<script setup>
import { ref, watchEffect } from "vue";
import { fetchQuestions, fetchAnswers, targetQuestionFilter } from "@/api";
import { useWorkspace } from "@/composables";
import QuestionCard from "@/components/QuestionCard";
import dayjs from "dayjs";

const { wallet } = useWorkspace();
const loading = ref(false);
const hasError = ref(false);
const allQuestions = ref([]);
const myQuestions = ref([]);

watchEffect(async () => {
  try {
    loading.value = true;
    allQuestions.value = await fetchQuestions();
  } catch (e) {
    hasError.value = true;
    console.trace(e);
  }

  for (const question of allQuestions.value) {
    if (wallet.value.publicKey.toBase58() !== question.author.toBase58()) {
      // not my question, skip
      continue;
    }

    const answers = await fetchAnswers([targetQuestionFilter(question.publicKey.toBase58())]);
    if (answers.length === 0) {
      // no answers, skip
      continue;
    }

    const solution = answers.filter(answer => answer.key === question.solution.toBase58())[0];
    if (solution !== undefined && solution.amount <= 0) {
      // already has solution and no rewards to claim, skip
      continue;
    }

    myQuestions.value.push(question);
  }

  myQuestions.value.sort((a, b) => {
    return dayjs.unix(b.timestamp) - dayjs.unix(a.timestamp);
  });

  loading.value = false;
});
</script>

<template>
  <div>
    <div v-if="loading" class="p-8 text-gray-500 text-center">
      Loading...
    </div>
    <div v-else-if="hasError" class="p-8 text-gray-500 text-center">
      Error on loading questions QQ
    </div>
    <div v-else-if="myQuestions.length === 0" class="p-8 text-gray-500 text-center">
      There is currently no rewards to claim. Go asking questions!
    </div>
    <div v-else class="divide-y">
      <div class="p-8 text-gray-500 text-center text-lg">
        Select the answer for your problems and claim your deposit!
      </div>
      <question-card
        v-for="question in myQuestions"
        :key="question.key"
        :question="question"
      ></question-card>
    </div>
  </div>
</template>
