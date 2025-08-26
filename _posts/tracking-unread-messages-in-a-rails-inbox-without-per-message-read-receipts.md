---
title: "Tracking unread messages in a Rails inbox without per-message read receipts"
excerpt: "At Skillit, I needed unread counts to stay correct for both workers and employers. A per-conversation read counter ended up being simpler and more reliable than tracking every message."
date: "2025-08-26T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/skillit.png"
tags: ["Skillit", "Rails", "Hotwire", "Messaging"]
---

# Tracking unread messages in a Rails inbox without per-message read receipts

Unread badges look small until they start lying.

That was the real problem.

At Skillit, I worked on an inbox used by construction workers and employers. Once messaging became part of the hiring flow, the unread count in the header stopped being decoration. If it said `2`, it had to mean `2`. If a conversation looked unread in the sidebar, that state had to flip at the right moment. Not later. Not after a refresh. Not only for one side of the conversation.

I can't share the full app code, but the pattern is worth sharing because it held up well in a Rails app with server-rendered UI.

## I didn't want per-message read receipts

The obvious design is a join table that says user X has read message Y.

I didn't want that.

It creates a lot of rows, and it turns a basic question like "how many unread messages does this user have?" into a more annoying query problem than it needs to be. That cost goes up once you need the same answer in a header badge, a conversation list, and an open thread.

What I really needed to know was simpler:

- how many messages exist in a conversation
- how many messages a given participant has read in that conversation

That led to a smaller model.

## The shape was one counter cache plus one read-status row per user and conversation

Each conversation stored an `inbox_messages_count`. Each participant also had a read-status row with a `read_messages_count`.

The idea was simple.

When a conversation has 8 messages and your read-status says 8, you're caught up. If the conversation has 10 and your row says 8, you have 2 unread. No per-message receipts. No expensive diffing.

The core of it looked roughly like this:

```ruby
class Inbox::Conversation < ApplicationRecord
  has_many :inbox_messages
  has_many :inbox_conversation_read_statuses

  def read_by!(user)
    status = inbox_conversation_read_statuses.detect { |row| row.user_id == user.id }

    if status
      status.update(read_messages_count: inbox_messages_count)
    else
      inbox_conversation_read_statuses.create!(
        user_id: user.id,
        read_messages_count: inbox_messages_count
      )
    end
  end

  def already_read_by?(user)
    inbox_messages_count == inbox_conversation_read_statuses
      .detect { |row| row.user_id == user.id }
      &.read_messages_count
  end
end
```

That's the whole trick.

The message model used a counter cache so conversation totals stayed cheap to read. Then `read_by!` just snapped the user's read count to the latest conversation count.

## The aggregate unread count stayed in the user model

The other question was where to calculate the badge count.

I kept that on `User`, because the header already knows about `current_user`, and the view only wants one number. The interesting part was that employers and workers reached conversations differently. Workers owned conversations directly. Employers participated through their company.

So the unread calculation split on role:

```ruby
def unread_messages_count
  total_messages, read_messages =
    if is_employer?
      [
        Inbox::Conversation.where(id: participating_conversations.select(:id)).sum(:inbox_messages_count),
        inbox_conversation_read_statuses.where(
          conversation_id: participating_conversations.select(:id)
        ).sum(:read_messages_count)
      ]
    else
      [
        inbox_conversations.sum(:inbox_messages_count),
        inbox_conversation_read_statuses.sum(:read_messages_count)
      ]
    end

  total_messages - read_messages
end
```

I like this shape because the unread math stays boring.

That's a compliment.

There isn't a second pass over message bodies. There isn't a special unread table. There isn't a cache that needs to be invalidated in three places. It's just two sums and a subtraction.

## Marking a thread as read had to happen in two places

This part mattered more than the schema.

A conversation becomes read when you open it. It should also stay read after *you* send a reply, because you obviously shouldn't create your own unread state.

So the controller updated read status in both flows:

```ruby
def show
  @conversation.read_by!(current_user)
end

def create
  @message.author = current_user
  @message.conversation = @conversation

  if @message.save
    @conversation.reload.read_by!(current_user)
  end
end
```

That second call is easy to miss.

Without it, the conversation count increases when you send a message, but your own read count stays behind. The badge lies by one. Those are the bugs that make a messaging feature feel sloppy even when everything else looks fine.

## I also had to keep the UI from turning this into an N+1 mess

A sidebar full of conversations needs to know which rows are unread.

If each row asks the database for its read-status, the UI gets slower as the inbox grows. I hit that early and switched the component logic to work with preloaded read statuses in memory, then used `detect` instead of `find_by` for the per-row lookup.

That changed the component from "ask the database again" to "use the records we already loaded."

Small change, big difference.

Server-rendered Rails apps don't give you many places to hide waste. If a component renders 20 rows and each row does a lookup, you feel it.

## The tests were the real feature

I trusted the design more once the tests described the exact edge cases that had been causing trouble:

- opening a conversation creates a read-status row if one doesn't exist
- opening it again updates the counter instead of duplicating the row
- replying marks the current user as fully read
- employer and worker unread counts diverge correctly inside the same thread
- conversations without a read-status row still count as unread

That last one is important.

A missing read-status row shouldn't mean zero unread. It should mean "nothing here has been read yet." The tests forced that rule to stay explicit.

## Why I still like this pattern

I think read tracking gets overbuilt fast.

If you need "Alice read message 41 at 10:32:18", that's a different system. Build the heavier thing. But a lot of product inboxes don't need that. They need correct badges, correct unread styling, and cheap aggregate counts.

This pattern gave me all three:

- one counter cache on the conversation
- one read-status row per participant and conversation
- one subtraction for the global unread badge

That was enough.

And honestly, that's the part I like most. The feature feels a little more advanced than it is. Under the hood, it's just disciplined accounting.
