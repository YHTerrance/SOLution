<script setup>
import { computed, toRefs, ref } from "vue";
import QuestionCard from "@/components/QuestionCard";
import ToastItem from "@/components/atoms/ToastItem.vue";
import { Status } from "@/models";

const props = defineProps({
  questions: Array,
  loading: Boolean,
});
const { questions, loading } = toRefs(props);
const status = ref(new Status());

// Actions
const emit = defineEmits(["update:questions"]);

const orderedQuestions = computed(() => {
  return questions.value.slice().sort((a, b) => b.timestamp - a.timestamp);
});
const onDelete = (deletedQuestion) => {
  const filteredQuestions = questions.value.filter(
    (question) => question.publicKey.toBase58() !== deletedQuestion.publicKey.toBase58()
  );
  status.value.activate("success", "Successfully deleted question.");
  setTimeout(() => status.value.deactivate(), 5000);
  emit("update:questions", filteredQuestions);
};
</script>

<template>
  <div v-if="loading" class="p-8 text-gray-500 text-center">Loading...</div>
  <div v-else class="divide-y">
    <question-card
      v-for="question in orderedQuestions"
      :key="question.key"
      :question="question"
      @delete="onDelete"
    ></question-card>
  </div>
  <toast-item :status="status"></toast-item>
</template>
