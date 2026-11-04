# Contributing

For whoever changes the kit itself. The kit is changed in this repository and
nowhere else, and a change lands as a branch and a pull request, never as a
push to `main`. Read first:

- [`CLAUDE.md`](CLAUDE.md): how this repository is laid out, its commands, the
  cheap checks a change passes before it is handed on, and its rules.
- [`conventions.md`](conventions.md): the contract every component follows,
  and the quality bar a new component has to clear.
- [`CHANGELOG.md`](CHANGELOG.md): every release, its section generated from
  the pull requests it holds.

## Releasing (maintainers)

A release is a pull request the repository keeps open, and its merge. Nobody
bumps the version or writes a CHANGELOG section by hand.

**Every pull request carries one release label**, which says what its merge
does to the next version:

| Label      | The next release                 | For                                                    |
| ---------- | -------------------------------- | ------------------------------------------------------ |
| `feature`  | minor                            | something a project can now do                         |
| `fix`      | patch                            | something corrected                                    |
| `docs`     | patch                            | the documentation alone                                |
| `breaking` | minor while 0.x, major from 1.0  | a change a project must act on                         |
| `internal` | none, and left out of the notes  | CI, stories, screenshots, scripts only                 |

`.github/workflows/release-label.yml` makes the five exist (`gh label create
--force`) and refuses a pull request with none, or two, saying which to add.
Where the files touched decide, it sets the label itself: only `README.md`
or `docs/**` is `docs`; only `.github/**`, `stories/**`, `screenshots/**`
or `scripts/**` is `internal`. `internal` on a change to a kit file is
refused: a project receives it.

**A note for a project only when it must act.** The pull request template
has a section, "For a project that installs the kit": filled when the change
asks something of a project (what to look for, what to run, what to edit),
left empty otherwise. It is copied, as written, into the release's section of
`CHANGELOG.md` under **Action needed**. The rest of the notes are the pull
requests' titles, grouped by label: **Breaking**, **Added** (`feature`),
**Fixed** (`fix`), **Docs**; `internal` is left out. `.github/release.yml`
groups GitHub's own generated notes the same way. A command a note gives a
project is tested by `npm run docs:check` (`scripts/changelog.check.mjs`),
in the pull request that writes it.

**The release pull request.** On every push to `main`, and again after every
run of Pages, `.github/workflows/release-pr.yml` reads the pull requests
merged since the newest `v*` tag on `main` (`scripts/release.mjs`). When
some are not `internal`, it rebuilds the branch `release` from `main`, in
one commit:

```bash
npm version <bump> --no-git-tag-version   # the largest bump their labels ask
npm run registry:build                    # every item's meta.version, and RELEASE.json
# and a numbered section of CHANGELOG.md, made of their titles and notes
```

so the five places a release writes the version move together. Then it
opens the pull request "Release x.y.z", or updates the one open, with that
section as its body. The branch `release` is the workflow's own and is
force-pushed; `main` never is. With only `internal` pull requests since the
tag it opens nothing; with no tag yet it opens nothing, and says which tag
to make first.

A pull request opened with the workflow's `GITHUB_TOKEN` starts no
workflow, so `checks.yml` does not run on it by itself: `release-pr.yml`
runs `checks.yml` whole on the release commit, and writes the result on it as
the commit status **Release checks**, which the pull request shows. Merge it
once that is green.

**Merging it is the release.** Its push publishes (below), and once
published the `tag` job of `pages.yml` tags the commit `vX.Y.Z` and makes the
GitHub release, its notes the release's section. The next run of
`release-pr.yml` reads from that tag.

Leave the pull request open while the release is not wanted: it is
refreshed on every push. A pull request merged with no release label counts
as a patch, and the release pull request lists it under **Not labelled**:
label it, and the next push to `main` takes it.

**Two settings, made once by a person**: Settings → Actions → General →
"Allow GitHub Actions to create and approve pull requests", without which
the workflow cannot open the pull request and says so; and the tags of the
releases made before this workflow, each on the commit of `main` whose push
published it:

```bash
git tag v0.3.0 ebb1e22bc32387a26dc06b9155441f1dc6ef4bed
git tag v0.4.0 4b0c186b24bd55870a23226046efc41112f21666
git tag v0.5.0 b72faceef932db3a3e31a72b1d8cb62340243a36
git tag v0.5.1 09bb8eff6a59268239843c949f54b9ffa2f9c602
git push origin --tags
```

The entries written by hand under `[Unreleased]` before the switch go, as
written, into the first generated section; the past sections stay as they
are.

## Publishing this repository

**Only a release publishes.** The catalog and the registry are served from
GitHub Pages, which holds one build: no address serves an older release. So
a merge to `main` does not publish by itself, or the registry would serve
what `main` gathered since the last release under that release's number.

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
next patch release: it publishes both. An unpublished release is not tagged,
and `release-pr.yml` waits for its tag before it opens the next release pull
request, saying so: tag it by hand on its commit (`git tag vX.Y.Z <sha> &&
git push origin vX.Y.Z`), and the next push to `main` opens it.

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
