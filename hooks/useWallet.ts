"use client";

import { useState, useEffect, useCallback } from "react";
import { connect, disconnect, isConnected, request } from "@stacks/connect";
import {
  STXTransactionService,
  StakeTransactionParams,
} from "@/lib/stx-transactions";

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const checkConnection = useCallback(async () => {
    const connectionStatus = isConnected();
    if (connectionStatus !== connected) {
      setConnected(connectionStatus);
    }

    if (connectionStatus) {
      const result = await request("stx_getAddresses");
      const stacksAddress = result.addresses.find(
        // @ts-ignore
        (address) => address.purpose === "stacks"
      )?.address;

      if (!stacksAddress) {
        throw new Error("No Stacks address found");
      }
      setWalletAddress(stacksAddress);

      // Fetch balance when connected
      await fetchBalance(stacksAddress);
    } else {
      setWalletAddress(null);
      setBalance(null);
    }
  }, [connected]);

  const fetchBalance = useCallback(
    async (address?: string) => {
      const targetAddress = address || walletAddress;
      if (!targetAddress) return;

      setBalanceLoading(true);
      try {
        const balance = await STXTransactionService.getSTXBalance(
          targetAddress
        );
        setBalance(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setBalanceLoading(false);
      }
    },
    [walletAddress]
  );

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = async () => {
    try {
      await connect();
      await checkConnection();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setConnected(false);
    setWalletAddress(null);
    setBalance(null);
  };

  // Helper function to get wallet address when needed
  const getWalletAddress = async () => {
    if (!connected) return null;
    return walletAddress;
  };

  // Create and submit a stake transaction with confirmation wait
  const createStakeTransaction = useCallback(
    async (
      params: Omit<StakeTransactionParams, "senderAddress">
    ): Promise<string> => {
      if (!connected || !walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Validate sufficient balance
      if (balance !== null && balance < params.amount) {
        throw new Error("Insufficient STX balance");
      }

      const fullParams: StakeTransactionParams = {
        ...params,
        senderAddress: walletAddress,
      };

      // Validate parameters
      STXTransactionService.validateStakeParams(fullParams);

      // Create transaction
      const txId = await STXTransactionService.createStakeTransaction(
        fullParams
      );

      console.log(`Transaction created with ID: ${txId}`);

      // Wait for transaction confirmation before returning
      try {
        await STXTransactionService.waitForTransactionConfirmation(txId);
        console.log(`Transaction ${txId} confirmed, ready for API call`);
        
        // Refresh balance after confirmed transaction
        setTimeout(() => fetchBalance(), 2000);
        
        return txId;
      } catch (error) {
        console.error(`Transaction confirmation failed: ${error}`);
        throw new Error(`Transaction failed to confirm: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [connected, walletAddress, balance, fetchBalance]
  );

  // Create transaction without waiting for confirmation (for use cases that don't need to wait)
  const createStakeTransactionFast = useCallback(
    async (
      params: Omit<StakeTransactionParams, "senderAddress">
    ): Promise<string> => {
      if (!connected || !walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Validate sufficient balance
      if (balance !== null && balance < params.amount) {
        throw new Error("Insufficient STX balance");
      }

      const fullParams: StakeTransactionParams = {
        ...params,
        senderAddress: walletAddress,
      };

      // Validate parameters
      STXTransactionService.validateStakeParams(fullParams);

      // Create transaction without waiting
      const txId = await STXTransactionService.createStakeTransaction(
        fullParams
      );

      // Refresh balance after transaction (optimistic update)
      setTimeout(() => fetchBalance(), 1000);

      return txId;
    },
    [connected, walletAddress, balance, fetchBalance]
  );

  // Wait for transaction confirmation

  return {
    isConnected: connected,
    walletAddress,
    balance,
    balanceLoading,
    connectWallet,
    disconnectWallet,
    getWalletAddress,
    fetchBalance,
    createStakeTransaction,
    createStakeTransactionFast,
  };
}
