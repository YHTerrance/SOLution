<script setup>
import { toRefs, computed, ref } from "vue";
import { useWorkspace } from "@/composables";
import { fetchAnswers, targetQuestionFilter } from "@/api";
import AnswerList from "@/components/AnswerList.vue";
import IconHeart from "@/components/atoms/IconHeart.vue";
import IconComment from "@/components/atoms/IconComment.vue";
import IconShare from "@/components/atoms/IconShare.vue";
import AnswerModal from "@/components/AnswerModal.vue";
import QuestionBody from "@/components/QuestionBody";

const props = defineProps({
  question: Object,
});

// const debug = false
const { question } = toRefs(props);
const { wallet } = useWorkspace();
const authorRoute = computed(() => {
  if (
    wallet.value &&
    wallet.value.publicKey.toBase58() === question.value.author.toBase58()
  ) {
    return { name: "Profile" };
  } else {
    return {
      name: "Users",
      params: { author: question.value.author.toBase58() },
    };
  }
});

const answers = ref([]);
const loading = ref(true);
const liked = ref(false);
const showAnswerModal = ref(false);

fetchAnswers([targetQuestionFilter(question.value.publicKey.toBase58())])
  .then((fetchedAnswers) => (answers.value = fetchedAnswers))
  .finally(() => {
    loading.value = false;
  });
</script>

<template>
  <div class="px-8 py-4">
    <question-body
      :question="question"
      :authorRoute="authorRoute"
    ></question-body>

    <div class="flex justify-between mt-4">
      <icon-heart
        class="w-4 h-4 text-pink-500 cursor-pointer"
        :isActive="liked"
        @click="liked = !liked"
      ></icon-heart>
      <icon-comment
        class="w-4 h-4 text-pink-500 cursor-pointer"
        type="button"
        @click="showAnswerModal = true"
        :isActive="false"
      ></icon-comment>
      <icon-share
        class="w-4 h-4 text-pink-500 cursor-pointer"
        :isActive="false"
      ></icon-share>
    </div>

    <answer-list
      v-show="answers.length"
      :answers="answers"
      :authorRoute="authorRoute"
    ></answer-list>
    <answer-modal
      :show="showAnswerModal"
      :targetQuestion="question"
      @close="showAnswerModal = false"
    >
      <question-body
        :question="question"
        :authorRoute="authorRoute"
      ></question-body>
    </answer-modal>
  </div>
</template>
