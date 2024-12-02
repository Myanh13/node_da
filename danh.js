const mysql = require('mysql');
const exp = require('express');
const axios = require('axios');
const app = exp();
const bodyParser = require('body-parser');  // Thư viện để xử lý dữ liệu POST
const crypto = require('crypto');

const fs = require('fs');
var cors = require('cors');
const { METHODS } = require('http');
const { log } = require('console');

app.use(exp.json());
app.use(exp.urlencoded({ extended: true }));
app.use([cors(), exp.json()]);

//connect database
const db = mysql.createConnection({
    host: 'localhost', user:  'root', password: '', port: 3306, database: 'paradiso'
})
db.connect(err=>{
    if(err) throw err;
    console.log("Đã kết nối database");
})

//   https://4a14-115-77-64-228.ngrok-free.app 
//   03/07    9704 0000 0000 0018    NGUYEN VAN A	OTP

//////////////////////////////////////conect Da ta/////////////////////////////////


//axios
app.post('/payment', async(req, res)=> {
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = 'http://localhost:3001';
    var ipnUrl = 'https://2c36-2402-800-6396-280-810-f53c-72c3-4de7.ngrok-free.app/callback';
    var requestType = "payWithMethod";
    var amount = '50000';
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData ='';
    var orderGroupId ='';
    var autoCapture =true;
    var lang = 'vi';
    
    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    const crypto = require('crypto');
    var signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)
    
    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        partnerName : "Test",
        storeId : "MomoTestStore",
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        lang : lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData : extraData,
        orderGroupId: orderGroupId,
        signature : signature
    });
    //option for axios
    const options ={
        method :"POST",
        url:"https://test-payment.momo.vn/v2/gateway/api/create",
        headers:{
            'Content-type': 'application/json',
            'Content-length':Buffer.byteLength(requestBody)
        },
        data: requestBody
    }
        let result;
        try{
            result = await axios(options);
            return res.status(200).json(result.data);
        } catch(error){
            return res.status(500).json({
                statusCode:500,
                message: "L��i khi gửi yêu cầu đến MoMo",
              
            })
        }
    })

app.post("/callback", async(req, res)=> {   
    console.log("callback:: ");
    console.log(req.body);
    ///update số dư
    
    return res.status(200).json(req.body);

    
})










// app.post("/payments", async (req, res) => {
//     const accessKey = "F8BBA842ECF85"; // Khóa truy cập MoMo
//     const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // Khóa bí mật MoMo
//     const orderInfo = "Thanh toán đặt phòng"; // Thông tin đơn hàng
//     const partnerCode = "MOMO"; // Mã đối tác
//     const redirectUrl = "http://localhost:3001"; // URL chuyển hướng khi thành công
//     const ipnUrl = "http://localhost:3001/ipn"; // URL để nhận thông báo thanh toán
//     const requestType = "captureWallet"; // Loại yêu cầu thanh toán
    
//     // Lấy thông tin số tiền từ request body
//     const amount = req.body.tong_tien_dat;
  
//     // Kiểm tra tính hợp lệ của số tiền thanh toán
//     if (!amount || typeof amount !== "number" || amount <= 0) {
//       return res.status(400).json({
//         message: "Số tiền không hợp lệ. Vui lòng kiểm tra lại.",
//         resultCode: 22,
//       });
//     }
  
//     // Giới hạn số tiền thanh toán theo yêu cầu của MoMo
//     const minAmount = 1000; // Số tiền tối thiểu
//     const maxAmount = 50000000; // Số tiền tối đa
  
//     if (amount < minAmount || amount > maxAmount) {
//       return res.status(400).json({
//         message: `Số tiền phải nằm trong khoảng từ ${minAmount} VND đến ${maxAmount} VND.`,
//         resultCode: 22,
//       });
//     }
  
//     const orderId = partnerCode + new Date().getTime(); // Tạo orderId duy nhất
//     const requestId = orderId; // Sử dụng orderId làm requestId
//     const extraData = ""; // Dữ liệu bổ sung, có thể để trống
//     const autoCapture = true; // Tự động ghi nhận thanh toán
//     const lang = "vi"; // Ngôn ngữ
  
//     // Tạo chữ ký (signature) cho yêu cầu
//     const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
//     const signature = crypto
//       .createHmac("sha256", secretKey)
//       .update(rawSignature)
//       .digest("hex");
  
