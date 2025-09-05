import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, ClarityValue } from '@stacks/transactions';

const network = "testnet"; // Change to "mainnet" for production

// Helper functions for Stacks blockchain interactions
export class StacksAPI {
  
  // Submit a transaction using the openContractCall API
  static async callContract(
    contractAddress: string,
    contractName: string,
    functionName: string,
    functionArgs: ClarityValue[] = []
  ) {
    try {
      const result = await openContractCall({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        network,
        appDetails: {
          name: 'Prognos MVP',
          icon: '/favicon.ico',
        },
        onFinish: ({ txId }: { txId: string }) => {
          console.log('Transaction submitted:', txId);
        },
      });
      
      return result;
    } catch (error) {
      console.error('Error calling contract:', error);
      throw error;
    }
  }

  // Example: Submit a vote (this would be for actual blockchain integration)
  static async submitVote(
    contractAddress: string,
    poolId: string,
    vote: 'yes' | 'no'
  ) {
    return this.callContract(
      contractAddress,
      'prediction-pools',
      'submit-vote',
      [
        stringUtf8CV(poolId),
        stringUtf8CV(vote)
      ]
    );
  }

  // Example: Submit a stake (this would be for actual blockchain integration)
  static async submitStake(
    contractAddress: string,
    poolId: string,
    vote: 'yes' | 'no',
    amount: number
  ) {
    return this.callContract(
      contractAddress,
      'prediction-pools',
      'submit-stake',
      [
        stringUtf8CV(poolId),
        stringUtf8CV(vote),
        uintCV(amount)
      ]
    );
  }

  // Example: Claim rewards (this would be for actual blockchain integration)
  static async claimRewards(
    contractAddress: string,
    poolId: string
  ) {
    return this.callContract(
      contractAddress,
      'prediction-pools',
      'claim-rewards',
      [stringUtf8CV(poolId)]
    );
  }
}

// Note: These functions are for future blockchain integration
// The current app uses the HTTP API endpoints instead