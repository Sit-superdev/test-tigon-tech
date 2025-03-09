<template>
  <div class="wheel-container">
    <div v-if="itemsReward?.length === 0" class="empty-wheel-message">
      กรุณาเพิ่มรายการเพื่อเริ่มการสุ่ม
    </div>

    <div v-else class="wheel-wrapper cursor-pointer"  
    @click="eventSpin"
    @touchstart.prevent="eventSpin"
    >
      <div class="wheel-pointer"></div>
      <canvas ref="wheelCanvas" class="wheel-canvas"></canvas>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "LuckyDrawWheel",
  props: {
    eventSpin: {
      type: Function,
      default: () => {}
    },
    spinning: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentRotation: 0,
      finalRotation: 0,
      animationId: null,
      startTime: null,
      canvas: null,
      ctx: null,
      itemsCount: 0,
      canvasSize: 500
    };
  },
  watch: {
    itemsReward: {
      handler(newItems) {
        this.$nextTick(() => {
          if (newItems.length !== this.itemsCount) {
            this.itemsCount = newItems.length;
          }
          this.setupCanvas();
          this.drawWheel();
        });
      },
      deep: true,
      immediate: true
    },
    "itemsReward.length"(newLength) {
      this.$nextTick(() => {
        this.setupCanvas();
        this.drawWheel();
      });
    }
  },

  mounted() {
    this.setupCanvas();
    this.itemsCount = this.itemsReward?.length; // ให้ค่าขนาด Array

    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },
  methods: {
    ...mapActions(["setWinnersReward"]),
    setupCanvas() {
      this.canvas = this.$refs.wheelCanvas;
      if (!this.canvas) return;

      this.canvas.width = this.canvasSize;
      this.canvas.height = this.canvasSize;

      this.ctx = this.canvas.getContext("2d"); // บริบทของตัว canvas ที่จะวาดภาพ
    },

    handleResize() {
      if (!this.canvas) return;

      const container = this.canvas.parentElement; // element wrap tag canvas
      if (!container) return;

      const size = Math.min(container.clientWidth, 500); //จำนวนน้อยที่สุด คือ 500
      this.canvas.style.width = `${size}px`;
      this.canvas.style.height = `${size}px`;

      this.canvasSize = size * (window.devicePixelRatio || 1); // คือการคูณด้วยความละเอียดของหน้าจอ
      this.canvas.width = this.canvasSize;
      this.canvas.height = this.canvasSize;
      this.drawWheel();
    },

    spinToAngle(degrees) {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      this.finalRotation = this.currentRotation + degrees;
      this.startTime = null;

      this.startAnimation();
    },

    startAnimation() {
      const animate = (timestamp) => {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;

        const duration = 4000;

        if (elapsed < duration) {
          const t = elapsed / duration;
          const easedT = this.cubicBezier(0.17, 0.67, 0.24, 0.99, t);

          const rotationDiff = this.finalRotation - this.currentRotation;
          const newRotation = this.currentRotation + rotationDiff * easedT;

          this.drawWheel(newRotation);
          this.animationId = requestAnimationFrame(animate); // จะทำการเรียกfunction animate ต่อไปเมื่อจบ frame
        } else {
          this.currentRotation = this.finalRotation % 360; // finalRotation รวมค่าที่มุ่ได้จากตัว dress
          this.drawWheel(this.currentRotation); // หมุนไปวาดไปไม่ใช้ css rotate
          this.spinComplete();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    },

    resetWheel() {
      // รีเซ็ตการหมุนกลับไปที่ตำแหน่งเริ่มต้น
      this.currentRotation = 0;
      this.finalRotation = 0;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      // วาดวงล้อใหม่ในตำแหน่งเริ่มต้น
      this.drawWheel(0);
    },

    cubicBezier(p1x, p1y, p2x, p2y, t) {
      const cx = 3 * p1x;
      const bx = 3 * (p2x - p1x) - cx;
      const ax = 1 - cx - bx;

      const cy = 3 * p1y;
      const by = 3 * (p2y - p1y) - cy;
      const ay = 1 - cy - by;

      const tSquared = t * t;
      const tCubed = tSquared * t;

      return ay * tCubed + by * tSquared + cy * t;
    },

    spinComplete() {
      if (this.itemsReward.length === 1) {
        this.$emit("spin-complete", this.itemsReward[0]);
        return;
      }

      const winnerIndex = this.calculateWinnerIndex();
      const winner = this.itemsReward[winnerIndex];
      this.$emit("spin-complete", winner);
    },

    calculateWinnerIndex() {
      const segmentAngle = 360 / this.itemsReward.length; // ค่าพื้นที่แต่ล่ะส่วน
      let normalizedAngle = (360 - (this.currentRotation % 360)) % 360; // หามุมของลูกศรที่ชี้ไป
      let winnerIndex = Math.floor(normalizedAngle / segmentAngle); // หารมุมของลูกศรที่ชี้ไปด้วยค่าพื้นที่แต่ล่ะส่วน
      if (winnerIndex >= this.itemsReward.length) {
        winnerIndex = 0;
      }

      return winnerIndex;
    },

    drawWheel(rotation = this.currentRotation) {
      if (!this.ctx || !this.canvas) {
        console.warn("ไม่สามารถวาด canvas ได้: ctx หรือ canvas ไม่ถูกกำหนด");
        return;
      }

      const ctx = this.ctx;
      const canvas = this.canvas;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      ctx.clearRect(0, 0, canvas.width, canvas.height); // clear พื้นที่ทั้งหมด

      if (this.itemsReward.length === 0) return;

      if (this.itemsReward.length === 1) {
        // มี item อันเดียวให้วาดเต็มๆ
        ctx.beginPath(); //เริ่มต้นวาดใหม่ ทำของเก่าให้ว่าง
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); //Math.PI * 2 = 360 องศา // 0 คือจุดเริ่มต้นของวงกลม ตำแหน่วง 3 นาฬิกา
        ctx.fillStyle = this.getColor(0);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#333";
        ctx.stroke(); //วาดขอบ ที่มีเส้นหน่าๆ

        ctx.save(); //บันทึกสถานะปัจจุบัน
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";
        ctx.font = "bold 24px Arial";
        ctx.fillText(this.itemsReward[0], centerX, centerY, radius * 1.5);
        ctx.restore(); // คืนค่าเดิม จะมีผลตอนหมุนวงล้อ ให้ได้ค่าเดิม
      } else {
        const segmentAngle = (Math.PI * 2) / this.itemsReward.length; //ทำให้พื้นที่เท่าๆกัน

        ctx.save();
        ctx.translate(centerX, centerY); // ย้ายจุดกำเนิดไปที่จุดศูนย์กลางของวงล้อ
        ctx.rotate((Math.PI / 180) * rotation); // หมุนวงล้อให้ตรงกับมุมที่ต้องการ

        for (let i = 0; i < this.itemsReward.length; i++) {
          const startAngle = i * segmentAngle;
          const endAngle = (i + 1) * segmentAngle;

          ctx.beginPath(); //เริ่มต้นวาดใหม่ ทำของเก่าให้ว่าง
          ctx.moveTo(0, 0); // ย้ายจุดกำเนิดไปที่จุดศูนย์กลางของวงล้อ
          ctx.arc(0, 0, radius, startAngle, endAngle); // วาดวงกลมตามมุมที่ต้องการ
          ctx.closePath(); // ปิดวงกลม
          ctx.fillStyle = this.getColor(i); // สีของวงกลม
          ctx.fill(); // วาดวงกลม
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#fff";
          ctx.stroke();

          const textAngle = startAngle + segmentAngle / 2;
          const textDistance = this.getTextDistance();

          ctx.save();
          ctx.rotate(textAngle);
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#333";

          let fontSize = 16;
          if (this.itemsReward.length > 10) fontSize = 14; // จัด font กรณีมีจำนวนรายการมาก
          if (this.itemsReward.length > 20) fontSize = 12;

          ctx.font = `bold ${fontSize}px Arial`;

          let text = this.itemsReward[i];
          const maxWidth = radius * 0.8;
          if (ctx.measureText(text).width > maxWidth) {
            text = this.truncateText(text, maxWidth, ctx); // จัดข้อความให้ตรงกับขนาดของวงล้อ ถ้าเกินจะตัด string ให้สั้นลง
          }

          ctx.fillText(text, textDistance, 0);
          ctx.restore();
        }

        ctx.restore();

        ctx.beginPath(); //เริ่มต้นวาดใหม่ ทำของเก่าให้ว่าง
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); // วาดวงกลมตามมุมที่ต้องการ
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#333"; // สีขอบ
        ctx.stroke(); // วาดขอบ
      }
    },

    truncateText(text, maxWidth, ctx) {
      let truncated = text;

      while (
        ctx.measureText(truncated + "...").width > maxWidth &&
        truncated.length > 0
      ) {
        //ขนาดข้อความบนภาพวาด ถ้าเกินจะตัด string ให้สั้นลง
        truncated = truncated.substring(0, truncated.length - 1); // ตัด string ให้สั้นลง
      }

      return truncated.length < text.length ? truncated + "..." : text; // ถ้าขนาดข้อความสั่นลง  จะเติมตัวอักษร ...
    },

    getTextDistance() {
      //คำนวณระยะห่างของข้อความบนภาพวาด ยิ่งเยอะยิ่งห่าง
      const radius =
        Math.min(this.canvas.width / 2, this.canvas.height / 2) - 10;

      let distance = radius * 0.7;

      if (this.itemsReward.length <= 4) {
        distance = radius * 0.6;
      } else if (this.itemsReward.length <= 8) {
        distance = radius * 0.65;
      } else if (this.itemsReward.length <= 12) {
        distance = radius * 0.7;
      } else {
        distance = radius * 0.75;
      }

      return distance;
    },

    getColor(index) {
      const colors = [
        "#FF9AA2",
        "#FFB7B2",
        "#FFDAC1",
        "#E2F0CB",
        "#B5EAD7",
        "#C7CEEA",
        "#FDFFAB",
        "#AEC6CF",
        "#F49AC2",
        "#B39EB5",
        "#98FB98",
        "#FFD700",
        "#FFC0CB",
        "#87CEFA",
        "#9370DB",
        "#FF6347",
        "#00CED1",
        "#FF7F50",
        "#20B2AA",
        "#FF69B4"
      ];
      return colors[index % colors.length];
    }
  },
  computed: {
    ...mapState(["itemsReward", "winnersReward"])
  }
};
</script>

<style scoped>
.wheel-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  height: 500px;
}

.empty-wheel-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  border: 2px dashed #ccc;
  border-radius: 50%;
  padding: 20px;
  font-size: 1.2em;
  color: #666;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.wheel-canvas {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.wheel-pointer {
  position: absolute;
  top: 50%;
  right: -35px;
  transform: translateY(-50%);
  width: 40px;
  height: 30px;
  background-color: red;
  clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
  z-index: 10;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 500px) {
  .wheel-container {
    height: auto;
    aspect-ratio: 1 / 1;
  }
}
</style>
