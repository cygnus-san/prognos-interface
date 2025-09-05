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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Prediction
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setSelectedVote('yes')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              selectedVote === 'yes'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setSelectedVote('no')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              selectedVote === 'no'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 hover:border-red-300'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={voteMutation.isPending || !selectedVote}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          voteMutation.isPending || !selectedVote
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {voteMutation.isPending ? 'Submitting...' : 'Submit Vote (Free)'}
      </button>
    </form>
  );
}