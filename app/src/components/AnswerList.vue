<script setup>
import { toRefs, computed } from "vue";
import AnswerCard from "@/components/AnswerCard.vue";

const props = defineProps({
  question: Object,
  answers: Object,
});

const { question, answers } = toRefs(props);

const orderedAnswers = computed(() => {
  const cmpFunc = (a, b) => {
    if (question?.value?.solution !== undefined && a.publicKey.toBase58() === question.value.solution.toBase58()) {
      return -1;
    } else if (question?.value?.solution !== undefined && b.publicKey.toBase58() === question.value.solution.toBase58()){
      return 1;
    } else {
      return a.timestamp - b.timestamp;
    }
  };
  return answers.value.slice().sort(cmpFunc);
});

const emit = defineEmits(["update:answers"]);

const onDelete = async (deletedAnswer) => {
  const filteredAnswers = answers.value.filter(
    (answer) => answer.publicKey.toBase58() !== deletedAnswer.publicKey.toBase58()
  );
  emit("update:answers", filteredAnswers);
};
</script>

<template>
  <div class="mt-6 pl-4 border-l-2 border-pink-100">
    <div v-for="answer in orderedAnswers" :key="answer.key">
      <answer-card :answer="answer" :question="question" @delete="onDelete"></answer-card>
    </div>
  </div>
</template>
