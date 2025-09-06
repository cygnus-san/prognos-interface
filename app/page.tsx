"use client";

import VotingCard from "@/components/VotingCard";
import { useWallet } from "@/hooks/useWallet";
import { useFeedPoolsQuery, useVoteMutation } from "@/hooks/usePoolsQuery";
import toast from "react-hot-toast";

export default function Home() {
  const { isConnected, walletAddress } = useWallet();
  const { data: pools, isLoading: loading, error } = useFeedPoolsQuery(walletAddress);
  const voteMutation = useVoteMutation();

  const handleVote = async (poolId: string, voteType: "yes" | "no") => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await voteMutation.mutateAsync({
        poolId,
        walletAddress,
        vote: voteType,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Premium Header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4 leading-tight">
            Prediction Markets
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover, analyze, and vote on the most exciting prediction markets
          </p>
        </div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <div className="glass-surface border border-blue-400/30 px-6 py-5 rounded-xl mb-8 text-center slide-up">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="font-semibold text-blue-200 mb-2">Connect your wallet to view personalized feeds</p>
            <p className="text-sm text-slate-400">Your feed will show pools you haven't voted on yet</p>
          </div>
        )}

        {/* Loading State */}
        {loading && isConnected && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="loading-shimmer w-16 h-16 rounded-full mb-4"></div>
            <p className="text-slate-400 font-medium">Loading your personalized feed...</p>
          </div>
        )}

        {/* Error State */}
        {error && isConnected && (
          <div className="glass-surface border border-red-400/30 px-6 py-5 rounded-xl mb-8 slide-up">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="font-semibold text-red-200">Error loading feed</p>
            </div>
            <p className="text-sm text-red-300 ml-11">{error.message || "Failed to fetch feed pools"}</p>
          </div>
        )}

        {/* No Pools State */}
        {!loading && !error && isConnected && pools && pools.length === 0 && (
          <div className="glass-surface border border-green-400/30 px-8 py-10 rounded-xl text-center slide-up">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-green-200 text-xl mb-2">🎉 You're all caught up!</p>
            <p className="text-green-300">You've voted on all available pools. Check back later for new ones.</p>
          </div>
        )}

        {/* Premium Cards Grid */}
        {!loading && !error && isConnected && pools && pools.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pools.map((pool, index) => (
              <div 
                key={pool.id} 
                className="slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VotingCard 
                  pool={pool} 
                  onVote={handleVote}
                  isVoting={voteMutation.isPending}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
