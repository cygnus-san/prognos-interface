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
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 slide-up">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">
              Profile
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-md mx-auto">
              Connect your wallet to view your predictions and rewards.
            </p>
            <button
              onClick={connectWallet}
              className="btn-primary text-lg px-8 py-4"
            >
              Connect Wallet
            </button>
          </div>
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 fade-in">
          <h1 className="text-5xl font-bold text-white mb-4">
            Profile
          </h1>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3"></div>
            <p className="text-slate-400 text-lg font-mono">
              {walletAddress?.substring(0, 12)}...{walletAddress?.substring(walletAddress.length - 8)}
            </p>
          </div>
        </div>

        {/* Premium Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center slide-up p-6" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-300 mb-2">{activePredictions.length}</p>
            <p className="text-slate-400 text-sm font-medium">Active Campaigns</p>
          </div>
          
          <div className="text-center slide-up p-6" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-300 mb-2">{resolvedPredictions.length}</p>
            <p className="text-slate-400 text-sm font-medium">Resolved Campaigns</p>
          </div>
          
          <div className="text-center slide-up p-6" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-yellow-300 mb-2">${unclaimedRewards.toFixed(2)}</p>
            <p className="text-slate-400 text-sm font-medium">Available to Claim</p>
          </div>
          
          <div className="text-center slide-up p-6" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-300 mb-2">${claimedRewards.toFixed(2)}</p>
            <p className="text-slate-400 text-sm font-medium">Total Claimed</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="loading-shimmer w-20 h-20 rounded-xl mb-6"></div>
            <p className="text-slate-400 text-lg font-medium">Loading your predictions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-6 py-5 rounded-xl mb-8 slide-up">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-200">Error loading predictions</p>
                <p className="text-red-300 text-sm mt-1">{error.message || 'Failed to fetch your predictions'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Tab Navigation */}
        {!loading && !error && (
          <div className="slide-up p-6">
            <div className="tab-nav">
              <button
                onClick={() => setActiveTab('active')}
                className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Active ({activePredictions.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`tab-button ${activeTab === 'resolved' ? 'active' : ''}`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resolved ({resolvedPredictions.length})
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'active' && (
                <div>
                  {activePredictions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No active campaigns</h3>
                      <p className="text-slate-400 mb-8">Your active predictions will appear here.</p>
                      <Link href="/" className="btn-primary">
                        Browse Markets
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activePredictions.map((prediction, index) => (
                        <div 
                          key={prediction.id} 
                          className="rounded-xl p-6 slide-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <Link 
                                href={`/pool/${prediction.pool.id}`}
                                className="text-xl font-bold text-blue-300 hover:text-blue-200 transition-colors block mb-2"
                              >
                                {prediction.pool.title}
                              </Link>
                              <p className="text-slate-400 line-clamp-2 leading-relaxed">
                                {prediction.pool.description}
                              </p>
                            </div>
                            <span className="badge-active ml-6">
                              Active
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 rounded-lg">
                              <p className="text-slate-500 text-sm mb-2">Your Prediction</p>
                              <p className={`font-bold text-lg ${
                                prediction.predictionValue === 'yes' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {prediction.predictionValue.toUpperCase()}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg">
                              <p className="text-slate-500 text-sm mb-2">Stake Amount</p>
                              <p className="font-bold text-lg text-blue-300">
                                {prediction.stakeAmount > 0 ? `${prediction.stakeAmount.toFixed(2)} STX` : 'Vote Only'}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg">
                              <p className="text-slate-500 text-sm mb-2">Pool Size</p>
                              <p className="font-bold text-lg text-blue-300">
                                ${prediction.pool.totalStake.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg">
                              <p className="text-slate-500 text-sm mb-2">Ends</p>
                              <p className="font-bold text-lg text-amber-300">
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
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No resolved campaigns</h3>
                      <p className="text-slate-400">Your resolved predictions will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resolvedPredictions.map((prediction, index) => {
                        const mockReward = prediction.stakeAmount * 1.5;
                        const canClaim = prediction.stakeAmount > 0 && !prediction.claimed;
                        
                        return (
                          <div 
                            key={prediction.id} 
                            className="rounded-xl p-6 slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1">
                                <Link 
                                  href={`/pool/${prediction.pool.id}`}
                                  className="text-xl font-bold text-blue-300 hover:text-blue-200 transition-colors block mb-2"
                                >
                                  {prediction.pool.title}
                                </Link>
                                <p className="text-slate-400 line-clamp-2 leading-relaxed">
                                  {prediction.pool.description}
                                </p>
                              </div>
                              <span className="badge-resolved ml-6">
                                Resolved
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                              <div className="p-4 rounded-lg">
                                <p className="text-slate-500 text-sm mb-2">Your Prediction</p>
                                <p className={`font-bold text-lg ${
                                  prediction.predictionValue === 'yes' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {prediction.predictionValue.toUpperCase()}
                                </p>
                              </div>
                              <div className="p-4 rounded-lg">
                                <p className="text-slate-500 text-sm mb-2">Stake Amount</p>
                                <p className="font-bold text-lg text-blue-300">
                                  {prediction.stakeAmount > 0 ? `${prediction.stakeAmount.toFixed(2)} STX` : 'Vote Only'}
                                </p>
                              </div>
                              <div className="p-4 rounded-lg">
                                <p className="text-slate-500 text-sm mb-2">Reward Amount</p>
                                <p className="font-bold text-lg text-yellow-300">
                                  ${mockReward.toFixed(2)}
                                </p>
                              </div>
                              <div className="p-4 rounded-lg">
                                <p className="text-slate-500 text-sm mb-2">Status</p>
                                <p className={`font-bold text-lg ${
                                  prediction.claimed ? 'text-green-400' : canClaim ? 'text-yellow-400' : 'text-slate-400'
                                }`}>
                                  {prediction.claimed ? 'Claimed' : canClaim ? 'Available' : 'No Reward'}
                                </p>
                              </div>
                              <div className="flex items-end">
                                {canClaim && (
                                  <button
                                    onClick={() => handleClaim(prediction.pool.id)}
                                    disabled={claimMutation.isPending}
                                    className={`btn-primary w-full text-sm ${
                                      claimMutation.isPending ? 'opacity-75 cursor-wait' : ''
                                    }`}
                                  >
                                    {claimMutation.isPending ? (
                                      <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                        Claiming...
                                      </div>
                                    ) : (
                                      `Claim $${mockReward.toFixed(2)}`
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm text-slate-500 pt-4 border-t border-slate-700/30">
                              <span>Ended: {new Date(prediction.pool.deadline).toLocaleDateString()}</span>
                              <span>Predicted: {new Date(prediction.createdAt).toLocaleDateString()}</span>
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
    </div>
  );
}