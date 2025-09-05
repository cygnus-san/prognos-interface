'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VoteForm from '@/components/VoteForm';
import StakeForm from '@/components/StakeForm';
import ClaimButton from '@/components/ClaimButton';
import { useWallet } from '@/hooks/useWallet';
import { PoolsAPI } from '@/lib/api';
import { Pool, Prediction, APIError } from '@/types';

export default function PoolDetail() {
  const params = useParams();
  const poolId = params.id as string;
  const { walletAddress, isConnected, connectWallet } = useWallet();
  
  const [pool, setPool] = useState<Pool | null>(null);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vote' | 'stake'>('vote');

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      const poolData = await PoolsAPI.getPool(poolId);
      setPool(poolData);

      // Find user's prediction if wallet is connected
      if (walletAddress) {
        const userPred = poolData.predictions.find(
          pred => pred.userWalletAddress === walletAddress
        );
        setUserPrediction(userPred || null);
      }
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || 'Failed to fetch pool details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (poolId) {
      fetchPoolData();
    }
  }, [poolId, walletAddress]);

  const handleFormSubmission = () => {
    // Refresh pool data after vote or stake submission
    fetchPoolData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading pool</p>
          <p className="text-sm">{error}</p>
          <div className="mt-4 space-x-4">
            <button 
              onClick={() => fetchPoolData()} 
              className="text-sm underline hover:no-underline"
            >
              Try again
            </button>
            <Link href="/" className="text-sm underline hover:no-underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(pool.deadline) < new Date();
  const yesVotes = pool.predictions.filter(p => p.predictionValue === 'yes').length;
  const noVotes = pool.predictions.filter(p => p.predictionValue === 'no').length;
  const totalVotes = yesVotes + noVotes;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to all pools
      </Link>

      {/* Pool Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
            {pool.tag}
          </span>
          <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
            {isExpired ? 'Expired' : 'Active'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {pool.title}
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          {pool.description}
        </p>

        {pool.image && (
          <img 
            src={pool.image} 
            alt={pool.title} 
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Deadline</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(pool.deadline).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Stake</p>
            <p className="text-lg font-semibold text-green-600">
              ${pool.totalStake.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Predictions</p>
            <p className="text-lg font-semibold text-blue-600">
              {pool._count.predictions}
            </p>
          </div>
        </div>
      </div>

      {/* Voting Results */}
      {totalVotes > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Results</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium">Yes</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {yesVotes} ({totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600 font-medium">No</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{width: `${totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {noVotes} ({totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Prediction Status */}
      {userPrediction && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Prediction</h3>
          <p className="text-blue-800">
            You predicted: <strong>{userPrediction.predictionValue}</strong>
          </p>
          {userPrediction.stakeAmount > 0 && (
            <p className="text-blue-800">
              Stake amount: <strong>${userPrediction.stakeAmount.toFixed(2)}</strong>
            </p>
          )}
        </div>
      )}

      {/* Action Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to participate</p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : isExpired ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pool Expired</h3>
            {userPrediction && userPrediction.stakeAmount > 0 && !userPrediction.claimed && walletAddress ? (
              <div className="max-w-sm mx-auto">
                <ClaimButton 
                  poolId={pool.id} 
                  walletAddress={walletAddress} 
                  prediction={userPrediction}
                  onRewardClaimed={handleFormSubmission}
                />
              </div>
            ) : (
              <p className="text-gray-600">
                {userPrediction?.claimed 
                  ? "You have already claimed your rewards" 
                  : "No rewards to claim"}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('vote')}
                className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'vote'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vote (Free)
              </button>
              <button
                onClick={() => setActiveTab('stake')}
                className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'stake'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Stake
              </button>
            </div>

            {activeTab === 'vote' ? (
              walletAddress && (
                <VoteForm 
                  poolId={pool.id} 
                  walletAddress={walletAddress} 
                  onVoteSubmitted={handleFormSubmission}
                />
              )
            ) : (
              walletAddress && (
                <StakeForm 
                  poolId={pool.id} 
                  walletAddress={walletAddress} 
                  onStakeSubmitted={handleFormSubmission}
                />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}