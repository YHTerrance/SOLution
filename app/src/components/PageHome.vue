<script setup>
import { ref } from "vue";
import { paginateQuestions } from "@/api";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";

const questions = ref([]);

const onNewPage = (newQuestions) => questions.value.push(...newQuestions);
const { prefetch, getNextPage, hasNextPage, loading } = paginateQuestions(
  [],
  5,
  onNewPage
);

prefetch().then(getNextPage);

const addQuestion = (question) => questions.value.push(question);
</script>

<template>
  <div>
    <question-form @added="addQuestion"></question-form>
    <question-list
      :questions="questions"
      :loading="loading"
      :has-more="hasNextPage"
      @more="getNextPage"
    ></question-list>
  </div>
</template>
