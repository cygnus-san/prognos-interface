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
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Pool Image */}
      <div className="h-48 relative">
        {pool.image && (
          <Image src={pool.image} alt={pool.title} fill objectFit="cover" />
        )}
      </div>

      {/* Pool Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {pool.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>${pool.totalStake.toFixed(0)} volume</span>
          <span>{pool._count.predictions} predictions</span>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Stake on Prediction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
        <div className="p-6 space-y-6">
          {/* Pool Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {pool.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{pool.description}</p>

            {/* Pool Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">
                  ${pool.totalStake.toFixed(2)}
                </div>
                <div className="text-gray-500">Pool Size</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {new Date(pool.deadline).toLocaleDateString()}
                </div>
                <div className="text-gray-500">Pool Ends</div>
              </div>
            </div>
          </div>

          {/* Prediction Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prediction: {prediction}% YES ({yesPercentage.toFixed(0)}% of
              people say yes)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={prediction}
                onChange={(e) => setPrediction(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                    100 - prediction
                  }%, #10b981 ${100 - prediction}%, #10b981 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0% (NO)</span>
                <span>50%</span>
                <span>100% (YES)</span>
              </div>
            </div>
          </div>

          {/* Stake Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prediction Size (STX tokens)
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
            <div className="flex justify-between mt-2">
              {[5, 10, 25, 50].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
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
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              !isConnected || amount <= 0
                ? "bg-gray-300 cursor-not-allowed"
                : staking
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {staking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              `Submit ${amount} STX Stake`
            )}
          </button>

          {!isConnected && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 text-center">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Staking Markets
        </h1>
        <p className="text-lg text-gray-600">
          Select a prediction market to place your stake
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
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
          <p className="text-sm">
            {error?.message || "Failed to load staking markets"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Pool Cards Grid */}
      {!loading && !error && pools && (
        <>
          {pools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No staking markets available
              </h3>
              <p className="text-gray-600">
                Check back later for new staking opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onClick={() => setSelectedPool(pool)}
                />
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
  );
}
