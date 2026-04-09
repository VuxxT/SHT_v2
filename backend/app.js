const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios"); // Cần thiết cho route AI
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- KẾT NỐI DATABASE MYSQL ---
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

// --- ROUTE ĐĂNG KÝ (Giữ nguyên logic No Encryption) ---
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

// --- ROUTE ĐĂNG NHẬP (Giữ nguyên logic No Encryption) ---
// --- ROUTE ĐĂNG NHẬP (Không mã hóa, trả về Token + Email) ---
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
        if (results.length === 0) return res.status(400).json({ error: "User không tồn tại" });

        const user = results[0];
        
        // So sánh trực tiếp mật khẩu thuần
        if (password !== user.password) {
            return res.status(400).json({ error: "Mật khẩu sai" });
        }

        // Tạo Token ghi nhớ phiên đăng nhập (SECRET_KEY nên để trong .env)
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            "SECRET_KEY", 
            { expiresIn: "24h" }
        );

        // Trả về Token và thông tin Email để hiển thị ở Header
        res.json({ 
            token, 
            user: { email: user.email } 
        });
    });
});


// --- AI ROUTE (GIỮ NGUYÊN CODE CŨ CỦA BẠN - TUYỆT ĐỐI KHÔNG ĐỔI) ---
app.post("/api/ai/advice", async (req, res) => {
  const { weight, height, bmi } = req.body;

  try {
    const axios = require("axios");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Tôi nặng ${weight}kg, cao ${height}cm, BMI ${bmi}. Hãy cho lời khuyên sức khỏe ngắn gọn.`,
              },
            ],
          },
        ],
      }
    );

    const advice =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không có phản hồi";

    res.json({ advice });

  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "AI error" });
  }
});

// --- ROUTE KIỂM TRA TRẠNG THÁI ---
app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(3000, () => {
    console.log("🚀 Server running on port 3000 (MySQL & Gemini 2.5-Flash)");
});