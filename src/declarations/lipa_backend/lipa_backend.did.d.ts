import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BitcoinNetwork = { 'mainnet' : null } |
  { 'testnet' : null };
export type BlockHash = Uint8Array | number[];
export interface ConsentInfo {
  'metadata' : { 'utc_offset_minutes' : [] | [bigint], 'language' : string },
  'consent_message' : ConsentMessage,
}
export type ConsentMessage = {
    'LineDisplayMessage' : { 'pages' : Array<{ 'lines' : Array<string> }> }
  } |
  { 'GenericDisplayMessage' : string };
export interface ConsentMessageRequest {
  'arg' : Uint8Array | number[],
  'method' : string,
  'consent_preferences' : [] | [{ 'language' : string }],
}
export interface ErrorInfo { 'description' : string }
export interface FileMetadata {
  'name' : string,
  'path' : string,
  'size' : bigint,
  'mimeType' : string,
  'uploadedAt' : bigint,
}
export interface FileMetadata__1 {
  'path' : string,
  'size' : bigint,
  'mimeType' : string,
}
export interface GetUtxosResponse {
  'next_page' : [] | [Page],
  'tip_height' : number,
  'tip_block_hash' : BlockHash,
  'utxos' : Array<Utxo>,
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type ICRC21ConsentMessageResponse = { 'Ok' : ConsentInfo } |
  { 'Err' : ErrorInfo };
export interface Invoice {
  'id' : bigint,
  'files' : Array<FileMetadata>,
  'lightningInvoice' : [] | [LightningInvoice],
  'bitcoinAddress' : [] | [string],
  'details' : string,
}
export interface LightningInvoice {
  'status' : string,
  'expiry' : bigint,
  'amount' : bigint,
  'invoiceString' : string,
}
export type MillisatoshiPerVByte = bigint;
export type Network = { 'mainnet' : null } |
  { 'regtest' : null } |
  { 'testnet' : null };
export interface OutPoint { 'txid' : Uint8Array | number[], 'vout' : number }
export type Page = Uint8Array | number[];
export type Satoshi = bigint;
export type StreamingCallback = ActorMethod<
  [StreamingToken],
  StreamingCallbackHttpResponse
>;
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingToken],
  'body' : Uint8Array | number[],
}
export type StreamingStrategy = {
    'Callback' : { 'token' : StreamingToken, 'callback' : StreamingCallback }
  };
export interface StreamingToken { 'resource' : string, 'index' : bigint }
export interface Utxo {
  'height' : number,
  'value' : Satoshi,
  'outpoint' : OutPoint,
}
export interface _SERVICE {
  'addBadge' : ActorMethod<[string, string], undefined>,
  'addInvoice' : ActorMethod<[bigint, string, [] | [string]], undefined>,
  'addTask' : ActorMethod<[bigint, string], undefined>,
  'createLightningInvoice' : ActorMethod<[bigint, bigint], LightningInvoice>,
  'getAllBitcoinMappings' : ActorMethod<[], Array<[bigint, string]>>,
  'getBadge' : ActorMethod<[string], [] | [string]>,
  'getBitcoinBalance' : ActorMethod<[string, Network], Satoshi>,
  'getBitcoinFeePercentiles' : ActorMethod<
    [Network],
    BigUint64Array | bigint[]
  >,
  'getBitcoinUtxos' : ActorMethod<[string, Network], GetUtxosResponse>,
  'getInvoice' : ActorMethod<[bigint], [] | [Invoice]>,
  'getInvoiceBitcoinAddress' : ActorMethod<[bigint], [] | [string]>,
  'getInvoiceFiles' : ActorMethod<[bigint], Array<FileMetadata>>,
  'getLightningInvoice' : ActorMethod<[bigint], [] | [LightningInvoice]>,
  'getP2pkhAddress' : ActorMethod<[Network], string>,
  'getP2trAddress' : ActorMethod<[Network], string>,
  'getPublicInvoice' : ActorMethod<[bigint], [] | [Invoice]>,
  'getTask' : ActorMethod<[bigint], [] | [string]>,
  'httpStreamingCallback' : ActorMethod<
    [StreamingToken],
    StreamingCallbackHttpResponse
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'icrc21_canister_call_consent_message' : ActorMethod<
    [ConsentMessageRequest],
    ICRC21ConsentMessageResponse
  >,
  'initializeAuth' : ActorMethod<[], undefined>,
  'isCurrentUserAdmin' : ActorMethod<[], boolean>,
  'listBadges' : ActorMethod<[], Array<[string, string]>>,
  'listFiles' : ActorMethod<[], Array<FileMetadata__1>>,
  'listInvoices' : ActorMethod<[], Array<[bigint, Invoice]>>,
  'listTasks' : ActorMethod<[], Array<[bigint, string]>>,
  'sendBitcoinP2pkh' : ActorMethod<
    [string, Satoshi, Network],
    Uint8Array | number[]
  >,
  'sendBitcoinP2tr' : ActorMethod<
    [string, Satoshi, Network],
    Uint8Array | number[]
  >,
  'uploadInvoiceFile' : ActorMethod<
    [bigint, string, string, Uint8Array | number[], boolean],
    [] | [string]
  >,
  'validateBitcoinAddress' : ActorMethod<[string], boolean>,
  'validateBitcoinAddressForNetwork' : ActorMethod<
    [string, BitcoinNetwork],
    boolean
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
