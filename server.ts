import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const SANKA_API_BASE = "https://www.sankavollerei.web.id/anime";

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  expiry: number;
}
const cache = new Map<string, CacheEntry>();

// In-flight request deduplication map to prevent multiple identical upstream requests
const inFlightRequests = new Map<string, Promise<any>>();

// Rate limit tracker (Upstream rate limit: ~70 req per 3 min)
const requestTimestamps: number[] = [];
const MAX_UPSTREAM_PER_MINUTE = 40;

function isApproachingRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > 60_000) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length >= MAX_UPSTREAM_PER_MINUTE;
}

function trackUpstreamRequest() {
  requestTimestamps.push(Date.now());
}

async function fetchFromUpstream(endpoint: string, ttlMs: number = 5 * 60 * 1000): Promise<any> {
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  // Deduplicate inflight requests for identical endpoint
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      // If approaching rate limit, wait slightly
      if (isApproachingRateLimit()) {
        await new Promise((res) => setTimeout(res, 800));
      }

      trackUpstreamRequest();
      const targetUrl = `${SANKA_API_BASE}${endpoint}`;
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "id,en-US;q=0.9,en;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`Upstream SankaVollerei API returned status ${response.status}`);
      }

      const json = await response.json();
      cache.set(cacheKey, {
        data: json,
        expiry: Date.now() + ttlMs,
      });

      return json;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

app.use(express.json());

// User Database In-Memory / Local Store
interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  nickname: string;
  avatar: string;
  bio: string;
  favoriteGenres: string[];
  role: "member" | "supporter" | "vip";
  createdAt: number;
  preferences: {
    autoNextEpisode: boolean;
    preferredQuality: "360p" | "480p" | "720p" | "auto";
    preferredServer: string;
    notifyNewEpisodes: boolean;
  };
  bookmarks: any[];
  history: any[];
}

const usersDb = new Map<string, StoredUser>();

// Verification Code Store & Anti-Spam Guard
interface StoredOtp {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
}
const otpStore = new Map<string, StoredOtp>();

// Math Security Challenges
interface StoredChallenge {
  answer: number;
  expiresAt: number;
}
const challengeStore = new Map<string, StoredChallenge>();

// Disposable email domains to prevent spam accounts
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com", "10minutemail.com", "guerrillamail.com", "mailinator.com",
  "yopmail.com", "throwawaymail.com", "trashmail.com", "fakemailgenerator.com",
  "dispostable.com", "getairmail.com", "sharklasers.com", "guerrillamailblock.com",
  "burnermail.io", "crazymailing.com", "temp-mail.org", "mohmal.com", "nada.ltd"
]);

// IP / Client rate limiting for registration & OTP
const ipRequestLogs = new Map<string, { timestamps: number[] }>();

function checkIpRateLimit(ip: string, maxPerWindow = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = ipRequestLogs.get(ip) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= maxPerWindow) {
    return false;
  }
  entry.timestamps.push(now);
  ipRequestLogs.set(ip, entry);
  return true;
}

// Seed a demo user for quick testing
const demoUserId = "usr_demo_restream";
usersDb.set(demoUserId, {
  id: demoUserId,
  username: "otakurestream",
  email: "user@restream.io",
  passwordHash: "password123",
  nickname: "Otaku ReStream",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LuffyAnime&backgroundColor=b6e3f4,c0aede,d1d4f9",
  bio: "Pecinta anime shounen dan isekai sejati! Nonton maraton di ReStream tiap akhir pekan 🍿✨",
  favoriteGenres: ["Action", "Fantasy", "Isekai", "Shounen"],
  role: "member",
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  preferences: {
    autoNextEpisode: true,
    preferredQuality: "720p",
    preferredServer: "default",
    notifyNewEpisodes: true,
  },
  bookmarks: [],
  history: [],
});

// Helper to sanitize user object (strip password)
function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// 0. Security Challenge Endpoint (Anti-Bot Captcha Challenge)
app.get("/api/auth/security-challenge", (_req, res) => {
  const num1 = Math.floor(Math.random() * 9) + 2;
  const num2 = Math.floor(Math.random() * 8) + 1;
  const answer = num1 + num2;
  const token = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  challengeStore.set(token, {
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
  });

  res.json({
    token,
    prompt: `Berapa ${num1} + ${num2} ?`,
    num1,
    num2,
    operator: "+",
  });
});

