<script setup>
import { ref, watchEffect } from 'vue'
import { authorFilter, fetchQuestions } from '@/api'
import QuestionForm from '@/components/QuestionForm'
import QuestionList from '@/components/QuestionList'
import { useWorkspace } from '@/composables'

const questions = ref([])
const loading = ref(true)
const { wallet } = useWorkspace()

watchEffect(() => {
    fetchQuestions([authorFilter(wallet.value.publicKey.toBase58())])
        .then(fetchedQuestions => questions.value = fetchedQuestions)
        .finally(() => loading.value = false)
})

const addQuestion = question => questions.value.push(question)
</script>

<template>
    <!-- TODO: Check connected wallet -->
    <div v-if="wallet" class="border-b px-8 py-4 bg-gray-50">
        {{ wallet.publicKey.toBase58() }}
    </div>
    <question-form @added="addQuestion"></question-form>
    <question-list :questions="questions" :loading="loading"></question-list>
</template>
