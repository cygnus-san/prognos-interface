import {
  Pool,
  VoteResponse,
  StakeResponse,
  ClaimResponse,
  APIError,
  APIErrorType
} from '@/types';

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

// API Service Class
export class PoolsAPI {
  private static baseURL = API_BASE_URL;

  // Get all pools
  static async getAllPools(): Promise<Pool[]> {
    try {
      const response = await fetch(`${this.baseURL}/pools`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch pools' }));
        throw handleAPIError(response, error);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      }
      throw error;
    }
  }

  // Get specific pool
  static async getPool(id: string): Promise<Pool> {
    try {
      const response = await fetch(`${this.baseURL}/pools/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Pool not found' }));
        throw handleAPIError(response, error);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      }
      throw error;
    }
  }

  // Submit vote
  static async vote(poolId: string, walletAddress: string, vote: 'yes' | 'no'): Promise<VoteResponse> {
    try {
      const response = await fetch(`${this.baseURL}/pools/${poolId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, predictionValue: vote })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Vote failed' }));
        throw handleAPIError(response, error);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      }
      throw error;
    }
  }

  // Submit stake
  static async stake(poolId: string, walletAddress: string, prediction: string, amount: number): Promise<StakeResponse> {
    try {
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
        const error = await response.json().catch(() => ({ error: 'Stake failed' }));
        throw handleAPIError(response, error);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      }
      throw error;
    }
  }

  // Claim reward
  static async claimReward(poolId: string, walletAddress: string): Promise<ClaimResponse> {
    try {
      const response = await fetch(`${this.baseURL}/pools/${poolId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Claim failed' }));
        throw handleAPIError(response, error);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw { type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 };
      }
      throw error;
    }
  }
}

