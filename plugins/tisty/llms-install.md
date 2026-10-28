# Installing Tisty's MCP server

These steps are for an assistant setting up Tisty for the person, such as Cline.
Tisty is a desktop app for Windows and macOS with its own MCP server. The
`tisty-mcp` launcher on npm finds the installed app and starts that server
locally over stdio. It needs Node.js, and no API key, account or network beyond
fetching the launcher once.

## 1. Make sure Tisty is installed

Ask the person whether Tisty is installed. If it is not, they install it from
one of these, then open it once:

- Windows: [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N)
- macOS: `brew install --cask rgdevment/tap/tisty`
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
server's tools. Tisty's tools include `rules`, `find`, `propose` and
`write_doc`. Call `rules` with no arguments: it answers with the basics of
working in Tisty. If the only tool is `install_tisty`, the launcher did not find
Tisty: call it and pass its steps on to the person.

If every call is refused, assistants have no voice in Tisty: the person turns
it on in Tisty under Settings › Assistants, where this assistant also appears
as a device they can shut out at any time.

## What it may do

It can file tasks with steps and dates, set reminders, write documents and
correct them passage by passage, change their tables by rows and columns, draw
diagrams in Mermaid, file them into folders, attach files and
search open and archived work. It never closes or deletes anything: it says a
task is done and the person confirms it in the app.

More in the [documentation](https://www.tisty.app/docs/assistants-and-mcp/).
