# Tisty for assistants

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo.png"/>
  <img src="assets/logo-on-light.png" width="96" height="96" alt="Tisty"/>
</picture>

[Tisty](https://www.tisty.app/) keeps notes, documents and tasks as plain
Markdown on your own disk, for Windows and macOS. This plugin connects your
assistant to the Tisty app on your computer: it files tasks with steps and
dates, writes and edits documents passage by passage, changes their tables by
rows and columns, draws diagrams in Mermaid, files them into folders and
searches open and archived work. It never closes or deletes anything: it
says a task is done and you confirm it in the app.

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

The Tisty app, installed and opened once, with assistants turned on in
Settings › Assistants. The plugin finds it by itself: the Microsoft Store copy,
the Windows installer's, `/Applications` on a Mac, Homebrew or your PATH, and
uses the newest when there are several. It talks to the app's own MCP server,
so what your assistant writes always matches the version of your data. Nothing
leaves your computer.

| Install Tisty | |
| --- | --- |
| Windows | [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N) |
| macOS | `brew install --cask rgdevment/tap/tisty` |
| Every way | [Installation guide](https://www.tisty.app/docs/installation/) |

Without Tisty, the assistant gets one tool, `install_tisty`, that tells you how
to get it. If Tisty lives somewhere unusual, set `TISTY_PATH` to the full path
of its `tisty` command.

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

Apache-2.0. Tisty itself is AGPL-3.0.
