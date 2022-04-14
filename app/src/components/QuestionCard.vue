<script setup>
import { toRefs, computed, ref } from "vue";
import { useWorkspace } from "@/composables";
import { fetchAnswers, targetQuestionFilter } from "@/api";
import AnswerList from "@/components/AnswerList.vue";
import IconHeart from "@/components/atoms/IconHeart.vue";
import IconComment from "@/components/atoms/IconComment.vue";
import IconShare from "@/components/atoms/IconShare.vue";
import AnswerModal from "@/components/AnswerModal.vue";
import QuestionBody from "@/components/QuestionBody";
import ToastItem from "@/components/atoms/ToastItem.vue";
import { copyUrl } from "./utils/copy.js";
import { Status } from "@/models";

const props = defineProps({
	question: Object,
});

const { question } = toRefs(props);
const { wallet } = useWorkspace();
const authorRoute = computed(() => {
	if (
		wallet.value &&
		wallet.value.publicKey.toBase58() === question.value.author.toBase58()
	) {
		return { name: "Profile" };
	} else {
		return {
			name: "Users",
			params: { author: question.value.author.toBase58() },
		};
	}
});

const answers = ref([]);
const loading = ref(true);
const liked = ref(false);
const showAnswerModal = ref(false);

fetchAnswers([targetQuestionFilter(question.value.publicKey.toBase58())])
	.then((fetchedAnswers) => (answers.value = fetchedAnswers))
	.finally(() => {
		loading.value = false;
	});
const addAnswer = (answer) => answers.value.push(answer);

const status = ref(new Status());
const copyQuestionUrl = (questionBase58PublicKey) => {
	let msg = copyUrl(`#/question/${questionBase58PublicKey}`);
	if (msg[0] == 0) status.value.activate("success", msg[1]);
	else status.value.activate("danger", msg[1]);
	setTimeout(() => status.value.deactivate(), 5000);
};
</script>

<template>
	<div class="px-8 py-4">
		<question-body
			:question="question"
			:authorRoute="authorRoute"
		></question-body>

		<div class="flex justify-between mt-4">
			<icon-heart
				class="w-8 h-8 text-pink-500 cursor-pointer"
				:isActive="liked"
				@click="liked = !liked"
			></icon-heart>
			<icon-comment
				class="w-8 h-8 text-pink-500 cursor-pointer"
				type="button"
				@click="showAnswerModal = true"
				:isActive="false"
			></icon-comment>
			<icon-share
				class="w-8 h-8 text-pink-500 cursor-pointer"
				:isActive="false"
				@click="copyQuestionUrl(question.publicKey.toBase58())"
			></icon-share>
		</div>

		<answer-list
			v-show="answers.length"
			:answers="answers"
			:authorRoute="authorRoute"
		></answer-list>
		<answer-modal
			:show="showAnswerModal"
			:targetQuestion="question"
			@close="showAnswerModal = false"
			@added="addAnswer"
		>
			<question-body
				:question="question"
				:authorRoute="authorRoute"
			></question-body>
		</answer-modal>
		<toast-item :status="status"></toast-item>
	</div>
</template>
