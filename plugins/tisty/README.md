# Tisty for assistants

<img src="assets/logo.png" width="96" height="96" alt="Tisty"/>

[Tisty](https://www.tisty.app/) is shared working memory for you and your AI
agent: notes, documents and tasks in local Markdown, for Windows and macOS.
Ideas caught on the fly wait as sticky notes on the Ideas sheet, to become a
task or go into a document later. Your agent forgets everything when
the session ends; with this plugin it picks up where it left off, asking what
moved since last time and reading a long document by its outline and one section
instead of the whole file. It connects your assistant to the Tisty app on your
computer: it files tasks with steps and dates, writes and edits documents
passage by passage, changes their tables by rows and columns, draws diagrams in
Mermaid, files them into folders, jots and sorts ideas with you and searches
open and archived work. It never closes or deletes anything: it says a task is
done and you confirm it in the app.

**Your agents' work, in the open.** Through Tisty, an agent plans in
documents and works in tasks: it writes the plan, what it found and what it
decided as Markdown, breaks the work into tasks with steps and ticks them off as
it goes. Nothing stays buried in a chat: every stage lands in Tisty, on your
computer, where you can follow it as it happens and audit it later. When it says
a task is done, you are the one who closes it.

## Install

In Claude Code:

```console
/plugin install tisty --marketplace rgdevment/mcp-plugins
```

In Cursor, from the [Cursor Directory](https://cursor.directory/plugins).

## What it needs

The Tisty app, installed and opened once. Its door for assistants comes open on
its own, and Settings › Assistants closes it. The plugin finds it by itself: the
Microsoft Store copy, the Windows installer's, `/Applications` on a Mac,
Homebrew or your PATH, and uses the newest when there are several. It talks to
the app's own MCP server, so what your assistant writes always matches the
version of your data. Nothing leaves your computer.

| Install Tisty | |
| --- | --- |
| Windows | [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N) or `winget install rgdevment.Tisty` |
| macOS | `brew tap rgdevment/tap && brew trust rgdevment/tap && brew install --cask tisty` |
| Every way | [Installation guide](https://www.tisty.app/docs/installation/) |

Without Tisty, the assistant gets one tool, `install_tisty`, that tells you how
to get it. If Tisty lives somewhere unusual, set `TISTY_PATH` to the full path
of its `tisty` command.

## Hooks

From 1.4.0 the plugin also brings Tisty's hooks to Claude Code, and the Gemini
CLI extension brings them to Gemini CLI. When a session starts, your agent gets
the tasks it left open and what moved, in about 2,000 characters. When a turn
edited files and wrote nothing in Tisty, the turn is handed back once: if that
was work on a task, it ticks what it finished and, if it is done, says so with
the proof. They need a Tisty whose command line has `tisty hook`; with an older
one they stay silent.
Tisty's Settings › Assistants adds the same hooks to Cursor and GitHub Copilot,
and its switch **Remind it when a turn starts and ends** turns them off.

## Skills

The `tisty` skill tells your assistant when to reach for Tisty and how to pick
work up where it left off. `writing-for-the-next-agent` helps it write what
the next agent will read again: a long document, a task's state, an
assistant's file kept in Tisty. `consolidate` goes over what Tisty keeps —
stale agent notes, links that lead nowhere, task states out of date — and
fixes only what you pick, deleting nothing. Claude Code and Cursor load all
three; the Gemini CLI extension reads the `tisty` skill as its context.

## Any other assistant

The same launcher is on npm as `tisty-mcp`, for assistants that take an MCP
server by command, such as VS Code:

```json
{
  "servers": {
    "tisty": { "command": "npx", "args": ["-y", "tisty-mcp"] }
  }
}
```

Use this plugin or Tisty's Settings › Assistants, not both, so the assistant
does not run Tisty's server twice. The chat on claude.ai cannot reach servers
on your computer; Claude Code and Claude Desktop can.

## Learn more

- [Assistants and MCP](https://www.tisty.app/docs/assistants-and-mcp/)
- [What an assistant may do](https://www.tisty.app/docs/mcp-permissions/)
- [MCP tools](https://www.tisty.app/docs/mcp-tools/)
- [Privacy](https://www.tisty.app/privacy/)
- [Issues with the plugin](https://github.com/rgdevment/mcp-plugins/issues),
  [issues with Tisty](https://github.com/rgdevment/Tisty/issues)

Apache-2.0. Tisty itself is AGPL-3.0. `writing-for-the-next-agent` adapts
Matt Pocock's [`writing-for-agents`](https://github.com/mattpocock/skills),
under the MIT license that comes with it.
