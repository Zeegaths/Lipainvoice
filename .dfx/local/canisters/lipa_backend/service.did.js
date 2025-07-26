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
  const FileMetadata__1 = IDL.Record({
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'mimeType' : IDL.Text,
  });
  return IDL.Service({
    'addBadge' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'addInvoice' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'addTask' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'getBadge' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getInvoice' : IDL.Func([IDL.Nat], [IDL.Opt(Invoice)], ['query']),
    'getInvoiceFiles' : IDL.Func([IDL.Nat], [IDL.Vec(FileMetadata)], ['query']),
    'getTask' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Text)], ['query']),
    'httpStreamingCallback' : IDL.Func(
        [StreamingToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
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
  });
};
export const init = ({ IDL }) => { return []; };
