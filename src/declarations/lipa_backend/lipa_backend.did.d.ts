import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export interface Invoice {
  'id' : bigint,
  'files' : Array<FileMetadata>,
  'details' : string,
}
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
export interface _SERVICE {
  'addBadge' : ActorMethod<[string, string], undefined>,
  'addInvoice' : ActorMethod<[bigint, string], undefined>,
  'addTask' : ActorMethod<[bigint, string], undefined>,
  'getBadge' : ActorMethod<[string], [] | [string]>,
  'getInvoice' : ActorMethod<[bigint], [] | [Invoice]>,
  'getInvoiceFiles' : ActorMethod<[bigint], Array<FileMetadata>>,
  'getTask' : ActorMethod<[bigint], [] | [string]>,
  'httpStreamingCallback' : ActorMethod<
    [StreamingToken],
    StreamingCallbackHttpResponse
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'initializeAuth' : ActorMethod<[], undefined>,
  'isCurrentUserAdmin' : ActorMethod<[], boolean>,
  'listBadges' : ActorMethod<[], Array<[string, string]>>,
  'listFiles' : ActorMethod<[], Array<FileMetadata__1>>,
  'listInvoices' : ActorMethod<[], Array<[bigint, Invoice]>>,
  'listTasks' : ActorMethod<[], Array<[bigint, string]>>,
  'uploadInvoiceFile' : ActorMethod<
    [bigint, string, string, Uint8Array | number[], boolean],
    [] | [string]
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
