<script setup>
import { computed, toRefs } from "vue";
import QuestionCard from "@/components/QuestionCard";

const props = defineProps({
  questions: Array,
  loading: Boolean,
  hasMore: Boolean,
});
const { questions, loading, hasMore } = toRefs(props);

// Actions
const emit = defineEmits(["update:questions", "more"]);

const orderedQuestions = computed(() => {
  return questions.value.slice().sort((a, b) => b.timestamp - a.timestamp);
});
</script>

<template>
  <div>
    <question-card
      v-for="question in orderedQuestions"
      :key="question.key"
      :question="question"
    ></question-card>
    <div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
    <div v-else-if="hasMore" class="p-8 text-center">
      <button
        @click="emit('more')"
        class="px-4 py-2 rounded-full border bg-gray-50 dark:bg-pink-100/10 hover:bg-gray-100 dark:hover:bg-pink-100 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-midnight-900"
      >
        Load More
      </button>
    </div>
    <div v-else class="divide-y"></div>
  </div>
</template>
