<script setup>
import { computed, toRefs } from "vue";
import QuestionCard from "@/components/QuestionCard";

const props = defineProps({
  questions: Array,
  loading: Boolean,
});

const { questions, loading } = toRefs(props);
const orderedQuestions = computed(() => {
  return questions.value.slice().sort((a, b) => b.timestamp - a.timestamp);
});
</script>

<template>
  <div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
  <div v-else class="divide-y">
    <question-card
      v-for="question in orderedQuestions"
      :key="question.key"
      :question="question"
    ></question-card>
  </div>
</template>
