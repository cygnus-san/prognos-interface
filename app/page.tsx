"use client";

import VotingCard from "@/components/VotingCard";
import { useWallet } from "@/hooks/useWallet";
import { usePoolsQuery, useVoteMutation } from "@/hooks/usePoolsQuery";
import toast from "react-hot-toast";

export default function Home() {
  const { isConnected, walletAddress } = useWallet();
  const { data: pools, isLoading: loading, error } = usePoolsQuery();
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading pools</p>
          <p className="text-sm">{error.message || "Failed to fetch pools"}</p>
        </div>
      )}

      {/* Simple Cards Grid */}
      {!loading && !error && pools && (
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
