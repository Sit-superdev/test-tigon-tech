import { createRouter, createWebHistory } from "vue-router";
import formLuckyDraw from "../components/formLuckyDraw.vue";
import ManageRoomView from "../components/ManageRoomView.vue";

const routes = [
  {
    path: "/",
    name: "lucky-draw",
    component: formLuckyDraw
  },
  {
    path: "/manage-room",
    name: "manage-room",
    component: ManageRoomView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
