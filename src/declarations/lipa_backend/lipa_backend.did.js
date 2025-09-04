export const idlFactory = ({ IDL }) => {
  const FileMetadata = IDL.Record({
    'name' : IDL.Text,
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'mimeType' : IDL.Text,
    'uploadedAt' : IDL.Int,
  });
  const Invoice = IDL.Record({
    'id' : IDL.Nat,
    'files' : IDL.Vec(FileMetadata),
    'bitcoinAddress' : IDL.Opt(IDL.Text),
    'details' : IDL.Text,
  });
  const StreamingToken = IDL.Record({
    'resource' : IDL.Text,
    'index' : IDL.Nat,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallback = IDL.Func(
      [StreamingToken],
      [StreamingCallbackHttpResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const ConsentMessageRequest = IDL.Record({
    'arg' : IDL.Vec(IDL.Nat8),
    'method' : IDL.Text,
    'consent_preferences' : IDL.Opt(IDL.Record({ 'language' : IDL.Text })),
  });
  const ConsentMessage = IDL.Variant({
    'LineDisplayMessage' : IDL.Record({
      'pages' : IDL.Vec(IDL.Record({ 'lines' : IDL.Vec(IDL.Text) })),
    }),
    'GenericDisplayMessage' : IDL.Text,
  });
  const ConsentInfo = IDL.Record({
    'metadata' : IDL.Record({
      'utc_offset_minutes' : IDL.Opt(IDL.Int),
      'language' : IDL.Text,
    }),
    'consent_message' : ConsentMessage,
  });
  const ErrorInfo = IDL.Record({ 'description' : IDL.Text });
  const ICRC21ConsentMessageResponse = IDL.Variant({
    'Ok' : ConsentInfo,
    'Err' : ErrorInfo,
  });
  const FileMetadata__1 = IDL.Record({
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'mimeType' : IDL.Text,
  });
  return IDL.Service({
    'addBadge' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'addInvoice' : IDL.Func([IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)], [], []),
    'addTask' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'getAllBitcoinMappings' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
        [],
      ),
    'getBadge' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getInvoice' : IDL.Func([IDL.Nat], [IDL.Opt(Invoice)], ['query']),
    'getInvoiceBitcoinAddress' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'getInvoiceFiles' : IDL.Func([IDL.Nat], [IDL.Vec(FileMetadata)], ['query']),
    'getTask' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Text)], ['query']),
    'httpStreamingCallback' : IDL.Func(
        [StreamingToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'icrc21_canister_call_consent_message' : IDL.Func(
        [ConsentMessageRequest],
        [ICRC21ConsentMessageResponse],
        [],
      ),
    'initializeAuth' : IDL.Func([], [], []),
    'isCurrentUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listBadges' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'listFiles' : IDL.Func([], [IDL.Vec(FileMetadata__1)], ['query']),
    'listInvoices' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, Invoice))],
        ['query'],
      ),
    'listTasks' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text))],
        ['query'],
      ),
    'uploadInvoiceFile' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Bool],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'validateBitcoinAddress' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
