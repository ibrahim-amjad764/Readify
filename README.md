✨ Readify — AI-Powered README Generator

Turn any GitHub repository into professional documentation with AI.

Generate clean, structured, and production-ready README files in seconds.

    

🚀 Overview

Readify is an AI-powered documentation tool designed to simplify the process of creating professional GitHub README files.

Simply provide a public GitHub repository URL, and Readify analyzes the repository using GitHub API integration and OpenAI to generate comprehensive, well-structured documentation.

Whether you're building your first project or maintaining a large codebase, Readify helps you create documentation that looks professional and communicates your project's value.

✨ Key Features
GitHub Repository Analysis

Analyze public GitHub repositories through their URLs.

AI-Powered Generation

Generate professional documentation using OpenAI GPT-4o-mini.

Structured Documentation

Automatically generate essential README sections.

Live Markdown Preview

Preview documentation with GitHub-style Markdown rendering.

One-Click Copy

Copy generated Markdown instantly.

Secure Input Validation

Handle user input with prompt-injection-aware validation.

Rate Limiting

Apply per-IP request limits to help prevent API abuse.

Responsive Design

Support desktop, tablet, and mobile devices.

🛠️ Tech Stack
Technology Purpose

Next.js 14 Full-stack React framework

TypeScript Type-safe development

Tailwind CSS Responsive UI styling

OpenAI GPT-4o-mini AI-powered README generation

Octokit GitHub API integration

React Markdown Markdown rendering

Remark GFM GitHub Flavored Markdown

Jest Unit and integration testing

Testing Library Component testing

⚙️ Getting Started

Follow these steps to run Readify locally.

Prerequisites

Make sure you have the following installed:

Node.js 18+ npm OpenAI API key GitHub Personal Access Token (optional, depending on repository access and API requirements)

Clone the Repository bash git clone https://github.com/ibrahim-amjad764/reporead.git

Navigate to the Project bash cd reporead

Install Dependencies bash npm install

Configure Environment Variables

Create your environment configuration file:

bash cp .env.local.example .env.local

Add the required environment variables:

env OPENAI_API_KEY=your_openai_api_key GITHUB_TOKEN=your_github_token RATE_LIMIT_RPM=10

Environment Variable Reference

Variable Description OPENAI_API_KEY API key for OpenAI integration GITHUB_TOKEN GitHub API authentication token RATE_LIMIT_RPM Maximum requests allowed per minute

Keep your API keys private. Never commit .env.local or expose secret keys in client-side code.

Start the Development Server bash npm run dev
Open your browser and visit:

text http://localhost:3000

💡 How It Works Enter Repository URL — Paste the URL of any supported public GitHub repository. Analyze Repository — Readify retrieves relevant repository information. Generate Documentation — AI processes the repository context and generates structured Markdown. Preview README — Review the generated documentation in real time. Copy & Use — Copy your README and add it to your GitHub project.

🚀 Deployment

Readify can be deployed using Vercel.

Deploy with Vercel CLI bash npm install -g vercel vercel --prod

Before deployment, configure the required environment variables in your Vercel project settings.

OPENAI_API_KEY GITHUB_TOKEN (if required) RATE_LIMIT_RPM

For production deployment, ensure API keys are stored securely and server-side rate limiting is configured appropriately.

🔒 Security Considerations

Readify incorporates security-conscious practices, including:

Input validation and sanitization. Prompt-injection-aware handling of repository content. Server-side API key management. IP-based rate limiting. Controlled communication with external APIs. 🗺️ Future Improvements

Potential enhancements for future releases:

Multiple README templates. Download generated README as a Markdown file. Support for additional AI models. Repository badge generation. Custom README themes. GitHub OAuth integration. Multilingual README generation. 🤝 Contributing

Contributions, ideas, and suggestions are welcome!

Fork this repository. Create a feature branch: bash git checkout -b feature/your-feature

Commit your changes: bash git commit -m "feat: add your feature"

Push your branch: bash git push origin feature/your-feature

Open a Pull Request.

Please ensure your changes are tested and follow the existing project conventions.

📄 License

This project is licensed under the MIT License.

See the LICENSE file for more information.

👨‍💻 Author

Ibrahim Amjad

Full-Stack Developer | AI Enthusiast

GitHub: @ibrahim-amjad764

Built with ❤️ to make GitHub documentation smarter.

⭐ If you find Readify useful, consider giving this repository a star!