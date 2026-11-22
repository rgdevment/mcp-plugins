# Installing Tisty's MCP server

These steps are for an assistant setting up Tisty for the person, such as Cline.
Tisty is a desktop app for Windows and macOS: shared working memory for the
person and their AI agent, with notes, documents and tasks in local Markdown.
The agent reaches it through Tisty's own MCP server. The `tisty-mcp` launcher
on npm finds the installed app and starts that server locally over stdio. It
needs Node.js, and no API key, account or network beyond fetching the launcher
once.

## 1. Make sure Tisty is installed

Ask the person whether Tisty is installed. If it is not, they install it from
one of these, then open it once:

- Windows: [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N) or
  `winget install rgdevment.Tisty`
- macOS, with Homebrew:

  ```sh
  brew tap rgdevment/tap
  brew trust rgdevment/tap
  brew install --cask tisty
  ```

- Every other way: [installation guide](https://www.tisty.app/docs/installation/)

## 2. Add the server

Add this entry to the MCP settings file (for Cline, `cline_mcp_settings.json`),
keeping every other server that is already there:

```json
{
  "mcpServers": {
    "tisty": {
      "command": "npx",
      "args": ["-y", "tisty-mcp"]
    }
  }
}
```

There is nothing to configure. Only if Tisty is installed somewhere unusual, add
`"env": { "TISTY_PATH": "<full path of its tisty command>" }`.

## 3. Check it

Restart the assistant if it was open before Tisty was installed, then list the
server's tools. Tisty's tools include `rules`, `brain`, `read`, `propose` and
`write_doc`. Call `rules` with no arguments: it answers with the basics of
working in Tisty. If the only tool is `install_tisty`, the launcher did not find
Tisty: call it and pass its steps on to the person. If `brain` is not among the
tools, Tisty is older than 1.49: it works with the tools it lists, and updating
Tisty brings `brain`.

If every call is refused, the person closed Tisty's door to assistants: they
open it again in Settings › Assistants, or with «Let it in» when Tisty says
this assistant tried to come in.

To look things up, `brain` finds and connects without opening anything: words
in `query` search open and archived tasks and documents, a `doc` or `task`
alone gives its card with what cites it, `links` brings its neighbours and
`part_of` a project's open parts. `read` opens one: a task, or with `doc` a
document by the id `brain` gives, one `section` of it or only its `marks`. Sent
the `print` the last read gave, it says only that nothing changed; `versions`
lists a document's earlier versions.

## What it may do

It can file tasks with steps and dates, set reminders, write documents and
correct them passage by passage, change their tables by rows and columns, draw
diagrams in Mermaid, file them into folders, attach files, jot and sort ideas on
the Ideas sheet and search open and archived work. It never closes or deletes
anything: it says a task is done and the person confirms it in the app.

More in the [documentation](https://www.tisty.app/docs/assistants-and-mcp/).
