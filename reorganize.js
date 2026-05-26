const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');

// 1. Delete test files
const filesToDelete = ['2026-05-20-emoji-test.md', '2026-05-22-test-ai-explain.md'];
for (const file of filesToDelete) {
  const filePath = path.join(blogDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${file}`);
  }
}

// 2. Reorganize files and add slugs
const categories = {
  'Tech': [
    '2025-05-16-quick-reference-for-macOS network-reset-commands.md',
    '2026-05-16-earch-engine-user-guide.md',
    '2026-05-16-kokoro-tts-tutorial.md'
  ],
  'English': [
    '2026-04-29-coding-english-vocabulary.md',
    '2026-04-29-general-english-vocabulary.md'
  ],
  'Life': [
    '2026-05-14-do-chinese-face-racial-discrimination-abroad.md',
    '2026-05-14-why-not-date-girls-with-broken-family-background.md'
  ]
};

// Create folders
for (const category of Object.keys(categories)) {
  const catDir = path.join(blogDir, category);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir);
  }
}

for (const [category, files] of Object.entries(categories)) {
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if slug exists
    if (!content.includes('slug:')) {
      // Parse YYYY-MM-DD-TITLE
      const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.*)\.md$/);
      if (match) {
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const title = match[4];
        const slug = `${year}/${month}/${day}/${title}`;
        
        // Insert slug into frontmatter
        content = content.replace(/^---/, `---\nslug: ${slug}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added slug ${slug} to ${file}`);
      } else {
        const title = file.replace('.md', '');
        content = content.replace(/^---/, `---\nslug: ${title}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added fallback slug to ${file}`);
      }
    }

    // Move file
    const newPath = path.join(blogDir, category, file);
    fs.renameSync(filePath, newPath);
    console.log(`Moved ${file} to ${category}/`);
  }
}

// 3. Create music category and new article
const musicDir = path.join(blogDir, 'music');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir);
}

const newArticlePath = path.join(musicDir, '2026-05-24-my-favorite-songs.md');
const newArticleContent = `---
title: 我最喜欢的歌（周杰伦）
date: 2026-05-24
tags:
  - "Music"
  - "Jay Chou"
slug: 2026/05/24/my-favorite-songs
---
# 我最喜欢的歌

周杰伦的经典歌曲陪伴了我的整个青春。以下是我最喜欢的一些歌曲：

1. **七里香** - 经典的旋律，夏天的味道。
2. **夜曲** - 前奏一响，回忆涌上心头。
3. **晴天** - 青春期的暗恋与遗憾。
4. **以父之名** - 暗黑风格的巅峰之作。
5. **青花瓷** - 唯美的中国风。

这些歌曲不仅仅是旋律的组合，更是岁月的印记。
`;
fs.writeFileSync(newArticlePath, newArticleContent, 'utf8');
console.log(`Created new article at music/2026-05-24-my-favorite-songs.md`);
