# mcp-plugins

Plugins that connect assistants to apps by
[rgdevment](https://github.com/rgdevment). Each plugin brings an app's MCP
server and a skill that teaches the assistant how to work with it. The apps run
on your own computer; the plugins only tell your assistant how to reach them.

## Install

**Claude Code**, in one step:

```console
/plugin install tisty --marketplace rgdevment/mcp-plugins
```

Or add the marketplace first and install from it:

```console
/plugin marketplace add rgdevment/mcp-plugins
/plugin install tisty@rgdevment
```

**Cursor**: install from the [Cursor
Directory](https://cursor.directory/plugins), or add this repository as a plugin
source in Cursor's settings.

## Plugins

### Tisty

<img src="plugins/tisty/assets/logo.png" width="96" height="96" alt="Tisty"/>

Notes, documents and tasks as plain Markdown on your own disk, for Windows and
macOS. No account, no subscription, no telemetry, no server. With the plugin,
your assistant files tasks with steps and dates, sets reminders, writes and
edits documents passage by passage, files them into folders and searches open
and archived work. It never closes or deletes anything: it says a task is done
and you confirm it.

![Settings › Assistants in Tisty lists the assistants on this computer and connects each through MCP](docs/tisty-assistants.png)

**Requires the Tisty app.** The plugin starts its MCP server with the command
`tisty`, which a stable Tisty puts on your PATH while assistants have a voice.

| Install Tisty | |
| --- | --- |
| Windows | [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N) |
| macOS | `brew install --cask rgdevment/tap/tisty` |
| Either | [GitHub Releases](https://github.com/rgdevment/Tisty/releases/latest) |

If your assistant does not see Tisty's tools, restart it after installing Tisty.
On a Mac installed from the disk image, or in an app that does not read your
terminal's PATH, connect it from Tisty's Settings › Assistants instead, and turn
this plugin off so the assistant does not run Tisty's server twice. Use one or
the other, not both.

| Learn more | |
| --- | --- |
| Website | <https://www.tisty.app/> |
| Documentation | <https://www.tisty.app/docs/> |
| Assistants and MCP | <https://www.tisty.app/docs/assistants-and-mcp/> |
| Writing in Tisty | <https://markdown.tisty.app> |
| Wiki | <https://github.com/rgdevment/Tisty/wiki> |
| Source | <https://github.com/rgdevment/Tisty> |
| Official MCP Registry | `io.github.rgdevment/tisty` |
| Privacy | <https://github.com/rgdevment/Tisty/blob/main/PRIVACY.md> |
| Issues | <https://github.com/rgdevment/Tisty/issues> |

## Layout

```text
.claude-plugin/marketplace.json   Claude Code marketplace
.cursor-plugin/marketplace.json   Cursor marketplace
plugins/<app>/                    one folder per plugin, with each host's manifest,
                                  its MCP config and its skills
listings/                         manifests some directories publish from
```

## Licence

[Apache-2.0](LICENSE). Each app keeps its own licence: Tisty is AGPL-3.0. Report
a problem with an app in that app's own issues.
