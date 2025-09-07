"use client";

import { request } from "@stacks/connect";

// Configuration
const IS_MAINNET = false;
const PLATFORM_ADDRESS = "ST3EKY2FG5KW60TZC2R9D0DF6DJJ98RPW5CN3B9P4"; // Platform address that receives stakes

// Convert STX to microSTX (1 STX = 1,000,000 microSTX)
const STX_TO_MICRO_STX = 1_000_000;

export interface StakeTransactionParams {
  amount: number; // Amount in STX
  memo?: string; // Optional memo for the transaction
  senderAddress: string; // Sender's address
  poolId: string; // Pool ID for reference
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}

export interface TransactionStatus {
  txId: string;
  status: "pending" | "confirmed" | "failed";
  confirmations?: number;
  error?: string;
}

export class STXTransactionService {
  /**
   * Create and broadcast an STX stake transaction using Stacks Connect
   * This opens the user's wallet for transaction signing
   */
  static async createStakeTransaction(
    params: StakeTransactionParams
  ): Promise<string> {
    try {
      const { amount } = params;

      console.log("Creating stake transaction with params:", params);

      if (amount <= 0) {
        throw new Error("Stake amount must be positive");
      }

      if (amount > 1000) {
        throw new Error("Maximum stake amount is 1000 STX");
      }

      const amountInMicroSTX = Math.floor(amount * STX_TO_MICRO_STX);

      const response = await request("stx_transferStx", {
        amount: amountInMicroSTX,
        recipient: PLATFORM_ADDRESS,
      });

      if (!response.txid) {
        throw new Error("Transaction failed");
      }

      return response.txid;
    } catch (error) {
      console.error("Error creating stake transaction:", error);
      throw error;
    }
  }

  /**
   * Check transaction status using Stacks API
   */
  static async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
      const apiUrl = IS_MAINNET
        ? "https://stacks-node-api.mainnet.stacks.co"
        : "https://stacks-node-api.testnet.stacks.co";

      const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            txId,
            status: "pending",
            error: "Transaction not yet found in mempool"
          };
        }
        throw new Error(`API error: ${response.status}`);
      }

      const txData = await response.json();

      let status: "pending" | "confirmed" | "failed";
      
      if (txData.tx_status === "success") {
        status = "confirmed";
      } else if (txData.tx_status === "abort_by_response" || txData.tx_status === "abort_by_post_condition") {
        status = "failed";
      } else {
        status = "pending";
      }

      return {
        txId,
        status,
        confirmations: txData.block_height ? 1 : 0,
        error: status === "failed" ? txData.tx_result?.repr : undefined
      };
    } catch (error) {
      console.error("Error fetching transaction status:", error);
      return {
        txId,
        status: "pending",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Wait for transaction confirmation with timeout
   * @param txId Transaction ID to monitor
   * @param timeoutMs Maximum time to wait in milliseconds (default: 5 minutes)
   * @param pollIntervalMs How often to check status in milliseconds (default: 10 seconds)
   */
  static async waitForTransactionConfirmation(
    txId: string,
    timeoutMs: number = 5 * 60 * 1000, // 5 minutes
    pollIntervalMs: number = 10 * 1000 // 10 seconds
  ): Promise<TransactionStatus> {
    const startTime = Date.now();
    
    console.log(`Waiting for transaction confirmation: ${txId}`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getTransactionStatus(txId);
        
        console.log(`Transaction ${txId} status: ${status.status}`);

        if (status.status === "confirmed") {
          console.log(`Transaction ${txId} confirmed successfully`);
          return status;
        }

        if (status.status === "failed") {
          console.error(`Transaction ${txId} failed: ${status.error}`);
          throw new Error(`Transaction failed: ${status.error || "Unknown error"}`);
        }

        // Transaction is still pending, wait before next check
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

      } catch (error) {
        if (error instanceof Error && error.message.includes("Transaction failed")) {
          throw error; // Re-throw transaction failures immediately
        }
        
        console.warn(`Error checking transaction status, retrying: ${error}`);
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      }
    }

    throw new Error(`Transaction confirmation timeout after ${timeoutMs / 1000}s`);
  }

  /**
   * Get user's STX balance
   */
  static async getSTXBalance(address: string): Promise<number> {
    try {
      const apiUrl = IS_MAINNET
        ? "https://stacks-node-api.mainnet.stacks.co"
        : "https://stacks-node-api.testnet.stacks.co";

      const response = await fetch(
        `${apiUrl}/extended/v1/address/${address}/balances`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const balanceData = await response.json();
      const microSTXBalance = parseInt(balanceData.stx.balance || "0");

      return microSTXBalance / STX_TO_MICRO_STX;
    } catch (error) {
      console.error("Error fetching STX balance:", error);
      throw error;
    }
  }

  /**
   * Validate transaction parameters before creating transaction
   */
  static validateStakeParams(params: StakeTransactionParams): void {
    const { amount, senderAddress, poolId } = params;

    if (!amount || amount <= 0) {
      throw new Error("Invalid stake amount");
    }

    if (!senderAddress || senderAddress.length < 20) {
      throw new Error("Invalid sender address");
    }

    if (!poolId || poolId.trim() === "") {
      throw new Error("Invalid pool ID");
    }

    if (amount > 1000) {
      throw new Error("Stake amount too large (max 1000 STX)");
    }

    if (amount < 0.1) {
      throw new Error("Stake amount too small (min 0.1 STX)");
    }
  }
}

// Export constants for use in components
export const PLATFORM_STAKE_ADDRESS = PLATFORM_ADDRESS;
