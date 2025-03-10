<template>
  <div 
  :class=" statusHide ? 'box-lucky-draw' : '' "
  class="d-flex flex-column justify-content-center align-items-center">
    <LuckyDrawWheel
      class="p-4"
      ref="luckyWheel"
      :eventSpin="eventSpin"
      :items="itemsReward"
      :spinning="spinning"
      @spin-complete="handleSpinComplete"
    />
    <h3 v-if="winnersReward.length > 0 && statusHide" class="text-center">ประวัติผู้ได้รับรางวัล ({{ winnersReward.length }})</h3>
    <div v-if="winnersReward.length > 0 && statusHide" class="winners-history w-100 container">
  

      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">ชื่อ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(winner, index) in displayedWinners.reverse()"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ winner }}</td>
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
      console.log('add-people', data);
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
    }
  },
  watch: {}
};
</script>

<style>
.box-lucky-draw {
  height:100vh;
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


@keyframes highlight {
  0% {
    background-color: #ffee58;
  }
  100% {
    background-color: #f8f8f8;
  }
}
</style>
