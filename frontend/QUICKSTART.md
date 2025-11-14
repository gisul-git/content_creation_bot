# Quick Start Guide - Next.js Frontend

## 🚀 Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

Or manually create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Common Issues

### Backend Not Connecting?
1. Make sure backend is running on `http://localhost:8000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is enabled on backend

### Port 3000 Already in Use?
Next.js will automatically use the next available port (3001, 3002, etc.)

### Module Errors?
```bash
rm -rf .next node_modules
npm install
```

## 📚 More Information

See `README.md` for detailed documentation and `../NEXTJS_MIGRATION.md` for migration details.

