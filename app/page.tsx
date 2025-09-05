"use client";

import { useState, useEffect } from "react";
import VotingCard from "@/components/VotingCard";
import { useWallet } from "@/hooks/useWallet";
import { PoolsAPI } from "@/lib/api";
import { Pool, APIError } from "@/types";

export default function Home() {
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
        setPools(data);
      } catch (err) {
        const apiError = err as APIError;
        setError(apiError.message || "Failed to fetch pools");
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const handleVote = async (poolId: string, voteType: "yes" | "no") => {
    try {
      console.log(`Voting ${voteType} on pool ${poolId}`);
      const updatedPools = await PoolsAPI.getAllPools();
      setPools(updatedPools);
    } catch (error) {
      console.error("Vote failed:", error);
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
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Simple Cards Grid */}
      {!loading && !error && (
        <div className="space-y-6">
          {pools.map((pool) => (
            <VotingCard key={pool.id} pool={pool} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
}