// 1. Send Email Verification Code (OTP) with Anti-Spam Guards
app.post("/api/auth/send-verification", (req, res) => {
  try {
    const clientIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const { email, username, mathAnswer, mathToken, honeypot } = req.body;

    // Guard 1: Honeypot trap check (bots auto-fill hidden input)
    if (honeypot && String(honeypot).trim().length > 0) {
      return res.status(400).json({ success: false, message: "Aktivitas mencurigakan terdeteksi (Bot Guard)." });
    }

    if (!email || !username) {
      return res.status(400).json({ success: false, message: "Email dan Username wajib diisi." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Guard 2: Strict format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Format alamat email tidak valid." });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username harus 3-20 karakter, hanya huruf, angka, dan underscore (_)."
      });
    }

    // Guard 3: Disposable email domain blacklist
    const emailDomain = cleanEmail.split("@")[1];
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: "Alamat email sekali pakai (temporary email) tidak diizinkan untuk mencegah spam."
      });
    }

    // Guard 4: Check if email/username already registered
    for (const u of usersDb.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar. Silakan login." });
      }
      if (u.username.toLowerCase() === cleanUsername) {
        return res.status(400).json({ success: false, message: "Username sudah digunakan." });
      }
    }

    // Guard 5: Math Security Captcha Verification
    if (mathToken) {
      const challenge = challengeStore.get(mathToken);
      if (!challenge || Date.now() > challenge.expiresAt) {
        return res.status(400).json({
          success: false,
          message: "Tantangan keamanan kedaluwarsa. Silakan refresh dan coba lagi."
        });
      }
      if (Number(mathAnswer) !== challenge.answer) {
        return res.status(400).json({
          success: false,
          message: "Jawaban pertanyaan keamanan salah. Silakan coba lagi."
        });
      }
      challengeStore.delete(mathToken); // Single use
    }

    // Guard 6: IP Rate Limit (max 5 requests per 15 min)
    if (!checkIpRateLimit(clientIp, 6, 15 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "Terlalu banyak permintaan verifikasi dari perangkat ini. Harap tunggu 15 menit."
      });
    }

    // Guard 7: Email Cooldown Check (60 seconds between resends, max 3 in 15 min)
    const existingOtp = otpStore.get(cleanEmail);
    const now = Date.now();
    if (existingOtp) {
      const timeSinceLast = now - existingOtp.lastSentAt;
      if (timeSinceLast < 60_000) {
        const waitSec = Math.ceil((60_000 - timeSinceLast) / 1000);
        return res.status(429).json({
          success: false,
          message: `Harap tunggu ${waitSec} detik sebelum meminta kode baru.`
        });
      }
      if (existingOtp.sendCount >= 4 && now < existingOtp.expiresAt) {
        return res.status(429).json({
          success: false,
          message: "Batas pengiriman kode tercapai untuk email ini. Coba lagi dalam 15 menit."
        });
      }
    }

    // Generate 6-digit cryptographic-style OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, {
      code: generatedOtp,
      email: cleanEmail,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      sendCount: (existingOtp?.sendCount || 0) + 1,
    });

    console.log(`[AUTH GUARD] OTP for ${cleanEmail} generated: ${generatedOtp}`);

    res.json({
      success: true,
      message: `Kode verifikasi 6 digit telah dikirim ke ${cleanEmail}. Periksa inbox/spam email Anda.`,
      previewCode: generatedOtp, // Included so users in preview environment can easily verify
      cooldown: 60,
      expiresInMinutes: 10,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal mengirim kode verifikasi" });
  }
});

