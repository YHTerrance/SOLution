import { useWorkspace } from '@/composables'
import { Answer } from '@/models'

export const fetchAnswers = async (filters = []) => {
    const { program } = useWorkspace()
    const answers = await program.value.account.answer.all(filters);
    return answers.map(answer => new Answer(answer.publicKey, answer.account))
}

export const targetQuestionFilter = targetQuestionBase58PublicKey => ({
    memcmp: {
        offset: 8 + // Discriminator
            32 + // Author
            8, // timestamp
        bytes: targetQuestionBase58PublicKey,
    }
})