//     // Tạo payload gửi tới MoMo
//     const requestBody = {
//       partnerCode,
//       partnerName: "Homestay Booking",
//       storeId: "HomestayTestStore",
//       requestId,
//       amount,
//       orderId,
//       orderInfo,
//       redirectUrl,
//       ipnUrl,
//       lang,
//       requestType,
//       autoCapture,
//       extraData,
//       signature,
//     };
  
//     try {
//       // Gửi yêu cầu tạo URL thanh toán tới MoMo
//       const options = {
//         method: "POST",
//         url: "https://test-payment.momo.vn/v2/gateway/api/create",
//         headers: {
//           "Content-Type": "application/json",
//           "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
//         },
//         data: JSON.stringify(requestBody),
//       };
      
//       const momoResponse = await axios(options);
  
//       // Lưu thông tin đặt phòng (thay đổi các trường phù hợp với ReactJS)
//       const bookingResponse = await axios.post(
//         "http://localhost:3000/BookingRoom",
//         {
//           id_user: req.body.id_user, // ID người dùng
//           id_homestay: req.body.id_homestay, // ID homestay
//           ngay_dat: req.body.ngay_dat, // Ngày đặt
//           ngay_tra: req.body.ngay_tra, // Ngày trả
//           tong_tien_dat: req.body.tong_tien_dat, // Tổng tiền
//           trang_thai_TT: "chờ thanh toán", // Trạng thái thanh toán
//           orderId: orderId, // ID đơn hàng
//         }
//       );
  
//       // Trả về URL thanh toán và thông tin đặt phòng
//       res.json({
//         payUrl: momoResponse.data.payUrl, // URL thanh toán từ MoMo
//         orderId,
//         bookingId: bookingResponse.data.bookingId, // ID đặt phòng
//       });
//     } catch (error) {
//       console.error("Lỗi khi xử lý thanh toán:", error);
//       res.status(500).json({ message: "Có lỗi xảy ra khi xử lý thanh toán", error: error.message });
//     }
//   });


// // API nhận kết quả từ MoMo (IPN)
// app.post('/payment/notify', (req, res) => {
//     const { partnerCode, orderId, amount, message, resultCode, signature } = req.body;

//     // 1. Kiểm tra tính hợp lệ của signature từ MoMo
//     const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // Secret Key của bạn từ MoMo

//     // Lấy dữ liệu gốc để tạo lại signature
//     const rawSignature = "accessKey=" + req.body.accessKey + "&amount=" + amount + "&orderId=" + orderId + "&partnerCode=" + partnerCode + "&resultCode=" + resultCode + "&message=" + message;

//     // Tạo lại signature từ dữ liệu nhận được và secretKey
//     const checkSignature = crypto.createHmac('sha256', secretKey)
//         .update(rawSignature)
//         .digest('hex');

//     console.log('Signature nhận được từ MoMo:', signature);
//     console.log('Signature kiểm tra lại:', checkSignature);

//     // Nếu signature không khớp thì yêu cầu không hợp lệ
//     if (signature !== checkSignature) {
//         return res.status(400).json({ statusCode: 400, message: 'Signature không hợp lệ' });
//     }

//     // 2. Kiểm tra kết quả thanh toán (resultCode)
//     if (resultCode === '0') {
//         // Thanh toán thành công
//         console.log(`Thanh toán thành công cho đơn hàng ${orderId}`);
//         // Cập nhật trạng thái thanh toán trong cơ sở dữ liệu của bạn tại đây, ví dụ:
//         // db.updatePaymentStatus(orderId, 'success');

//         return res.status(200).json({
//             statusCode: 200,
//             message: 'Thanh toán thành công',
//             orderId: orderId,
//             amount: amount,
//         });
//     } else {
//         // Thanh toán thất bại
//         console.log(`Thanh toán thất bại cho đơn hàng ${orderId}, mã lỗi: ${resultCode}`);
//         // Cập nhật trạng thái thanh toán trong cơ sở dữ liệu của bạn tại đây, ví dụ:
//         // db.updatePaymentStatus(orderId, 'failed');

//         return res.status(200).json({
//             statusCode: 200,
//             message: `Thanh toán thất bại, mã lỗi: ${resultCode}`,
//             orderId: orderId,
//             resultCode: resultCode,
//         });
//     }
// });






