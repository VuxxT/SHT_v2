const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios"); 
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. KẾT NỐI DATABASE (Dùng Pool để không bị ngắt kết nối khi Deploy) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        rejectUnauthorized: false // Dòng này cực kỳ quan trọng để chạy trên Vercel
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- MIDDLEWARE XÁC THỰC TOKEN ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "SECRET_KEY", (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token hết hạn hoặc không hợp lệ" });
        req.user = decoded;
        next();
    });
};

// --- 2. ROUTE ĐĂNG KÝ ---
app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email này đã tồn tại!" });
            return res.status(500).json({ error: "Lỗi lưu database" });
        }
        res.status(201).json({ message: "Đăng ký thành công!" });
    });
});

// --- 3. ROUTE ĐĂNG NHẬP ---
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
        if (results.length === 0) return res.status(400).json({ error: "User không tồn tại" });

        const user = results[0];
        if (password !== user.password) return res.status(400).json({ error: "Mật khẩu sai" });

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            "SECRET_KEY", 
            { expiresIn: "24h" }
        );
        res.json({ token, user: { email: user.email } });
    });
});

// --- 4. ROUTE AI GEMINI (GIỮ NGUYÊN 100% THEO FILE CỦA BẠN) ---
app.post("/api/ai/advice", async (req, res) => {
    const { weight, height, bmi, isMenuRequest } = req.body;

    let promptText = "";
    if (isMenuRequest) {
        promptText = `
    Nhiệm vụ: Lập bảng thực đơn 7 ngày cho người ${weight}kg, cao ${height}cm, BMI ${bmi}.
    Yêu cầu bắt buộc:
    1. CHỈ TRẢ VỀ BẢNG (Markdown Table) gồm các cột: Thứ, Bữa Sáng, Bữa Trưa, Bữa Tối.
    2. KHÔNG có lời mở đầu.
    3. KHÔNG có lời kết luận hay phân tích thêm.
    4. Món ăn cụ thể, không trùng lặp, dễ nấu (Ví dụ: Cơm cá kho, Bún mọc, Ức gà áp chảo).
    5. Trình bày bằng tiếng Việt.
    Nếu bạn nói bất cứ điều gì ngoài cái bảng, nhiệm vụ sẽ thất bại.`;
    } else {
        promptText = `BMI của tôi là ${bmi}. Hãy đưa ra 3 lời khuyên sức khỏe quan trọng về tập luyện và sinh hoạt. Cấm nói về thực đơn ở đây. Trả lời súc tích dưới 60 từ.`;
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: promptText }]
                }]
            }
        );

        const advice = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI";
        res.json({ advice });

    } catch (err) {
        console.error("AI ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "AI error" });
    }
});

// --- 5. ROUTE LƯU NHẬT KÝ ---
app.post("/api/health/log", verifyToken, (req, res) => {
    const { weight, height, heart_rate } = req.body;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const bmiValue = parseFloat((w / ((h / 100) * (h / 100))).toFixed(2));
    const hr = heart_rate ? parseInt(heart_rate) : 0;

    const sql = "INSERT INTO health_logs (user_id, weight, height, bmi, heart_rate) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [req.user.id, w, h, bmiValue, hr], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi lưu database: " + err.sqlMessage });
        res.json({ message: "Lưu thành công!", bmi: bmiValue });
    });
});

// --- 6. ROUTE LẤY LỊCH SỬ ---
app.get("/api/health/history", verifyToken, (req, res) => {
    const sql = "SELECT weight, bmi, created_at FROM health_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 10";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn lịch sử" });
        res.json(results);
    });
});

app.get("/", (req, res) => res.send("🚀 Health App API is Running..."));

// --- QUAN TRỌNG: PHỤC VỤ DEPLOY VERCEL ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log(`🚀 Server running on port 3000`));
}

module.exports = app;