# Prognos MVP Backend API Configuration

**LLM Integration Guide for Frontend Development**

This document provides comprehensive API configuration for seamless frontend integration with the Prognos MVP backend. All endpoints, schemas, and patterns are defined for direct LLM consumption and implementation.

## Base Configuration

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// HTTP Client Configuration
const apiClient = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};
```

## Core Data Types & Schemas

### User Entity
```typescript
interface User {
  id: string;                    // cuid() generated ID
  walletAddress: string;         // Stacks wallet address (unique)
  createdAt: string;            // ISO 8601 datetime
  updatedAt: string;            // ISO 8601 datetime
  predictions: Prediction[];     // Related predictions
}
```

### Pool Entity
```typescript
interface Pool {
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
```

### Prediction Entity
```typescript
interface Prediction {
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
```

## API Endpoints Specification

### 1. GET /api/pools - Retrieve All Pools

**Purpose**: Fetch all prediction pools with aggregated data
**Method**: GET
**Authentication**: None required
**Rate Limit**: Standard

```typescript
// Request
interface GetPoolsRequest {
  // No parameters required
}

// Response
interface GetPoolsResponse extends Array<Pool> {
  // Array of Pool objects with predictions and count
}

// Implementation Pattern
async function getAllPools(): Promise<Pool[]> {
  const response = await fetch(`${API_BASE_URL}/pools`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch pools`);
  }
  
  return response.json();
}

// Expected Response Structure
[
  {
    "id": "cm123abc456",
    "title": "Will Bitcoin reach $100k by 2024?",
    "description": "Prediction on Bitcoin price reaching $100,000 USD",
    "tag": "crypto",
    "deadline": "2024-12-31T23:59:59.000Z",
    "image": "https://example.com/bitcoin.jpg",
    "totalStake": 1250.75,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-09-05T10:30:00.000Z",
    "predictions": [...],
    "_count": { "predictions": 42 }
  }
]
```

### 2. GET /api/pools/:id - Retrieve Specific Pool

**Purpose**: Fetch detailed information for a single pool
**Method**: GET
**Authentication**: None required
**Parameters**: Pool ID in URL path

```typescript
// Request
interface GetPoolRequest {
  id: string; // Pool ID (cuid)
}

// Response
interface GetPoolResponse extends Pool {
  // Single Pool object with full details
}

// Implementation Pattern
async function getPool(poolId: string): Promise<Pool> {
  const response = await fetch(`${API_BASE_URL}/pools/${poolId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (response.status === 404) {
    throw new Error('Pool not found');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch pool`);
  }
  
  return response.json();
}

// Error Responses
// 404: { "error": "Pool not found" }
// 500: { "error": "Failed to fetch pool" }
```

### 3. POST /api/pools/:id/vote - Submit Vote (No Stake)

**Purpose**: Submit prediction vote without financial stake
**Method**: POST
**Authentication**: Wallet address validation
**Idempotent**: Updates existing vote if present

```typescript
// Request Body
interface VoteRequest {
  walletAddress: string;         // Stacks wallet address
  predictionValue: 'yes' | 'no'; // Vote choice
}

// Response
interface VoteResponse extends Prediction {
  // Updated or created prediction
}

// Implementation Pattern
async function submitVote(poolId: string, voteData: VoteRequest): Promise<Prediction> {
  const response = await fetch(`${API_BASE_URL}/pools/${poolId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voteData)
  });
  
  if (response.status === 400) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid vote data');
  }
  
  if (response.status === 404) {
    throw new Error('Pool not found');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to submit vote`);
  }
  
  return response.json();
}

// Request Example
{
  "walletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678",
  "predictionValue": "yes"
}

// Success Response Example
{
  "id": "cm456def789",
  "poolId": "cm123abc456",
  "userWalletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678",
  "predictionValue": "yes",
  "stakeAmount": 0,
  "claimed": false,
  "createdAt": "2024-09-05T15:30:00.000Z",
  "updatedAt": "2024-09-05T15:30:00.000Z"
}

// Error Responses
// 400: { "error": "Missing required fields" }
// 404: { "error": "Pool not found" }
// 500: { "error": "Failed to create vote" }
```

### 4. POST /api/pools/:id/stake - Submit Stake

**Purpose**: Submit prediction with financial stake
**Method**: POST
**Authentication**: Wallet address validation
**Business Rules**: 
- Validates pool deadline not passed
- Accumulates stakes for existing predictions
- Creates user if doesn't exist

```typescript
// Request Body
interface StakeRequest {
  walletAddress: string;    // Stacks wallet address
  predictionValue: string;  // "yes"|"no" or numeric value
  stakeAmount: number;      // Positive number (float)
}

// Response
interface StakeResponse extends Prediction {
  // Updated or created prediction with stake
}

// Implementation Pattern
async function submitStake(poolId: string, stakeData: StakeRequest): Promise<Prediction> {
  const response = await fetch(`${API_BASE_URL}/pools/${poolId}/stake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stakeData)
  });
  
