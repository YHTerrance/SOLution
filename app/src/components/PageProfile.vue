<script setup>
import { ref, watchEffect } from 'vue'
import { fetchQuestions } from '@/api'
import QuestionForm from '@/components/QuestionForm'
import QuestionList from '@/components/QuestionList'

const questions = ref([])
const loading = ref(true)

watchEffect(() => {
    fetchQuestions()
        .then(fetchedQuestions => questions.value = fetchedQuestions)
        .finally(() => loading.value = false)
})

const addQuestion = question => questions.value.push(question)
</script>

<template>
    <!-- TODO: Check connected wallet -->
    <div v-if="true" class="border-b px-8 py-4 bg-gray-50">
        B1AfN7AgpMyctfFbjmvRAvE1yziZFDb9XCwydBjJwtRN
    </div>
    <question-form @added="addQuestion"></question-form>
    <question-list :questions="questions" :loading="loading"></question-list>
</template>
