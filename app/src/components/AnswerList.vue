<script setup>
import { toRefs, computed } from "vue";
import AnswerCard from "@/components/AnswerCard.vue";
import { useWorkspace } from "@/composables";

const props = defineProps({
  question: Object,
  answers: Object,
});

const isMyQuestion = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === question.value.author.toBase58()
);

const { question, answers } = toRefs(props);
const { wallet } = useWorkspace();

const orderedAnswers = computed(() => {
  return answers.value
    .slice()
    .filter((a) => a.key !== question.value.solution.toBase58()) // Filter out the solution
    .sort((a, b) => a.timestamp - b.timestamp);
});

const solution = computed(() => {
  return answers.value
    .slice()
    .filter((a) => a.key == question.value.solution.toBase58())[0];
});
</script>

<template>
  <div class="mt-6 pl-4 border-l-2 border-pink-100">
    <div v-if="solution">
      <answer-card
        :answer="solution"
        :question="question"
        :isSolution="true"
        :selectable="false"
      ></answer-card>
    </div>
    <div v-for="answer in orderedAnswers" :key="answer.key">
      <answer-card
        :answer="answer"
        :question="question"
        :isSolution="false"
        :selectable="!solution && isMyQuestion"
      ></answer-card>
    </div>
  </div>
</template>
