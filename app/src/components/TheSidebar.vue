<script setup>
import { WalletMultiButton, useWallet } from "solana-wallets-vue";
import IconHome from "@/components/atoms/IconHome";
import IconTopic from "@/components/atoms/IconTopic";
import IconUsers from "@/components/atoms/IconUsers";
import IconProfile from "@/components/atoms/IconProfile";
const { connected } = useWallet();
</script>

<template>
  <aside
    class="flex flex-col items-center md:items-stretch space-y-2 md:space-y-4"
  >
    <router-link
      :to="{ name: 'Home' }"
      class="inline-block rounded-full hover:bg-gray-100 p-3 md:self-start"
    >
      <icon-topic
        class="text-pink-500 h-8 md:h-10 w-8 md:w-10"
        v-bind:isActive="true"
      />
    </router-link>
    <div class="flex flex-col items-center md:items-stretch space-y-2">
      <router-link
        :to="{ name: 'Home' }"
        class="rounded-full hover:bg-gray-100 p-3 md:w-full inline-flex items-center space-x-4"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-home
          v-if="isActive"
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="true"
        ></icon-home>
        <icon-home
          v-else
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="false"
        ></icon-home>
        <div class="text-xl hidden md:block">Home</div>
      </router-link>
      <router-link
        :to="{ name: 'Topics' }"
        class="rounded-full hover:bg-gray-100 p-3 md:w-full inline-flex items-center space-x-4"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-topic
          v-if="isActive"
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="true"
        ></icon-topic>
        <icon-topic
          v-else
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="false"
        ></icon-topic>
        <div class="text-xl hidden md:block">Topics</div>
      </router-link>
      <router-link
        :to="{ name: 'Users' }"
        class="rounded-full hover:bg-gray-100 p-3 md:w-full inline-flex items-center space-x-4"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-users
          v-if="isActive"
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="true"
        ></icon-users>
        <icon-users
          v-else
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="false"
        ></icon-users>
        <div class="text-xl hidden md:block">Users</div>
      </router-link>
      <!-- TODO: Check connected wallet. -->
      <router-link
        v-if="connected"
        :to="{ name: 'Profile' }"
        class="rounded-full hover:bg-gray-100 p-3 md:w-full inline-flex items-center space-x-4"
        active-class="font-bold"
        v-slot="{ isActive }"
      >
        <icon-profile
          v-if="isActive"
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="true"
        ></icon-profile>
        <icon-profile
          v-else
          class="h-8 w-8 text-gray-700"
          v-bind:isActive="false"
        ></icon-profile>
        <div class="text-xl hidden md:block">Profile</div>
      </router-link>
    </div>
    <div class="fixed bottom-8 right-8 md:static w-48 md:w-full">
      <wallet-multi-button></wallet-multi-button>
    </div>
  </aside>
</template>
