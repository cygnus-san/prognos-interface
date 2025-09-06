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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Simple Header */}
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Prediction Markets
      </h1>

      {/* Wallet Connection Prompt */}
      {!isConnected && (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6 text-center">
          <p className="font-medium">Connect your wallet to view personalized feeds</p>
          <p className="text-sm">Your feed will show pools you haven't voted on yet</p>
        </div>
      )}

      {/* Loading State */}
      {loading && isConnected && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && isConnected && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading feed</p>
          <p className="text-sm">{error.message || "Failed to fetch feed pools"}</p>
        </div>
      )}

      {/* No Pools State */}
      {!loading && !error && isConnected && pools && pools.length === 0 && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
          <p className="font-medium">🎉 You're all caught up!</p>
          <p className="text-sm">You've voted on all available pools. Check back later for new ones.</p>
        </div>
      )}

      {/* Simple Cards Grid */}
      {!loading && !error && isConnected && pools && pools.length > 0 && (
        <div className="space-y-6">
          {pools.map((pool) => (
            <VotingCard 
              key={pool.id} 
              pool={pool} 
              onVote={handleVote}
              isVoting={voteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
