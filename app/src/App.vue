<script setup>
import { useRoute } from "vue-router";
import TheSidebar from "./components/TheSidebar";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { initWallet } from "solana-wallets-vue";
import { initWorkspace } from "./composables";
import { useStatus } from "@/stores";
import ToastItem from "./components/atoms/ToastItem.vue";

const route = useRoute();
const status = useStatus();

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

initWallet({ wallets, autoConnect: true });
initWorkspace();
</script>

<template>
  <div class="w-full max-w-3xl lg:max-w-4xl mx-auto">
    <!-- sidebar -->
    <the-sidebar
      class="py-4 md:py-8 md:pl-4 md:pr-8 fixed w-20 md:w-64 z-[10] md:z-auto"
    ></the-sidebar>

    <!-- Main -->
    <main
      class="flex-1 border-r border-l ml-20 md:ml-64 min-h-screen dark:border-pink-200"
    >
      <header
        class="flex space-x-6 items-center justify-between px-8 py-4 border-b dark:text-white dark:border-pink-200"
      >
        <div class="text-xl font-bold" v-text="route.name"></div>

        <button
          id="theme-toggle"
          type="button"
          class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
        >
          <svg
            id="theme-toggle-dark-icon"
            class="w-4 h-4 hidden"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            ></path>
          </svg>
          <svg
            id="theme-toggle-light-icon"
            class="w-4 h-4 hidden"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </header>
      <router-view></router-view>
    </main>
    <div v-for="_status in status.statuses" :key="_status.timestamp">
      <toast-item
        :status="_status"
        @delete="status.deleteStatus(_status.timestamp)"
      ></toast-item>
    </div>
  </div>
</template>
