"use client";

import { useState, useEffect } from "react";
import { connect, disconnect, isConnected } from "@stacks/connect";
import { AppState } from "@/types";

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const appDetails = {
    name: "Prognos MVP",
    icon: "/favicon.ico",
  };

  useEffect(() => {
    // Check initial connection status
    setConnected(isConnected());
  }, []);

  // Check for connection changes
  useEffect(() => {
    const checkConnection = () => {
      const connectionStatus = isConnected();
      if (connectionStatus !== connected) {
        setConnected(connectionStatus);
      }
    };

    const intervalId = setInterval(checkConnection, 500);
    return () => clearInterval(intervalId);
  }, [connected]);

  const connectWallet = async () => {
    try {
      connect();
      // await connect({
      //   appDetails: {
      //     name: "Prognos MVP",
      //     icon: "/favicon.ico",
      //   },
      //   onFinish: () => {
      //     setConnected(true);
      //     // Small delay to ensure connection is fully established
      //     setTimeout(() => {
      //       // Additional setup can go here if needed
      //     }, 100);
      //   },
      // });
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
    return walletAddress || "connected";
  };

  return {
    isConnected: connected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    getWalletAddress,
  };
}
