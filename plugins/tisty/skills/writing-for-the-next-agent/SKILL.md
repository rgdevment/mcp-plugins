---
name: writing-for-the-next-agent
description: Writing in Tisty for the next agent that reads it — a document agents reopen, a task's state or page, a `sum_up`, or an agent's file in AGENTS such as a CLAUDE.md or a skill. Use when shaping or reshaping one of those, or when an agent keeps missing what one says.
---

# Writing for the next agent

What you write in Tisty is read again: by the person in the window, and by the
next agent, in a later session, with none of what you know now. Tisty's `rules`
teach where things go and how they look; this is how a text gets read and acted
on the same way every time.

Adapted from Matt Pocock's
[`writing-for-agents`](https://github.com/mattpocock/skills/blob/321658273cb1d20b76026717d027d505790106d4/skills/productivity/writing-for-agents/SKILL.md),
under the MIT license kept in `LICENSE` beside this file.

## Pointers

A **pointer** is a line the next agent holds that names material it has not
read and says when to reach it: a task's or document's title, a heading on its
card, a `gist` left with `sum_up`, a link `[Title](tisty:doc/…)`, the line that
places a page, a rule in a CLAUDE.md that names a document. Its wording, not
its target, decides whether the agent goes there.

- **Say the condition.** «Before changing how login refreshes tokens, read
  *Login — decisions*» is reached; «See also *Login*» is not.
- **Name it the way it will be searched.** `brain` finds by words: title a
  document by its subject in the words the person and the code use.
- **One trigger per case.** Synonyms for one case are one trigger written twice.

## The two loads

- **Context load** is what reaches every session whether needed or not: what
  `catch_up` and the start hook bring, and a file in AGENTS, written into the
  agent's own rules. Keep those short; every word there is paid every
  time. A task's state is close behind: `read` brings it first, each time the
  task is opened.
- **Cognitive load** is the person's: they are the index, and folders and
  titles are how they find things. Spend it where their judgement matters.

What sits behind a pointer costs only the pointer's line.

## Order by how soon it is needed

A text holds **steps**, what to do in order, and **reference**, what is looked
up. Put each piece on the highest rung it needs and no higher:

1. **On top:** what holds today. For a task, its state, written with `tick`:
   done, left, decisions in force, ruled out. For a document, its opening lines.
2. **In the body:** reference under headings. The card lists the headings, and
   `read` takes one `section` at a time, so a heading says what its section
   holds.
3. **Behind a pointer:** a page, or another document, for what only some
   readers reach.

Keep a decision, its why and its caveats under one heading, never spread across
the text. A document too long to hold in mind sends its rarer parts to pages or
splits by subject, each part named where the reader will look for it.

## Steps that end

A step is something the agent can do and check. Write what done looks like:
«every endpoint answers 401 without a token» ends; «auth works» invites stopping
early. The section of a task's page that says when it is done (*Done when*, in
the person's language) sets the bar for the whole task: checkable, and covering
everything, so nothing is left to judgement.

## Leading words

Reuse a word the model already knows and the project already says — the
person's, the code's, Tisty's own: *state*, *card*, *page*, *part*. One word
repeated anchors a behaviour in fewer tokens than a sentence restated. Coin a
new one only when nothing fits, and define it once.

Say what to do. A prohibition puts the forbidden thing in mind; keep one only as
a hard guardrail, next to the behaviour you want instead.

## Prune

- **One source.** Each meaning lives in one place: one document per subject,
  and a link from everywhere else. A task's page links its document rather than
  repeating it.
- **The environment is a source too.** The repo, its config and `--help`
  already say what they say. Keep in Tisty what no file confesses: the
  convention, the reason, the gotcha.
- **Relevance.** What no longer holds moves down, struck with its date, and a
  document that keeps piling up is tidied as `rules` «tidying» says.
- **No-ops.** Delete a sentence that tells an agent what it does anyway.

Done when every line is true, needed and specific, each pointer says when to
reach its target, and the top says what holds today.
