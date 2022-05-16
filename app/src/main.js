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

// Create the app
import { createApp } from "vue";
import App from "./App.vue";
import VueMarkdownIt from 'vue3-markdown-it';
import MathJax, { initMathJax, renderByMathjax } from 'mathjax-vue3'

// Rewrite pageReady method, optimizing MathJax as required rendering and render to avoid them
// ❗️❗️ For example '<span>$$Not a formula$$</span>' is not going to render, but in fact will be rendered into formula， As below is not the el

function onMathJaxReady() {
  // The parent node of need to be rendered into the formula node set
  const el = document.getElementById('elementId')
  // ❗️❗️ When there is no el will begin to render the default root node
  renderByMathjax(el)
}

initMathJax({}, onMathJaxReady)

createApp(App).use(router).use(VueMarkdownIt).use(MathJax).mount("#app");
