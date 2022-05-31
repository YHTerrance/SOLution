<script setup>
import { toRefs, computed, ref } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";
import IconCheck from "@/components/atoms/IconCheck.vue";
import IconSolana from "@/components/atoms/IconSolana.vue";
import AnswerModalUpdate from "@/components/AnswerModalUpdate.vue";
import { selectSolution, redeemReward } from "@/api";
import { useWorkspace } from "@/composables";
import { BASE_FEE_LAMPORTS } from "@/const";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import MarkdownContent from "@/components/MarkdownContent.vue";

const props = defineProps({
  question: Object,
  answer: Object,
  isSolution: Boolean,
});
const { wallet } = useWorkspace();
const { question, answer, isSolution } = toRefs(props);

const isEditing = ref(false);

const isMyAnswer = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === answer.value.author.toBase58()
);

const isMyQuestion = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === question.value.author.toBase58()
);

const authorRoute = computed(() => {
  if (isMyAnswer.value) {
    return { name: "Profile" };
  } else {
    return {
      name: "Users",
      params: { author: answer.value.author.toBase58() },
    };
  }
});

const onSelect = async () => {
  try {
    await selectSolution(question.value, answer.value);
    question.value.solution = answer.value.publicKey;
    answer.value.amount += question.value.amount - BASE_FEE_LAMPORTS;
    question.value.amount = 0;
  } catch (error) {
    console.log(error);
  }
};

const onRedeem = async () => {
  try {
    await redeemReward(answer.value);
    answer.value.amount = 0;
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div>
    <answer-modal-update
      :answer="answer"
      @close="isEditing = false"
      v-if="isEditing"
    >
      <div>
        <h3 class="inline font-semibold" :title="answer.author">
          <router-link :to="authorRoute" class="hover:underline">
            {{ answer.author_display }}
          </router-link>
        </h3>
        <span class="text-gray-500"> • </span>
        <time class="text-gray-500 text-sm" :title="answer.created_at">
          {{ answer.created_ago }}
        </time>
      </div>
    </answer-modal-update>

    <div :class="isSolution ? 'bg-pink-100 p-4 rounded-lg' : 'p-4'">
      <div
        v-if="isSolution"
        class="flex p-2 pt-0 ml-[-8px] mb-2 justify-between items-center"
      >
        <div class="underline text-pink-500 font-bold">Solution</div>
        <div v-if="isMyAnswer">
          <button
            v-if="answer.amount > 0"
            @click="onRedeem"
            class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200"
          >
            <span class="flex px-5 py-2.5 rounded-md text-white">
              Redeem <icon-solana class="mx-2" />
              {{ answer.amount / LAMPORTS_PER_SOL }}
            </span>
          </button>
          <button
            v-else
            @click="onRedeem"
            disabled
            class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200"
          >
            <span class="flex px-5 py-2.5 rounded-md text-white">
              Reward claimed
            </span>
          </button>
        </div>
      </div>

      <div class="flex justify-between pb-2">
        <div>
          <h3 class="inline font-semibold" :title="answer.author">
            <router-link :to="authorRoute" class="hover:underline">
              {{ answer.author_display }}
            </router-link>
          </h3>
          <span class="text-gray-500"> • </span>
          <time class="text-gray-500 text-sm" :title="answer.created_at">
            {{ answer.created_ago }}
          </time>
        </div>

        <div class="flex">
          <div class="flex" v-if="isMyAnswer">
            <button
              @click="isEditing = true"
              class="flex px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
              title="Update answer"
            >
              <icon-edit></icon-edit>
            </button>
          </div>
          <button
            v-if="isSolution"
            class="flex py-[3px] px-2 rounded-full text-pink-700"
            title="Select answer"
            disabled
          >
            <icon-check></icon-check>
          </button>
          <button
            v-else-if="isMyQuestion"
            @click="onSelect"
            class="flex py-[3px] px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
            title="Select answer"
          >
            <icon-check></icon-check>
          </button>
          <button
            v-else
            class="flex py-[3px] px-2 rounded-full text-gray-500"
            title="Select answer"
            disabled
          >
            <icon-check></icon-check>
          </button>
        </div>
      </div>
      <MarkdownContent :text="answer.content"></MarkdownContent>
    </div>
  </div>
</template>
