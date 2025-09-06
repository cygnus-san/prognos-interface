import {
  Pool,
  VoteResponse,
  StakeResponse,
  ClaimResponse,
  APIError,
  APIErrorType
} from '@/types';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Error Handler
function handleAPIError(response: Response, error: { error?: string }): APIError {
  const statusCode = response.status;
  const errorMessage = error.error || 'Unknown error';
  
  switch (statusCode) {
    case 400:
      if (errorMessage.includes('deadline')) {
        return { type: APIErrorType.DEADLINE_PASSED, message: errorMessage, statusCode };
      }
      if (errorMessage.includes('claimed')) {
        return { type: APIErrorType.ALREADY_CLAIMED, message: errorMessage, statusCode };
      }
      return { type: APIErrorType.VALIDATION_ERROR, message: errorMessage, statusCode };
    
    case 404:
      return { type: APIErrorType.NOT_FOUND, message: errorMessage || 'Resource not found', statusCode };
    
    case 500:
      return { type: APIErrorType.SERVER_ERROR, message: 'Server error occurred', statusCode };
    
    default:
      return { type: APIErrorType.NETWORK_ERROR, message: 'Network error occurred', statusCode };
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw handleAPIError(response, error);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      toast.error(networkError.message);
      throw networkError;
    }
    
    // Show toast notification for API errors
    if (error && typeof error === 'object' && 'message' in error) {
      toast.error((error as APIError).message);
    }
    
    throw error;
  }
}

// API functions
export const api = {
  // Pools
  async getAllPools(): Promise<Pool[]> {
    return apiRequest<Pool[]>('/pools');
  },

  async getFeedPools(walletAddress: string): Promise<Pool[]> {
    return apiRequest<Pool[]>(`/pools/feeds/${walletAddress}`);
  },

  async getPool(id: string): Promise<Pool> {
    return apiRequest<Pool>(`/pools/${id}`);
  },

  async vote(poolId: string, walletAddress: string, vote: 'yes' | 'no'): Promise<VoteResponse> {
    return apiRequest<VoteResponse>(`/pools/${poolId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ walletAddress, predictionValue: vote }),
    });
  },

  async stake(poolId: string, walletAddress: string, prediction: string, amount: number): Promise<StakeResponse> {
    return apiRequest<StakeResponse>(`/pools/${poolId}/stake`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        predictionValue: prediction,
        stakeAmount: amount,
      }),
    });
  },

  async claimReward(poolId: string, walletAddress: string): Promise<ClaimResponse> {
    return apiRequest<ClaimResponse>(`/pools/${poolId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },
};