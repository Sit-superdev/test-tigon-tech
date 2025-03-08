<template>
  <div class="">
    <h1 v-if="statusHide" class="mt-5 text-center">Lucky Draw</h1>
    <LuckyDrawWheel
      ref="luckyWheel"
      :eventSpin="eventSpin"
      :items="itemsReward"
      :spinning="spinning"
      @spin-complete="handleSpinComplete"
    />

    <div v-if="winnersReward.length > 0 && statusHide" class="winners-history">
      <h3>ประวัติผู้ได้รับรางวัล ({{ winnersReward.length }})</h3>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">ชื่อ</th>
            <th scope="col">วันที่</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(winner, index) in displayedWinners.reverse()"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ winner }}</td>
            <td>{{ new Date().toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import LuckyDrawWheel from "./LuckyDraw.vue";
export default {
  name: "App",
  components: {
    LuckyDrawWheel
  },
  props: {
    eventSpin: {
      type: Function,
      default: () => {}
    },

    statusHide: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      items: [],
      newItem: "",
      spinning: false,
      winner: null,
      winners: [],
      editingIndex: -1,
      editingText: "",
      sampleCount: 100,
      showAll: false,
      channel: null
    };
  },
  computed: {
    ...mapState(["itemsReward", "winnersReward"]),
    displayedItems() {
      if (this.showAll || this.itemsReward.length <= 100) {
        return this.itemsReward;
      } else {
        return this.itemsReward.slice(0, 100);
      }
    },
    displayedWinners() {
      return this.winnersReward.slice(-10);
    }
  },
  mounted() {
    // เชื่อมต่อกับ Pusher channel
    this.channel = this.$pusher.subscribe("spinner");

    this.channel.bind("add-people", (data) => {
      this.setItemsReward([...data]);
      this.itemsCount = this.itemsReward.length;
    });

    this.channel.bind("add-reward", (data) => {
      this.setWinnersReward([...data]);
    });

    this.channel.bind("update-people", (data) => {
      this.setItemsReward([...data]);
    });

    this.channel.bind("remove-people", (data) => {
      this.setItemsReward(data);
      this.itemsCount = this.itemsReward.length;
    });

    this.channel.bind("spin-wheel", (data) => {
      if (this.$refs.luckyWheel) {
        this.$refs.luckyWheel.spinToAngle(data.randomDegrees); //ไปทำ function ต่อใน LuckyDraw.vue
      } else {
        console.error("ไม่พบ luckyWheel ref");
      }
    });
  },
  methods: {
    ...mapActions(["setItemsReward", "setWinnersReward"]),
    loadSampleData() {
      const count = parseInt(this.sampleCount);
      if (isNaN(count) || count < 1) {
        alert("กรุณาใส่จำนวนตัวอย่างที่ถูกต้อง");
        return;
      }

      const finalCount = Math.min(count, 5000);

      if (finalCount > 1000) {
        if (
          !confirm(
            `คุณกำลังจะโหลดข้อมูลจำนวน ${finalCount} รายการ ซึ่งอาจทำให้เว็บทำงานช้าลง คุณแน่ใจหรือไม่?`
          )
        ) {
          return;
        }
      }

      const sampleData = [];
      for (let i = 1; i <= finalCount; i++) {
        sampleData.push(`A${i}`);
      }

      this.setItemsReward(sampleData);

      this.winner = null;
      this.editingIndex = -1;
      this.editingText = "";

      alert(`โหลดข้อมูลตัวอย่าง A1-A${finalCount} เรียบร้อยแล้ว`);

      this.$nextTick(() => {
        if (this.$refs.luckyWheel) {
          this.$refs.luckyWheel.drawWheel();
        }
      });
    },
    updateWinnersReward() {
      this.setWinnersReward(this.winnersReward.slice(-10));
    },
    addItem() {
      if (this.newItem.trim()) {
        this.setItemsReward([...this.itemsReward, this.newItem.trim()]);
        this.newItem = "";
      }
    },
    removeItem(index) {
      this.setItemsReward(this.itemsReward.filter((_, i) => i !== index));
    },
    resetItems() {
      this.setItemsReward([]);
      this.winner = null;
    },
    spinWheel() {
      if (this.itemsReward.length < 2) {
        alert("ต้องมีรายการอย่างน้อย 2 รายการเพื่อทำการสุ่ม");
        return;
      }

      this.spinning = true;
      this.winner = null;

      // สร้างองศาสุ่มสำหรับการหมุน (1800-3600 องศา = 5-10 รอบ)
      const randomDegrees = 1800 + Math.floor(Math.random() * 1800);

      // ส่งคำสั่งหมุนวงล้อไปยัง Pusher (ถ้าต้องการใช้ real-time)

      //   เรียกใช้ฟังก์ชัน spinToAngle ของ LuckyDrawWheel
    },
    handleSpinComplete(winner) {
      this.winner = winner;
      this.spinning = false;

      setTimeout(async () => {
        await alert(`🎉 ยินดีด้วย! 🎉 ผู้ได้รับรางวัลคือ: ${winner}`);

        this.setWinnersReward([...this.winnersReward, winner]);
        const winnerIndex = this.itemsReward.indexOf(winner);
        if (winnerIndex !== -1) {
          this.setItemsReward(
            this.itemsReward.filter((_, i) => i !== winnerIndex)
          );
        }

        this.$nextTick(() => {
          this.$refs.luckyWheel.resetWheel();
          if (this.$refs.luckyWheel) {
            this.$refs.luckyWheel.drawWheel();
          }
        });
      }, 500);
    },
    editItem(index) {
      this.editingIndex = index;
      this.editingText = this.itemsReward[index];

      this.$nextTick(() => {
        if (this.$refs.editInput) {
          const input = Array.isArray(this.$refs.editInput)
            ? this.$refs.editInput[0]
            : this.$refs.editInput;

          if (input) {
            input.focus();
            input.select();
          }
        }
      });
    },
    saveEdit() {
      if (this.editingIndex >= 0 && this.editingText.trim()) {
        this.itemsReward[this.editingIndex] = this.editingText.trim();

        this.cancelEdit();

        this.$nextTick(() => {
          if (this.$refs.luckyWheel) {
            this.$refs.luckyWheel.drawWheel();
          }
        });
      }
    },
    cancelEdit() {
      this.editingIndex = -1;
      this.editingText = "";
    }
  },
  watch: {}
};
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.sample-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.sample-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sample-input input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.sample-btn {
  background: #4a6da7;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 4px;
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.toggle-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.controls {
  margin: 20px 0;
}

.controls input {
  padding: 8px;
  width: 300px;
  margin-right: 10px;
}

.controls button {
  padding: 8px 15px;
  margin: 0 5px;
  cursor: pointer;
}

.item-list {
  margin: 20px 0;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

.items-container {
  list-style-type: none;
  padding: 0;
}

.item-list li {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.display-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.edit-mode input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-buttons,
.edit-buttons {
  display: flex;
  gap: 5px;
}

.edit-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 3px;
}

.remove-btn {
  background: #ff5555;
  color: white;
  border: none;
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 3px;
}

.save-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 3px;
}

.cancel-btn {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 3px;
}

.winner-announcement {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 10px;
  animation: highlight 1s ease-in-out;
}

.winners-history {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f8ff;
  border-radius: 10px;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
}

.winners-history ul {
  list-style-type: none;
  padding: 0;
}

.winners-history li {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

@keyframes highlight {
  0% {
    background-color: #ffee58;
  }
  100% {
    background-color: #f8f8f8;
  }
}
</style>
