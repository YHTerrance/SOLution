import { useWorkspace } from '@/composables'
import { Question } from '@/models'
import bs58 from 'bs58'

export const fetchQuestions = async (filters = []) => {
    const { program } = useWorkspace()
    const questions = await program.value.account.question.all(filters);
    return questions.map(question => new Question(question.publicKey, question.account))
}

export const authorFilter = authorBase58PublicKey => ({
    memcmp: {
        offset: 8, // Discriminator.
        bytes: authorBase58PublicKey,
    }
})

export const topicFilter = topic => ({
    memcmp: {
        offset: 8 + // Discriminator.
            32 + // Author public key.
            32 + // Solution public key
            8 + // Timestamp.
            4, // Topic string prefix.
        bytes: bs58.encode(Buffer.from(topic)),
    }
})

export const targetQuestionFilter = targetQuestionBase58PublicKey => ({
    memcmp: {
        offset: 8 + // Discriminator
            32 + // Author
            8, // timestamp
        bytes: targetQuestionBase58PublicKey,
    }
})
