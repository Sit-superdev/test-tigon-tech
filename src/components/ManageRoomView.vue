<template>
  <div class="manage-room container">
    <div class="sample-controls">
      <div class="sample-input">
        <label>จำนวนตัวอย่าง:</label>
        <input
          v-model.number="sampleCount"
          type="number"
          min="1"
          max="5000"
          placeholder="ใส่จำนวนตัวอย่าง"
        />
      </div>
      <button @click="loadSampleData" class="btn btn-primary btn-sm">
        โหลดข้อมูลตัวอย่าง (A1-A{{ sampleCount }})
      </button>
    </div>
    <div class="d-flex flex-wrap justify-content-start align-items-center  gap-2">
      <input
        v-model="newItem"
        placeholder="ใส่ชื่อหรือรายการที่ต้องการสุ่ม"
        class="form-control width-member"
        @keyup.enter="addItem"
      />
      <button @click="addItem" class="btn btn-primary btn-sm">
        <font-awesome-icon  icon="plus"  />
      </button>

      <button
        @click="spinWheel"
        :disabled="itemsReward.length < 2 || spinning"
        class="btn btn-primary btn-sm"
        v-tooltip="{
          content: 'สุ่มรางวัล',
          placement: 'top',
          trigger: 'hover'
        }"
      >
        <font-awesome-icon  icon="circle-notch"  />
      </button>
      <button 
        @click="resetItems" 
        class="btn btn-primary btn-sm"
                v-tooltip="{
          content: 'ลบรายการทั้งหมด',
          placement: 'top',
          trigger: 'hover'
        }"
        >
        <font-awesome-icon  icon="trash"  />
      </button>
    </div>
    <div class="mt-4">
      <div
        class="list-controls d-flex justify-content-start align-items-center gap-2 flex-wrap"
      >
        <button
          @click="showAll = 'all'"
          class="btn btn-sm width-member-mobile"
          :class="showAll == 'all' ? 'btn-primary' : 'btn-outline-primary'"
        >
          ทั้งหมด
        </button>
        <button
          @click="showAll = 'winners'"
          class="btn btn-sm width-member-mobile"
          :class="showAll == 'winners' ? 'btn-primary' : 'btn-outline-primary'"
        >
        ผู้ที่ได้รับรางวัล
        </button>
        <button
          @click="showAll = 'participants'"
          class="btn btn-sm width-member-mobile"
          :class="
            showAll == 'participants' ? 'btn-primary' : 'btn-outline-primary'
          "
        >
        ผู้เข้าร่วม
        </button>

        <h5 class="mb-0">รายการทั้งหมด ({{ displayedItems.length }})</h5>
      </div>
    </div>
    
    <formLuckyDraw   
    :statusHide="false"
    :eventSpin="spinWheel"
    ></formLuckyDraw>

    <div class="item-list">
      <table class="table mt-4" v-if="displayedItems.length > 0">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>ชื่อ</th>
            <th v-if="showAll === 'all'">รางวัล</th>
            <th>วันที่</th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in displayedItems" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item }}</td>
            <td v-if="showAll === 'all'">
              <font-awesome-icon v-if="displayReward(item)" icon="trophy" />
            </td>

            <td>{{ new Date().toLocaleString() }}</td>

            <td>
              <div v-if="showAll == 'winners'">
                <button @click="tradeWinner(item,index)" class="btn btn-primary btn-sm">
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
              <div v-else>
                <div v-if="editingIndex === index">
                  <input
                    v-model="editingText"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                    ref="editInput"
                  />
                  <div class="edit-buttons">
                    <button @click="saveEdit" class="btn btn-primary btn-sm">บันทึก</button>
                    <button @click="cancelEdit" class="btn btn-outline-primary btn-sm">
                      ยกเลิก
                    </button>
                  </div>
                </div>
                <div v-else class="action-buttons">
                  <button @click="editItem(index)" class="edit-btn">
                    <font-awesome-icon icon="pen" />
                  </button>
                  <button @click="removeItem(index)" class="remove-btn">
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center">ไม่มีข้อมูล</div>
    </div>
  </div>
</template>

