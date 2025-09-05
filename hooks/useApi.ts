'use client';

import { useState, useEffect } from 'react';
import { APIError, APIErrorType } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Custom React Hook for API calls
export function useApi<T>(
  endpoint: string,
  options?: RequestInit
): { data: T | null; loading: boolean; error: APIError | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw handleAPIError(response, errorData);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        if (err instanceof TypeError) {
          setError({ type: APIErrorType.NETWORK_ERROR, message: 'Network connection failed', statusCode: 0 });
        } else {
          setError(err as APIError);
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

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