const mysql = require('mysql');

// Tạo kết nối
const db = mysql.createConnection({
    host:"bssojx5fcowseuhj54iz-mysql.services.clever-cloud.com",
    user:'usz5ky1inl8lpehy',
    password: 'dgp61l27BsJn3UlM0a0U',
    database:  'bssojx5fcowseuhj54iz'
});

db.connect(err => {
    if (err) {
        console.error("Lỗi kết nối database:", err.message);
        process.exit(1);
    }
    console.log("Đã kết nối database từ database.js");
});

module.exports = db; // Export đối tượng db
