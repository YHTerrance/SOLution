// export const askQuestion = async (topic, content) => {
//     return {
//         topic,
//         content,
//         author_display: 'B1Af..wtRN',
//         created_at: 'Nov 26, 2021 1:03PM',
//         created_ago: 'just now',
//         timestamp: 1637932868,
//     }
// }

import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { Question } from '@/models'

export const askQuestion = async (topic, content) => {
    const { wallet, program } = useWorkspace()

    const question = web3.Keypair.generate()

    await program.value.rpc.askQuestion(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            question: question.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [question]
    })

    const questionAccount = await program.value.account.question.fetch(question.publicKey)

    return new Question(question.publicKey, questionAccount)
}
