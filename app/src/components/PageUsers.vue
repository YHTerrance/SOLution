<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { paginateQuestions, authorFilter } from "@/api";
import { useFromRoute } from "@/composables";
import QuestionList from "@/components/QuestionList";
import QuestionSearch from "@/components/QuestionSearch";

// Data.
const router = useRouter();
const questions = ref([]);
const author = ref("");
const viewedAuthor = ref("");
const filters = ref([]);

const onNewPage = (newQuestions) => questions.value.push(...newQuestions);
const { prefetch, hasNextPage, getNextPage, loading } = paginateQuestions(
  filters,
  5,
  onNewPage
);

// Actions.
const search = () => {
  router.push(`/users/${author.value}`);
};

const fetchAuthorQuestions = async () => {
  if (author.value === viewedAuthor.value) return;
  questions.value = [];
  viewedAuthor.value = author.value;
  filters.value = [authorFilter(author.value)];
  prefetch().then(getNextPage);
};

// Router hooks.
useFromRoute((route) => {
  author.value = route.params.author;
  if (author.value) {
    fetchAuthorQuestions();
  } else {
    questions.value = [];
    viewedAuthor.value = "";
  }
});
</script>

<template>
  <question-search
    placeholder="public key"
    :disabled="!author"
    v-model="author"
    @search="search"
  >
    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
        />
      </svg>
    </template>
  </question-search>
  <div v-if="viewedAuthor">
    <question-list
      v-model:questions="questions"
      :loading="loading"
      :has-more="hasNextPage"
      @more="getNextPage"
    ></question-list>
    <div
      v-if="!loading && questions.length === 0"
      class="p-8 text-gray-500 text-center"
    >
      User has not asked any questions...
    </div>
  </div>
</template>
