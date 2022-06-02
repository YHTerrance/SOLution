<script setup>
import { toRefs, computed, ref } from "vue";
import { useWorkspace } from "@/composables";
import { fetchAnswers, targetQuestionFilter } from "@/api";
import { copyUrl } from "./utils/copy.js";
import { Status } from "@/models";
import AnswerList from "@/components/AnswerList.vue";
import IconHeart from "@/components/atoms/IconHeart.vue";
import IconComment from "@/components/atoms/IconComment.vue";
import IconShare from "@/components/atoms/IconShare.vue";
import IconSolana from "@/components/atoms/IconSolana.vue";
import AnswerModal from "@/components/AnswerModal.vue";
import QuestionBody from "@/components/QuestionBody";
import ToastItem from "@/components/atoms/ToastItem.vue";
import QuestionFormUpdate from "@/components/QuestionFormUpdate.vue";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BASE_FEE_LAMPORTS } from "@/const";

const props = defineProps({
  question: Object,
});

const { question } = toRefs(props);
const { wallet } = useWorkspace();
const answers = ref([]);
const loading = ref(true);
const liked = ref(false);
const showAnswerModal = ref(false);
const isEditing = ref(false);
const isMyQuestion = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === question.value.author.toBase58()
);
const authorRoute = computed(() => {
  if (isMyQuestion.value) {
    return { name: "Profile" };
  } else {
    return {
      name: "Users",
      params: { author: question.value.author.toBase58() },
    };
  }
});

const status = ref(new Status());

// Delete function
const ticks_delete = ref(0);
const loading_delete = ref(false);

// Fetch answers at start
fetchAnswers([targetQuestionFilter(question.value.publicKey.toBase58())])
  .then((fetchedAnswers) => (answers.value = fetchedAnswers))
  .finally(() => {
    loading.value = false;
  });
const addAnswer = (answer) => answers.value.push(answer);

const copyQuestionUrl = (questionBase58PublicKey) => {
  let msg = copyUrl(`#/question/${questionBase58PublicKey}`);
  if (msg[0] == 0) status.value.activate("success", msg[1]);
  else status.value.activate("danger", msg[1]);
  setTimeout(() => status.value.deactivate(), 5000);
};
</script>

<template>
  <div>
    <question-form-update
      v-if="isEditing"
      :question="question"
      @close="isEditing = false"
    ></question-form-update>

    <div v-else class="px-8 py-4">
      <question-body
        :question="question"
        :authorRoute="authorRoute"
        :isMyQuestion="isMyQuestion"
        :loading_delete="loading_delete"
        :ticks_delete="ticks_delete"
        @edit="isEditing = true"
      ></question-body>
      <div class="flex justify-between mt-4 items-center">
        <icon-heart
          class="w-8 h-8 text-pink-500 cursor-pointer dark:hover:text-midnight"
          :isActive="liked"
          @click="liked = !liked"
        ></icon-heart>
        <icon-comment
          class="w-8 h-8 text-pink-500 cursor-pointer dark:hover:text-midnight"
          type="button"
          @click="showAnswerModal = true"
          :isActive="false"
        ></icon-comment>
        <icon-share
          class="w-8 h-8 text-pink-500 cursor-pointer dark:hover:text-midnight"
          :isActive="false"
          @click="copyQuestionUrl(question.publicKey.toBase58())"
        ></icon-share>

        <span
          class="bg-pink-100 dark:bg-pink-700 font-semibold text-pink-700 dark:text-white text-md inline-flex items-center px-2.5 py-1 rounded"
        >
          Rewards:
          <icon-solana class="mx-2"></icon-solana>

          {{
            Math.max(
              (question.amount - BASE_FEE_LAMPORTS) / LAMPORTS_PER_SOL,
              0
            ).toFixed(2)
          }}
        </span>
      </div>

      <answer-list
        v-show="answers.length"
        :answers="answers"
        :question="question"
      ></answer-list>
      <answer-modal
        :show="showAnswerModal"
        :targetQuestion="question"
        @close="showAnswerModal = false"
        @added="addAnswer"
      >
        <question-body
          :question="question"
          :authorRoute="authorRoute"
        ></question-body>
      </answer-modal>
      <toast-item :status="status"></toast-item>
    </div>
    <div class="h-[3px] mx-auto my-4 w-1/12 bg-white rounded-full"></div>
  </div>
</template>
