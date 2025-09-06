"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { usePoolsQuery, useStakeMutation } from "@/hooks/usePoolsQuery";
import { Pool } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

interface PoolCardProps {
  pool: Pool;
  onClick: () => void;
}

function PoolCard({ pool, onClick }: PoolCardProps) {
  const yesCount =
    pool.predictions?.filter((p) => p.predictionValue === "yes").length || 0;
  const totalPredictions = pool._count.predictions;
  const yesPercentage =
    totalPredictions > 0 ? (yesCount / totalPredictions) * 100 : 50;

  return (
    <div
      onClick={onClick}
      className="glass-card cursor-pointer group overflow-hidden"
    >
      {/* Pool Image */}
      <div className="h-52 relative overflow-hidden">
        {pool.image && (
          <Image
            src={pool.image}
            alt={pool.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Volume Badge */}
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-white text-sm font-semibold">
              ${pool.totalStake.toFixed(0)} STX
            </span>
          </div>
        </div>

        {/* Predictions Count */}
        {/* <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30">
            <span className="text-blue-200 text-sm font-medium">
              {pool._count.predictions} votes
            </span>
          </div>
        </div> */}
      </div>

      {/* Pool Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-blue-300 transition-colors leading-tight">
          {pool.title}
        </h3>

        {/* Prediction Distribution */}
        {/* <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Market Sentiment</span>
            <span className="text-slate-300 font-medium">{yesPercentage.toFixed(0)}% YES</span>
          </div>
          
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${yesPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-green-400 font-medium">{yesPercentage.toFixed(0)}% YES</span>
            <span className="text-red-400 font-medium">{(100 - yesPercentage).toFixed(0)}% NO</span>
          </div>
        </div> */}

        {/* Stake Button Hint */}
        <div className="mt-5 pt-4 border-t border-slate-600/30">
          <div className="flex items-center justify-center text-slate-400 group-hover:text-blue-300 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm font-medium">Click to stake</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StakingModalProps {
  pool: Pool;
  isOpen: boolean;
  onClose: () => void;
  onStake: (
    poolId: string,
    prediction: string,
    amount: number
  ) => Promise<void>;
}

function StakingModal({ pool, isOpen, onClose, onStake }: StakingModalProps) {
  const [prediction, setPrediction] = useState<number>(50);
  const [amount, setAmount] = useState<number>(10);
  const [staking, setStaking] = useState(false);
  const { isConnected } = useWallet();

  if (!isOpen) return null;

  const handleStake = async () => {
    if (!isConnected || staking) return;

    setStaking(true);
    try {
      await onStake(pool.id, "yes", amount);
      onClose();
    } catch (error) {
      console.error("Stake failed:", error);
    } finally {
      setStaking(false);
    }
  };

  // Calculate yes/no percentages from predictions
  const yesCount =
    pool.predictions?.filter((p) => p.predictionValue === "yes").length || 0;
  const noCount =
    pool.predictions?.filter((p) => p.predictionValue === "no").length || 0;
  const totalVotes = yesCount + noCount;

  const yesPercentage = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 50;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
          <h2 className="text-2xl font-bold text-white">Stake on Prediction</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700/50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Pool Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 leading-tight">
              {pool.title}
            </h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              {pool.description}
            </p>

            {/* Pool Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-surface p-4 rounded-xl border border-slate-600/30">
                <div className="text-2xl font-bold text-blue-300 mb-1">
                  ${pool.totalStake.toFixed(2)}
                </div>
                <div className="text-slate-400 text-sm">Pool Size</div>
              </div>
              <div className="glass-surface p-4 rounded-xl border border-slate-600/30">
                <div className="text-2xl font-bold text-blue-300 mb-1">
                  {new Date(pool.deadline).toLocaleDateString()}
                </div>
                <div className="text-slate-400 text-sm">Pool Ends</div>
              </div>
            </div>
          </div>

          {/* Prediction Slider */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">
              Your Prediction: {prediction}% YES
            </label>
            <div className="glass-surface p-4 rounded-xl border border-slate-600/30 space-y-4">
              <div className="text-center text-slate-300 text-sm">
                Current market: {yesPercentage.toFixed(0)}% YES •{" "}
                {(100 - yesPercentage).toFixed(0)}% NO
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={prediction}
                onChange={(e) => setPrediction(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                    100 - prediction
                  }%, #10b981 ${100 - prediction}%, #10b981 100%)`,
                }}
              />
              <div className="flex justify-between text-sm">
                <span className="text-red-400 font-semibold">0% NO</span>
                <span className="text-slate-400">50%</span>
                <span className="text-green-400 font-semibold">100% YES</span>
              </div>
            </div>
          </div>

          {/* Stake Amount */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">
              Stake Amount
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-glass w-full text-lg font-medium pr-16"
                placeholder="Enter amount"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-slate-400 text-sm font-semibold">
                  STX
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-4 gap-2">
              {[5, 10, 25, 50].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  {preset} STX
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleStake}
            disabled={!isConnected || staking || amount <= 0}
            className={`btn-primary w-full py-4 text-lg font-bold ${
              !isConnected || amount <= 0
                ? "opacity-50 cursor-not-allowed"
                : staking
                ? "opacity-75 cursor-wait"
                : ""
            }`}
          >
            {staking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting Stake...
              </div>
            ) : (
              `Submit ${amount} STX Stake`
            )}
          </button>

          {!isConnected && (
            <div className="glass-surface border border-amber-400/30 p-4 rounded-xl">
              <p className="text-amber-200 text-center font-medium">
                Connect your wallet to stake on this prediction
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StakePage() {
  const { isConnected, walletAddress } = useWallet();
  const { data: pools, isLoading: loading, error } = usePoolsQuery();
  const stakeMutation = useStakeMutation();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const handleStake = async (
    poolId: string,
    prediction: string,
    amount: number
  ) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await stakeMutation.mutateAsync({
        poolId,
        walletAddress,
        prediction,
        amount,
      });
      toast.success(`Successfully staked ${amount} STX!`);
    } catch (error) {
      // Error handling is done in the mutation hook
      throw error;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Staking Markets
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Discover high-yield staking opportunities and put your STX to work
            in prediction markets
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-12 glass-surface border border-amber-400/30 p-6 rounded-xl slide-up">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-lg font-semibold text-amber-200 mb-1">
                  Connect your wallet to start staking
                </p>
                <p className="text-amber-300/80">
                  Unlock premium staking features and earn rewards on your
                  predictions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-shimmer w-20 h-20 rounded-xl mb-6"></div>
            <p className="text-slate-400 text-lg font-medium">
              Loading staking markets...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-surface border border-red-400/30 px-6 py-5 rounded-xl mb-12 slide-up">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-200 text-lg">
                  Error loading staking markets
                </p>
                <p className="text-red-300 mt-1">
                  {error?.message || "Failed to load staking markets"}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pool Cards Grid */}
        {!loading && !error && pools && (
          <>
            {pools.length === 0 ? (
              <div className="text-center py-20 slide-up">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No staking markets available
                </h3>
                <p className="text-slate-400 text-lg">
                  Check back later for new staking opportunities.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pools.map((pool, index) => (
                  <div
                    key={pool.id}
                    className="slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PoolCard
                      pool={pool}
                      onClick={() => setSelectedPool(pool)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Staking Modal */}
        {selectedPool && (
          <StakingModal
            pool={selectedPool}
            isOpen={!!selectedPool}
            onClose={() => setSelectedPool(null)}
            onStake={handleStake}
          />
        )}
      </div>
    </div>
  );
}
