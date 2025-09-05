'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Pool } from '@/types';

interface VotingCardProps {
  pool: Pool;
  onVote: (poolId: string, voteType: 'yes' | 'no') => Promise<void>;
}

export default function VotingCard({ pool, onVote }: VotingCardProps) {
  const [voting, setVoting] = useState<'yes' | 'no' | null>(null);
  const { isConnected } = useWallet();

  const handleVote = async (voteType: 'yes' | 'no') => {
    if (!isConnected) return;
    
    setVoting(voteType);
    try {
      await onVote(pool.id, voteType);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(null);
    }
  };

  // Calculate yes/no percentages from predictions
  const yesCount = pool.predictions?.filter(p => p.predictionValue === 'yes').length || 0;
  const noCount = pool.predictions?.filter(p => p.predictionValue === 'no').length || 0;
  const totalVotes = yesCount + noCount;
  
  const yesPercentage = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 50;
  const noPercentage = totalVotes > 0 ? (noCount / totalVotes) * 100 : 50;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Pool Question */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {pool.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {pool.description}
        </p>
        
        {/* Current Odds */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 bg-gray-100 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-green-600">YES</span>
              <span className="text-sm font-bold text-green-600">{yesPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-100 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-red-600">NO</span>
              <span className="text-sm font-bold text-red-600">{noPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${noPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={() => handleVote('yes')}
          disabled={!isConnected || voting !== null}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : voting === 'yes'
              ? 'bg-green-400 cursor-wait'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {voting === 'yes' ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Voting...
            </div>
          ) : (
            'Vote YES'
          )}
        </button>
        
        <button
          onClick={() => handleVote('no')}
          disabled={!isConnected || voting !== null}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !isConnected 
              ? 'bg-gray-300 cursor-not-allowed' 
              : voting === 'no'
              ? 'bg-red-400 cursor-wait'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {voting === 'no' ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Voting...
            </div>
          ) : (
            'Vote NO'
          )}
        </button>
      </div>

      {/* Pool Details */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Volume: ${pool.totalStake.toFixed(2)}</span>
          <span>Predictions: {pool._count.predictions}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Ends: {new Date(pool.deadline).toLocaleDateString()}</span>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 text-center">
            Connect your wallet to vote on this prediction
          </p>
        </div>
      )}
    </div>
  );
}