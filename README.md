# Offline leetcode

This project allows you to get problems from leetcode, and have a similar looking UI and code env on the browser for you to solve leetcode with no excuses.

## Features

- Code editor with VIM mode
- Import leetcode directly with graphql
- Dashboard to see all questions stored
- Change to your favourite IDE theme

## Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd offline-leetcode
```

1. Install dependencies:

```bash
bun install
```

1. (Optional) Generate problems.json from problems.ts:

```bash
bun run scripts/generate-problems-json.ts
```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### Building for Production

Build the application:

```bash
bun run build
```

Preview the production build:

```bash
bun run serve
```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run serve` - Preview production build
- `bun run test` - Run tests

> Disclaimer this app was completely vibe coded

Made with ❤️ by DK
