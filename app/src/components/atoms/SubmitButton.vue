<script setup>
import { toRefs, computed } from "vue";
import IconSpinner from "@/components/atoms/IconSpinner.vue";

// Props.
const props = defineProps({
  loading: Boolean,
  enabled: Boolean,
  ticks: Number,
});
const { loading, enabled, ticks } = toRefs(props);
const confirmationStatus = computed(() => {
  if (ticks.value < 4) return "loading";
  else return "almost-done";
});
const emit = defineEmits(["click"]);
</script>

<template>
  <!-- question button. -->
  <button
    v-if="!loading"
    class="text-white px-4 py-2 rounded-full font-semibold"
    :disabled="!enabled"
    :class="
      enabled
        ? 'bg-pink-500 dark:bg-pink-700'
        : 'bg-gray-400 cursor-not-allowed'
    "
    @click="emit('click')"
  >
    <slot> Ask </slot>
  </button>
  <button
    v-else-if="confirmationStatus == 'loading'"
    type="button"
    class="inline-flex text-center items-center text-white px-4 py-2 rounded-full font-semibold bg-pink-300 cursor-not-allowed"
    disabled
  >
    <icon-spinner class="mr-3 inline"></icon-spinner>
    Loading...
  </button>
  <button
    v-else-if="confirmationStatus == 'almost-done'"
    type="button"
    class="inline-flex text-center items-center text-white px-4 py-2 rounded-full font-semibold bg-green-300 cursor-not-allowed"
    disabled
  >
    <icon-spinner class="mr-3 inline text-white"></icon-spinner>
    Almost done...
  </button>
</template>
