'use client';

import { useState } from 'react';
import { useVoteMutation } from '@/hooks/usePoolsQuery';

interface VoteFormProps {
  poolId: string;
  walletAddress: string;
  onVoteSubmitted?: () => void;
}

export default function VoteForm({ poolId, walletAddress, onVoteSubmitted }: VoteFormProps) {
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const voteMutation = useVoteMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVote) {
      setError('Please select yes or no');
      return;
    }

    setError(null);

    try {
      await voteMutation.mutateAsync({
        poolId,
        walletAddress,
        vote: selectedVote,
      });
      setSelectedVote(null); // Reset form
      onVoteSubmitted?.();
    } catch {
      setError('Failed to submit vote');
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
              onClick={() => setSelectedVote('yes')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                selectedVote === 'yes'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400/30 shadow-lg shadow-green-500/30'
                  : 'glass-surface text-slate-300 border border-slate-600/30 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSelectedVote('no')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                selectedVote === 'no'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border border-red-400/30 shadow-lg shadow-red-500/30'
                  : 'glass-surface text-slate-300 border border-slate-600/30 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-400/30 text-red-300 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={voteMutation.isPending || !selectedVote}
          className={`btn-primary w-full py-4 ${
            voteMutation.isPending || !selectedVote
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {voteMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting...
            </div>
          ) : (
            'Submit Vote (Free)'
          )}
        </button>
      </form>
    </div>
  );
}