# Installing Tisty's MCP server

These steps are for an assistant setting up Tisty for the person, such as Cline.
Tisty is a desktop app for Windows and macOS; its MCP server is the `tisty`
command that comes with it, and runs locally over stdio. It needs no API key,
no account and no network.

## 1. Make sure Tisty is installed

Run `tisty --version`. It answers `tisty <version>` when Tisty is installed and
on the PATH. If it is not found, ask the person to install Tisty first, from
one of these, then open it once:

- Windows: [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N)
- macOS: `brew install --cask rgdevment/tap/tisty`
- Every other way: [installation guide](https://www.tisty.app/docs/installation/)

If `tisty` is still not found after installing, use the full path for the
command in step 2 instead of `tisty`:

| Installed with | Command |
| --- | --- |
| Microsoft Store | `%LOCALAPPDATA%\Microsoft\WindowsApps\tisty.exe` |
| Windows installer or winget | `%LOCALAPPDATA%\Programs\Tisty\tisty.exe` |
| macOS | `/Applications/Tisty.app/Contents/MacOS/tisty` |

Expand `%LOCALAPPDATA%` to the real folder when you write it into a settings
file.

## 2. Add the server

Add this entry to the MCP settings file (for Cline, `cline_mcp_settings.json`),
keeping every other server that is already there:

```json
{
  "mcpServers": {
    "tisty": {
      "command": "tisty",
      "args": ["mcp"]
    }
  }
}
```

There is nothing to configure: no environment variables, no keys.

## 3. Check it

Restart the assistant if it was open before Tisty was installed, then list the
server's tools. Tisty's tools include `rules`, `find`, `propose` and
`write_doc`. Call `rules` with no arguments: it answers with the basics of
working in Tisty.

If every call is refused, assistants have no voice in Tisty: the person turns
it on in Tisty under Settings › Assistants, where this assistant also appears
as a device they can shut out at any time.

## What it may do

It can file tasks with steps and dates, set reminders, write documents and
correct them passage by passage, file them into folders, attach files and
search open and archived work. It never closes or deletes anything: it says a
task is done and the person confirms it in the app.

More in the [documentation](https://www.tisty.app/docs/assistants-and-mcp/).
