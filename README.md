# 🏥 SHT_v2 - Smart Health Tracker (Gemini AI Integration)

**SHT_v2** là hệ thống theo dõi sức khỏe thông minh thế hệ mới, kết hợp giữa việc quản lý dữ liệu cá nhân và tư vấn chuyên sâu từ trí tuệ nhân tạo. Ứng dụng giúp người dùng lưu trữ nhật ký sức khỏe và nhận phản hồi trực tiếp từ mô hình AI tiên tiến nhất của Google.

---

## ✨ Tính năng nổi bật
* **Hệ thống xác thực**: Đăng ký và đăng nhập bảo mật hoàn toàn với công nghệ JWT (JSON Web Token).
* **Quản lý nhật ký**: Lưu trữ chi tiết các chỉ số cân nặng, chiều cao và nhịp tim vào cơ sở dữ liệu MySQL.
* **Trực quan hóa xu hướng**: Theo dõi sự thay đổi của cơ thể thông qua biểu đồ trực quan (Line Chart) sử dụng thư viện Recharts.
* **Tư vấn sức khỏe AI**: 
    * Tích hợp trực tiếp với **Gemini AI** (`gemini-2.5-flash`) để đưa ra lời khuyên sinh hoạt cá nhân hóa.
    * Tự động lập thực đơn dinh dưỡng 7 ngày dưới dạng bảng Markdown chuyên nghiệp và khoa học.
* **Theo dõi Hydration**: Công cụ tính toán lượng nước uống cần thiết hàng ngày dựa trên trọng lượng cơ thể thực tế.

---

## 🛠 Công nghệ sử dụng
* **Frontend**: React.js, Vite, Recharts, Axios.
* **Backend**: Node.js, Express.js.
* **Database**: MySQL (XAMPP).
* **AI Engine**: Google Gemini API.
* **Security**: JWT Authentication, CORS.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Chuẩn bị môi trường
* Cài đặt **Node.js** (Phiên bản LTS).
* Cài đặt **XAMPP** để quản lý MySQL Database.

### 2. Cấu hình Cơ sở dữ liệu
1. Khởi động **Apache** và **MySQL** từ XAMPP Control Panel.
2. Tạo database mới tên là `sht`.
3. Cấu trúc bảng `health_logs`:
   * `id`: INT (Primary Key, Auto Increment)
   * `user_id`: INT (Foreign Key)
   * `weight`, `height`: FLOAT
   * `heart_rate`: INT
   * `created_at`: TIMESTAMP

### 3. Cài đặt Backend
1. Truy cập thư mục backend: `cd backend`
2. Cài đặt thư viện: `npm install`
3. Cấu hình file `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sht
   GEMINI_API_KEY=Nhập_Key_Của_Bạn_Tại_Đây

 4. Cài đặt Frontend
Truy cập thư mục frontend: cd frontend
Cài đặt thư viện: npm install
Khởi chạy ứng dụng: npm run dev

Dự án được hoàn thiện bởi Vũ - SHT Project.
