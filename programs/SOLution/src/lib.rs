use anchor_lang::prelude::*;

declare_id!("97qP2WfmsqrYwrQ1s5APNQ4RxwrBbmS2v48UzG2cUZnw");

#[error_code]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}


#[program]
pub mod so_lution {
    use super::*;

    pub fn ask_question(ctx: Context<AskQuestion>, topic: String, content: String) -> Result<()> {
        let question: &mut Account<Question> = &mut ctx.accounts.question;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        question.author = *author.key;
        question.timestamp = clock.unix_timestamp;
        question.topic = topic;
        question.content = content;

        Ok(())
    }

    pub fn submit_answer(ctx: Context<SubmitAnswer>, target_question: Pubkey, content: String) -> Result<()> {
        let answer: &mut Account<Answer> = &mut ctx.accounts.answer;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        answer.author = *author.key;
        answer.target_question = target_question;
        answer.timestamp = clock.unix_timestamp;
        answer.content = content;

        Ok(())
    }
}

#[account]
pub struct Question {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

#[account]
pub struct Answer {
    pub target_question: Pubkey,
    pub author: Pubkey,
    pub timestamp: i64,
    pub content: String,
}


#[derive(Accounts)]
pub struct AskQuestion<'info> {
    #[account(init, payer = author, space = Question::LEN)]
    pub question: Account<'info, Question>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitAnswer<'info> {
    #[account(init, payer = author, space = Answer::LEN)]
    pub answer: Account<'info, Answer>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max

impl Question {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author
        + TIMESTAMP_LENGTH // Timestamp
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content
}

impl Answer {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Source question
        + PUBLIC_KEY_LENGTH // Author
        + TIMESTAMP_LENGTH // Timestamp
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content
}
