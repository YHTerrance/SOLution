<script setup>
import { toRefs } from "vue";

const props = defineProps({
  isActive: Boolean,
});

const { isActive } = toRefs(props);
</script>

<template>
  <div class="hover:bg-pink-100 rounded-full p-1">
    <svg
      v-if="!isActive"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <title>Share Social</title>
      <circle
        cx="128"
        cy="256"
        r="48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
      />
      <circle
        cx="384"
        cy="112"
        r="48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
      />
      <circle
        cx="384"
        cy="400"
        r="48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
      />
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
        d="M169.83 279.53l172.34 96.94M342.17 135.53l-172.34 96.94"
      />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 512 512"
    >
      <title>Share Social</title>
      <path
        d="M384 336a63.78 63.78 0 00-46.12 19.7l-148-83.27a63.85 63.85 0 000-32.86l148-83.27a63.8 63.8 0 10-15.73-27.87l-148 83.27a64 64 0 100 88.6l148 83.27A64 64 0 10384 336z"
      />
    </svg>
  </div>
</template>
