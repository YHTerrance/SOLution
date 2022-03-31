import { useWorkspace } from '@/composables'
import { Question } from '@/models'

export const getQuestion = async (publicKey) => {
    const { program } = useWorkspace()
    const account = await program.value.account.question.fetch(publicKey);
    return new Question(publicKey, account)
}
