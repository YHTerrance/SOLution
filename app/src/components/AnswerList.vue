<script setup>
import { toRefs, computed } from "vue";
import AnswerCard from "@/components/AnswerCard.vue";

const props = defineProps({
  question: Object,
  answers: Object,
});

const { question, answers } = toRefs(props);

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

const emit = defineEmits(["update:answers", "select"]);

const onDelete = async (deletedAnswer) => {
  const filteredAnswers = answers.value.filter(
    (answer) =>
      answer.publicKey.toBase58() !== deletedAnswer.publicKey.toBase58()
  );
  emit("update:answers", filteredAnswers);
};
</script>

<template>
  <div class="mt-6 pl-4 border-l-2 border-pink-100">
    <div v-if="solution">
      <answer-card
        :answer="solution"
        :question="question"
        :isSolution="true"
      ></answer-card>
    </div>
    <div v-for="answer in orderedAnswers" :key="answer.key">
      <answer-card
        :answer="answer"
        :question="question"
        :isSolution="false"
        @delete="onDelete"
      ></answer-card>
    </div>
  </div>
</template>
