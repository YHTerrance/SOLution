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
      return Err(ErrorCode::TopicTooLong.into());
    }

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    question.author = *author.key;
    question.timestamp = clock.unix_timestamp;
    question.topic = topic;
    question.content = content;

    Ok(())
  }
  
  pub fn select_solution(ctx: Context<SelectSolution>, solution: Pubkey,) -> Result<()> {
    let question: &mut Account<Question> = &mut ctx.accounts.question;

    question.solution = solution;

    Ok(())
  }

  pub fn update_question(ctx: Context<UpdateQuestion>, topic: String, content: String) -> Result<()> {
    let question: &mut Account<Question> = &mut ctx.accounts.question;

    if topic.chars().count() > 50 {
      return Err(ErrorCode::TopicTooLong.into());
    }

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    question.topic = topic;
    question.content = content;

    Ok(())
  }

  pub fn delete_question(_ctx: Context<DeleteQuestion>) -> Result<()> {
    Ok(())
  }

  pub fn submit_answer(
    ctx: Context<SubmitAnswer>,
    target_question: Pubkey,
    target_author: Pubkey,
    content: String,
  ) -> Result<()> {
    let answer: &mut Account<Answer> = &mut ctx.accounts.answer;
    let author: &Signer = &ctx.accounts.author;
    let clock: Clock = Clock::get().unwrap();

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    answer.author = *author.key;
    answer.target_question = target_question;
    answer.target_author = target_author;
    answer.timestamp = clock.unix_timestamp;
    answer.content = content;

    Ok(())
  }

  pub fn update_answer(ctx: Context<UpdateAnswer>, content: String) -> Result<()> {
    let answer: &mut Account<Answer> = &mut ctx.accounts.answer;

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into())
    }

    answer.content = content;

    Ok(())
  }

  pub fn delete_answer(_ctx: Context<DeleteAnswer>) -> Result<()> {
    Ok(())
  }
}


#[account]
pub struct Question {
  pub author: Pubkey,
  pub timestamp: i64,
  pub solution: Pubkey,
  pub topic: String,
  pub content: String,
}

#[account]
pub struct Answer {
  pub author: Pubkey,
  pub timestamp: i64,
  pub target_question: Pubkey,
  pub target_author: Pubkey,
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
pub struct SelectSolution<'info> {
  #[account(mut, has_one = author)]
  pub question: Account<'info, Question>,
  pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateQuestion<'info> {
  // has_one: checks that the author in question is similar to the current question
  #[account(mut, has_one = author)]
  pub question: Account<'info, Question>,
  pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteQuestion<'info> {
  #[account(mut, has_one = author, close = author)]
  // has_one: only allows author to do this | close: transfers the lamports to author after closing the account
  pub question: Account<'info, Question>,
  pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitAnswer<'info> {
  #[account(init, payer = author, space = Answer::LEN)]
  pub answer: Account<'info, Answer>,
  #[account(mut)]
  pub author: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAnswer<'info> {
  #[account(mut, has_one = author)]
  pub answer: Account<'info, Answer>,
  pub author: Signer<'info>
}

#[derive(Accounts)]
pub struct DeleteAnswer<'info> {
  #[account(mut, constraint = (answer.author == author.key() || answer.target_author == author.key()) && answer.author == receiver.key(), close = receiver)]
  pub answer: Account<'info, Answer>,
  pub author: Signer<'info>,
  #[account(mut)]
  pub receiver: SystemAccount<'info>,
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
        + PUBLIC_KEY_LENGTH // Solution
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content
}

impl Answer {
  const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Source question
        + PUBLIC_KEY_LENGTH // Source question author
        + PUBLIC_KEY_LENGTH // Author
        + TIMESTAMP_LENGTH // Timestamp
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content
}
