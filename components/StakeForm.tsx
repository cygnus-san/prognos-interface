'use client';

import { useState } from 'react';
import { PoolsAPI } from '@/lib/api';
import { APIError } from '@/types';

interface StakeFormProps {
  poolId: string;
  walletAddress: string;
  onStakeSubmitted?: () => void;
}

export default function StakeForm({ poolId, walletAddress, onStakeSubmitted }: StakeFormProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<'yes' | 'no' | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPrediction) {
      setError('Please select yes or no');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await PoolsAPI.stake(poolId, walletAddress, selectedPrediction, amount);
      onStakeSubmitted?.();
      setStakeAmount('');
      setSelectedPrediction(null);
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || 'Failed to submit stake');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Prediction
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setSelectedPrediction('yes')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              selectedPrediction === 'yes'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setSelectedPrediction('no')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              selectedPrediction === 'no'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 hover:border-red-300'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-2">
          Stake Amount ($)
        </label>
        <input
          type="number"
          id="stakeAmount"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          step="0.01"
          min="0.01"
          placeholder="Enter amount to stake"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedPrediction || !stakeAmount}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isSubmitting || !selectedPrediction || !stakeAmount
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Stake'}
      </button>
    </form>
  );
}