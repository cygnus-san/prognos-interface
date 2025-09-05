'use client';

import { useState } from 'react';
import { useClaimRewardMutation } from '@/hooks/usePoolsQuery';
import { Prediction } from '@/types';

interface ClaimButtonProps {
  poolId: string;
  walletAddress: string;
  prediction: Prediction;
  onRewardClaimed?: () => void;
}

export default function ClaimButton({ poolId, walletAddress, prediction, onRewardClaimed }: ClaimButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const claimMutation = useClaimRewardMutation();

  const handleClaim = async () => {
    setError(null);

    try {
      await claimMutation.mutateAsync({
        poolId,
        walletAddress,
      });
      onRewardClaimed?.();
    } catch {
      setError('Failed to claim reward');
    }
  };

  // Don't show button if no stake or already claimed
  if (prediction.stakeAmount <= 0 || prediction.claimed) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={claimMutation.isPending}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          claimMutation.isPending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        }`}
      >
        {claimMutation.isPending ? 'Claiming...' : 'Claim Reward (Mock)'}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Estimated reward: ${(prediction.stakeAmount * 1.5).toFixed(2)}
      </p>
    </div>
  );
}