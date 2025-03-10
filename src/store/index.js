import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      itemsReward: [],
      winnersReward: []
    };
  },
  mutations: {
    setItemsReward(state, newItems) {
      state.itemsReward = newItems;
    },
    setWinnersReward(state, newWinners) {
      state.winnersReward = newWinners;
    }
  },
  actions: {
    setItemsReward(context, newItems) {
      context.commit("setItemsReward", newItems);
    },
    setWinnersReward(context, newWinners) {
      context.commit("setWinnersReward", newWinners);
    }
  }
});
