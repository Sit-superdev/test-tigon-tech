<template>
  <div class="lucky-draw">
    <div class="wheel-container">
      <div class="wheel" :style="wheelStyle">
        <div v-for="(item, index) in items" 
             :key="index" 
             class="wheel-item"
             :style="getItemStyle(index)">
          <div class="wheel-content" :style="getContentStyle(index)">
            {{ item.name }}
          </div>
        </div>
      </div>
      <!-- เพิ่มตัวชี้ -->
      <div class="pointer"></div>
    </div>
    <button @click="spin" :disabled="isSpinning">หมุน!</button>
    
    <div v-if="winner" class="winner-display">
      <h2>🎉 ยินดีด้วย! 🎉</h2>
      <p>คุณ {{ winner.name }}</p>
      <p>ได้รับ: {{ winner.prize }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = [
  { name: 'สมชาย', prize: 'รางวัลที่ 1', color: '#FF6B6B' },
  { name: 'สมหญิง', prize: 'รางวัลที่ 2', color: '#4ECDC4' },
  { name: 'สมศรี', prize: 'รางวัลที่ 3', color: '#45B7D1' },
  { name: 'สมพงษ์', prize: 'รางวัลที่ 4', color: '#96CEB4' },
  { name: 'สมใจ', prize: 'รางวัลที่ 5', color: '#FFBE0B' },
  { name: 'สมปอง', prize: 'รางวัลที่ 6', color: '#FF006E' },
]

// ... existing rotation, isSpinning, winner refs ...

const getItemStyle = (index) => {
  const degree = (360 / items.length) * index
  return {
    transform: `rotate(${degree}deg)`,
    'clip-path': `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
    width: '100%',
    height: '100%',
    position: 'absolute',
    'transform-origin': '50% 50%'
  }
}

const getContentStyle = (index) => {
  const degree = (360 / items.length) * index
  const bgColor = items[index].color
  return {
    transform: `rotate(${-degree}deg)`,
    backgroundColor: bgColor,
    border: '2px solid white'
  }
}

// ... existing other methods ...
</script>

<style scoped>
.lucky-draw {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.wheel-container {
  width: 400px;
  height: 400px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  border: 10px solid #333;
  overflow: hidden;
  background: #f0f0f0;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
}

.wheel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.wheel-content {
  position: absolute;
  width: 50%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  text-align: center;
  padding: 10px;
  font-size: 18px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* เพิ่มตัวชี้ */
.pointer {
  position: absolute;
  top: -20px;
  width: 40px;
  height: 40px;
  background: #333;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  z-index: 100;
}

button {
  padding: 12px 30px;
  font-size: 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.2);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.winner-display {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  text-align: center;
  animation: fadeIn 0.5s ease-in;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.winner-display h2 {
  color: #28a745;
  margin-bottom: 10px;
  font-size: 24px;
}

.winner-display p {
  font-size: 20px;
  margin: 5px 0;
  color: #333;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 