const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios"); 
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. KẾT NỐI DATABASE MYSQL ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "", 
    database: process.env.DB_NAME || "sht"
});

db.connect(err => {
    if (err) {
        console.error("❌ Lỗi kết nối MySQL:", err.message);
        return;
    }
    console.log("✅ Đã kết nối MySQL thành công");
});

// --- 2. ROUTE ĐĂNG KÝ ---
app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Email này đã tồn tại!" });
            }
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
        if (password !== user.password) {
            return res.status(400).json({ error: "Mật khẩu sai" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            "SECRET_KEY", 
            { expiresIn: "24h" }
        );

        res.json({ 
            token, 
            user: { email: user.email } 
        });
    });
});

// --- 4. ROUTE AI: LỜI KHUYÊN & THỰC ĐƠN (ĐÃ SỬA LỖI) ---
app.post("/api/ai/advice", async (req, res) => {
    const { weight, height, bmi, isMenuRequest } = req.body;

    // Phân loại nội dung yêu cầu gửi cho AI
    let promptText = "";
   if (isMenuRequest) {
        // PROMPT TẬP TRUNG TỐI ĐA VÀO THỰC ĐƠN 7 NGÀY
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
        // PROMPT LỜI KHUYÊN SỨC KHỎE (NGẮN GỌN)
        promptText = `BMI của tôi là ${bmi}. Hãy đưa ra 3 lời khuyên sức khỏe quan trọng về tập luyện và sinh hoạt. Cấm nói về thực đơn ở đây. Trả lời súc tích dưới 60 từ.`;
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: promptText }] // Đã dùng biến động thay vì viết cứng
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

// --- 5. ROUTE LƯU NHẬT KÝ SỨC KHỎE ---
app.post("/api/health/log", (req, res) => {
    const { weight, height, bmi, heart_rate } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "SECRET_KEY", (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token hết hạn" });

        const sql = "INSERT INTO health_logs (user_id, weight, height, bmi, heart_rate) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [decoded.id, weight, height, bmi, heart_rate || null], (err, result) => {
            if (err) return res.status(500).json({ error: "Lỗi lưu nhật ký" });
            res.json({ message: "Đã lưu chỉ số thành công!" });
        });
    });
});

// --- 6. ROUTE LẤY LỊCH SỬ BIỂU ĐỒ ---
app.get("/api/health/history", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "SECRET_KEY", (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token hết hạn" });

        const sql = "SELECT weight, bmi, created_at FROM health_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 10";
        db.query(sql, [decoded.id], (err, results) => {
            if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
            res.json(results);
        });
    });
});

// --- 7. KIỂM TRA TRẠNG THÁI SERVER ---
app.get("/", (req, res) => {
    res.send("🚀 Health App API is Running...");
});

// --- 8. KHỞI CHẠY SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (Gemini 2.5-Flash & MySQL)`);
});