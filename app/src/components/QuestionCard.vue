<script setup>
import { toRefs, computed, ref } from 'vue'
import { useWorkspace } from '@/composables'
import { fetchAnswers, targetQuestionFilter } from '@/api'
import AnswerList from '@/components/AnswerList.vue'
import IconHeart from '@/components/atoms/IconHeart.vue'
import IconComment from '@/components/atoms/IconComment.vue'
import IconShare from '@/components/atoms/IconShare.vue'

const props = defineProps({
    question: Object,
})

// const debug = false
const { question } = toRefs(props)
const { wallet } = useWorkspace()
const authorRoute = computed(() => {
    if (wallet.value && wallet.value.publicKey.toBase58() === question.value.author.toBase58()) {
        return { name: 'Profile' }
    } else {
        return { name: 'Users', params: { author: question.value.author.toBase58() } }
    }
})

const answers = ref([])
const loading = ref(true)

fetchAnswers([targetQuestionFilter(question.value.publicKey.toBase58())])
    .then(fetchedAnswers => answers.value = fetchedAnswers)
    .finally(() => {
        loading.value = false
    })

</script>

<template>
    <div class="px-8 py-4">
        <div>
            <h3 class="inline font-semibold" :title="question.author">
                <!-- TODO: Link to author page or the profile page if it's our own question. -->
                <router-link :to="authorRoute" class="hover:underline">
                    {{ question.author_display }}
                </router-link>
            </h3>
            <span class="text-gray-500"> • </span>
            <time class="text-gray-500 text-sm" :title="question.created_at">
                <!-- TODO: Link to the question page. -->
                <router-link :to="{ name: 'Question', params: { question: question.publicKey.toBase58() } }" class="hover:underline">
                    {{ question.created_at }}
                </router-link>
            </time>
        </div>
        <p class="whitespace-pre-wrap" v-text="question.content"></p>
        <!-- TODO: Link to the topic page. -->
        <router-link v-if="question.topic" :to="{ name: 'Topics', params: { topic: question.topic } }" class="inline-block mt-2 text-pink-500 hover:underline justify-self-start">
            #{{ question.topic }}
        </router-link>
        <div v-else></div>
        <div class="flex justify-between mt-4">
            <icon-heart class='w-4 h-4 text-pink-500' v-bind:isActive="false"></icon-heart>
            <icon-comment class="w-4 h-4 text-pink-500" v-bind:isActive="false"></icon-comment>
            <icon-share class="w-4 h-4 text-pink-500" v-bind:isActive="false"></icon-share>
        </div>

        <answer-list v-show="answers.length" :answers="answers" :authorRoute="authorRoute"></answer-list>
    </div>
</template>