app.post('/BookingRoom', (req, res) => {
    const { id_user, id_homestay, ngay_dat, ngay_tra, tong_tien_dat, trang_thai_TT } = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!id_user || !id_homestay ||  !ngay_dat || !ngay_tra || !tong_tien_dat || !trang_thai_TT) {
      return res.status(400).json({ message: 'Tất cả các trường là bắt buộc.' });
    }
  
    // Chèn thông tin đặt phòng vào bảng `dat_homestay`
    const insertQuery = `
      INSERT INTO dat_homestay (id_user, id_homestay, ngay_dat, ngay_tra, tong_tien_dat ,trang_thai_TT)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(insertQuery, [id_user,id_homestay, ngay_dat, ngay_tra, tong_tien_dat,trang_thai_TT], (err, results) => {
      if (err) {
        console.error('Lỗi khi thêm dữ liệu vào dat_homestay:', err);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi đặt phòng.', error: err.message });
      }
      
      res.status(200).json({
        message: 'Đặt phòng thành công',
        bookingId: results.insertId,
      });
    });
  });
// lấy user
app.get('/user', function(req, res) {
    db.query(`SELECT * FROM users; `,(err, data) => {
      if (err) res.json({"thongbao": "lỗi lấy user", err });
      else res.json(data);
    })
})
//lấy hết loại
app.get('/loai', function(req, res) {
    db.query(`SELECT id_Loai, Ten_Loai ,Mo_ta FROM loai_homestay `,(err, data) => {
      if (err) res.json({"thongbao": "lỗi lấy loại", err });
      else res.json(data);
    })
})

  //lấy tất cả loaiHomestay
app.get('/loaihomestay', function(req, res){
    let sql = `SELECT * FROM loai_homestay`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list homestay", err});
        else res.json(data);
    })
})

//lấy theo loại homestay
app.get('/loaihomestay', function(req, res){
    let id_loai = parseInt(req.params.id_loai)
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({"thongbao":"Không biết loại", "id_loai": id_loai}); return;
    }
    let sql = `SELECT * FROM loai_homestay WHERE id_Loai =?`
    db.query(sql, id_loai, (err, data)=>{
        if(err) res.json({"thongbao":"Lỗi lấy  loai", err});
        else res.json(data[0]);
    })
})

// app.get('/htthanhtoan', function(req, res){
//     let sql = `SELECT * FROM dat_homestay`
//     db.query (sql, (err, data) =>{
//         if(err) res.json({"thongbao":"Lỗi lấy list homestay", err});
//         else res.json(data);
//     })
// })
// app.get('/htthanhtoan/:id', function(req, res) {
//     const id = parseInt(req.params.id); // Lấy `id` từ URL và chuyển thành số nguyên
//     // Kiểm tra tính hợp lệ của `id`
//     if (isNaN(id) || id <= 0) {
//         res.json({ "thongbao": "ID không hợp lệ", "id": id });
//         return;
//     }
//     // Truy vấn cơ sở dữ liệu để lấy homestay theo `id`
//     let sql = `SELECT * FROM dat_homestay WHERE id_homestay = ?`;
//     db.query(sql, [id], (err, data) => {
//         if (err) {
//             res.json({ "thongbao": "Lỗi lấy homestay", err });
//         } else if (data.length === 0) {
//             res.json({ "thongbao": "Không tìm thấy homestay với ID này" });
//         } else {
//             res.json(data[0]); // Trả về homestay đầu tiên (theo `id`)
//         }
//     });
// });
// //lấy tất cả Homestay


app.get('/homestay', function(req, res){
    let sql = `SELECT * FROM homestay`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list homestay", err});
        else res.json(data);
    })
})

  //lấy tất cả Homestay theo id
app.get('/homestay/:id', function(req, res) {
    const id = parseInt(req.params.id); // Lấy `id` từ URL và chuyển thành số nguyên
    // Kiểm tra tính hợp lệ của `id`
    if (isNaN(id) || id <= 0) {
        res.json({ "thongbao": "ID không hợp lệ", "id": id });
        return;
    }
    // Truy vấn cơ sở dữ liệu để lấy homestay theo `id`
    let sql = `SELECT * FROM homestay WHERE id_homestay = ?`;
    db.query(sql, [id], (err, data) => {
        if (err) {
            res.json({ "thongbao": "Lỗi lấy homestay", err });
        } else if (data.length === 0) {
            res.json({ "thongbao": "Không tìm thấy homestay với ID này" });
        } else {
            res.json(data[0]); // Trả về homestay đầu tiên (theo `id`)
        }
    });
});

// API lấy danh sách homestay liên quan
app.get("/homestaylienquan/:id", function (req, res) {
    let id = parseInt(req.params.id || 0);
    if (isNaN(id) || id <= 0) {
      res.json({ "thong bao": "Không biết homestay", id: id });
      return;
    }
    let sql = `SELECT * FROM homestay, hinh_homestay, hinh_anh
     WHERE id_Loai = ? AND homestay.id_homestay = hinh_homestay.id_homestay 
    AND hinh_homestay.id_hinh = hinh_anh.id_hinh ORDER BY homestay.id_homestay desc LIMIT 4`;
    db.query(sql, id, (err, data) => {
      if (err) res.json({ thongbao: "Lỗi lấy homestay", err });
      else res.json(data);  // Trả về toàn bộ danh sách homestay
    });
});

//lấy yêu thích vào dATA
app.get('/yeuthich', function(req, res){
    let sql = `SELECT * FROM yeuthich`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list yeuthich", err});
        else res.json(data);
    })
})

//thêm yêu thích vào dATA
app.post('/thich/:id', function(req, res) {
    const { id_homestay } = req.body;
    const sql = `
        INSERT INTO yeuthich (id_homestay)
        VALUES (?)
    `;
    const values = [id_homestay];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            return res.json({ "thongbao": "lỗi thêm dữ liệu vào bảng yeuthich", err });
        }
        res.json({ "thongbao": "thêm dữ liệu vào bảng yeuthich thành công", result });
    });
});

// Lấy danh sách homestay theo loại
app.get('/homestay/:id_loai', function(req, res) {
    let id_loai = parseInt(req.params.id_loai);
    
    // Kiểm tra id_loai hợp lệ
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({ "thongbao": "Không biết loại", "id_loai": id_loai });
        return;
    }
    // Truy vấn lấy danh sách homestay theo id_loai
    let sql = `SELECT * FROM homestay WHERE id_loai = ?`;
    db.query(sql, id_loai, (err, data) => {
        if (err) {
            res.json({ "thongbao": "Lỗi lấy danh sách homestay", err });
        } else if (data.length === 0) {
            res.json({ "thongbao": "Không tìm thấy homestay nào cho loại này" });
        } else {
            res.json(data); // Trả về danh sách homestay
        }
    });
});

// API lấy danh sách hình ảnh của homestay
app.get('/dshinhanh', (req, res) => {
    const id_homestay = req.params.id;

    const query = `
    SELECT *
    FROM homestay, hinh_homestay, hinh_anh
    WHERE homestay.id_homestay = hinh_homestay.id_homestay 
    AND hinh_homestay.id_hinh = hinh_anh.id_hinh
    `;
    db.query(query, [id_homestay], (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// ct homestay
app.get('/ct_homestay/:id', (req, res) => {
    let id = parseInt(req.params.id || 0);
    if (isNaN(id) || id <= 0) {
        res.json({ "thong bao": "Không biết homestay", id: id });
        return;
    }
    console.log('Request homestay ID:', id);
    let sql = 'SELECT * FROM homestay WHERE id_homestay = ?';
    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else if (rows.length > 0) {
            res.json(rows[0]); // Trả về homestay đầu tiên
        } else {
            res.status(404).json({ message: 'Homestay not found' });
        }
    });
});

//lấy theo loại homestay trong loại
app.get('/homestayTrongLoai/:id_loai', function(req, res){
    let id_Loai = parseInt(req.params.id_loai)
    if (isNaN(id_Loai) || id_Loai <= 0) {
        res.json({"thongbao":"Không biết loại", "id_Loai": id_Loai}); return;
    }
    let sql = `SELECT *  FROM homestay WHERE id_Loai =? ORDER BY id_homestay desc`
    db.query(sql, id_Loai, (err, data)=>{
        if(err) res.json({"thongbao":"Lỗi lấy sản phẩm trong loai", err});
        else res.json(data);
    })
})

// Xử lý form liên hệ
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Kiểm tra xem có giá trị nào trống không
    if (!name || !email || !message) {
        return res.status(400).json({ "thongbao": "Vui lòng điền đầy đủ thông tin!" });
    }
    const sql = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("Lỗi khi lưu dữ liệu:", err);
            return res.status(500).json({ "thongbao": "Lỗi khi gửi tin nhắn" });
        }
        res.status(200).json({ "thongbao": "Gửi tin thành công!" });
    });
});
// quên mật khẩu 

// Lấy tất cả đánh giá cho một homestay
app.get('/danhgia/:id_homestay', (req, res) => {
    const { id_homestay } = req.params;
    const sql = 'SELECT * FROM danh_gia WHERE id_homestay = ?';
    db.query(sql, [id_homestay], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy đánh giá:", err);
            return res.status(500).json({ "thongbao": "Đã có lỗi khi lấy đánh giá" });
        }
        res.json(results);
    });
});

// Thêm một đánh giá
app.post('/danhgia', (req, res) => {
    const { id_homestay, ten_user, noi_dung, sao } = req.body;
    if (!id_homestay || !ten_user || !noi_dung || !sao) {
        return res.status(400).json({ "thongbao": "Vui lòng điền đầy đủ các trường" });
    }
    const sql = 'INSERT INTO danh_gia (id_homestay, ten_user, noi_dung, sao) VALUES (?, ?, ?, ?)';
    db.query(sql, [id_homestay, ten_user, noi_dung, sao], (err) => {
        if (err) {
            console.error("Lỗi khi thêm đánh giá:", err);
            return res.status(500).json({ "thongbao": "Đã có lỗi khi thêm đánh giá" });
        }
        res.json({ "thongbao": "Đánh giá đã được thêm thành công" });
    });
});

// Cập nhật một đánh giá
app.put('/danhgia/:id', (req, res) => {
    const { id } = req.params;
    const { ten_user, noi_dung, sao } = req.body;

    if (!ten_user || !noi_dung || !sao) {
        return res.status(400).json({ "thongbao": "Vui lòng cung cấp thông tin hợp lệ" });
    }

    const query = 'UPDATE danh_gia SET ten_user = ?, noi_dung = ?, sao = ? WHERE id = ?';
    db.query(query, [ten_user, noi_dung, sao, id], (error, results) => {
        if (error) {
            console.error("Lỗi khi cập nhật đánh giá:", error);
            return res.status(500).json({ "thongbao": "Cập nhật không thành công" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ "thongbao": "Không tìm thấy đánh giá" });
        }
        res.json({ "thongbao": "Đánh giá đã được cập nhật thành công" });
    });
});

// Xóa một đánh giá
app.delete('/danhgia/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM danh_gia WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error("Lỗi khi xóa đánh giá:", err);
            return res.status(500).json({ "thongbao": "Đã có lỗi khi xóa đánh giá" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ "thongbao": "Không tìm thấy đánh giá" });
        }
        res.json({ "thongbao": "Đánh giá đã được xóa thành công" });
    });
});

// Đăng ký, Đăng nhập
app.post('/Register', (req, res) => {
    let data = req.body;
    let sql = `INSERT INTO users SET ?`;
    db.query(sql, data, (err, data) => {
        if (err) res.json({ "thongbao": "Tài khoản đã tồn tại", err })
        else {
            res.json({ "thongbao": "Tạo tài khoản thành công", data });
        }
    });
})
app.post('/login', (req, res) => {
    const { email_user, pass_user } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email_user || !pass_user ) {
        return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    // SQL query để tìm người dùng theo email
    const sql = 'SELECT * FROM users WHERE email_user = ?';
    db.query(sql, [email_user], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Có lỗi xảy ra', err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email không tồn tại hoặc không chính xác!' });
        }

        const user = results[0];

        if (pass_user !== user.pass_user) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
        }

        // Kiểm tra vai trò (role_id) của người dùng
        if (user.role_id === 1) {
            // Người dùng bình thường
            res.status(200).json({
                message: 'Đăng nhập thành công',
                user: {
                    id_user: user.id_user,
                    ten_user: user.ten_user,
                    email_user: user.email_user,
                    sdt_user: user.sdt_user,
                    role_id: user.role_id,
                    redirectTo: '/'  // Đường dẫn cho người dùng
                }
            });
        } else if (user.role_id === 2) {
            // Quản trị viên
            res.status(200).json({
                message: 'Đăng nhập thành công với quyền admin',
                user: {
                    id: user.id_user,
                    name: user.ten_user,
                    email: user.email_user,
                    dien_thoai: user.sdt_user,
                    role: user.role_id,
                    redirectTo: '/admin'  // Đường dẫn cho quản trị viên
                }
            });
        } else {
            // Vai trò không xác định
            res.status(403).json({ message: 'Vai trò người dùng không xác định' });
        }
    });
});

//thay dỏi pass
app.post('/change-password/:id', (req, res) => {
    const { old_password, new_password, confirm_password } = req.body;
    const id_user = req.params.id;  // Lấy id_user từ tham số URL

    // Kiểm tra dữ liệu đầu vào
    if (!old_password || !new_password || !confirm_password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }

    // Kiểm tra mật khẩu mới và mật khẩu nhập lại
    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'Mật khẩu mới và mật khẩu nhập lại không khớp.' });
    }

    // SQL query để lấy thông tin người dùng dựa vào id_user
    const sql = 'SELECT * FROM users WHERE id_user = ?';
    db.query(sql, [id_user], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Có lỗi xảy ra khi truy vấn dữ liệu.', err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const user = results[0];

        // Kiểm tra mật khẩu cũ có khớp không
        if (old_password !== user.pass_user) {
            return res.status(401).json({ message: 'Mật khẩu cũ không chính xác.' });
        }

        // SQL query để cập nhật mật khẩu mới
        const updateSql = 'UPDATE users SET pass_user = ? WHERE id_user = ?';
        db.query(updateSql, [new_password, id_user], (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật mật khẩu.', updateErr });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(400).json({ message: 'Không thể cập nhật mật khẩu. Vui lòng thử lại.' });
            }

            // Trả về thông báo thành công
            res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
        });
    });
});

app.post('/user', async (req, res) => {
    try {
        const { id, ...updatedData } = req.body;

        // Tìm người dùng theo id và cập nhật thông tin
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

app.get('/user', function (req, res){
    let sql = `SELECT * FROM users`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗii lấy list user", err});
        else res.json(data);
    })
})
app.get('/user/:id', function (req, res) {
    const userId = req.params.id;  // Lấy id từ tham số URL
  
    // Truy vấn thông tin người dùng theo id
    let sql = `SELECT * FROM users WHERE id_user = ?`;  // Dùng tham số để tránh SQL Injection
    db.query(sql, [userId], (err, data) => {
      if (err) {
        // Nếu có lỗi khi truy vấn
        return res.status(500).json({ "thongbao": "Lỗi khi lấy thông tin người dùng", err });
      }
  
      if (data.length === 0) {
        // Nếu không tìm thấy người dùng với id tương ứng
        return res.status(404).json({ "thongbao": "Người dùng không tìm thấy" });
      }
  
      // Lấy thông tin người dùng
      const user = data[0];
  
      // Kiểm tra từng trường và gán "Chưa cập nhật" nếu trường đó không có giá trị
      const userData = {
        id_user: user.id_user || "Chưa cập nhật",
        ten_user: user.ten_user || "Chưa cập nhật",
        sdt_user: user.sdt_user || "Chưa cập nhật",
        email_user: user.email_user || "Chưa cập nhật",
        address: user.address || "Chưa cập nhật",
        gender: user.gender || "Chưa cập nhật",
        dob: user.dob || "Chưa cập nhật",
        old_password: user.old_passwordb || "Chưa cập nhật",
        new_password: user.new_password || "Chưa cập nhật",
        confirm_password: user.confirm_password || "Chưa cập nhật"
      };
  
      // Trả về thông tin người dùng đã xử lý
      res.json({ user: userData });
    });
  });
  
app.put('/user/:id', function (req, res) {
    const userId = req.params.id;  // Lấy id người dùng từ URL
    let { ten_user, sdt_user, email_user, address, gender, dob } = req.body;  // Lấy dữ liệu từ body
    
    // Kiểm tra và nếu không có giá trị thì gán thành chuỗi rỗng
    ten_user = ten_user || '';
    sdt_user = sdt_user || '';
    email_user = email_user || '';
    address = address || '';
    gender = gender || '';
    dob = dob || '';
  
    // Kiểm tra xem các trường bắt buộc có tồn tại hay không
    // if (!ten_user || !sdt_user || !email_user || !address || !gender || !dob) {
    //   return res.status(400).json({ "thongbao": "Vui lòng cung cấp đầy đủ thông tin để cập nhật" });
    // }
  
    // Cập nhật thông tin người dùng trong cơ sở dữ liệu
    let sql = `
      UPDATE users 
      SET 
        ten_user = ?, 
        sdt_user = ?, 
        email_user = ?, 
        address = ?, 
        gender = ?, 
        dob = ? 
      WHERE id_user = ?
    `;
  
    // Thực thi câu lệnh SQL
    db.query(sql, [ten_user, sdt_user, email_user, address, gender, dob, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ "thongbao": "Lỗi khi cập nhật thông tin người dùng", err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ "thongbao": "Người dùng không tìm thấy" });
      }
  
      // Trả về thông báo thành công
      res.json({ "thongbao": "Cập nhật thông tin người dùng thành công" });
    });
  });
// API kiểm tra email
app.post('/check-email', (req, res) => {
    const { email } = req.body;
  
    const query = 'SELECT * FROM users WHERE email_user = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn:', err);
        return res.status(500).json({ error: 'Lỗi server' });
      }
  
      if (results.length > 0) {
        // Nếu tìm thấy email trong cơ sở dữ liệu
        return res.json({ exists: true });
      } else {
        // Nếu không tìm thấy email
        return res.json({ exists: false });
      }
    });
  });

//đặt mật khẩu mới
app.post('/reset-password', (req, res) => {
    const { email_user, phone_number, new_password } = req.body;

    // Kiểm tra nếu thiếu dữ liệu
    if (!email_user || !phone_number || !new_password) {
        return res.status(400).json({ message: '*Thiếu dữ liệu*' });
    }

    // Tìm người dùng dựa trên email và số điện thoại
    const sqlSelect = 'SELECT * FROM users WHERE email_user = ? AND sdt_user = ?';
    db.query(sqlSelect, [email_user, phone_number], (err, results) => {
        if (err) {
            console.error('Lỗi khi tìm người dùng:', err);
            return res.status(500).json({ message: 'Lỗi server' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Email hoặc số điện thoại không đúng' });
        }

        // Cập nhật mật khẩu mới
        const sqlUpdate = 'UPDATE users SET pass_user = ? WHERE email_user = ? AND sdt_user = ?';
        db.query(sqlUpdate, [new_password, email_user, phone_number], (err) => {
            if (err) {
                console.error('Lỗi khi cập nhật mật khẩu:', err);
                return res.status(500).json({ message: 'Lỗi khi cập nhật mật khẩu' });
            }

            res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
        });
    });
});


///////////////////////////////ADMIN////////////////////////////////////
// API lấy danh sách hình ảnh của homestay
app.get('/admin/homestay', (req, res) => {
    const id_homestay = req.params.id;

    const query = `
    SELECT *
    FROM homestay, hinh_homestay
    WHERE homestay.id_homestay = hinh_homestay.id_homestay 
    
    `;
    db.query(query, [id_homestay], (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// show loại homestay trong admin
app.get('/admin/loai', function (req, res){
    let sql = `SELECT * FROM loai_homestay`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list sp", err});
        else res.json(data);
    })
})
app.get('/admin/homestay/:id', (req, res) => {
    const id_homestay = req.params.id;

    const query = `
    SELECT *
    FROM homestay
    LEFT JOIN hinh_homestay ON homestay.id_homestay = hinh_homestay.id_homestay
    WHERE homestay.id_homestay = ?
    `;

    db.query(query, [id_homestay], (err, results) => {
        if (err) {
            console.error('Error fetching homestay details:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Homestay not found');
        }

        res.json(results);
    });
});

//định nghĩa route lấy chi tiết 1 loại homestay trong admin
app.get('/admin/loai/:id', function (req, res) {
    let id = parseInt(req.params.id);
    if (id <= 0){
        res.json({"thongbao":"Không tìm thấy sản phẩm", "id": id}); return;
    }
    let sql = `SELECT * FROM loai_homestay WHERE id_Loai = ?`
    db.query(sql, id, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy 1 sp", err});
        else res.json(data[0]);
    })
})


app.post('/admin/homestay', (req, res) => {
    const { ten_homestay, gia_homestay, mota, danh_gia, TrangThai, id_Loai, url_hinh } = req.body;

    if (!ten_homestay || !gia_homestay || !id_Loai || !url_hinh || typeof TrangThai === 'undefined') {
        return res.status(400).send('Please provide all required fields: ten_homestay, gia_homestay, id_Loai, TrangThai, and url_hinh.');
    }

    // Thêm homestay vào bảng Homestay
    const homestayQuery = `
    INSERT INTO Homestay (ten_homestay, gia_homestay, mota, danh_gia, TrangThai, id_Loai)
    VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(homestayQuery, [ten_homestay, gia_homestay, mota, danh_gia || "Chưa đánh giá", TrangThai, id_Loai], (err, result) => {
        if (err) {
            console.error('Error adding new homestay:', err);
            return res.status(500).send('Server error');
        }

        const homestayId = result.insertId;

        // Thêm hình ảnh vào bảng hinh_homestay cho homestay vừa tạo
        const imageQuery = `
        INSERT INTO hinh_homestay (id_homestay, url_hinh)
        VALUES (?, ?)
        `;

        db.query(imageQuery, [homestayId, url_hinh], (err) => {
            if (err) {
                console.error('Error adding image:', err);
                return res.status(500).send('Server error while adding image');
            }

            res.json({
                message: 'Homestay đã được thêm thành công'
            });
        });
    });
});


