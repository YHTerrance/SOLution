<script setup>
import { WalletMultiButton, useWallet } from "solana-wallets-vue";
import IconHome from "@/components/atoms/IconHome";
import IconTopic from "@/components/atoms/IconTopic";
import IconGift from "@/components/atoms/IconGift";
import IconUsers from "@/components/atoms/IconUsers";
import IconProfile from "@/components/atoms/IconProfile";
import IconLogo from "@/components/atoms/IconLogo.vue";
const { connected } = useWallet();

const routeLinkClass =
  "group rounded-full hover:font-bold hover:bg-gray-100 dark:hover:bg-pink-300 dark:text-white dark:hover:text-midnight-900 p-3 md:w-full inline-flex items-center space-x-4";
const iconClass =
  "h-8 w-8 text-gray-700 dark:text-white dark:group-hover:text-midnight-900";
</script>

<template>
  <aside
    class="flex flex-col items-center md:items-stretch space-y-2 md:space-y-4"
  >
    <router-link
      :to="{ name: 'Home' }"
      class="inline-block rounded-full p-3 md:self-start"
    >
      <icon-logo class="text-pink-700 h-8 md:h-[150px] w-8 md:w-[150px]" />
    </router-link>
    <div class="flex flex-col items-center md:items-stretch space-y-2">
      <router-link
        :to="{ name: 'Home' }"
        :class="routeLinkClass"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-home :class="iconClass" :isActive="isActive"></icon-home>
        <div class="text-xl hidden md:block">Home</div>
      </router-link>
      <router-link
        :to="{ name: 'Topics' }"
        :class="routeLinkClass"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-topic :class="iconClass" :isActive="isActive"></icon-topic>
        <div class="text-xl hidden md:block">Topics</div>
      </router-link>
      <router-link
        :to="{ name: 'Rewards' }"
        :class="routeLinkClass"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-gift :class="iconClass" :isActive="isActive"></icon-gift>
        <div class="text-xl hidden md:block">Rewards</div>
      </router-link>
      <router-link
        :to="{ name: 'Users' }"
        :class="routeLinkClass"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-users :class="iconClass" :isActive="isActive"></icon-users>
        <div class="text-xl hidden md:block">Users</div>
      </router-link>
      <!-- TODO: Check connected wallet. -->
      <router-link
        v-if="connected"
        :to="{ name: 'Profile' }"
        :class="routeLinkClass"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-profile :class="iconClass" :isActive="isActive"></icon-profile>
        <div class="text-xl hidden md:block">Profile</div>
      </router-link>
    </div>
    <div class="fixed bottom-8 right-8 md:static w-48 md:w-full md:pt-6">
      <wallet-multi-button></wallet-multi-button>
    </div>
  </aside>
</template>
