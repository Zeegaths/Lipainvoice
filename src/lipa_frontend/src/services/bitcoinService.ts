import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Actor, HttpAgent } from '@dfinity/agent';

// Initialize ECC for bitcoinjs-lib
bitcoin.initEccLib(ecc);

// Define the network (mainnet or testnet)
const NETWORK = bitcoin.networks.bitcoin; // or bitcoin.networks.testnet

// Bitcoin canister configuration
const BTC_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

// Create an agent to interact with the Bitcoin canister
const agent = new HttpAgent({ host: 'https://ic0.app' });

// TODO: Replace with actual IDL interface
const btcActor = Actor.createActor(
  // IDL interface should be defined here
  ({ IDL }) => IDL.Service({
    submit_transaction: IDL.Func([IDL.Text], [IDL.Text], [])
  }),
  {
    agent,
    canisterId: BTC_CANISTER_ID,
  }
);

export class BitcoinAddressService {
  private static instance: BitcoinAddressService;

  private constructor() {}

  public static getInstance(): BitcoinAddressService {
    if (!BitcoinAddressService.instance) {
      BitcoinAddressService.instance = new BitcoinAddressService();
    }
    return BitcoinAddressService.instance;
  }

  /**
   * Create a Bitcoin transaction
   * @param utxos List of UTXOs to spend
   * @param toAddress Recipient Bitcoin address
   * @param amount Amount in satoshis to send
   * @param fee Fee in satoshis
   * @param changeAddress Change address to send leftover funds
   */
  public createTransaction(
    utxos: Array<{ txid: string; vout: number; value: number; scriptPubKey: string }>,
    toAddress: string,
    amount: number,
    fee: number,
    changeAddress: string
  ): bitcoin.Psbt {
    // Use PSBT instead of deprecated TransactionBuilder
    const psbt = new bitcoin.Psbt({ network: NETWORK });

    let inputSum = 0;
    for (const utxo of utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(utxo.scriptPubKey, 'hex'), // Convert hex string to Buffer
      });
      inputSum += utxo.value;
    }

    if (inputSum < amount + fee) {
      throw new Error('Insufficient funds');
    }

    psbt.addOutput({
      address: toAddress,
      value: amount,
    });

    const change = inputSum - amount - fee;
    if (change > 0) {
      psbt.addOutput({
        address: changeAddress,
        value: change,
      });
    }

    return psbt;
  }

  /**
   * Sign a Bitcoin transaction
   * @param psbt PSBT instance
   * @param keyPairs Array of key pairs corresponding to inputs
   */
  public signTransaction(
    psbt: bitcoin.Psbt,
    keyPairs: Array<{ keyPair: bitcoin.Signer; index: number }>
  ): bitcoin.Transaction {
    for (const { keyPair, index } of keyPairs) {
      psbt.signInput(index, keyPair);
    }
    
    // Finalize all inputs
    psbt.finalizeAllInputs();
    
    return psbt.extractTransaction();
  }

  /**
   * Submit a signed transaction to the Bitcoin network via Internet Computer BTC API
   * @param rawTxHex Raw transaction hex string
   */
  public async submitTransaction(rawTxHex: string): Promise<string> {
    try {
      // Call the Bitcoin canister submit_transaction method
      const txid = await btcActor.submit_transaction(rawTxHex) as string;
      return txid;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw new Error('Transaction submission failed');
    }
  }
}

/* Removed extending class due to private constructor in base class */
// export class BitcoinAddressServiceExtended extends BitcoinAddressService {
//   // This class can now inherit all methods from BitcoinAddressService
//   // No need to duplicate the transaction methods
// }

// Export singleton instance
export const bitcoinService = BitcoinAddressService.getInstance();