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
import { useStatus } from "@/stores";

const props = defineProps({
  question: Object,
  answer: Object,
  isSolution: Boolean,
  selectable: Boolean,
});
const { wallet } = useWorkspace();
const { question, answer, isSolution } = toRefs(props);
const status = useStatus();

const isEditing = ref(false);

const isMyAnswer = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === answer.value.author.toBase58()
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
    status.addSuccessStatus(
      `Successfully selected solution and retrieved ${BASE_FEE_LAMPORTS} SOL`
    );
  } catch (error) {
    status.addErrorStatus("Failed to select solution");
    console.log(error);
  }
};

const onRedeem = async () => {
  try {
    await redeemReward(answer.value);
    answer.value.amount = 0;
    status.addSuccessStatus(
      `Successfully redeemed reward: ${answer.value.amount} SOL.`
    );
  } catch (error) {
    console.log(error);
    status.addErrorStatus("Failed to redeem rewards.");
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
        <span class="text-gray-500 dark:text-gray-100"> • </span>
        <time
          class="text-gray-500 dark:text-gray-100 text-sm"
          :title="answer.created_at"
        >
          {{ answer.created_ago }}
        </time>
      </div>
    </answer-modal-update>

    <div
      :class="
        isSolution ? 'bg-pink-100 dark:bg-pink-100/10 p-4 rounded-lg' : 'p-4'
      "
    >
      <div
        v-if="isSolution"
        class="flex pl-2 pt-0 ml-[-8px] mb-2 justify-between items-center"
      >
        <div class="text-md underline text-pink-700 font-bold">Solution</div>
        <div v-if="isMyAnswer">
          <button
            v-if="answer.amount > 0"
            @click="onRedeem"
            class="inline-flex items-center justify-center overflow-hidden text-md font-semibold text-white rounded group bg-gradient-to-br from-pink-500 to-orange-400 focus:ring-4 focus:outline-none focus:ring-pink-200"
          >
            <span class="flex px-2.5 py-1 rounded text-md">
              Redeem <icon-solana class="mx-2" />
              {{ answer.amount / LAMPORTS_PER_SOL }}
            </span>
          </button>
          <button
            v-else
            @click="onRedeem"
            disabled
            class="inline-flex items-center justify-center overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gray-400 text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200"
          >
            <span class="flex px-3 py-2 rounded-md text-white">
              Reward claimed
            </span>
          </button>
        </div>
      </div>

      <div class="flex justify-between pb-2">
        <div>
          <h3
            class="inline font-semibold dark:text-white"
            :title="answer.author"
          >
            <router-link :to="authorRoute" class="hover:underline">
              {{ answer.author_display }}
            </router-link>
          </h3>
          <span class="text-gray-500 dark:text-gray-100"> • </span>
          <time
            class="text-gray-500 dark:text-gray-100 text-sm"
            :title="answer.created_at"
          >
            {{ answer.created_ago }}
          </time>
        </div>

        <div class="flex">
          <div class="flex" v-if="isMyAnswer">
            <button
              @click="isEditing = true"
              class="w-6 h-6 flex rounded-full text-gray-500 dark:text-gray-300 hover:text-pink-500 dark:hover:text-midnight-900 hover:bg-gray-100 dark:hover:bg-pink-200"
              title="Update answer"
            >
              <icon-edit></icon-edit>
            </button>
          </div>
          <button
            v-if="selectable"
            @click="onSelect"
            class="relative flex w-6 h-6 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100 dark:hover:bg-pink-100 dark:hover:text-midnight-900"
            title="Select answer"
          >
            <icon-check></icon-check>
            <span
              class="flex absolute justify-center items-center -top-[7px] -right-[9px] w-4 h-4"
            >
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"
              ></span>
            </span>
          </button>
        </div>
      </div>
      <MarkdownContent
        :text="answer.content"
        class="dark:text-white"
      ></MarkdownContent>
    </div>
  </div>
</template>
