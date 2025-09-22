import { useMutation } from '@tanstack/react-query';
import { Actor } from '@dfinity/agent';
import { useAgent } from '../hooks/useAgent';
import { Principal } from '@dfinity/principal';
// @ts-ignore
import { idlFactory } from '../utils/ckbtc.js';
import { useMemo } from 'react';
import { useToast } from '../components/ToastContainer.js';

const DECIMALS = 100000000;
const TEMP_ADDRESS = '4ppas-bcjk7-pvvzg-uy6xp-7cblq-56to3-gryyo-7sjbq-5anil-7uufn-3ae';

const CKBTC_LEDGER_CANISTER_ID = 'mxzaz-hqaaa-aaaar-qaada-cai';


export const useTransferCkBtcWithAgent = () => {
  const authenticatedAgent = useAgent()
  const { showToast } = useToast();
 

  const actor = useMemo(() => {
    if (!authenticatedAgent) return null;

    return Actor.createActor(idlFactory, {
      agent: authenticatedAgent,
      canisterId: CKBTC_LEDGER_CANISTER_ID,
    });
  }, [authenticatedAgent]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (amountInCkBtc: number) => {
      if (!actor) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const amountInUnits = BigInt(Math.floor(amountInCkBtc * DECIMALS));

      const transferArgs = {
        to: { owner: Principal.fromText(TEMP_ADDRESS), subaccount: [] },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [BigInt(Date.now() * 1_000_000)],
        amount: amountInUnits,
      };

      try {
        const result = await actor.icrc1_transfer(transferArgs);
        
        // @ts-ignore
        if ('Err' in result) {
          const errorDetail = result.Err as {
            GenericError?: { message: string; error_code: bigint };
            TemporarilyUnavailable?: null;
            BadBurn?: { min_burn_amount: bigint };
            Duplicate?: { duplicate_of: bigint };
            BadFee?: { expected_fee: bigint };
            CreatedInFuture?: { ledger_time: bigint };
            TooOld?: null;
            InsufficientFunds?: { balance: bigint };
          };
          throw new Error(`Transfer failed: ${errorDetail}`);
        }
        // @ts-ignore
        return result.Ok;
      } catch (error: any) {
        if (error.message?.includes('Canister') && error.message?.includes('not found')) {
          throw new Error(`Canister not found. Please check if you're on the correct network and the canister ID is correct. Canister: ${CKBTC_LEDGER_CANISTER_ID}`);
        }
        
        if (error.message?.includes('Transfer failed:')) {
          throw error;
        }
        
        throw new Error(`Unexpected error: ${error.message || 'Unknown error occurred'}`);
      }
    },
    onMutate: (variables) => {
      console.log('Mutation starting with amount:', variables);
    },
    onError: (error) => {
      showToast({
        title: 'Transfer failed',
        message: 'Transfer failed',
        type: 'error',
      });
      console.error('Transfer failed:', error.message || 'Unknown error');
    },
    onSuccess: async (data) => {
      showToast({
        title: 'Transfer successful',
        message: 'Transfer successful',
        type: 'success',
      });
      // update invoice status here
    },
    onSettled: () => {
      console.log('Mutation settled');
    },
  });

  return { mutate, isPending, error, isConnected: !!authenticatedAgent };
};