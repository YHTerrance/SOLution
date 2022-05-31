<script setup>
import { toRefs, computed, ref, watchEffect } from "vue";
import { useWorkspace } from "@/composables";
import { fetchAnswers, targetQuestionFilter, like } from "@/api";
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
const showAnswerModal = ref(false);
const isEditing = ref(false);
const liked = ref(false);

watchEffect(() => {
  liked.value =
    question?.value?.likes?.includes(wallet?.value?.publicKey) ?? false;
  // TODO: Refer to like.js, because it does not record, everytime the website
  // reflush, the like will disappear.
});

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

const onLike = async () => {
  if (!liked.value) {
    liked.value = true;
  }
  await like(question.value);
};
</script>

<template>
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
        class="w-8 h-8 text-pink-500 cursor-pointer"
        :isActive="liked"
        @click="onLike"
      ></icon-heart>
      <icon-comment
        class="w-8 h-8 text-pink-500 cursor-pointer"
        type="button"
        @click="showAnswerModal = true"
        :isActive="false"
      ></icon-comment>
      <icon-share
        class="w-8 h-8 text-pink-500 cursor-pointer"
        :isActive="false"
        @click="copyQuestionUrl(question.publicKey.toBase58())"
      ></icon-share>

      <span
        class="
          bg-pink-100
          text-pink-800 text-md
          font-medium
          inline-flex
          items-center
          px-2.5
          py-1
          rounded
          dark:bg-pink-200 dark:text-pink-800
        "
      >
        Rewards:
        <icon-solana class="mx-2"></icon-solana>

        {{
          Math.max((question.amount - BASE_FEE_LAMPORTS) / LAMPORTS_PER_SOL, 0)
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
</template>
