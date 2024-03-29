<script setup>
import { toRefs, ref, computed } from "vue";
import { useAutoresizeTextarea, useCountCharacterLimit } from "@/composables";
import SubmitButton from "@/components/atoms/SubmitButton.vue";
import { useWallet } from "solana-wallets-vue";
import { updateAnswer } from "@/api";

const props = defineProps({
  answer: Object,
});

const { answer } = toRefs(props);
const content = ref(answer.value.content);

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

const close_modal = () => {
  if (!loading.value) emit("close");
};

// Permissions.
const { connected } = useWallet();
const canUpdate = computed(() => content.value && characterLimit.value > 0);

// Actions.
const loading = ref(false);
const emit = defineEmits(["added", "failed", "close"]);

const update = async () => {
  if (!canUpdate.value) return;
  loading.value = true;
  try {
    let _answer = await updateAnswer(answer.value, content.value);
    // Update content of parent prop
    answer.value.content = _answer.content;
    emit("added", answer);
  } catch (error) {
    console.log(error);
    emit("failed", answer);
  } finally {
    loading.value = false;
    content.value = "";
    close_modal();
  }
};
</script>

<template>
  <div>
    <div
      class="fixed z-[20] w-full h-full top-0 left-0 flex items-center justify-center"
    >
      <div
        @click.self="close_modal()"
        class="absolute w-full h-full bg-gray-800 opacity-50 z-[-10]"
      ></div>

      <div
        class="bg-white dark:bg-midnight-900 dark:text-white w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg overflow-y-auto z-100"
      >
        <div class="py-4 text-left px-6">
          <div class="flex-col pb-3">
            <h1 class="text-xl dark:text-white font-bold mt-2 mb-4">
              Answering...
            </h1>
            <slot>Loading slot</slot>
            <div v-if="connected" class="pt-4">
              <!-- Content field. -->
              <textarea
                ref="textarea"
                rows="1"
                class="md:text-xl text-md grow focus:outline-none resize-none overflow-clip mb-3 px-1 focus:border-pink-600 focus:ring-transparent border-gray-200 border-0 border-b-2 bg-transparent dark:text-white w-full"
                placeholder="What's your solution?"
                v-model="content"
              ></textarea>
            </div>
            <div class="flex items-center space-x-6 m-2 ml-auto">
              <!-- Character limit. -->
              <div :class="characterLimitColour">{{ characterLimit }} left</div>
              <!-- submit button. -->
              <submit-button
                :loading="loading"
                :enabled="canUpdate"
                @click="update"
              >
                Update
              </submit-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
