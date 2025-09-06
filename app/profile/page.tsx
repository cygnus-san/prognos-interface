'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { usePoolsQuery, useClaimRewardMutation } from '@/hooks/usePoolsQuery';
import { Pool, Prediction } from '@/types';
import toast from 'react-hot-toast';

interface UserPredictionWithPool extends Prediction {
  pool: Pool;
}

export default function Profile() {
  const { walletAddress, isConnected, connectWallet } = useWallet();
  const { data: pools, isLoading: loading, error } = usePoolsQuery();
  const claimMutation = useClaimRewardMutation();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

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

  // Separate active and resolved predictions
  const activePredictions = useMemo(() => {
    return userPredictions.filter(pred => new Date(pred.pool.deadline) >= new Date());
  }, [userPredictions]);

  const resolvedPredictions = useMemo(() => {
    return userPredictions.filter(pred => new Date(pred.pool.deadline) < new Date());
  }, [userPredictions]);

  const handleClaim = async (poolId: string) => {
    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      await claimMutation.mutateAsync({
        poolId,
        walletAddress,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Claim failed:', error);
    }
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <p className="text-2xl font-bold text-blue-600">{activePredictions.length}</p>
          <p className="text-gray-600 text-sm">Active Campaigns</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-green-600">{resolvedPredictions.length}</p>
          <p className="text-gray-600 text-sm">Resolved Campaigns</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-yellow-600">${unclaimedRewards.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Available to Claim</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-purple-600">${claimedRewards.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Total Claimed</p>
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

      {/* Tab Navigation */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active ({activePredictions.length})
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'resolved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resolved ({resolvedPredictions.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'active' && (
              <div>
                {activePredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active campaigns</h3>
                    <p className="text-gray-600 mb-4">Your active predictions will appear here.</p>
                    <Link 
                      href="/" 
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Markets
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {activePredictions.map((prediction) => (
                      <div key={prediction.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
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
                          <span className="ml-4 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Your Prediction</p>
                            <p className={`font-medium ${
                              prediction.predictionValue === 'yes' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {prediction.predictionValue.toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Stake Amount</p>
                            <p className="font-medium text-gray-900">
                              {prediction.stakeAmount > 0 ? `$${prediction.stakeAmount.toFixed(2)}` : 'Vote Only'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Pool Size</p>
                            <p className="font-medium text-gray-900">
                              ${prediction.pool.totalStake.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ends</p>
                            <p className="font-medium text-gray-900">
                              {new Date(prediction.pool.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resolved' && (
              <div>
                {resolvedPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resolved campaigns</h3>
                    <p className="text-gray-600">Your resolved predictions will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {resolvedPredictions.map((prediction) => {
                      const mockReward = prediction.stakeAmount * 1.5;
                      const canClaim = prediction.stakeAmount > 0 && !prediction.claimed;
                      
                      return (
                        <div key={prediction.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
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
                            <span className="ml-4 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Resolved
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Your Prediction</p>
                              <p className={`font-medium ${
                                prediction.predictionValue === 'yes' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {prediction.predictionValue.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Stake Amount</p>
                              <p className="font-medium text-gray-900">
                                {prediction.stakeAmount > 0 ? `$${prediction.stakeAmount.toFixed(2)}` : 'Vote Only'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Reward Amount</p>
                              <p className="font-medium text-gray-900">
                                ${mockReward.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Status</p>
                              <p className={`font-medium ${
                                prediction.claimed ? 'text-green-600' : canClaim ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                {prediction.claimed ? 'Claimed' : canClaim ? 'Available' : 'No Reward'}
                              </p>
                            </div>
                            <div>
                              {canClaim && (
                                <button
                                  onClick={() => handleClaim(prediction.pool.id)}
                                  disabled={claimMutation.isPending}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    claimMutation.isPending
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {claimMutation.isPending ? (
                                    <div className="flex items-center">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                      Claiming...
                                    </div>
                                  ) : (
                                    `Claim $${mockReward.toFixed(2)}`
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Ended: {new Date(prediction.pool.deadline).toLocaleDateString()} • 
                            Predicted: {new Date(prediction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}