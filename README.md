# Prognos MVP - Prediction Market Frontend

A clean, functional prediction market platform built with Next.js and integrated with Stacks wallet connectivity.

## Features

### 🏠 Home Page
- Display all active prediction markets
- Pool cards with title, description, deadline, and total stake
- Platform statistics (active markets, total value locked, predictions)
- Real-time data fetching with error handling and loading states

### 🎯 Pool Detail Page
- Detailed pool information with voting results visualization
- Two interaction modes:
  - **Vote (Free)**: Submit predictions without financial stake
  - **Stake**: Submit predictions with monetary commitment
- Real-time results display with percentage breakdowns
- User prediction status tracking
- Expired pool handling with reward claiming

### 👤 Profile Page
- Wallet connection integration
- Complete prediction history
- Reward tracking (claimed and unclaimed)
- Personal statistics dashboard
- Links to individual pool details

### 🔒 Stacks Wallet Integration
- Secure wallet connection using `@stacks/connect`
- Persistent session management
- Wallet address display and management
- Seamless wallet state management across the app

## Technical Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Styling**: TailwindCSS 4 with custom utility classes
- **TypeScript**: Full type safety throughout the application
- **Wallet**: Stacks Connect for blockchain integration
- **State Management**: React hooks with persistent localStorage
- **Data Fetching**: Native fetch API with comprehensive error handling

## API Integration

The frontend is designed to work with the backend API specification provided in `API_CONFIG.md`:

### Endpoints
- `GET /api/pools` - Fetch all prediction pools
- `GET /api/pools/:id` - Fetch specific pool details
- `POST /api/pools/:id/vote` - Submit free vote
- `POST /api/pools/:id/stake` - Submit vote with stake
- `POST /api/pools/:id/claim` - Claim mock rewards

### Error Handling
- Comprehensive error type system
- Network error recovery
- User-friendly error messages
- Retry mechanisms

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles with TailwindCSS
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home page
│   ├── pool/[id]/page.tsx   # Dynamic pool detail pages
│   └── profile/page.tsx     # User profile page
├── components/
│   ├── ClaimButton.tsx      # Reward claiming functionality
│   ├── ErrorBoundary.tsx    # Error boundary component
│   ├── Loading.tsx          # Reusable loading spinner
│   ├── Navigation.tsx       # Main navigation with wallet connection
│   ├── PoolCard.tsx         # Pool display cards
│   ├── StakeForm.tsx        # Staking form component
│   └── VoteForm.tsx         # Voting form component
├── hooks/
│   ├── useApi.ts            # Custom API hook with error handling
│   └── useWallet.ts         # Stacks wallet integration hook
├── lib/
│   └── api.ts               # API service layer
├── types/
│   └── index.ts             # TypeScript type definitions
├── .env.local               # Environment configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn
- Stacks wallet (Hiro Wallet recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stack-polymarket-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENVIRONMENT=development
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001` (or next available port).

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" in the navigation to connect your Stacks wallet
2. **Browse Markets**: View all active prediction markets on the home page
3. **Make Predictions**: Click on any pool to vote or stake on outcomes
4. **Track Performance**: Visit your profile page to see all predictions and rewards
5. **Claim Rewards**: For expired pools where you had stakes, claim your mock rewards

## Development Notes

### Key Components

- **PoolCard**: Displays pool information with status indicators
- **VoteForm**: Handles free voting without stakes
- **StakeForm**: Manages monetary predictions with validation
- **ClaimButton**: Processes reward claiming for expired pools
- **Navigation**: Manages wallet connection and app navigation

### State Management

- Wallet state persisted in localStorage
- Real-time data fetching with SWR-like patterns
- Error boundaries for graceful error handling
- Loading states throughout the application

### Styling Philosophy

Following the "minimal, clean, functional" approach:
- Clean, modern interface with TailwindCSS
- Responsive design for all screen sizes
- Consistent color scheme and typography
- Accessible components with proper ARIA labels

## Backend Integration

This frontend is designed to work with the Prognos MVP backend. Ensure the backend is running on the configured API URL before testing full functionality.

The application gracefully handles backend unavailability with appropriate error messages and retry mechanisms.

## Future Enhancements

- Real Stacks blockchain integration (currently mock)
- Advanced prediction analytics
- Social features (comments, sharing)
- Advanced filtering and search
- Real-time updates with WebSockets
- Mobile app version
- Advanced charting and data visualization

## Security Considerations

- No sensitive data stored in localStorage
- API requests properly validated
- Error messages don't expose system internals
- Wallet integration follows Stacks security best practices

---

Built with ❤️ for the Stacks ecosystem
