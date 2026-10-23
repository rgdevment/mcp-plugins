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

**Gemini CLI**:

```console
gemini extensions install https://github.com/rgdevment/mcp-plugins
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

**Requires the Tisty app and Node.js.** A small launcher finds the Tisty
installed on your computer and starts its own MCP server, so the server always
matches the app and your data. Without Tisty, it tells your assistant how to
install it. Other assistants, such as VS Code, take the same launcher from npm:
`npx -y tisty-mcp`. More in the [plugin's readme](plugins/tisty/README.md).

| Install Tisty | |
| --- | --- |
| Windows | [Microsoft Store](https://apps.microsoft.com/detail/9PGVWXD8X93N) |
| macOS | `brew install --cask rgdevment/tap/tisty` |
| Every way | [Installation guide](https://www.tisty.app/docs/installation/) |

If your assistant does not see Tisty's tools, restart it after installing Tisty.
Connect Tisty either with this plugin or from Tisty's Settings › Assistants, not
both, so the assistant does not run Tisty's server twice.

| Learn more | |
| --- | --- |
| Website | <https://www.tisty.app/> |
| Documentation | <https://www.tisty.app/docs/> |
| Assistants and MCP | <https://www.tisty.app/docs/assistants-and-mcp/> |
| What an assistant may do | <https://www.tisty.app/docs/mcp-permissions/> |
| MCP tools | <https://www.tisty.app/docs/mcp-tools/> |
| Writing in Tisty | <https://markdown.tisty.app> |
| Privacy | <https://www.tisty.app/privacy/> |
| Official MCP Registry | [`io.github.rgdevment/tisty`](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.rgdevment%2Ftisty/versions/latest) |
| Source | <https://github.com/rgdevment/Tisty> |
| Issues | <https://github.com/rgdevment/Tisty/issues> |

## Layout

```text
.claude-plugin/marketplace.json   Claude Code marketplace
.cursor-plugin/marketplace.json   Cursor marketplace
gemini-extension.json             Gemini CLI extension (the Tisty plugin)
plugins/<app>/                    one folder per plugin, with each host's manifest,
                                  its MCP config, its skills and its launcher
test/                             tests for the launchers
listings/                         manifests some directories publish from
```

## Licence

[Apache-2.0](LICENSE). Each app keeps its own licence: Tisty is AGPL-3.0. Report
a problem with an app in that app's own issues.
