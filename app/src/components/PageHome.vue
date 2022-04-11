<script setup>
import { ref } from "vue";
import { fetchQuestions } from "@/api";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";

const questions = ref([]);
const loading = ref(true);
fetchQuestions()
  .then((fetchedQuestions) => (questions.value = fetchedQuestions))
  .finally(() => (loading.value = false));

const addQuestion = (question) => questions.value.push(question);
</script>

<template>
  <question-form @added="addQuestion"></question-form>
  <question-list :questions="questions" :loading="loading"></question-list>
</template>
