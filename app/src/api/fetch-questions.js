import { useWorkspace, usePagination } from "@/composables";
import { computed, ref } from "vue";
import { Question } from "@/models";
import bs58 from "bs58";
import { BN } from "@project-serum/anchor";
import { FILTER, START_TIME } from "@/const";

export const fetchQuestions = async (filters = []) => {
  const { program } = useWorkspace();
  const questions = await program.value.account.question.all(filters);
  return questions.map(
    (question) => new Question(question.publicKey, question.account)
  );
};

export const authorFilter = (authorBase58PublicKey) => ({
  memcmp: {
    offset: FILTER.discriminator_length, // Discriminator.
    bytes: authorBase58PublicKey,
  },
});

export const topicFilter = (topic) => ({
  memcmp: {
    offset:
      FILTER.discriminator_length + // Discriminator.
      FILTER.public_key_length + // Author public key.
      FILTER.timestamp_length + // Timestamp.
      FILTER.bool_length + // hasSolution
      FILTER.public_key_length + // Solution public key
      FILTER.amount_length + // Amount
      FILTER.string_length_prefix, // Topic string prefix.
    bytes: bs58.encode(Buffer.from(topic)),
  },
});

export const hasSolutionFilter = () => ({
  memcmp: {
    offset:
      FILTER.discriminator_length + // Discriminator.
      FILTER.public_key_length + // Author public key.
      FILTER.timestamp_length, // Timestamp.
    bytes: bs58.encode(new BN(1, "le").toArray()),
  },
});

export const paginateQuestions = (
  filters = [],
  perPage = 6,
  onNewPage = () => {}
) => {
  filters = ref(filters);
  const { program, connection } = useWorkspace();
  const page = ref(0);

  const prefetchCb = async () => {
    // Reset page number
    page.value = 0;

    // Prepare the discriminator filter
    const questionClient = program.value.account.question;
    const questionAccountName = questionClient._idlAccount.name;
    const questionDiscriminatorFilter = {
      memcmp: questionClient.coder.accounts.memcmp(questionAccountName),
    };

    // Prefetch all questions with no data
    const allQuestions = await connection.getProgramAccounts(
      program.value.programId,
      {
        filters: [questionDiscriminatorFilter, ...filters.value],
        dataSlice: { offset: 8 + 32, length: 8 }, // discriminator + author public key
      }
    );

    const allQuestionsWithTimestamps = allQuestions.map(
      ({ account, pubkey }) => ({
        pubkey,
        timestamp: new BN(account.data, "le"),
      })
    );

    console.log(allQuestionsWithTimestamps);

    return allQuestionsWithTimestamps
      .filter((a) => a.timestamp > START_TIME)
      .sort((a, b) => b.timestamp.cmp(a.timestamp))
      .map(({ pubkey }) => pubkey);
  };

  const pageCb = async (page, paginatedPublicKeys) => {
    const questions = await program.value.account.question.fetchMultiple(
      paginatedPublicKeys
    );

    return questions.reduce((accumulator, question, index) => {
      const publicKey = paginatedPublicKeys[index];
      accumulator.push(new Question(publicKey, question));
      return accumulator;
    }, []);
  };

  const pagination = usePagination(perPage, prefetchCb, pageCb);
  const { hasPage, getPage } = pagination;

  const hasNextPage = computed(() => hasPage(page.value + 1));
  const getNextPage = async () => {
    const newPageQuestions = await getPage(page.value + 1);
    page.value += 1;
    onNewPage(newPageQuestions);
  };

  return { page, hasNextPage, getNextPage, ...pagination };
};
