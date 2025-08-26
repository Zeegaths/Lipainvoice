import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

// Initialize BIP32 with secp256k1
const bip32 = BIP32Factory(ecc);

// Network configuration (mainnet for production, testnet for development)
const NETWORK = bitcoin.networks.bitcoin; // Change to bitcoin.networks.testnet for testnet

// HD Wallet derivation path (BIP84 for Native SegWit)
const DERIVATION_PATH = "m/84'/0'/0'/0/0"; // BIP84: m/purpose'/coin_type'/account'/change/address_index

export interface BitcoinKeyPair {
  address: string;
  publicKey: string;
  privateKey: string; // WIF format
  derivationPath: string;
}

export class BitcoinAddressService {
  private static instance: BitcoinAddressService;
  private masterNode: any;
  private addressIndex: number = 0;

  private constructor() {
    this.initializeWallet();
  }

  public static getInstance(): BitcoinAddressService {
    if (!BitcoinAddressService.instance) {
      BitcoinAddressService.instance = new BitcoinAddressService();
    }
    return BitcoinAddressService.instance;
  }

  /**
   * Initialize HD wallet with a new mnemonic
   * In production, this should be securely stored and retrieved
   */
  private initializeWallet(): void {
    try {
      // Generate a new mnemonic (24 words)
      const mnemonic = bip39.generateMnemonic(256);
      console.log('Generated mnemonic:', mnemonic);
      
      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic generated');
      }

      // Create seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      
      // Create master node from seed
      this.masterNode = bip32.fromSeed(seed, NETWORK);
      
      console.log('HD Wallet initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Bitcoin wallet:', error);
      throw new Error('Bitcoin wallet initialization failed');
    }
  }

  /**
   * Generate a new Bitcoin address from the HD wallet
   * @param index Optional address index (defaults to internal counter)
   */
  public generateAddress(index?: number): BitcoinKeyPair {
    try {
      if (!this.masterNode) {
        throw new Error('Wallet not initialized');
      }

      const addressIndex = index !== undefined ? index : this.addressIndex;
      
      // Derive child key according to BIP84
      const childNode = this.masterNode.derivePath(`m/84'/0'/0'/0/${addressIndex}`);
      
      // Get public key and create Native SegWit address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: childNode.publicKey,
        network: NETWORK,
      });

      if (!address) {
        throw new Error('Failed to generate Bitcoin address');
      }

      // Get private key in WIF format
      const privateKeyWIF = childNode.toWIF();

      const keyPair: BitcoinKeyPair = {
        address,
        publicKey: childNode.publicKey.toString('hex'),
        privateKey: privateKeyWIF,
        derivationPath: `m/84'/0'/0'/0/${addressIndex}`,
      };

      // Increment internal counter for next address
      if (index === undefined) {
        this.addressIndex++;
      }

      console.log('Generated Bitcoin address:', address);
      return keyPair;
    } catch (error) {
      console.error('Failed to generate Bitcoin address:', error);
      throw new Error('Bitcoin address generation failed');
    }
  }

  /**
   * Validate a Bitcoin address
   * @param address Bitcoin address to validate
   */
  public validateAddress(address: string): boolean {
    try {
      // Try to decode the address
      bitcoin.address.toOutputScript(address, NETWORK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get address type (legacy, segwit, native segwit)
   * @param address Bitcoin address to check
   */
  public getAddressType(address: string): string {
    try {
      const outputScript = bitcoin.address.toOutputScript(address, NETWORK);
      
      // Check for P2WPKH (Native SegWit)
      if (bitcoin.payments.p2wpkh({ output: outputScript, network: NETWORK })) {
        return 'native_segwit';
      }
      
      // Check for P2SH (SegWit)
      if (bitcoin.payments.p2sh({ output: outputScript, network: NETWORK })) {
        return 'segwit';
      }
      
      // Check for P2PKH (Legacy)
      if (bitcoin.payments.p2pkh({ output: outputScript, network: NETWORK })) {
        return 'legacy';
      }
      
      // Check for P2TR (Taproot)
      if (bitcoin.payments.p2tr({ output: outputScript, network: NETWORK })) {
        return 'taproot';
      }
      
      return 'unknown';
    } catch {
      return 'invalid';
    }
  }

  /**
   * Generate multiple addresses at once
   * @param count Number of addresses to generate
   */
  public generateMultipleAddresses(count: number): BitcoinKeyPair[] {
    const addresses: BitcoinKeyPair[] = [];
    
    for (let i = 0; i < count; i++) {
      addresses.push(this.generateAddress(this.addressIndex + i));
    }
    
    this.addressIndex += count;
    return addresses;
  }

  /**
   * Get the current address index
   */
  public getCurrentIndex(): number {
    return this.addressIndex;
  }

  /**
   * Reset the address index (use with caution)
   */
  public resetIndex(): void {
    this.addressIndex = 0;
    console.log('Address index reset to 0');
  }

  /**
   * Generate a testnet address for development
   */
  public generateTestnetAddress(): BitcoinKeyPair {
    const testnetNetwork = bitcoin.networks.testnet;
    const testnetDerivationPath = "m/84'/1'/0'/0/0";
    
    try {
      const childNode = this.masterNode.derivePath(testnetDerivationPath);
      
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: childNode.publicKey,
        network: testnetNetwork,
      });

      if (!address) {
        throw new Error('Failed to generate testnet address');
      }

      return {
        address,
        publicKey: childNode.publicKey.toString('hex'),
        privateKey: childNode.toWIF(),
        derivationPath: testnetDerivationPath,
      };
    } catch (error) {
      console.error('Failed to generate testnet address:', error);
      throw new Error('Testnet address generation failed');
    }
  }
}

// Export singleton instance
export const bitcoinService = BitcoinAddressService.getInstance();
