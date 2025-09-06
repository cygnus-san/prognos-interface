"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Pool } from "@/types";

interface VotingCardProps {
  pool: Pool;
  onVote: (poolId: string, voteType: "yes" | "no") => Promise<void>;
  isVoting?: boolean;
}

export default function VotingCard({
  pool,
  onVote,
  isVoting = false,
}: VotingCardProps) {
  const [localVoting, setLocalVoting] = useState<"yes" | "no" | null>(null);
  const { isConnected } = useWallet();

  const handleVote = async (voteType: "yes" | "no") => {
    if (!isConnected) return;

    setLocalVoting(voteType);
    try {
      await onVote(pool.id, voteType);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setLocalVoting(null);
    }
  };

  return (
    <div className="glass-card p-4 slide-up h-full flex flex-col ">
      {/* Tag */}
      <div className="mb-4">
        <span className="inline-block px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-full border border-blue-500/30">
          {pool.tag || "General"}
        </span>
      </div>

      {/* Image */}
      <div className="mb-6 relative overflow-hidden rounded-xl">
        <img
          src={pool.image || "/api/placeholder/400/200"}
          alt={pool.title}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Name and Description */}
      <div className="mb-8 grow">
        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
          {pool.title}
        </h3>
        <p className="text-slate-300 leading-relaxed line-clamp-3">
          {pool.description}
        </p>
      </div>

      {/* Yes/No Buttons */}
      <div className="flex space-x-4 ">
        <button
          onClick={() => handleVote("yes")}
          disabled={!isConnected || localVoting !== null || isVoting}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
            !isConnected
              ? "bg-gray-600/30 text-gray-400 cursor-not-allowed border border-gray-600/20"
              : localVoting === "yes" || isVoting
              ? "bg-green-500/40 text-green-200 cursor-wait border border-green-400/30 shadow-lg shadow-green-500/20"
              : "border-2 border-green-500 text-green-400 bg-transparent hover:bg-green-500/10 hover:border-green-400 hover:text-green-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105"
          }`}
        >
          {localVoting === "yes" || isVoting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Voting...
            </div>
          ) : (
            "Yes"
          )}
        </button>

        <button
          onClick={() => handleVote("no")}
          disabled={!isConnected || localVoting !== null || isVoting}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
            !isConnected
              ? "bg-gray-600/30 text-gray-400 cursor-not-allowed border border-gray-600/20"
              : localVoting === "no" || isVoting
              ? "bg-red-500/40 text-red-200 cursor-wait border border-red-400/30 shadow-lg shadow-red-500/20"
              : "border-2 border-red-500 text-red-400 bg-transparent hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105"
          }`}
        >
          {localVoting === "no" || isVoting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Voting...
            </div>
          ) : (
            "No"
          )}
        </button>
      </div>

      {!isConnected && (
        <div className="mt-6 p-4 glass-surface rounded-xl border border-amber-400/20">
          <p className="text-sm text-amber-200 text-center font-medium">
            Connect your wallet to vote on this prediction
          </p>
        </div>
      )}
    </div>
  );
}
