<script setup>
import { computed, ref, toRefs } from "vue";
import {
  useAutoresizeTextarea,
  useCountCharacterLimit,
  useSlug,
} from "@/composables";
import { updateQuestion } from "@/api";
import { useWallet } from "solana-wallets-vue";
// Props.
const props = defineProps({
  question: Object,
});
const { question } = toRefs(props);
// Form data.
const content = ref(question.value.content);
const topic = ref(question.value.topic);
const slugTopic = useSlug(topic);
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
const canAskQuestion = computed(
  () => content.value && characterLimit.value > 0
);
// Actions.
const emit = defineEmits(["close"]);
const update = async () => {
  if (!canAskQuestion.value) return;
  await updateQuestion(question.value, slugTopic.value, content.value);
  emit("close");
};
</script>

<template>
  <div v-if="connected">
    <div class="px-8 py-4 border-l-4 border-pink-500">
      <div class="py-1 dark:text-white">
        <h3 class="inline font-semibold" :title="question.author">
          <router-link :to="{ name: 'Profile' }" class="hover:underline">
            {{ question.author_display }}
          </router-link>
        </h3>
        <span class="text-gray-500 dark:text-white"> • </span>
        <time
          class="text-gray-500 text-sm dark:text-white"
          :title="question.created_at"
        >
          <router-link
            :to="{
              name: 'Question',
              params: { question: question.publicKey.toBase58() },
            }"
            class="hover:underline"
          >
            {{ question.created_ago }}
          </router-link>
        </time>
      </div>

      <!-- Content field. -->
      <textarea
        ref="textarea"
        rows="1"
        class="my-2 text-xl w-full focus:outline-none resize-none mb-3 border-none focus:ring-pink-300 rounded-xl bg-gray-700 dark:text-white"
        placeholder="What's happening?"
        v-model="content"
      ></textarea>

      <div class="flex flex-wrap items-center justify-between -m-2">
        <!-- Topic field. -->
        <div class="relative m-2 mr-4">
          <input
            type="text"
            placeholder="topic"
            class="text-pink-500 dark:text-midnight-900 font-bold rounded-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-300 border-none focus:ring-pink-500"
            :value="slugTopic"
            @input="topic = $event.target.value"
          />
          <div class="absolute left-0 inset-y-0 flex pl-3 pr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 m-auto"
              :class="
                slugTopic
                  ? 'text-pink-500 dark:text-midnight-900'
                  : 'text-gray-400'
              "
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
        <div class="flex items-center space-x-4 m-2 ml-auto">
          <!-- Character limit. -->
          <div :class="characterLimitColour">{{ characterLimit }} left</div>

          <!-- Close button. -->
          <button
            class="text-gray-500 px-4 py-2 rounded-full border bg-white hover:bg-gray-100"
            @click="emit('close')"
          >
            Cancel
          </button>

          <!-- Ask Question button. -->
          <button
            class="text-white px-4 py-2 rounded-full font-semibold"
            :disabled="!canAskQuestion"
            :class="
              canAskQuestion ? 'bg-pink-700' : 'bg-pink-300 cursor-not-allowed'
            "
            @click="update"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="px-8 py-4 bg-gray-50 text-gray-500 text-center border-b">
    Connect your wallet to start asking questions...
  </div>
</template>