app.put('/admin/homestay/:id', (req, res) => {
    const { id } = req.params;
    const { ten_homestay, gia_homestay, mota, danh_gia, TrangThai, id_Loai, url_hinh } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!ten_homestay || !gia_homestay || !id_Loai || !url_hinh || typeof TrangThai === 'undefined') {
        return res.status(400).send('Please provide all required fields: ten_homestay, gia_homestay, id_Loai, TrangThai, and url_hinh.');
    }

    // Cập nhật bảng Homestay
    const updateHomestayQuery = `
    UPDATE Homestay 
    SET ten_homestay = ?, gia_homestay = ?, mota = ?, danh_gia = ?, TrangThai = ?, id_Loai = ?
    WHERE id_homestay = ?
    `;

    db.query(
        updateHomestayQuery,
        [ten_homestay, gia_homestay, mota, danh_gia || "Chưa đánh giá", TrangThai, id_Loai, id],
        (err, result) => {
            if (err) {
                console.error('Error updating homestay:', err);
                return res.status(500).send('Server error while updating homestay');
            }

            // Kiểm tra xem homestay có tồn tại hay không
            if (result.affectedRows === 0) {
                return res.status(404).send('Homestay not found');
            }

            // Cập nhật hình ảnh trong bảng hinh_homestay
            const updateImageQuery = `
            UPDATE hinh_homestay 
            SET url_hinh = ?
            WHERE id_homestay = ?
            `;

            db.query(updateImageQuery, [url_hinh, id], (err) => {
                if (err) {
                    console.error('Error updating image:', err);
                    return res.status(500).send('Server error while updating image');
                }

                res.json({
                    message: 'Homestay đã được cập nhật thành công'
                });
            });
        }
    );
});