<script>
import { roomService, luckyDrawService } from "../services/api.service";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import formLuckyDraw from "./formLuckyDraw.vue";
export default {
  name: "ManageRoomView",
  components: {
    formLuckyDraw
  },
  data() {
    return {
      channel: null,
      items: [],
      newItem: "",
      spinning: false,
      winners: [],
      lastWinner: null,
      editingIndex: -1,
      editingText: "",
      sampleCount: 100,
      showAll: "all"
    };
  },
  computed: {
    ...mapState(["itemsReward", "winnersReward"]),
    displayedItems() {
      if (this.showAll === "all") {
        return [...this.winnersReward, ...this.itemsReward];
      } else if (this.showAll === "winners") {
        return this.winnersReward;
      } else if (this.showAll === "participants") {
        return this.itemsReward;
      } else {
        return [];
      }
    },
    displayReward(item) {
      return (item) => {
        if (this.winnersReward.includes(item)) {
          return true;
        } else {
          return false;
        }
      };
    }
  },
  watch: {
    winnersReward: {
      handler(newWinners) {
        this.winners = [...newWinners];
        if (newWinners.length > 0) {
          this.lastWinner = newWinners[newWinners.length - 1];
        }
      },
      deep: true,
      immediate: true
    }
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
      this.editingIndex = -1;
      this.editingText = "";
      this.lastWinner = null;
      roomService.addPeople({ items: this.itemsReward });

      alert(`โหลดข้อมูลตัวอย่าง A1-A${finalCount} เรียบร้อยแล้ว`);
    },

    addItem() {
      if (this.newItem.trim()) {

        if (this.itemsReward.includes(this.newItem.trim())) {
          this.newItem = "";
          alert("รายการนี้มีอยู่ในรายการแล้ว");
          return;
        }

        this.setItemsReward([...this.itemsReward, this.newItem.trim()]);
        this.newItem = "";
        roomService.addPeople({ items: this.itemsReward });
      }

    },

    removeItem(index) {
      if (confirm("ยืนยันลบรายการ")) {
        this.setItemsReward(this.itemsReward.filter((_, i) => i !== index));
        roomService.removePeople({ items: this.itemsReward });
      }
    },

    resetItems() {
      // this.items = [];
      this.setItemsReward([]);
      this.setWinnersReward([]);
      this.lastWinner = null;
      roomService.removePeople({ items: [] });
    },

    async spinWheel() {
      if (this.itemsReward.length < 2) {
        alert("ต้องมีรายการอย่างน้อย 2 รายการเพื่อทำการสุ่ม");
        return;
      }

      this.spinning = true;
      this.winner = null;
      roomService.addPeople({ items: this.itemsReward });
      roomService.addReward({ items: this.winnersReward });
      // สร้างองศาสุ่มสำหรับการหมุน (1800-3600 องศา = 5-10 รอบ)
      //สุ่ม 0-0.99
      const randomDegrees = 1800 + Math.floor(Math.random() * 1800); // จะได้ค่ามุมที่สุ่มได้ตั้งแต่ 1800-3600 องศา  มากสุด 1800 + 1799 = 3599
      await luckyDrawService.spinWheel({ randomDegrees: randomDegrees }); // ส่งค่ามุมที่สุ่มได้ไปยัง API แล้วเกิด trigger spin-wheel ของตัว pusher
      this.spinning = false;
    },


    tradeWinner(item,index) {
      if (confirm(`ยืนยันยกเลิกการให้รางวัลคุณ ${item} `)) {
        let dataWinner = [...this.winnersReward]
        dataWinner.splice(index, 1);
        this.setWinnersReward(dataWinner);
        this.setItemsReward([...this.itemsReward, item]);
        roomService.addReward({ items: this.winnersReward });
        roomService.addPeople({ items: this.itemsReward });
      }
    },

    removeWinner() {
      if (this.lastWinner && this.winners.length > 0) {
        const index = this.winners.indexOf(this.lastWinner);
        if (index !== -1) {
          this.winners.splice(index, 1);
          this.items.push(this.lastWinner);
          this.lastWinner =
            this.winners.length > 0
              ? this.winners[this.winners.length - 1]
              : null;
        }
      }
    },

    editItem(index) {
      this.editingIndex = index;
      this.editingText = this.itemsReward[index];
    },

    saveEdit() {
      if (this.editingIndex >= 0 && this.editingText.trim()) {
        this.itemsReward[this.editingIndex] = this.editingText.trim();
        roomService.updatePeople({ items: this.itemsReward });
        this.cancelEdit();
      } else {
        alert("กรุณาใส่ชื่อหรือรายการที่ต้องการแก้ไข");
      }
    },

    cancelEdit() {
      this.editingIndex = -1;
      this.editingText = "";
    }
  }
};
</script>

<style scoped>
.manage-room {
  max-width: 1400px;
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

.item-list {
  margin: 20px 0;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
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







.width-member {
  width: 250px;
}



.width-member-mobile {
  width: content;
}

@media only screen and (max-width: 400px) {
  .width-member-mobile{
    width:100%
  }
}


</style>
