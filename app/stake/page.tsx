'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PoolsAPI } from '@/lib/api';
import { Pool, APIError } from '@/types';

interface StakingCardProps {
  pool: Pool;
  onStake: (poolId: string, prediction: number, amount: number, outcome: 'yes' | 'no') => Promise<void>;
}

function StakingCard({ pool, onStake }: StakingCardProps) {
  const [prediction, setPrediction] = useState<number>(50);
  const [amount, setAmount] = useState<number>(10);
  const [outcome, setOutcome] = useState<'yes' | 'no'>('yes');
  const [staking, setStaking] = useState(false);
  const { isConnected } = useWallet();

  const handleStake = async () => {
    if (!isConnected || staking) return;
    
    setStaking(true);
    try {
      await onStake(pool.id, prediction, amount, outcome);
    } catch (error) {
      console.error('Stake failed:', error);
    } finally {
      setStaking(false);
    }
  };

  // Calculate yes/no percentages from predictions
  const yesCount = pool.predictions?.filter(p => p.predictionValue === 'yes').length || 0;
  const noCount = pool.predictions?.filter(p => p.predictionValue === 'no').length || 0;
  const totalVotes = yesCount + noCount;
  
  const yesPercentage = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 50;
  const noPercentage = totalVotes > 0 ? (noCount / totalVotes) * 100 : 50;

  // Calculate potential returns based on current odds
  const currentOdds = outcome === 'yes' ? yesPercentage : noPercentage;
  const potentialReturn = currentOdds > 0 ? (amount * 100) / currentOdds : amount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Pool Question */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {pool.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {pool.description}
        </p>
        
        {/* Current Market Odds */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Market Odds</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{yesPercentage.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">YES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{noPercentage.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">NO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Form */}
      <div className="space-y-4">
        {/* Outcome Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Prediction
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setOutcome('yes')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                outcome === 'yes'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setOutcome('no')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                outcome === 'no'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* Confidence Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level: {prediction}%
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="99"
              value={prediction}
              onChange={(e) => setPrediction(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span>50%</span>
              <span>99%</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Higher confidence = higher potential returns but more risk
          </p>
        </div>

        {/* Stake Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake Amount (STX)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">STX</span>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            {[5, 10, 25, 50].map(preset => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              >
                {preset} STX
              </button>
            ))}
          </div>
        </div>

        {/* Potential Returns */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">Potential Return</span>
            <span className="text-lg font-bold text-blue-900">
              {potentialReturn.toFixed(2)} STX
            </span>
          </div>
          <div className="flex justify-between text-xs text-blue-700">
            <span>Stake: {amount} STX</span>
            <span className={potentialReturn > amount ? 'text-green-600' : 'text-red-600'}>
              {potentialReturn > amount ? '+' : ''}{(potentialReturn - amount).toFixed(2)} STX
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            Based on current market odds of {currentOdds.toFixed(1)}% for {outcome.toUpperCase()}
          </div>
        </div>

        {/* Stake Button */}
        <button
          onClick={handleStake}
          disabled={!isConnected || staking || amount <= 0}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !isConnected || amount <= 0
              ? 'bg-gray-300 cursor-not-allowed'
              : staking
              ? 'bg-blue-400 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {staking ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Staking...
            </div>
          ) : (
            `Stake ${amount} STX on ${outcome.toUpperCase()}`
          )}
        </button>
      </div>

      {/* Pool Details */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <div className="font-medium text-gray-900">${pool.totalStake.toFixed(2)}</div>
            <div className="text-xs">Total Volume</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{pool._count.predictions}</div>
            <div className="text-xs">Total Stakes</div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-3">
          <span>Ends: {new Date(pool.deadline).toLocaleDateString()}</span>
          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 text-center">
            Connect your wallet to stake on this prediction
          </p>
        </div>
      )}
    </div>
  );
}

export default function StakePage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useWallet();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PoolsAPI.getAllPools();
        // Show all pools for staking
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

  const handleStake = async (poolId: string, prediction: number, amount: number, outcome: 'yes' | 'no') => {
    try {
      // This would integrate with your staking API
      console.log(`Staking ${amount} STX on ${outcome} with ${prediction}% confidence for pool ${poolId}`);
      
      // For now, just show success message
      // In real implementation, you'd call something like:
      // await PoolsAPI.stake(poolId, outcome, amount, prediction);
      
      // Refresh pools after stake
      const updatedPools = await PoolsAPI.getAllPools();
      setPools(updatedPools);
    } catch (error) {
      console.error('Stake failed:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Staking Markets
        </h1>
        <p className="text-lg text-gray-600">
          Make detailed predictions with custom confidence levels and stake amounts
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Connect your wallet to start staking on predictions
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
          <p className="font-medium">Error loading staking markets</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Staking Markets */}
      {!loading && !error && (
        <>
          {pools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staking markets available</h3>
              <p className="text-gray-600">Check back later for new staking opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pools.map((pool) => (
                <StakingCard 
                  key={pool.id} 
                  pool={pool} 
                  onStake={handleStake}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}