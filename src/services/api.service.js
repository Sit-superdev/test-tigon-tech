import axios from "../plugins/axios";

// สร้าง service สำหรับการเรียกใช้ API ที่เกี่ยวข้องกับวงล้อสุ่มรางวัล
export const luckyDrawService = {
  spinWheel(degrees) {
    return axios.post("/spin-wheel", { degrees });
  }
};


export const roomService = {
  // สร้างห้องใหม่

  addPeople(roomData) {
    return axios.post("/add-people", roomData);
  },
  addReward(roomData) {
    return axios.post("/add-reward", roomData);
  },

  updatePeople(roomData) {
    return axios.patch("/update-people", roomData);
  },

  removePeople(roomData) {
    return axios.post("/remove-people", roomData);
  }
};

// สามารถเพิ่ม service อื่นๆ ได้ตามต้องการ