//định nghĩa route xóa sản phẩm
app.delete('/admin/homestay/:id', function (req, res){
    let id = req.params.id;
    let sql = `DELETE FROM homestay WHERE id_homestay =?`
    db.query(sql, id, (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi xóa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã xóa sản phẩm thành công"});
    })
})

//Định nghĩa route thêm loại
app.post('/admin/loai', function (req, res){
    let data = req.body;
    let sql = `INSERT INTO loai_homestay SET?`
    db.query(sql, data, (err, data) => {
        if(err) 
            res.json({"thongbao": "Lỗi thêm sản phẩm", err});
        else 
            res.json({"thongbao":"Đã thêm sản phẩm thành công", "id_sp": data.insertId});
    })
})

//định nghĩa route sửa loại homestay
app.put('/admin/loai/:id', function (req, res){
    let id = req.params.id;
    let data = req.body;
    let sql = `UPDATE loai_homestay SET? WHERE id_Loai =?`
    db.query(sql, [data, id], (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi sửa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã sửa sản phẩm thành công"});
    })
})


//định nghĩa route xóa loại homestay
app.delete('/admin/loai/:id', function (req, res){
    let id = req.params.id;
    let sql = `DELETE FROM loai_homestay WHERE id_Loai =?`
    db.query(sql, id, (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi xóa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã xóa sản phẩm thành công"});
    })
})  

