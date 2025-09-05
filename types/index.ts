// Core Data Types & Schemas for Prognos MVP

export interface User {
  id: string;                    // cuid() generated ID
  walletAddress: string;         // Stacks wallet address (unique)
  createdAt: string;            // ISO 8601 datetime
  updatedAt: string;            // ISO 8601 datetime
  predictions: Prediction[];     // Related predictions
}

export interface Pool {
  id: string;                    // cuid() generated ID
  title: string;                 // Pool title/question
  description: string;           // Detailed description
  tag: string;                   // Category tag (lowercase)
  deadline: string;              // ISO 8601 datetime
  image: string | null;          // Optional image URL
  totalStake: number;            // Total stake amount (float)
  createdAt: string;            // ISO 8601 datetime
  updatedAt: string;            // ISO 8601 datetime
  predictions: Prediction[];     // All predictions for this pool
  _count: {
    predictions: number;         // Count of predictions
  };
}

export interface Prediction {
  id: string;                    // cuid() generated ID
  poolId: string;               // Reference to Pool.id
  userWalletAddress: string;    // Reference to User.walletAddress
  predictionValue: string;      // "yes"|"no" or numeric value as string
  stakeAmount: number;          // Stake amount (float, default: 0)
  claimed: boolean;             // Reward claim status (default: false)
  createdAt: string;            // ISO 8601 datetime
  updatedAt: string;            // ISO 8601 datetime
  pool?: Pool;                  // Optional pool data (when included)
  user?: User;                  // Optional user data (when included)
}

// API Request/Response Types

export interface VoteRequest {
  walletAddress: string;         // Stacks wallet address
  predictionValue: 'yes' | 'no'; // Vote choice
}

export interface VoteResponse extends Prediction {}

export interface StakeRequest {
  walletAddress: string;    // Stacks wallet address
  predictionValue: string;  // "yes"|"no" or numeric value
  stakeAmount: number;      // Positive number (float)
}

export interface StakeResponse extends Prediction {}

export interface ClaimRequest {
  walletAddress: string; // Stacks wallet address
}

export interface ClaimResponse extends Prediction {
  mockReward: number;    // Calculated reward amount
  message: string;       // Success message
}

// Error Types
export enum APIErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DEADLINE_PASSED = 'DEADLINE_PASSED',
  ALREADY_CLAIMED = 'ALREADY_CLAIMED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface APIError {
  type: APIErrorType;
  message: string;
  statusCode: number;
}

// App State Types
export interface AppState {
  walletAddress: string | null;
  isConnected: boolean;
}

export interface StacksUserData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}