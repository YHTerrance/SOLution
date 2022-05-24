<script setup>
import { ref, toRefs, computed } from "vue";
import AnswerCard from "@/components/AnswerCard.vue";

const props = defineProps({
  question: Object,
  answers: Object,
});

const { question, answers } = toRefs(props);

const orderedAnswers = computed(() => {
  return answers.value.slice().sort((a, b) => a.timestamp - b.timestamp);
});

const emit = defineEmits(["update:answers", "deleteSelection", "select"]);

const onDelete = async (deletedAnswer) => {
  const filteredAnswers = answers.value.filter(
    (answer) => answer.publicKey.toBase58() !== deletedAnswer.publicKey.toBase58()
  );
  emit("update:answers", filteredAnswers);
};

let solution = ref(undefined);
const onDeleteSolution = async (deletedAnswer) => {
  solution.value = undefined;
  onDelete(deletedAnswer);
  emit("deleteSelection");
};
const onSelect = async (bestAnswer) => {
  if (solution.value !== undefined) {
    answers.value.push(solution.value);
  }
  solution.value = bestAnswer;
  onDelete(bestAnswer);
  emit("select");
};

</script>

<template>
  <div class="mt-6 pl-4 border-l-2 border-pink-100">
    <div v-if="solution !== undefined">
      <answer-card :answer="solution" :question="question" :isBest="true" @delete="onDeleteSolution"></answer-card>
    </div>
    <div v-for="answer in orderedAnswers" :key="answer.key">
      <answer-card :answer="answer" :question="question" :isBest="false" @delete="onDelete" @select="onSelect"></answer-card>
    </div>
  </div>
</template>
