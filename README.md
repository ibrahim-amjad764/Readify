
# Readify — AI README Generator

> Paste any GitHub URL → instantly generate a production-ready `README.md` using AI.

[Next.js](https://nextjs.org) • [TypeScript](https://typescriptlang.org) • [Tailwind CSS](https://tailwindcss.com) • [OpenAI](https://openai.com)

---

## Features

* Paste any public GitHub repository URL
* AI-powered analysis using GPT-4o-mini
* Generates structured README including:

  * Overview
  * Features
  * Tech Stack
  * Installation
  * Usage
  * Configuration
  * Contributing
  * License
* Live Markdown preview with GitHub-style rendering
* One-click copy to clipboard
* Secure input handling to prevent prompt injection
* Rate limiting per IP
* Fully responsive UI

---

## Tech Stack

* Next.js 14 (App Router + API routes)
* TypeScript (strict mode)
* Tailwind CSS
* OpenAI API (GPT-4o-mini)
* Octokit (GitHub API integration)
* react-markdown + remark-gfm
* Jest + Testing Library

---

## Installation

```bash
git clone https://github.com/your-username/reporead.git
cd reporead
npm install
```

### Environment Setup

```bash
cp .env.local.example .env.local
```

Add environment variables:

```env
OPENAI_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
RATE_LIMIT_RPM=10
```

Run development server:

```bash
npm run dev
```

---

## Usage

1. Open `http://localhost:3000`
2. Paste a GitHub repository URL (example: `https://github.com/vercel/next.js`)
3. Click Generate
4. View the generated README preview
5. Copy markdown with one click

---

## Project Structure

```
app/        → UI and API routes
components/ → Reusable UI components
lib/        → GitHub and OpenAI logic
tests/      → Unit and integration tests
```

---

## Deployment

Deploy on Vercel:

```bash
vercel --prod
```

Add environment variables in Vercel dashboard:

* OPENAI_API_KEY
* GITHUB_TOKEN (optional)
* RATE_LIMIT_RPM

---

## Why Readify

Readify automates README generation using AI, helping developers save time and create professional documentation instantly.

---

## License

MIT License © 2026

---

## Author

GitHub: [https://github.com/ibrahim-amjad764](https://github.com/ibrahim-amjad764)
