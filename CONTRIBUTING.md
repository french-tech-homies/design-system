# Contributing

For whoever changes the kit itself. The kit is changed in this repository and
nowhere else, and a change lands as a branch and a pull request, never as a
push to `main`. Read first:

- [`CLAUDE.md`](CLAUDE.md): how this repository is laid out, its commands, the
  cheap checks a change passes before it is handed on, and its rules.
- [`conventions.md`](conventions.md): the contract every component follows,
  and the quality bar a new component has to clear.
- [`CHANGELOG.md`](CHANGELOG.md): every change to the kit has an entry under
  `[Unreleased]`.

## Releasing (maintainers)

```bash
npm version minor --no-git-tag-version   # or patch; package.json is the only source of truth
npm run registry:build         # restamps every item's meta.version, and writes the release record
npm run registry:check-version # what CI runs
# add the CHANGELOG entry, commit package.json, package-lock.json, registry.json and RELEASE.json together
```

`.github/workflows/checks.yml` fails when a bump was not followed by
`registry:build`, alongside the existing guards on `resolved.json` and on a
`registry.json` or a `RELEASE.json` that is not what the build writes.

The merge of that one commit to `main` is what publishes: see [Publishing
this repository](#publishing-this-repository).

## Publishing this repository

**Only a release publishes.** The catalog and the registry are served from
GitHub Pages, which holds one build: no address serves an older release. So
a merge to `main` does not publish by itself, or the registry would serve
what is under `[Unreleased]` under the number of the last release.

- **Every pull request and every push to `main` is checked whole** by
  `.github/workflows/checks.yml`: the cheap checks, the Storybook build and
  the story tests.
- **A push to `main` publishes only when it is a release**: the version
  moved, in that one push, in all five places a release writes it:
  `package.json`, `package-lock.json`, every item's `meta.version` in
  `registry.json`, `RELEASE.json`, and the newest numbered heading of
  `CHANGELOG.md`. The tree must say one version in all five, and the commit
  before the push must say it in none. `.github/workflows/pages.yml` then
  deploys the site the checks built on that commit.
- **Any other merge publishes nothing** and the previous site stays. Its run
  is green, with `publish` skipped.
- **A version that moved in some of the five places only is refused**: the
  run is red, on the pull request already. A release completed over two
  pushes is not published by the second: it is published by hand, below.

The decision is `scripts/decide-publish.mjs`, one step of `checks.yml`
("Does this run publish?"). It prints its sentence in the run's summary: on
a pull request, what the merge would publish. `npm run registry:publishes --
--event push --base <sha> --ref refs/heads/main` says the same from a clone,
and publishes nothing.

**The manual trigger** (`gh workflow run pages.yml`, or "Run workflow" on the
Actions page) is for publishing the last release again: after a deployment
that failed, after Pages was set up, or for a release that was completed over
two pushes. It follows the same rule. On `main`, while `registry.json` and
`RELEASE.json` are still what the release's commit holds, it publishes them,
with the catalog as `main` has it. Once `main` has moved past the release it
publishes nothing, and says which release that was: what `main` holds since
is published by the next release. It publishes nothing from another branch.

**A release whose own run is red publishes nothing, and is re-run, never
fixed by a push.** When the run of a release's commit on `main` goes red,
the release is merged but not published, and the site stays as the release
before left it. Once a fix that touches a kit file is pushed after it, no
path publishes that release any more: the push finds the version already in
all five places, so it is no release, and a hand start finds `RELEASE.json`,
which holds every kit file's hash, changed since the release's commit, so
`main` has moved past it. Only a re-run of the release commit's own run (on
the Actions page, "Re-run all jobs", or `gh run rerun <run id>`) still
publishes it, which serves where the red came from outside the commit: a
flaky step, a deployment that failed, Pages not yet set up. Where the commit
itself is wrong, leave the release unpublished, merge the fix, and make the
next patch release: it publishes both.

**One setting, made once by a person**: Settings → Pages → Build and
deployment → Source = "GitHub Actions". Until then `publish` fails at
"Configure Pages".

**What to look at** once a release's run is green:

```bash
curl -sI https://french-tech-homies.github.io/design-system/ | head -1
# → HTTP/2 200: the catalog is at the site root
curl -s https://french-tech-homies.github.io/design-system/r/ds.json | jq '.name, .meta'
# → "ds" and { "kit": "<owner>/<repository>", "version": "…", "license": "MIT" }
curl -s https://french-tech-homies.github.io/design-system/r/registry.json | jq '.items | length'
# → the number of items `npm run registry:build` printed
```
