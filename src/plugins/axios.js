import axios from "axios";

// กำหนดค่าเริ่มต้นของ axios
const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:9000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// เพิ่ม interceptor สำหรับการจัดการ response
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log(error, "error");
    if (error.response) {
      console.error("เกิดข้อผิดพลาดจาก API:", error.response.status, error.response.data);

      switch (error.response.status) {
        case 404:
          console.warn("ไม่พบข้อมูลที่ร้องขอ");
          break;

        case 500:
          console.error("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์");
          break;

        default:
          console.error("เกิดข้อผิดพลาดที่ไม่ได้ระบุ");
          break;
      }
    } else if (error.request) {
      console.error("ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์");
    } else {
      console.error("เกิดข้อผิดพลาดในการตั้งค่าคำขอ:", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
