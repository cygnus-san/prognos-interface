"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import VoteForm from "@/components/VoteForm";
import StakeForm from "@/components/StakeForm";
import ClaimButton from "@/components/ClaimButton";
import { useWallet } from "@/hooks/useWallet";
import { usePoolQuery } from "@/hooks/usePoolsQuery";
import { Prediction } from "@/types";

export default function PoolDetail() {
  const params = useParams();
  const poolId = params.id as string;
  const { walletAddress, isConnected, connectWallet } = useWallet();

  const {
    data: pool,
    isLoading: loading,
    error,
    refetch,
  } = usePoolQuery(poolId);
  const [activeTab, setActiveTab] = useState<"vote" | "stake">("vote");

  // Find user's prediction if wallet is connected
  const userPrediction: Prediction | null =
    walletAddress && pool
      ? pool.predictions.find(
          (pred) => pred.userWalletAddress === walletAddress
        ) || null
      : null;

  const handleFormSubmission = () => {
    // Refresh pool data after vote or stake submission
    refetch();
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
          <p className="text-sm">
            {error.message || "Failed to fetch pool details"}
          </p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => refetch()}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pool not found
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(pool.deadline) < new Date();
  const yesVotes = pool.predictions.filter(
    (p) => p.predictionValue === "yes"
  ).length;
  const noVotes = pool.predictions.filter(
    (p) => p.predictionValue === "no"
  ).length;
  const totalVotes = yesVotes + noVotes;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 mb-6 inline-block transition-colors"
        >
          ← Back to all pools
        </Link>

        {/* Pool Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 text-sm font-semibold rounded-full border border-blue-500/30">
              {pool.tag}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isExpired
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-green-500/20 text-green-300 border border-green-500/30"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{pool.title}</h1>

          <p className="text-slate-300 text-lg mb-6 leading-relaxed">
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
              <p className="text-sm text-slate-400 mb-1">Deadline</p>
              <p className="text-lg font-semibold text-white">
                {new Date(pool.deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Stake</p>
              <p className="text-lg font-semibold text-green-400">
                {pool.totalStake.toFixed(2)} STX
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Predictions</p>
              <p className="text-lg font-semibold text-blue-400">
                {pool._count.predictions}
              </p>
            </div>
          </div>
        </div>

        {/* Voting Results */}
        {totalVotes > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Current Results
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">Yes</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-300 w-16 text-right">
                    {yesVotes} (
                    {totalVotes > 0
                      ? Math.round((yesVotes / totalVotes) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-medium">No</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-300 w-16 text-right">
                    {noVotes} (
                    {totalVotes > 0
                      ? Math.round((noVotes / totalVotes) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Prediction Status */}
        {userPrediction && (
          <div className="glass-surface border border-blue-400/30 p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              Your Prediction
            </h3>
            <p className="text-blue-200">
              You predicted:{" "}
              <strong className="text-white">
                {userPrediction.predictionValue}
              </strong>
            </p>
            {userPrediction.stakeAmount > 0 && (
              <p className="text-blue-200">
                Stake amount:{" "}
                <strong className="text-white">
                  {userPrediction.stakeAmount.toFixed(2)} STX
                </strong>
              </p>
            )}
          </div>
        )}

        {/* Action Section */}
        <div className="glass-card p-8">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">
                Connect your wallet to participate
              </p>
              <button
                onClick={connectWallet}
                className="btn-primary px-6 py-3"
              >
                Connect Wallet
              </button>
            </div>
          ) : isExpired ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Pool Expired
              </h3>
              {userPrediction &&
              userPrediction.stakeAmount > 0 &&
              !userPrediction.claimed &&
              walletAddress ? (
                <div className="max-w-sm mx-auto">
                  <ClaimButton
                    poolId={pool.id}
                    walletAddress={walletAddress}
                    prediction={userPrediction}
                    onRewardClaimed={handleFormSubmission}
                  />
                </div>
              ) : (
                <p className="text-slate-400">
                  {userPrediction?.claimed
                    ? "You have already claimed your rewards"
                    : "No rewards to claim"}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="tab-nav mb-6">
                <button
                  onClick={() => setActiveTab("vote")}
                  className={`tab-button ${activeTab === "vote" ? "active" : ""}`}
                >
                  Vote (Free)
                </button>
                <button
                  onClick={() => setActiveTab("stake")}
                  className={`tab-button ${activeTab === "stake" ? "active" : ""}`}
                >
                  Stake
                </button>
              </div>

              {activeTab === "vote"
                ? walletAddress && (
                    <VoteForm
                      poolId={pool.id}
                      walletAddress={walletAddress}
                      onVoteSubmitted={handleFormSubmission}
                    />
                  )
                : walletAddress && (
                    <StakeForm
                      poolId={pool.id}
                      walletAddress={walletAddress}
                      onStakeSubmitted={handleFormSubmission}
                    />
                  )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
