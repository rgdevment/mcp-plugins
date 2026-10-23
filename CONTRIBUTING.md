# Contributing

Thanks for helping. This repository holds plugins that connect assistants to
apps; the apps live in their own repositories, and so do their issues.

## Before you start

- A problem with an app, such as Tisty, goes in that app's issues.
- A problem with a plugin, the marketplace, a launcher or a skill goes here.
- For anything larger than a fix, open an issue first so we can agree on it.

## Making a change

1. Branch from `main` and keep one change per pull request.
2. Write in English, and wrap Markdown at 80 columns.
3. Check what CI checks: `node --test test/*.test.mjs`,
   `npx markdownlint-cli2`, and `claude plugin validate .` plus
   `--profile directory` on the plugin.
4. A change to a plugin raises its version, the same in its `package.json`,
   in both `plugin.json` files and, for Tisty, in `gemini-extension.json`:
   Claude Code keeps people on the version they have until it changes.
5. Commit messages and the pull request title follow
   [Conventional Commits](https://www.conventionalcommits.org/), on one line.

Pull requests are squashed into `main`, and commits there must be signed.
By contributing you agree your work is licensed under [Apache-2.0](LICENSE).
