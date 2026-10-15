This repository may be mirrored on other Git forges. The [canonical repository](https://git.caution.co/public/demo-transparent-social-feeds) is hosted on git.caution.co. Please open issues and pull requests there.

# Transparent Social Feed demo

A polished static Caution demo prototype for verifiable social-media ranking algorithms.

The app uses only synthetic example data. It is not connected to a real social network and does not process private user data. Its purpose is to show how a feed can disclose the exact algorithm, formula, weights, inputs, score breakdown, and final ordering behind every item.

## What it demonstrates

- Multiple feed algorithms: chronological, popularity, following, topic affinity, and balanced/recommended.
- Realistic synthetic inputs: users, follows, posts, tags, likes, replies, shares, recency, and explicit topic preferences.
- A per-post "why am I seeing this?" explanation with every score component.
- A debug panel showing the active formula, weights, user profile, normalized inputs, and final ranked order.
- Caution deployment conventions: static assets, explicit `Procfile`, pinned StageX `Containerfile`, small resource settings, and `e2e: true`.

## Run locally

Quick static preview without containers:

```sh
cd /home/tuna/git/demo-transparent-social-feed
python3 -m http.server 8083 --directory public
```

Then open http://localhost:8083.

Container workflow:

```sh
make check
make build
make dev
```

Stop the container:

```sh
make stop
```

## Caution deployment

The `Procfile` serves `/workdir/public` with BusyBox httpd on port 8083:

```Procfile
run: /bin/busybox httpd -f -p 0.0.0.0:8083 -h /workdir/public
```

`Containerfile` pins the StageX BusyBox base image by digest and copies only static assets into the runtime image. No external paid APIs or runtime network access are required.

## Verification notes

The app intentionally computes rankings client-side from inspectable static data so demo visitors can compare the visible formula against the actual code in `public/app.js`. The dataset is synthetic and labeled as such in the UI.