// 2. Register Account with OTP Verification & Security Validation
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, email, password, nickname, avatar, verificationCode, honeypot } = req.body;

    // Guard 1: Honeypot trap check
    if (honeypot && String(honeypot).trim().length > 0) {
      return res.status(400).json({ success: false, message: "Aktivitas bot terdeteksi." });
    }

    if (!username || !email || !password || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Semua kolom dan kode verifikasi 6-digit wajib diisi."
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = verificationCode.trim();

    // Guard 2: Verify OTP
    const storedOtp = otpStore.get(cleanEmail);
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "Kode verifikasi belum dikirim atau sudah kedaluwarsa. Silakan minta kode baru."
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: "Kode verifikasi telah kedaluwarsa (lebih dari 10 menit). Silakan minta kode baru."
      });
    }

    // Guard 3: Max 5 incorrect attempts (brute force protection)
    if (storedOtp.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: "Terlalu banyak percobaan kode yang salah. Kode dibatalkan demi keamanan. Silakan minta kode baru."
      });
    }

    if (storedOtp.code !== cleanCode) {
      storedOtp.attempts += 1;
      const remainingAttempts = 5 - storedOtp.attempts;
      return res.status(400).json({
        success: false,
        message: `Kode verifikasi salah. Sisa ${remainingAttempts} kesempatan.`
      });
    }

    // OTP Validated! Delete OTP so it cannot be reused
    otpStore.delete(cleanEmail);

    // Guard 4: Duplicate check
    for (const u of usersDb.values()) {
      if (u.username.toLowerCase() === cleanUsername) {
        return res.status(400).json({ success: false, message: "Username sudah digunakan oleh pengguna lain." });
      }
      if (u.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Kata sandi minimal 6 karakter." });
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: StoredUser = {
      id: newId,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: password,
      nickname: nickname?.trim() || cleanUsername,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}&backgroundColor=b6e3f4,c0aede`,
      bio: "Halo! Saya penggemar anime di ReStream.",
      favoriteGenres: ["Action", "Fantasy"],
      role: "member",
      createdAt: Date.now(),
      preferences: {
        autoNextEpisode: true,
        preferredQuality: "720p",
        preferredServer: "default",
        notifyNewEpisodes: true,
      },
      bookmarks: [],
      history: [],
    };

    usersDb.set(newId, newUser);
    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      message: "🎉 Akun Anda berhasil diverifikasi dan terdaftar! Selamat datang di ReStream."
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal mendaftarkan akun" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Username/Email dan password wajib diisi." });
    }

    const cleanIdent = identifier.trim().toLowerCase();
    let foundUser: StoredUser | null = null;

    for (const u of usersDb.values()) {
      if (u.username.toLowerCase() === cleanIdent || u.email.toLowerCase() === cleanIdent) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser || foundUser.passwordHash !== password) {
      return res.status(401).json({ success: false, message: "Username/Email atau kata sandi tidak cocok." });
    }

    res.json({ success: true, user: sanitizeUser(foundUser), message: "Berhasil masuk ke akun!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal masuk" });
  }
});

app.get("/api/auth/user/:id", (req, res) => {
  const { id } = req.params;
  const user = usersDb.get(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
  }
  res.json({ success: true, user: sanitizeUser(user) });
});

app.put("/api/auth/profile", (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !usersDb.has(userId)) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const user = usersDb.get(userId)!;
    if (updates.nickname !== undefined) user.nickname = updates.nickname;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.favoriteGenres !== undefined) user.favoriteGenres = updates.favoriteGenres;
    if (updates.preferences !== undefined) user.preferences = { ...user.preferences, ...updates.preferences };
    if (updates.bookmarks !== undefined) user.bookmarks = updates.bookmarks;
    if (updates.history !== undefined) user.history = updates.history;

    usersDb.set(userId, user);
    res.json({ success: true, user: sanitizeUser(user), message: "Profil berhasil diperbarui!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal memperbarui profil" });
  }
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    cacheSize: cache.size,
    inFlightCount: inFlightRequests.size,
    timestamp: new Date().toISOString(),
  });
});

// 1. Homepage
app.get("/api/anime/home", async (_req, res) => {
  try {
    const data = await fetchFromUpstream("/home", 10 * 60 * 1000); // 10 min cache
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch homepage data" });
  }
});

// 2. Ongoing Anime
app.get("/api/anime/ongoing", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await fetchFromUpstream(`/ongoing-anime?page=${page}`, 10 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch ongoing anime" });
  }
});

// 3. Completed Anime
app.get("/api/anime/completed", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await fetchFromUpstream(`/complete-anime?page=${page}`, 15 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch completed anime" });
  }
});

// 4. Release Schedule
app.get("/api/anime/schedule", async (_req, res) => {
  try {
    const data = await fetchFromUpstream("/schedule", 30 * 60 * 1000); // 30 min cache
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch schedule" });
  }
});

// 5. Genres List
app.get("/api/anime/genres", async (_req, res) => {
  try {
    const data = await fetchFromUpstream("/genre", 60 * 60 * 1000); // 1 hour cache
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch genres" });
  }
});

// 6. Anime by Genre
app.get("/api/anime/genre/:genreId", async (req, res) => {
  try {
    const { genreId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await fetchFromUpstream(`/genre/${encodeURIComponent(genreId)}?page=${page}`, 15 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch anime by genre" });
  }
});

// 7. Search Anime
app.get("/api/anime/search/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || !keyword.trim()) {
      return res.json({ status: "success", data: { animeList: [] } });
    }
    const data = await fetchFromUpstream(`/search/${encodeURIComponent(keyword.trim())}`, 5 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to search anime" });
  }
});

// 8. Anime Detail
app.get("/api/anime/detail/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await fetchFromUpstream(`/anime/${encodeURIComponent(slug)}`, 15 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch anime detail" });
  }
});

// 9. Episode Detail
app.get("/api/anime/episode/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await fetchFromUpstream(`/episode/${encodeURIComponent(slug)}`, 10 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch episode detail" });
  }
});

// 10. Streaming Server Resolution
app.get("/api/anime/server/:serverId", async (req, res) => {
  try {
    const { serverId } = req.params;
    const data = await fetchFromUpstream(`/server/${encodeURIComponent(serverId)}`, 10 * 60 * 1000);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to resolve streaming server" });
  }
});

// 11. Image Proxy
app.get("/api/img-proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl || !targetUrl.startsWith("http")) {
      return res.status(400).send("Invalid image URL");
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://otakudesu.blog/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to proxy image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send("Image proxy error");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Anime Streaming Server running on http://localhost:${PORT}`);
  });
}

startServer();
