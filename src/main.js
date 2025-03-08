import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import Pusher from "pusher-js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faHome, faEdit, faPen, faTrash, faTrophy, faCircleNotch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

library.add(faUser, faHome, faEdit, faPen, faTrash, faTrophy, faCircleNotch, faPlus);

// สร้าง Pusher instance
const pusher = new Pusher("f25f2376f4ef8827511e", {
  cluster: "ap1", // หรือ cluster ที่คุณใช้
  encrypted: true
});

// สร้าง global event bus
const eventBus = {};

const app = createApp(App);

// กำหนด pusher เป็น global property
app.config.globalProperties.$pusher = pusher;
app.config.globalProperties.$eventBus = eventBus;

app.use(store).use(router).use(FloatingVue).component("font-awesome-icon", FontAwesomeIcon).mount("#app");
document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
