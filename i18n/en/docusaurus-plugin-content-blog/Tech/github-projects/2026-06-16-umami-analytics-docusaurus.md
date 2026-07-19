---
slug: 2026/06/16/umami-analytics-docusaurus
title: Adding Umami Visitor Analytics to a Docusaurus Blog
date: 2026-06-16
image: https://cdn.mikeq95blog.uk/coverimage/umami-en-cn.png
tags:
  - github
description: "Umami is a privacy-friendly open-source analytics tool that skips the cookie banner. This walks through the full setup, from signup to wiring it into a Docusaurus blog."
---

[Umami](https://umami.is) is an open-source analytics tool that doesn't track users or require a cookie banner. It has a free cloud-hosted tier with 100k events/month — plenty for a personal blog.

{/* truncate */}

---

## Step 1: Sign up and add your website

Umami's cloud-hosted version is free and the easiest way to start:

1. Go to [umami.is](https://umami.is) → **Get started for free**
2. Create an account
3. After logging in, click **Add website** and fill in:
   - Name: your blog's name
   - Domain: your blog's domain, e.g. `mikeq95blog.uk`
4. Click **Save**, then **Edit** → **Tracking code**, and copy your `data-website-id` (a UUID)

---

## Step 2: Inject the tracking script in Docusaurus

Add a `scripts` field in `docusaurus.config.js` (anywhere before `plugins` works):

```js
scripts: [
  ...(process.env.NODE_ENV === 'production' ? [
    {
      src: 'https://cloud.umami.is/script.js',
      async: true,
      defer: true,
      'data-website-id': 'your-website-id',  // replace with the UUID from step 1
    },
  ] : []),
],
```

Gating on `NODE_ENV === 'production'` keeps local dev from sending tracking requests, so your own browsing doesn't pollute the data.

It's fine to hardcode the website ID here — it ends up embedded in the public HTML source anyway, visible to anyone, so there's nothing to protect.

---

## Step 3: Push and wait for deploy

Commit and push:

```bash
git add docusaurus.config.js
git commit -m "Add Umami analytics tracking script"
git push origin main
```

GitHub Actions will kick off a build and deploy automatically — give it a couple of minutes. Check the **Actions** tab in your repo and look for a green `completed success`.

---

## Step 4: Verify the script made it into the page

Once deployed, use `curl` to check whether the Umami script is present on the live page:

```bash
curl -s https://your-blog-domain | grep 'umami'
```

If you see a `<script>` tag with the full UUID, it's wired up correctly.

Visit your blog, then refresh the [cloud.umami.is](https://cloud.umami.is) dashboard — you should start seeing real-time visitors, pageviews, and visitor countries show up.
