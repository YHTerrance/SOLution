<script setup>
import { ref, watchEffect } from 'vue'
import { PublicKey } from '@solana/web3.js'
import { getQuestion } from '@/api'
import { useFromRoute } from '@/composables'
import QuestionCard from '@/components/QuestionCard'

const questionAddress = ref(null)
useFromRoute((route) => questionAddress.value = route.params.question)

const loading = ref(false)
const question = ref(null)
watchEffect(async () => {
    try {
        loading.value = true
        question.value = await getQuestion(new PublicKey(questionAddress.value))
    } catch (e) {
        question.value = null
    } finally {
        loading.value = false
    }
})

</script>

<template>
    <div v-if="loading" class="p-8 text-gray-500 text-center">
        Loading...
    </div>
    <div v-else-if="! question" class="p-8 text-gray-500 text-center">
        Question not found
    </div>
    <question-card v-else :question="question"></question-card>
</template>
