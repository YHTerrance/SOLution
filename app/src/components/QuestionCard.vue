<script setup>
import { toRefs } from 'vue'

const props = defineProps({
    question: Object,
})

const { question } = toRefs(props)
</script>

<template>
    <div class="px-8 py-4">
        <div>
            <h3 class="inline font-semibold" :title="question.author">
                <!-- TODO: Link to author page or the profile page if it's our own question. -->
                <router-link :to="{ name: 'Home' }" class="hover:underline">
                    {{ question.author_display }}
                </router-link>
            </h3>
            <span class="text-gray-500"> • </span>
            <time class="text-gray-500 text-sm" :title="question.created_at">
                <!-- TODO: Link to the question page. -->
                <router-link :to="{ name: 'Home' }" class="hover:underline">
                    {{ question.created_ago }}
                </router-link>
            </time>
        </div>
        <p class="whitespace-pre-wrap" v-text="question.content"></p>
        <!-- TODO: Link to the topic page. -->
        <router-link v-if="question.topic" :to="{ name: 'Home' }" class="inline-block mt-2 text-pink-500 hover:underline">
            #{{ question.topic }}
        </router-link>
    </div>
</template>
