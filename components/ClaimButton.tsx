'use client';

import { useState } from 'react';
import { PoolsAPI } from '@/lib/api';
import { APIError, Prediction } from '@/types';

interface ClaimButtonProps {
  poolId: string;
  walletAddress: string;
  prediction: Prediction;
  onRewardClaimed?: () => void;
}

export default function ClaimButton({ poolId, walletAddress, prediction, onRewardClaimed }: ClaimButtonProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    setIsClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await PoolsAPI.claimReward(poolId, walletAddress);
      setSuccess(`Successfully claimed $${result.mockReward.toFixed(2)} reward!`);
      onRewardClaimed?.();
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || 'Failed to claim reward');
    } finally {
      setIsClaiming(false);
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
      
      {success && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={isClaiming}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isClaiming
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        }`}
      >
        {isClaiming ? 'Claiming...' : 'Claim Reward (Mock)'}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Estimated reward: ${(prediction.stakeAmount * 1.5).toFixed(2)}
      </p>
    </div>
  );
}