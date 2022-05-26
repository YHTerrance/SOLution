<script setup>
import { computed, ref, toRefs } from "vue";
import {
  useAutoresizeTextarea,
  useCountCharacterLimit,
  useSlug,
} from "@/composables";
import SubmitButton from "@/components/atoms/SubmitButton.vue";
import { askQuestion } from "@/api";
import { useWallet } from "solana-wallets-vue";
import ToastItem from "@/components/atoms/ToastItem.vue";
import { Status } from "@/models";
import { BASE_FEE_LAMPORTS } from "@/const";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Props.
const props = defineProps({
  forcedTopic: String,
});
const { forcedTopic } = toRefs(props);

// Form data.
const content = ref("");
const topic = ref("");
const amount = ref();
const deposit = BASE_FEE_LAMPORTS / LAMPORTS_PER_SOL;
const slugTopic = useSlug(topic);
const effectiveTopic = computed(() => forcedTopic.value ?? slugTopic.value);

// Auto-resize the content's textarea.
const textarea = ref();
useAutoresizeTextarea(textarea);

// Character limit / count-down.
const characterLimit = useCountCharacterLimit(content, 280);
const characterLimitColour = computed(() => {
  if (characterLimit.value < 0) return "text-red-500";
  if (characterLimit.value <= 10) return "text-yellow-500";
  return "text-gray-400";
});

// Permissions.
const { connected } = useWallet();
const canQuestion = computed(() => content.value && characterLimit.value > 0);

// Actions.
const loading = ref(false);
const emit = defineEmits(["added", "failed"]);
const ticks = ref(0);
const status = ref(new Status());

const ask = async () => {
  if (!canQuestion.value) return;
  loading.value = true;
  let question;
  let storedValue;
  try {
    storedValue = {
      eff: effectiveTopic.value,
      con: content.value,
      amo: amount.value,
    };
    question = await askQuestion(
      effectiveTopic.value,
      content.value,
      amount.value + deposit,
      ticks
    );
    status.value.activate("success", "Successfully asked question");
    topic.value = "";
    content.value = "";
    amount.value = undefined;
    emit("added", question);
  } catch (error) {
    console.log(error);
    status.value.activate("danger", "Failed to ask question");
    topic.value = storedValue.eff;
    content.value = storedValue.con;
    amount.value = storedValue.amo;
    emit("failed", question);
  } finally {
    loading.value = false;
    setTimeout(() => status.value.deactivate(), 5000);
  }
};
</script>

<template>
  <div v-if="connected" class="px-8 py-4 border-b">
    <!-- Content field. -->
    <div class="w-full flex">
      <textarea
        ref="textarea"
        rows="1"
        class="text-xl grow focus:outline-none resize-none overflow-clip mb-3 p-3 focus:ring-transparent border-gray-200 border-0 border-b-2"
        placeholder="What's happening?"
        v-model="content"
      ></textarea>
      <div class="text-xl mb-3 ml-3 py-3">
        <span :class="characterLimitColour"> {{ characterLimit }} left </span>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between -m-2">
      <!-- Topic field. -->
      <div class="relative m-2 mr-4">
        <input
          type="text"
          placeholder="topic"
          class="text-pink-500 rounded-full pl-10 pr-4 py-2 bg-gray-100 border-none focus:ring-pink-500/50"
          :value="effectiveTopic"
          :disabled="forcedTopic"
          @input="topic = $event.target.value"
        />
        <div class="absolute left-0 inset-y-0 flex pl-3 pr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 m-auto"
            :class="effectiveTopic ? 'text-pink-500' : 'text-gray-400'"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div class="flex items-center space-x-6 m-2 ml-auto">
        <!-- Character limit. -->


      </div>

      <!-- question button. -->
      <div class="relative z-0 w-full my-6 group">
        <div class="inline-block w-4/12 p-2">
          <label
            for="charge"
            class="peer-focus:font-medium absolute text-sm text-pink-500 dark:text-pink-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-pink-600 peer-focus:dark:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Reward (required)</label
          >
          <input
            v-model="amount"
            type="number"
            name="charge"
            id="charge"
            placeholder=" "
            class="block py-2.5 px-0 w-full text-sm text-pink-900 bg-transparent border-0 border-b-2 border-pink-300 appearance-none dark:text-white dark:border-pink-600 dark:focus:border-pink-500 focus:outline-none focus:ring-0 focus:border-pink-600 peer"
            required
          />
        </div>
        <span class="inline-block w-1/12 text-center text-lg">+</span>
        <div class="inline-block w-3/12 p-2">
          <label
            class="peer-focus:font-medium absolute text-sm text-pink-500 dark:text-pink-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-pink-600 peer-focus:dark:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Deposit (fixed)</label
          >
          <span
            class="block py-2.5 px-0 w-full text-sm text-pink-900 bg-transparent border-0 border-b-2 border-pink-300 appearance-none dark:text-white dark:border-pink-600 dark:focus:border-pink-500 focus:outline-none focus:ring-0 focus:border-pink-600 peer"
          > {{ deposit }}
          </span>
        </div>
        <span class="inline-block w-1/12 text-center text-lg">=</span>
        <div class="inline-block w-3/12 p-2">
          <label
            class="peer-focus:font-medium absolute text-sm text-pink-500 dark:text-pink-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-pink-600 peer-focus:dark:text-pink-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Total</label
          >
          <span
            class="block py-2.5 px-0 w-full text-sm text-pink-900 bg-transparent border-0 border-b-2 border-pink-300 appearance-none dark:text-white dark:border-pink-600 dark:focus:border-pink-500 focus:outline-none focus:ring-0 focus:border-pink-600 peer"
          > {{ (amount ?? 0) + deposit }}
          </span>
        </div>
      </div>
      <div class="w-full flex justify-end mb-4">
        <submit-button
          :loading="loading"
          :enabled="canQuestion"
          :ticks="ticks"
          @click="ask"
        >
          Ask
        </submit-button>
      </div>
    </div>

    <toast-item :status="status"></toast-item>
  </div>

  <div v-else class="px-8 py-4 bg-pink-50 text-gray-500 text-center border-b">
    Connect your wallet to start asking questions...
  </div>
</template>