  if (response.status === 400) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid stake data');
  }
  
  if (response.status === 404) {
    throw new Error('Pool not found');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to submit stake`);
  }
  
  return response.json();
}

// Request Example
{
  "walletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678",
  "predictionValue": "yes",
  "stakeAmount": 100.5
}

// Success Response Example
{
  "id": "cm456def789",
  "poolId": "cm123abc456",
  "userWalletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678",
  "predictionValue": "yes",
  "stakeAmount": 150.5,    // Accumulated if existing prediction
  "claimed": false,
  "createdAt": "2024-09-05T15:30:00.000Z",
  "updatedAt": "2024-09-05T15:35:00.000Z"
}

// Error Responses
// 400: { "error": "Missing required fields" }
// 400: { "error": "Stake amount must be positive" }
// 400: { "error": "Pool deadline has passed" }
// 404: { "error": "Pool not found" }
// 500: { "error": "Failed to create stake" }
```

### 5. POST /api/pools/:id/claim - Claim Rewards (Mock)

**Purpose**: Claim prediction rewards (mock implementation)
**Method**: POST
**Authentication**: Wallet address validation
**Business Rules**:
- Validates user has prediction with stake
- Prevents double claiming
- Mock reward calculation (1.5x stake)

```typescript
// Request Body
interface ClaimRequest {
  walletAddress: string; // Stacks wallet address
}

// Response
interface ClaimResponse extends Prediction {
  mockReward: number;    // Calculated reward amount
  message: string;       // Success message
}

// Implementation Pattern
async function claimReward(poolId: string, claimData: ClaimRequest): Promise<ClaimResponse> {
  const response = await fetch(`${API_BASE_URL}/pools/${poolId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  
  if (response.status === 400) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid claim request');
  }
  
  if (response.status === 404) {
    throw new Error('No prediction found');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to claim reward`);
  }
  
  return response.json();
}

// Request Example
{
  "walletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678"
}

// Success Response Example
{
  "id": "cm456def789",
  "poolId": "cm123abc456",
  "userWalletAddress": "SP1234567890ABCDEF1234567890ABCDEF12345678",
  "predictionValue": "yes",
  "stakeAmount": 100.0,
  "claimed": true,
  "createdAt": "2024-09-05T15:30:00.000Z",
  "updatedAt": "2024-09-05T16:00:00.000Z",
  "mockReward": 150.0,
  "message": "Rewards claimed successfully (mock)"
}

// Error Responses
// 400: { "error": "Missing wallet address" }
// 400: { "error": "Rewards already claimed" }
// 400: { "error": "No stake to claim" }
// 404: { "error": "No prediction found for this user and pool" }
// 500: { "error": "Failed to claim reward" }
```

## Frontend Integration Patterns

### React Hooks Pattern
```typescript
// useApi.ts - Custom hook for API integration
import { useState, useEffect } from 'react';

export function useApi<T>(
  endpoint: string,
  options?: RequestInit
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

// Usage Examples
const { data: pools, loading, error } = useApi<Pool[]>('/pools');
const { data: pool } = useApi<Pool>(`/pools/${poolId}`);
```

### API Service Layer Pattern
```typescript
// api/pools.ts - Service layer implementation
export class PoolsAPI {
  private static baseURL = API_BASE_URL;

  static async getAllPools(): Promise<Pool[]> {
    const response = await fetch(`${this.baseURL}/pools`);
    if (!response.ok) throw new Error('Failed to fetch pools');
    return response.json();
  }

  static async getPool(id: string): Promise<Pool> {
    const response = await fetch(`${this.baseURL}/pools/${id}`);
    if (!response.ok) throw new Error('Pool not found');
    return response.json();
  }

  static async vote(poolId: string, walletAddress: string, vote: 'yes' | 'no'): Promise<Prediction> {
    const response = await fetch(`${this.baseURL}/pools/${poolId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, predictionValue: vote })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Vote failed');
    }
    
    return response.json();
  }

  static async stake(poolId: string, walletAddress: string, prediction: string, amount: number): Promise<Prediction> {
    const response = await fetch(`${this.baseURL}/pools/${poolId}/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        predictionValue: prediction,
        stakeAmount: amount
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Stake failed');
    }
    
    return response.json();
  }

  static async claimReward(poolId: string, walletAddress: string): Promise<ClaimResponse> {
    const response = await fetch(`${this.baseURL}/pools/${poolId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Claim failed');
    }
    
    return response.json();
  }
}
```

## Error Handling Strategy

### Error Types & Handling
```typescript
// types/errors.ts
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

