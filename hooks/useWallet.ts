"use client";

import { useState, useEffect, useCallback } from "react";
import { connect, disconnect, isConnected, request } from "@stacks/connect";

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    const connectionStatus = isConnected();
    if (connectionStatus !== connected) {
      setConnected(connectionStatus);
    }

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
    }
  }, []);

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
  };

  // Helper function to get wallet address when needed
  const getWalletAddress = async () => {
    if (!connected) return null;
    return walletAddress;
  };

  return {
    isConnected: connected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    getWalletAddress,
  };
}
