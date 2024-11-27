# Estimify

A beautiful estimation game where players test their intuition and compete globally.

## Features

- 🔐 Secure authentication with Clerk
- 🎯 Estimate various quantities and see how close you get
- 📊 Global leaderboard with privacy controls
- 💬 AI-powered feedback system
- ✨ Beautiful, responsive design

## Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd estimify
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Clerk and Google AI credentials:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_CLERK_SECRET_KEY=your_clerk_secret_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server
```bash
npm run dev
```

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `VITE_CLERK_SECRET_KEY`: Your Clerk secret key
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

## Tech Stack

- React + Vite
- Tailwind CSS
- Clerk.js for authentication
- Google Gemini AI for feedback
- Shadcn/UI components

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.