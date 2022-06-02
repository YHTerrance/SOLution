<script setup>
import { ref, watchEffect } from "vue";
import { authorFilter, paginateQuestions } from "@/api";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import { useWorkspace } from "@/composables";

const questions = ref([]);
const { wallet } = useWorkspace();
const filters = ref([]);

const onNewPage = (newQuestions) => questions.value.push(...newQuestions);
const { prefetch, hasNextPage, getNextPage, loading } = paginateQuestions(
  filters,
  5,
  onNewPage
);

watchEffect(() => {
  if (!wallet.value) return;
  questions.value = [];
  filters.value = [authorFilter(wallet.value.publicKey.toBase58())];
  prefetch().then(getNextPage);
});

const addQuestion = (question) => questions.value.push(question);
</script>

<template>
  <div>
    <!-- TODO: Check connected wallet -->
    <div
      v-if="wallet"
      class="border-b px-8 py-4 bg-gray-50 dark:bg-pink-100/10 dark:text-white"
    >
      {{ wallet.publicKey.toBase58() }}
    </div>
    <question-form @added="addQuestion"></question-form>
    <question-list
      :questions="questions"
      :loading="loading"
      :has-more="hasNextPage"
      @more="getNextPage"
    ></question-list>
  </div>
</template>
