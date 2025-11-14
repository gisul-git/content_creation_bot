# Content Creation Chatbot - Next.js Frontend

This is the Next.js frontend for the AI Content Creation Chatbot.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.jsx      # Root layout
│   │   ├── page.jsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── ChatBot.jsx     # Main chat component (client component)
│   │   └── ChatBot.css     # Component styles
│   └── api.js              # API utilities
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json
```

## Key Features

- **Next.js 14** with App Router
- **React 18** with client components
- **Tailwind CSS** for styling
- **TypeScript support** (optional)
- **Environment variables** for API configuration

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Migration from Vite

This project was migrated from React + Vite to Next.js. Key changes:

1. **App Router**: Uses Next.js 14 App Router instead of Vite's entry point
2. **Client Components**: Components using hooks must have `'use client'` directive
3. **Environment Variables**: Uses `NEXT_PUBLIC_` prefix instead of `VITE_`
4. **Build System**: Uses Next.js build system instead of Vite
5. **File Structure**: Follows Next.js conventions (app directory)

## Troubleshooting

### Port conflicts
If port 3000 is in use, Next.js will automatically use the next available port.

### API connection issues
Ensure your backend is running on the URL specified in `NEXT_PUBLIC_API_URL`.

### Build errors
Clear the `.next` directory and rebuild:
```bash
rm -rf .next
npm run build
```

