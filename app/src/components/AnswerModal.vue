<script setup>
import { toRefs, ref, computed } from "vue";
import { useAutoresizeTextarea, useCountCharacterLimit } from "@/composables";
import SubmitButton from "@/components/atoms/SubmitButton.vue";
import { useWallet } from "solana-wallets-vue";
import { submitAnswer } from "@/api";
import { useStatus } from "@/stores";

function close_modal() {
  if (!loading.value) emit("close");
}
const props = defineProps({
  show: Boolean,
  targetQuestion: Object,
});

const { show, targetQuestion } = toRefs(props);

// state
const status = useStatus();

// Form data.
const content = ref("");

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
const canSubmit = computed(() => content.value && characterLimit.value > 0);

// Actions.
const loading = ref(false);
const emit = defineEmits(["added", "failed", "close"]);
const ticks = ref(0); // Record the ticks passed during transaction confirmation

const submit = async () => {
  if (!canSubmit.value) return;
  loading.value = true;
  let answer;
  try {
    answer = await submitAnswer(
      targetQuestion.value.publicKey,
      targetQuestion.value.author,
      content.value,
      ticks
    );
    status.addSuccessStatus("Successfully submitted answer.");
    emit("added", answer);
  } catch (error) {
    console.log(error);
    status.addErrorStatus("Failed to submit answer.");
    emit("failed", answer);
  } finally {
    loading.value = false;
    content.value = "";
    console.log(ticks.value);
    ticks.value = 0;
    close_modal();
  }
};
</script>

<template>
  <div>
    <div
      v-if="show"
      class="fixed z-[20] w-full h-full top-0 left-0 flex items-center justify-center"
    >
      <div
        @click.self="close_modal()"
        class="absolute w-full h-full bg-gray-800 opacity-50 z-[-10]"
      ></div>

      <div
        class="dark:bg-midnight-900 bg-white w-11/12 md:max-w-md mx-auto rounded-xl shadow-lg overflow-y-auto z-100"
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
                :enabled="canSubmit"
                :ticks="ticks"
                @click="submit"
              >
                Answer
              </submit-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
