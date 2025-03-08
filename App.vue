<template>
  <div class="container">
    <h1>วงล้อสุ่มรางวัล</h1>
    
    <div class="controls">
      <input v-model="newItem" placeholder="ใส่ชื่อหรือรายการที่ต้องการสุ่ม" @keyup.enter="addItem" />
      <button @click="addItem">เพิ่มรายการ</button>
      <button @click="spinWheel" :disabled="items.length < 2 || spinning">หมุนวงล้อ</button>
      <button @click="resetItems">ล้างรายการทั้งหมด</button>
    </div>
    
    <div class="item-list">
      <h3>รายการทั้งหมด ({{ items.length }})</h3>
      <ul>
        <li v-for="(item, index) in items" :key="index">
          {{ item }}
          <button @click="removeItem(index)" class="remove-btn">ลบ</button>
        </li>
      </ul>
    </div>
    
    <LuckyDrawWheel 
      :items="items" 
      :spinning="spinning" 
      :winner-index="winnerIndex" 
      @spin-complete="handleSpinComplete" 
    />
    
    <div v-if="winner" class="winner-announcement">
      <h2>🎉 ขอแสดงความยินดี! 🎉</h2>
      <h3>ผู้ชนะคือ: {{ winner }}</h3>
    </div>
  </div>
</template>

<script>
import LuckyDrawWheel from './components/LuckyDrawWheel.vue';

export default {
  name: 'App',
  components: {
    LuckyDrawWheel
  },
  data() {
    return {
      items: [],
      newItem: '',
      spinning: false,
      winnerIndex: -1,
      winner: null
    };
  },
  methods: {
    addItem() {
      if (this.newItem.trim()) {
        this.items.push(this.newItem.trim());
        this.newItem = '';
      }
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    resetItems() {
      this.items = [];
      this.winner = null;
      this.winnerIndex = -1;
    },
    spinWheel() {
      if (this.items.length < 2) return;
      
      this.spinning = true;
      this.winner = null;
      
      // สุ่มผู้ชนะ
      this.winnerIndex = Math.floor(Math.random() * this.items.length);
    },
    handleSpinComplete() {
      this.winner = this.items[this.winnerIndex];
      this.spinning = false;
    }
  }
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
  max-height: 200px;
  overflow-y: auto;
}

.item-list ul {
  list-style-type: none;
  padding: 0;
}

.item-list li {
  padding: 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.remove-btn {
  background: #ff5555;
  color: white;
  border: none;
  padding: 2px 5px;
  cursor: pointer;
}

.winner-announcement {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 10px;
  animation: highlight 1s ease-in-out;
}

@keyframes highlight {
  0% { background-color: #ffee58; }
  100% { background-color: #f8f8f8; }
}
</style> 