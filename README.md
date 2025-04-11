# Collaborative Canvas

A real-time collaborative web application featuring a shared canvas and chat functionality. Users can interact with the canvas by placing and moving their avatars, and communicate through a global chat system.

## Features

- Shared canvas where users can place and move their avatars
- Real-time updates of user positions and movements
- Global chat system for all connected users
- Random name and avatar generation for each user
- Widget system architecture for future extensions (YouTube player, chess game, etc.)

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Real-time Communication: Socket.IO
- Styling: Styled Components
- Build Tool: Vite

## Setup

1. Install dependencies:
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. Start the development servers:
   ```bash
   # Start both client and server
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3000
   - Frontend development server on http://localhost:5173

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   ├── index.html         # HTML template
│   └── package.json       # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── index.ts           # Server entry point
│   └── utils.ts           # Utility functions
├── package.json           # Backend dependencies
└── README.md             # Project documentation
```

## Adding Widgets

The application is designed with a flexible widget system. To add a new widget:

1. Create a new component in `client/src/components/widgets/`
2. Add the widget to the `WidgetContainer` in `App.tsx`
3. Implement the necessary Socket.IO events for widget synchronization

## Contributing

Feel free to submit issues and enhancement requests! # sqdtv
# sqdtv
