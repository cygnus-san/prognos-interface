'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Pool } from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const poolQueryKeys = {
  all: ['pools'] as const,
  lists: () => [...poolQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...poolQueryKeys.lists(), filters] as const,
  details: () => [...poolQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...poolQueryKeys.details(), id] as const,
};

// Queries
export function usePoolsQuery() {
  return useQuery({
    queryKey: poolQueryKeys.list(),
    queryFn: () => api.getAllPools(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePoolQuery(id: string) {
  return useQuery({
    queryKey: poolQueryKeys.detail(id),
    queryFn: () => api.getPool(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Mutations
export function useVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poolId, walletAddress, vote }: { 
      poolId: string; 
      walletAddress: string; 
      vote: 'yes' | 'no'; 
    }) => api.vote(poolId, walletAddress, vote),
    onSuccess: (data, { poolId }) => {
      toast.success('Vote submitted successfully!');
      // Invalidate and refetch pool data
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.detail(poolId) });
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Vote failed:', error);
      // Error toast is already handled in api-client
    },
  });
}

export function useStakeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      poolId, 
      walletAddress, 
      prediction, 
      amount 
    }: { 
      poolId: string; 
      walletAddress: string; 
      prediction: string; 
      amount: number; 
    }) => api.stake(poolId, walletAddress, prediction, amount),
    onSuccess: (data, { poolId }) => {
      toast.success('Stake submitted successfully!');
      // Invalidate and refetch pool data
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.detail(poolId) });
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Stake failed:', error);
      // Error toast is already handled in api-client
    },
  });
}

export function useClaimRewardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poolId, walletAddress }: { 
      poolId: string; 
      walletAddress: string; 
    }) => api.claimReward(poolId, walletAddress),
    onSuccess: (data, { poolId }) => {
      toast.success(`Reward claimed successfully! Amount: $${data.mockReward.toFixed(2)}`);
      // Invalidate and refetch pool data
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.detail(poolId) });
      queryClient.invalidateQueries({ queryKey: poolQueryKeys.list() });
    },
    onError: (error) => {
      console.error('Claim failed:', error);
      // Error toast is already handled in api-client
    },
  });
}