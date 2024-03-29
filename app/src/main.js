// CSS
import "solana-wallets-vue/styles.css";
import "./main.css";
import "flowbite";

// Day.js
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// Routing.
import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Global stores
import { createPinia } from "pinia";

// Create the app
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).use(createPinia()).use(router).mount("#app");
