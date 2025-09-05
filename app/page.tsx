'use client';

import { useState, useEffect } from 'react';
import PoolCard from '@/components/PoolCard';
import VotingCard from '@/components/VotingCard';
import { useWallet } from '@/hooks/useWallet';
import { PoolsAPI } from '@/lib/api';
import { Pool, APIError } from '@/types';

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'voting' | 'detailed'>('voting');
  const { isConnected } = useWallet();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PoolsAPI.getAllPools();
        setPools(data);
      } catch (err) {
        const apiError = err as APIError;
        setError(apiError.message || 'Failed to fetch pools');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const handleVote = async (poolId: string, voteType: 'yes' | 'no') => {
    try {
      // This would integrate with your voting API
      console.log(`Voting ${voteType} on pool ${poolId}`);
      
      // For now, just show success message
      // In real implementation, you'd call something like:
      // await PoolsAPI.vote(poolId, voteType, amount);
      
      // Refresh pools after vote
      const updatedPools = await PoolsAPI.getAllPools();
      setPools(updatedPools);
    } catch (error) {
      console.error('Vote failed:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Active Prediction Markets
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Participate in prediction markets and stake on outcomes you believe in.
          Connect your Stacks wallet to get started.
        </p>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('voting')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'voting'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quick Vote
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status for Voting Mode */}
      {viewMode === 'voting' && !isConnected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Connect your wallet to start voting on predictions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading pools</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Pools Grid */}
      {!loading && !error && (
        <>
          {pools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prediction markets available</h3>
              <p className="text-gray-600">Check back later for new prediction opportunities.</p>
            </div>
          ) : (
            <>
              {viewMode === 'voting' ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {pools.filter(pool => pool.status === 'ACTIVE').map((pool) => (
                    <VotingCard 
                      key={pool.id} 
                      pool={pool} 
                      onVote={handleVote}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Statistics */}
      {!loading && pools.length > 0 && (
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {pools.length}
              </p>
              <p className="text-gray-600 mt-1">Active Markets</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                ${pools.reduce((sum, pool) => sum + pool.totalStake, 0).toFixed(2)}
              </p>
              <p className="text-gray-600 mt-1">Total Value Locked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {pools.reduce((sum, pool) => sum + pool._count.predictions, 0)}
              </p>
              <p className="text-gray-600 mt-1">Total Predictions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
