"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Pool } from "@/types";

interface VotingCardProps {
  pool: Pool;
  onVote: (poolId: string, voteType: "yes" | "no") => Promise<void>;
  isVoting?: boolean;
}

export default function VotingCard({ pool, onVote, isVoting = false }: VotingCardProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Tag */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {pool.tag || "General"}
        </span>
      </div>

      {/* Image */}
      <div className="mb-4">
        <img
          src={pool.image || "/api/placeholder/400/200"}
          alt={pool.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      {/* Name and Description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {pool.title}
        </h3>
        <p className="text-gray-600">{pool.description}</p>
      </div>

      {/* Yes/No Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => handleVote("yes")}
          disabled={!isConnected || localVoting !== null || isVoting}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !isConnected
              ? "bg-gray-300 cursor-not-allowed"
              : localVoting === "yes" || isVoting
              ? "bg-green-400 cursor-wait"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {(localVoting === "yes" || isVoting) ? "Voting..." : "Yes"}
        </button>

        <button
          onClick={() => handleVote("no")}
          disabled={!isConnected || localVoting !== null || isVoting}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !isConnected
              ? "bg-gray-300 cursor-not-allowed"
              : localVoting === "no" || isVoting
              ? "bg-red-400 cursor-wait"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {(localVoting === "no" || isVoting) ? "Voting..." : "No"}
        </button>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 text-center">
            Connect your wallet to vote
          </p>
        </div>
      )}
    </div>
  );
}