//định nghĩa route ds User

app.get('/admin/user', function (req, res){
    let sql = `SELECT * FROM users`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗii lấy list user", err});
        else res.json(data);
    })
})
app.get('/admin/user/:id', function (req, res){
    let id = parseInt(req.params.id);
    if (id <= 0){
        res.json({"thongbao":"Không tìm thấy sản phẩm", "id": id}); return;
    }
    let sql = `SELECT * FROM users WHERE id_user = ?`
    db.query(sql, id, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy 1 sp", err});
        else res.json(data[0]);
    })
})

//định nghĩa route sửa loại homestay
app.put('/admin/user/:id', function (req, res){
    let id = req.params.id;
    let data = req.body;
    let sql = `UPDATE users SET? WHERE id_user =?`
    db.query(sql, [data, id], (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi sửa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã sửa sản phẩm thành công"});
    })
})


//định nghĩa route xóa loại homestay
app.delete('/admin/user/:id', function (req, res){
    let id = req.params.id;
    let sql = `DELETE FROM users WHERE id_user =?`
    db.query(sql, id, (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi xóa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã xóa sản phẩm thành công"});
    })
})  


///////////////////////////////ADMIN////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////


// app.get("/admin/donhang", function(req, res){
//     let sql = `SELECT * FROM dat_homestay`
//     db.query(sql, (err, data) => {
//         if(err) res.json({"thongbao":"L��i lấy list đơn hàng", err});
//         else res.json(data);
//     })
// })

// app.listen(3000, () => console.log("ung dung chay voi port 3000"))
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
