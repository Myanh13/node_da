// const mysql = require('mysql');

const axios = require('axios');
const express = require('express');
const app = express();
const crypto = require('crypto');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//axios
var accessKey = 'F8BBA842ECF85';
var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
app.post('/payment', async(req, res)=> {
    var orderInfo = 'pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = 'http://localhost:3001';
    var ipnUrl = 'https://f9b9-58-187-190-33.ngrok-free.app/callback';
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

app.listen(3000, () => {
    console.log(`Server running on 3000`);
});
