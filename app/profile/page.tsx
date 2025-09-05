'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { usePoolsQuery } from '@/hooks/usePoolsQuery';
import { Pool, Prediction } from '@/types';

interface UserPredictionWithPool extends Prediction {
  pool: Pool;
}

export default function Profile() {
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const { data: pools, isLoading: loading, error } = usePoolsQuery();

  // Filter user predictions from all pools
  const userPredictions = useMemo(() => {
    if (!walletAddress || !pools) return [];
    
    const predictions: UserPredictionWithPool[] = [];
    pools.forEach(pool => {
      const userPreds = pool.predictions.filter(
        pred => pred.userWalletAddress === walletAddress
      );
      userPreds.forEach(pred => {
        predictions.push({
          ...pred,
          pool
        });
      });
    });
    
    return predictions;
  }, [walletAddress, pools]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to view your predictions and rewards.</p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const totalStaked = userPredictions.reduce((sum, pred) => sum + pred.stakeAmount, 0);
  const claimedRewards = userPredictions
    .filter(pred => pred.claimed)
    .reduce((sum, pred) => sum + pred.stakeAmount * 1.5, 0); // Mock 1.5x reward
  const unclaimedRewards = userPredictions
    .filter(pred => !pred.claimed && pred.stakeAmount > 0 && new Date(pred.pool.deadline) < new Date())
    .reduce((sum, pred) => sum + pred.stakeAmount * 1.5, 0); // Mock 1.5x reward

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Wallet: {walletAddress?.substring(0, 8)}...{walletAddress?.substring(walletAddress.length - 6)}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-blue-600">{userPredictions.length}</p>
          <p className="text-gray-600 text-sm">Total Predictions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-green-600">${totalStaked.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Total Staked</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-yellow-600">${unclaimedRewards.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Unclaimed Rewards</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-purple-600">${claimedRewards.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Claimed Rewards</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading predictions</p>
          <p className="text-sm">{error.message || 'Failed to fetch your predictions'}</p>
        </div>
      )}

      {/* Predictions List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Predictions</h2>
          </div>
          
          {userPredictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
              <p className="text-gray-600 mb-4">Start by making your first prediction on a market.</p>
              <Link 
                href="/" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userPredictions.map((prediction) => {
                const isExpired = new Date(prediction.pool.deadline) < new Date();
                return (
                  <div key={prediction.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link 
                          href={`/pool/${prediction.pool.id}`}
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {prediction.pool.title}
                        </Link>
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {prediction.pool.description}
                        </p>
                      </div>
                      <span className={`ml-4 text-sm font-medium ${
                        isExpired ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Your Prediction</p>
                        <p className={`font-medium ${
                          prediction.predictionValue === 'yes' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {prediction.predictionValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stake Amount</p>
                        <p className="font-medium text-gray-900">
                          ${prediction.stakeAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Potential Reward</p>
                        <p className="font-medium text-gray-900">
                          ${(prediction.stakeAmount * 1.5).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className={`font-medium ${
                          prediction.claimed 
                            ? 'text-green-600' 
                            : prediction.stakeAmount > 0 && isExpired 
                              ? 'text-yellow-600' 
                              : 'text-gray-600'
                        }`}>
                          {prediction.claimed 
                            ? 'Claimed' 
                            : prediction.stakeAmount > 0 && isExpired 
                              ? 'Ready to Claim'
                              : prediction.stakeAmount > 0 
                                ? 'Staked'
                                : 'Vote Only'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Deadline: {new Date(prediction.pool.deadline).toLocaleDateString()} • 
                      Created: {new Date(prediction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}