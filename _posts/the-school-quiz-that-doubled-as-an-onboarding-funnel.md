---
title: "The school quiz that doubled as an onboarding funnel"
excerpt: "At AlumniFire, the quiz wasn't just trivia. It was a school-specific scoring flow that fed sharing, reminder emails, and signup attribution without breaking the subdomain model."
date: "2025-10-01T19:15:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/alumnifire/alumnifire.png"
tags: ["AlumniFire", "Rails", "Product", "Quiz", "Growth"]
---

# The school quiz that doubled as an onboarding funnel

Trivia features are easy to underestimate.

At AlumniFire, in 2015, the quiz wasn't there to keep people busy for thirty seconds. It was there to make a school network feel real before someone even joined it.

That mattered because AlumniFire wasn't a generic social site. Each school had its own subdomain, its own network, and its own identity. So a school-knowledge quiz did two jobs at once:

- it gave people something school-specific to engage with
- it pulled them toward signup without feeling like a signup wall

Pretty good shape for a small feature.

The code around it has some very 2015 Rails habits. That's part of the context here. I'm not trying to pretend the implementation is brand new. I'm interested in the quiz logic and the product loop it supported.

## The quiz was scoped to the current school from the start

The controller only exposed active quizzes for the current school:

```ruby
def index
  @quizzes = current_school.quizzes.active
  redirect_to start_quiz_path(@quizzes.first) if @quizzes.count == 1
end
```

And it also guarded against school mismatches:

```ruby
def require_correct_school
  if current_school.blank? || quiz_school_mismatch
    redirect_to root_path
  end
end

def quiz_school_mismatch
  @quiz && @quiz.school != current_school
end
```

I like this because it kept the feature aligned with the actual product model.

This wasn't one giant public quiz catalog. A Columbia quiz belonged on Columbia's subdomain. A different school got a different quiz, different branding, different outcomes, and eventually a different signup funnel.

That's the right call when the network boundary is the school.

## Questions were weighted, not just counted

The scoring system didn't treat every question as worth the same amount. Each question had a `value`, and the score engine used that directly:

```ruby
def radio
  if submitted_answer_id.present?
    Answer.find(submitted_answer_id).correct ? submitted_question.value : 0
  elsif no_correct_answers?
    submitted_question.value
  else
    0
  end
end
```

That let the content team decide which questions were lightweight and which ones mattered more.

A generic quiz app usually counts raw correct answers. This one had room for editorial weighting. That's a better fit when the quiz is about school identity and not just random entertainment.

## Checkbox questions got partial credit in a way I still like

The more interesting logic was the checkbox path:

```ruby
def checkbox
  user_answers = Answer.where(id: submitted_answer_ids)
  user_correct_answers = user_answers.select {|a| a.correct}
  user_correct_non_answers = submitted_question.answers.where.not(id: user_answers.map(&:id), correct: true)
  one_answer_value = (submitted_question.value.to_f / submitted_question.answers.count.to_f).round(2)
  user_question_score = (user_correct_answers.count + user_correct_non_answers.count) * one_answer_value
end
```

Here's what that means in practice.

The question value gets split evenly across all available answers. Then the user earns points for two kinds of correctness:

- selecting answers that are actually correct
- leaving incorrect answers unselected

That's more interesting than a pass/fail checkbox question.

It means the quiz isn't only measuring whether someone spotted the right choices. It's also measuring whether they avoided the wrong ones. For a school-knowledge quiz, that feels fair. It rewards actual recognition instead of lucky over-clicking.

## The UI moved one question at a time, but the score stayed cumulative

The quiz view was intentionally simple:

```haml
= form_tag submit_answer_quizzes_path(last_question: @current_question.id, total_score: @total_score), remote: true do
  .panel.panel-default
    .panel-heading
      .panel-title= @current_question.header
```

Each submit carried two things forward:

- the last question id
- the running total score

The controller picked up the submitted question, found the next one by position, and updated the total:

```ruby
@submitted_question = Question.find(params[:last_question])
@quiz = Quiz.find(@submitted_question.quiz_id)
@questions = @quiz.questions.order(position: :asc)
@current_question = @questions[@questions.index(@submitted_question) + 1]

logic = QuizLogic.new({
  submitted_question: @submitted_question,
  answer: params[:answer],
  answer_ids: params[:answer_ids]
})

@total_score = params[:total_score].to_i + logic.get_current_score
```

Then the frontend swapped the panel with JS:

```javascript
$("#quiz-view").empty();
$("#quiz-view").html("<%= j render 'question' %>");
```

I like this structure because it kept the interaction lightweight without turning the whole feature into a client-side app. Rails still owned the sequence, the question order, and the scoring logic. The browser just moved the user through the flow.

That's a practical split.

## The result screen was designed to keep the loop going

Once the quiz ended, the app stored a `QuizScore`, calculated the percentage against the total weighted value of the quiz, and generated share copy:

```ruby
def self.score_percent(score, quiz)
  score / (quiz.questions.pluck(:value).reduce(:+).to_f) * 100
end

def self.score_title(score_percent, school)
  "My score... #{score_percent.round}% on the #{school.informal_name} quiz"
end
```

The score page then did three useful things:

- showed the user's result
- offered Facebook sharing
- pushed the user toward signup

It also had a nice little hook: if someone entered their email address, the app would send a reminder showing the average score for that quiz.

```ruby
@average_score = @quiz.quiz_scores.average(:score).to_f
@average_percent = QuizLogic.score_percent(@average_score, @quiz).to_i
```

That's better than a dead-end result screen.

Instead of "thanks, you're done," the feature became "here's your score, here's how other people do, and here's the next step if you want access to the actual community."

## The reminder email and signup path preserved attribution

The reminder flow was pretty direct:

```ruby
@email = SignUpReminderEmail.create(reminder_email_params)
UserMailer.signup_reminder_email(@email.id, current_school.id).deliver
```

And the email linked back into the school with quiz context:

```haml
#{link_to 'Sign Up', root_url(subdomain: current_school.subdomain, quiz: true)}
```

From there the app recorded that the user came from a quiz.

The school page stashed that in the session:

```ruby
def check_if_came_from_quiz
  if params[:from_quiz].present? && current_school.present?
    session[:from_quiz] = true
  end
end
```

Then account creation copied it onto the user:

```ruby
def determine_if_user_came_from_quiz
  params[:user][:from_quiz] = session[:from_quiz]
end
```

That's the part I like most.

The quiz wasn't just engagement bait. It was wired into attribution cleanly enough that the admin side could measure what happened next.

## The admin panel tracked whether the funnel worked

The reporting object for quizzes tracked more than completions:

```ruby
def get_profiles_from_quizzes_hash
  profiles_from_quizzes = Profile.joins(:user).where(users: {from_quiz: true}).uniq
  @profiles_from_quizzes_hash["_all_time"] = profiles_from_quizzes.count
  get_single_data_hash({
    all_time_klass: profiles_from_quizzes,
    hash: @profiles_from_quizzes_hash
  })
end
```

There was a matching method for validated profiles too.

That closed the loop:

- people take the quiz
- some ask for the reminder email
- some click through to signup
- some finish registration
- some get validated into the network

That's a full product funnel, not just a scoring toy.

## I still like the logic here

The best part of this feature is that it respected the product.

It was school-specific.
It had weighted questions.
It handled radio and checkbox scoring differently.
It stayed server-driven.
It turned quiz completions into measurable signup intent.

A lot of quiz features stop at "you got 8 out of 10."

This one was trying to turn school familiarity into community entry. That's more interesting.
