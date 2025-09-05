# Stacks Wallet Integration Setup

## ✅ Updated Implementation

The wallet integration has been updated to use the correct Stacks Connect API as specified in the official documentation.

### Key Changes Made

1. **Proper Import Structure**:
```typescript
import { 
  AppConfig, 
  UserSession, 
  showConnect 
} from '@stacks/connect';
```

2. **Correct Configuration**:
```typescript
// Initialize app config and user session
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const appDetails = {
  name: 'Prognos MVP',
  icon: '/favicon.ico',
};
```

3. **Proper Connection Flow**:
```typescript
const connectWallet = () => {
  showConnect({
    appDetails,
    onFinish: () => {
      window.location.reload(); // Reload to handle the pending sign in
    },
    onCancel: () => {
      console.log('User canceled wallet connection');
    },
    userSession, // Pass userSession to showConnect
  });
};
```

4. **Correct Session Handling**:
```typescript
useEffect(() => {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Handle pending sign in and check if user is already signed in
  if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then((userData) => {
      setUserData(userData);
      const walletAddress = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
      if (walletAddress) {
        setAppState({
          walletAddress,
          isConnected: true
        });
      }
    });
  } else if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    setUserData(userData);
    const walletAddress = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
    if (walletAddress) {
      setAppState({
        walletAddress,
        isConnected: true
      });
    }
  }
}, []);
```

5. **Proper Disconnect**:
```typescript
const disconnectWallet = () => {
  userSession.signUserOut();
  setAppState({
    walletAddress: null,
    isConnected: false
  });
  setUserData(null);
  window.location.reload(); // Refresh to clear state
};
```

### How It Works

1. **Connection**: When user clicks "Connect Wallet", `showConnect` opens the wallet interface
2. **Authentication**: User authenticates with their Stacks wallet (Hiro Wallet, Leather, etc.)
3. **Session Handling**: The app handles the pending sign-in and extracts the wallet address
4. **Persistence**: Session is managed by the Stacks Connect library (no need for localStorage)
5. **Disconnection**: `userSession.signUserOut()` properly clears the session

### Compatible Wallets

- **Hiro Wallet** (formerly Blockstack)
- **Leather Wallet** 
- **Xverse Wallet**
- Any Stacks-compatible wallet

### Testing the Connection

1. Start the development server: `npm run dev`
2. Open `http://localhost:3002` (or whatever port Next.js assigns)
3. Click "Connect Wallet" 
4. Follow the wallet connection flow
5. Your wallet address should appear in the navigation

### Build Status

✅ **Build succeeds** with no TypeScript errors  
✅ **SSR compatible** with proper window checks  
✅ **Type safe** with proper TypeScript interfaces  
✅ **Production ready** for deployment

The implementation follows the exact patterns from the Stacks documentation and will work correctly with real Stacks wallets.