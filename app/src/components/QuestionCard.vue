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

// Copy destination link to clipboard
const copyToClipboard = (text) => {
  var dummy = document.createElement("textarea");
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy);
  //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
};

fetchAnswers([targetQuestionFilter(question.value.publicKey.toBase58())])
  .then((fetchedAnswers) => (answers.value = fetchedAnswers))
  .finally(() => {
    loading.value = false;
  });
const addAnswer = (answer) => answers.value.push(answer);
</script>

<template>
  <div class="px-8 py-4">
    <question-body
      :question="question"
      :authorRoute="authorRoute"
    ></question-body>

    <div class="flex justify-between mt-4">
      <icon-heart
        class="w-8 h-8 text-pink-500 cursor-pointer"
        :isActive="liked"
        @click="liked = !liked"
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
        @click="copyToClipboard('')"
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
      @added="addAnswer"
    >
      <question-body
        :question="question"
        :authorRoute="authorRoute"
      ></question-body>
    </answer-modal>
  </div>
</template>
