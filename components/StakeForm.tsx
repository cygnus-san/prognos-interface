'use client';

import { useState } from 'react';
import { useStakeMutation } from '@/hooks/usePoolsQuery';

interface StakeFormProps {
  poolId: string;
  walletAddress: string;
  onStakeSubmitted?: () => void;
}

export default function StakeForm({ poolId, walletAddress, onStakeSubmitted }: StakeFormProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<'yes' | 'no' | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const stakeMutation = useStakeMutation();

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

    setError(null);

    try {
      await stakeMutation.mutateAsync({
        poolId,
        walletAddress,
        prediction: selectedPrediction,
        amount,
      });
      // Reset form on success
      setStakeAmount('');
      setSelectedPrediction(null);
      onStakeSubmitted?.();
    } catch {
      setError('Failed to submit stake');
    }
  };

  return (
    <div className="glass-card p-6 slide-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-white mb-4">
            Your Prediction
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSelectedPrediction('yes')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                selectedPrediction === 'yes'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400/30 shadow-lg shadow-green-500/30'
                  : 'glass-surface text-slate-300 border border-slate-600/30 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSelectedPrediction('no')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                selectedPrediction === 'no'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border border-red-400/30 shadow-lg shadow-red-500/30'
                  : 'glass-surface text-slate-300 border border-slate-600/30 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="stakeAmount" className="block text-sm font-semibold text-white mb-4">
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
            className="input-glass w-full"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-400/30 text-red-300 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={stakeMutation.isPending || !selectedPrediction || !stakeAmount}
          className={`btn-primary w-full py-4 ${
            stakeMutation.isPending || !selectedPrediction || !stakeAmount
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {stakeMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting...
            </div>
          ) : (
            'Submit Stake'
          )}
        </button>
      </form>
    </div>
  );
}