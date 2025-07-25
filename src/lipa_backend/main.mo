import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Array "mo:base/Array";


import AdminSystem "auth-single-user/management";
import Http "file-storage/http";
import FileStorage "file-storage/file-storage";


persistent actor FreelancerDashboard {
    // Initialize the admin system state
    let adminState = AdminSystem.initState();

    transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
    transient let textMap = OrderedMap.Make<Text>(Text.compare);
    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

    // File storage
    var storage = FileStorage.new();

    // File metadata type
    public type FileMetadata = {
        name : Text;
        mimeType : Text;
        size : Nat;
        uploadedAt : Int;
        path : Text;
    };

    // Invoice type with file attachments
    public type Invoice = {
        id : Nat;
        details : Text;
        files : [FileMetadata];
    };

    // Invoices - now stores Invoice records instead of just Text
    var invoices : OrderedMap.Map<Principal, OrderedMap.Map<Nat, Invoice>> = principalMap.empty();

    // Tasks
    var tasks : OrderedMap.Map<Principal, OrderedMap.Map<Nat, Text>> = principalMap.empty();

    // Reputation Badges
    var badges : OrderedMap.Map<Principal, OrderedMap.Map<Text, Text>> = principalMap.empty();

    // File counter for unique file paths
    var fileCounter : Nat = 0;

    // Initialize admin (first caller becomes admin)
    public shared ({ caller }) func initializeAuth() : async () {
        AdminSystem.initializeAuth(adminState, caller);
    };

    // Check if current user is admin
    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        AdminSystem.isCurrentUserAdmin(adminState, caller);
    };

    // Add Invoice
    public shared ({ caller }) func addInvoice(id : Nat, details : Text) : async () {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot add invoices");
        };
        let userInvoices = switch (principalMap.get(invoices, caller)) {
            case null natMap.empty();
            case (?existing) existing;
        };
        let newInvoice : Invoice = {
            id = id;
            details = details;
            files = [];
        };
        let updatedInvoices = natMap.put(userInvoices, id, newInvoice);
        invoices := principalMap.put(invoices, caller, updatedInvoices);
    };

    // Upload file for invoice
    public shared ({ caller }) func uploadInvoiceFile(
        invoiceId : Nat,
        fileName : Text,
        mimeType : Text,
        chunk : Blob,
        complete : Bool
    ) : async ?Text {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot upload files");
        };

        // Validate file size (25MB limit)
        if (chunk.size() > 25_000_000) {
            Debug.trap("File size exceeds 25MB limit");
        };

        // Validate file type
        let allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                           "application/zip", "image/png", "image/jpeg", "image/jpg"];
        var isValidType = false;
        for (allowedType in allowedTypes.vals()) {
            if (mimeType == allowedType) {
                isValidType := true;
            };
        };
        if (not isValidType) {
            Debug.trap("File type not allowed");
        };

        // Check if invoice exists
        switch (principalMap.get(invoices, caller)) {
            case null { Debug.trap("No invoices found for user"); };
            case (?userInvoices) {
                switch (natMap.get(userInvoices, invoiceId)) {
                    case null { Debug.trap("Invoice not found"); };
                    case (?invoice) {
                        // Generate unique file path
                        fileCounter += 1;
                        let filePath = "invoice_" # Nat.toText(invoiceId) # "_file_" # Nat.toText(fileCounter) # "_" # fileName;
                        
                        // Upload file
                        FileStorage.upload(storage, filePath, mimeType, chunk, complete);
                        
                        if (complete) {
                            // Add file metadata to invoice
                            let fileMetadata : FileMetadata = {
                                name = fileName;
                                mimeType = mimeType;
                                size = chunk.size();
                                uploadedAt = Time.now();
                                path = filePath;
                            };
                            
                            let updatedFiles = Array.append(invoice.files, [fileMetadata]);
                            let updatedInvoice : Invoice = {
                                invoice with files = updatedFiles;
                            };
                            
                            let updatedUserInvoices = natMap.put(userInvoices, invoiceId, updatedInvoice);
                            invoices := principalMap.put(invoices, caller, updatedUserInvoices);
                            
                            ?filePath;
                        } else {
                            ?filePath;
                        };
                    };
                };
            };
        };
    };

    // Get Invoice with files
    public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot get invoices");
        };
        switch (principalMap.get(invoices, caller)) {
            case null null;
            case (?userInvoices) natMap.get(userInvoices, id);
        };
    };

    // List All Invoices
    public query ({ caller }) func listInvoices() : async [(Nat, Invoice)] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot list invoices");
        };
        switch (principalMap.get(invoices, caller)) {
            case null [];
            case (?userInvoices) Iter.toArray(natMap.entries(userInvoices));
        };
    };

    // Get invoice files
    public query ({ caller }) func getInvoiceFiles(invoiceId : Nat) : async [FileMetadata] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot get invoice files");
        };
        switch (principalMap.get(invoices, caller)) {
            case null [];
            case (?userInvoices) {
                switch (natMap.get(userInvoices, invoiceId)) {
                    case null [];
                    case (?invoice) invoice.files;
                };
            };
        };
    };

    // List all uploaded files
    public query func listFiles() : async [FileStorage.FileMetadata] {
        FileStorage.list(storage);
    };

    // HTTP request handler for file access
    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        FileStorage.fileRequest(storage, request, httpStreamingCallback);
    };

    // HTTP streaming callback for large files
    public query func httpStreamingCallback(token : Http.StreamingToken) : async Http.StreamingCallbackHttpResponse {
        FileStorage.httpStreamingCallback(storage, token);
    };

    // Add Task
    public shared ({ caller }) func addTask(id : Nat, description : Text) : async () {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot add tasks");
        };
        let userTasks = switch (principalMap.get(tasks, caller)) {
            case null natMap.empty();
            case (?existing) existing;
        };
        let updatedTasks = natMap.put(userTasks, id, description);
        tasks := principalMap.put(tasks, caller, updatedTasks);
    };

    // Get Task
    public query ({ caller }) func getTask(id : Nat) : async ?Text {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot get tasks");
        };
        switch (principalMap.get(tasks, caller)) {
            case null null;
            case (?userTasks) natMap.get(userTasks, id);
        };
    };

    // List All Tasks
    public query ({ caller }) func listTasks() : async [(Nat, Text)] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot list tasks");
        };
        switch (principalMap.get(tasks, caller)) {
            case null [];
            case (?userTasks) Iter.toArray(natMap.entries(userTasks));
        };
    };

    // Add Badge
    public shared ({ caller }) func addBadge(name : Text, description : Text) : async () {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot add badges");
        };
        let userBadges = switch (principalMap.get(badges, caller)) {
            case null textMap.empty();
            case (?existing) existing;
        };
        let updatedBadges = textMap.put(userBadges, name, description);
        badges := principalMap.put(badges, caller, updatedBadges);
    };

    // Get Badge
    public query ({ caller }) func getBadge(name : Text) : async ?Text {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot get badges");
        };
        switch (principalMap.get(badges, caller)) {
            case null null;
            case (?userBadges) textMap.get(userBadges, name);
        };
    };

    // List All Badges
    public query ({ caller }) func listBadges() : async [(Text, Text)] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot list badges");
        };
        switch (principalMap.get(badges, caller)) {
            case null [];
            case (?userBadges) Iter.toArray(textMap.entries(userBadges));
        };
    };
};