// utils/errorHandler.ts
export function handleAPIError(response: Response, error: any): APIError {
  const statusCode = response.status;
  
  switch (statusCode) {
    case 400:
      if (error.error?.includes('deadline')) {
        return { type: APIErrorType.DEADLINE_PASSED, message: error.error, statusCode };
      }
      if (error.error?.includes('claimed')) {
        return { type: APIErrorType.ALREADY_CLAIMED, message: error.error, statusCode };
      }
      return { type: APIErrorType.VALIDATION_ERROR, message: error.error, statusCode };
    
    case 404:
      return { type: APIErrorType.NOT_FOUND, message: error.error || 'Resource not found', statusCode };
    
    case 500:
      return { type: APIErrorType.SERVER_ERROR, message: 'Server error occurred', statusCode };
    
    default:
      return { type: APIErrorType.NETWORK_ERROR, message: 'Network error occurred', statusCode };
  }
}
```

## State Management Integration

### Redux/Zustand Store Pattern
```typescript
// store/poolsStore.ts
interface PoolsState {
  pools: Pool[];
  selectedPool: Pool | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPools: () => Promise<void>;
  fetchPool: (id: string) => Promise<void>;
  submitVote: (poolId: string, walletAddress: string, vote: 'yes' | 'no') => Promise<void>;
  submitStake: (poolId: string, walletAddress: string, prediction: string, amount: number) => Promise<void>;
  claimReward: (poolId: string, walletAddress: string) => Promise<void>;
}

export const usePoolsStore = create<PoolsState>((set, get) => ({
  pools: [],
  selectedPool: null,
  loading: false,
  error: null,

  fetchPools: async () => {
    set({ loading: true, error: null });
    try {
      const pools = await PoolsAPI.getAllPools();
      set({ pools, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPool: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const pool = await PoolsAPI.getPool(id);
      set({ selectedPool: pool, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  submitVote: async (poolId: string, walletAddress: string, vote: 'yes' | 'no') => {
    try {
      await PoolsAPI.vote(poolId, walletAddress, vote);
      // Refresh pool data
      await get().fetchPool(poolId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }

  // ... other actions
}));
```

## Development & Testing Configuration

### Environment Variables
```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENVIRONMENT=development

# .env.production (Frontend)
NEXT_PUBLIC_API_URL=https://api.prognos.com/api
NEXT_PUBLIC_ENVIRONMENT=production
```

### Mock Data for Development
```typescript
// mocks/poolData.ts
export const mockPools: Pool[] = [
  {
    id: "cm123abc456",
    title: "Will Bitcoin reach $100k by 2024?",
    description: "Prediction on Bitcoin price reaching $100,000 USD by end of 2024",
    tag: "crypto",
    deadline: "2024-12-31T23:59:59.000Z",
    image: "https://example.com/bitcoin.jpg",
    totalStake: 1250.75,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-09-05T10:30:00.000Z",
    predictions: [],
    _count: { predictions: 42 }
  }
];
```

## LLM Implementation Guidelines

### Prompt Patterns for Implementation
```
When implementing frontend API integration:

1. ALWAYS use the exact TypeScript interfaces provided above
2. IMPLEMENT proper error handling for all status codes (400, 404, 500)
3. VALIDATE request data before sending to API
4. USE the service layer pattern for organized API calls
5. IMPLEMENT loading states and error boundaries
6. CACHE responses when appropriate
7. HANDLE wallet address validation client-side
8. IMPLEMENT optimistic updates where suitable
9. ADD retry logic for network failures
10. LOG API interactions for debugging

Code generation should prioritize:
- Type safety with provided interfaces
- Error handling with specific error types
- Loading states for user experience
- Caching for performance
- Validation for data integrity
```

This configuration provides complete API integration guidance optimized for LLM understanding and direct implementation in React/Next.js frontend applications.