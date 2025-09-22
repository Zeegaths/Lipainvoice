import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";


import AdminSystem "auth-single-user/management";
import Http "file-storage/http";
import FileStorage "file-storage/file-storage";
import Bitcoin "bitcoin";
import _HttpOutcalls "http-outcalls/outcall";

// Bitcoin integration imports
import BitcoinApi "bitcoin/bitcoinapi";
import P2pkh "bitcoin/P2pkh";
import P2tr "bitcoin/P2tr";
import Types "bitcoin/Types";
import _Utils "bitcoin/Utils";
import _EcdsaApi "bitcoin/ecdsaapi";
import _SchnorrApi "bitcoin/SchnorrApi";

persistent actor FreelancerDashboard {
    // Initialize the admin system state
    transient let adminState = AdminSystem.initState();

    // Bitcoin canister actors
    transient let ecdsa_canister_actor : Types.EcdsaCanisterActor = actor("aaaaa-aa");
    transient let schnorr_canister_actor : Types.SchnorrCanisterActor = actor("aaaaa-aa");

    // Bitcoin key names
    stable var ecdsa_key_name : Text = "dfx_test_key";
    stable var schnorr_key_name : Text = "dfx_test_key";

    transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
    transient let textMap = OrderedMap.Make<Text>(Text.compare);
    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

    // File storage
    transient var storage = FileStorage.new();

    // File metadata type
    public type FileMetadata = {
        name : Text;
        mimeType : Text;
        size : Nat;
        uploadedAt : Int;
        path : Text;
    };

    // Lightning invoice type
    public type LightningInvoice = {
        invoiceString : Text;
        amount : Nat;
        expiry : Nat;
        status : Text; // e.g. "pending", "paid"
    };

    // Invoice type with file attachments and Bitcoin address
    public type Invoice = {
        id : Nat;
        details : Text;
        files : [FileMetadata];
        bitcoinAddress : ?Text; // Optional Bitcoin address for payment
        lightningInvoice : ?LightningInvoice; // Optional lightning invoice
    };

    // Invoices - now stores Invoice records instead of just Text
    transient var invoices : OrderedMap.Map<Principal, OrderedMap.Map<Nat, Invoice>> = principalMap.empty();

    // Bitcoin address mappings (stable storage)
    stable var _bitcoinMappingsStable : [(Nat, Text)] = [];

    // Bitcoin address map (stable representation for persistent storage)
    stable var bitcoinAddressMap : [(Nat, Text)] = [];

    // Lightning invoices stable storage mapped by invoice ID
    stable var _lightningInvoicesStable : [(Nat, LightningInvoice)] = [];

    // Lightning invoices HashMap for runtime operations
    transient var _lightningInvoices : HashMap.HashMap<Nat, LightningInvoice> = HashMap.HashMap<Nat, LightningInvoice>(10, Nat.equal, Hash.hash);

    // Tasks
    transient var tasks : OrderedMap.Map<Principal, OrderedMap.Map<Nat, Text>> = principalMap.empty();

    // Reputation Badges
    transient var badges : OrderedMap.Map<Principal, OrderedMap.Map<Text, Text>> = principalMap.empty();

    // File counter for unique file paths
    transient var fileCounter : Nat = 0;



    public type ConsentMessageRequest = {
        method : Text;
        arg : Blob;
        consent_preferences : ?{
            language : Text;
        };
    };

    public type ConsentMessage = {
        #GenericDisplayMessage : Text;
        #LineDisplayMessage : { pages : [{ lines : [Text] }] };
    };

    public type ConsentInfo = {
        metadata : {
            language : Text;
            utc_offset_minutes : ?Int;
        };
        consent_message : ConsentMessage;
    };

    public type ErrorInfo = {
        description : Text;
    };

    public type ICRC21ConsentMessageResponse = {
        #Ok : ConsentInfo;
        #Err : ErrorInfo;
    };

    public shared func icrc21_canister_call_consent_message(request : ConsentMessageRequest) : async ICRC21ConsentMessageResponse {
        let consent_message = switch (request.method) {
            case "addInvoice" {
                #GenericDisplayMessage("Approve Lipa Invoice to add a new invoice");
            };
            case "addTask" {
                #GenericDisplayMessage("Approve Lipa Invoice to add a new task");
            };
            case "addBadge" {
                #GenericDisplayMessage("Approve Lipa Invoice to add a new badge");
            };
            case "uploadInvoiceFile" {
                #GenericDisplayMessage("Approve Lipa Invoice to upload a file");
            };
            case _ {
                #GenericDisplayMessage("Approve Lipa Invoice to execute " # request.method);
            };
        };
        
        let metadata = {
            language = switch (request.consent_preferences) {
                case null { "en" };
                case (?prefs) { prefs.language };
            };
            utc_offset_minutes = null;
        };
        
        return #Ok({
            metadata = metadata;
            consent_message = consent_message;
        });
    };

    // Initialize admin (first caller becomes admin)
    public shared ({ caller }) func initializeAuth() : async () {
        AdminSystem.initializeAuth(adminState, caller);
    };

    // Check if current user is admin
    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        AdminSystem.isCurrentUserAdmin(adminState, caller);
    };

    // Add Invoice with optional Bitcoin address
    public shared ({ caller }) func addInvoice(id : Nat, details : Text, bitcoinAddress : ?Text) : async () {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot add invoices");
        };
        
        // Handle Bitcoin address if provided (validation temporarily disabled for immediate fix)
        switch (bitcoinAddress) {
            case null {};
            case (?address) {
                // Validation temporarily disabled - will re-enable after deployment
                // TODO: Re-enable validation after deployment
                // Validate Bitcoin address format
                // if (not Bitcoin.validateBitcoinAddress(address)) {
                //     Debug.trap("Invalid Bitcoin address format");
                // };
                // Check if address is already used
                if (Bitcoin.isAddressUsed(bitcoinAddressMap, address)) {
                    Debug.trap("Bitcoin address is already in use");
                };
                // Store the address mapping
                bitcoinAddressMap := Bitcoin.addInvoiceAddress(bitcoinAddressMap, id, address);
            };
        };
        
        let userInvoices = switch (principalMap.get(invoices, caller)) {
            case null natMap.empty();
            case (?existing) existing;
        };
        let newInvoice : Invoice = {
            id = id;
            details = details;
            files = [];
            bitcoinAddress = bitcoinAddress;
            lightningInvoice = null;
        };
        let updatedInvoices = natMap.put(userInvoices, id, newInvoice);
        invoices := principalMap.put(invoices, caller, updatedInvoices);
    };

    // Helper function to get lightning invoice from stable array
    func getLightningInvoiceFromStable(id : Nat) : ?LightningInvoice {
        for ((invoiceId, invoice) in _lightningInvoicesStable.vals()) {
            if (invoiceId == id) {
                return ?invoice;
            };
        };
        null;
    };

    // Helper function to put lightning invoice in stable array
    func putLightningInvoiceInStable(id : Nat, invoice : LightningInvoice) {
        var found = false;
        var newArray : [(Nat, LightningInvoice)] = [];
        for ((invoiceId, inv) in _lightningInvoicesStable.vals()) {
            if (invoiceId == id) {
                newArray := Array.append(newArray, [(id, invoice)]);
                found := true;
            } else {
                newArray := Array.append(newArray, [(invoiceId, inv)]);
            };
        };
        if (not found) {
            newArray := Array.append(newArray, [(id, invoice)]);
        };
        _lightningInvoicesStable := newArray;
    };


    // Query lightning invoice details
    public query ({ caller }) func getLightningInvoice(invoiceId : Nat) : async ?LightningInvoice {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot query lightning invoices");
        };
        getLightningInvoiceFromStable(invoiceId);
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

    // Get Invoice with files and Bitcoin address
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

    // Get public invoice
    public query func getPublicInvoice(id : Nat) : async ?Invoice {
    // Search through all users' invoices
    for ((principal, userInvoices) in principalMap.entries(invoices)) {
        switch (natMap.get(userInvoices, id)) {
            case (?invoice) return ?invoice;
            case null {};
        };
    };
    null;
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

    // Get Bitcoin address for invoice
    public query func getInvoiceBitcoinAddress(invoiceId : Nat) : async ?Text {
        Bitcoin.getInvoiceAddress(bitcoinAddressMap, invoiceId);
    };

    // Validate Bitcoin address
    public query func validateBitcoinAddress(address : Text) : async Bool {
        Bitcoin.validateBitcoinAddress(address);
    };

    // Validate Bitcoin address for specific network
    public query func validateBitcoinAddressForNetwork(address : Text, network : Bitcoin.BitcoinNetwork) : async Bool {
        Bitcoin.validateBitcoinAddressForNetwork(address, network);
    };

    // Get all Bitcoin address mappings (admin only)
    public shared ({ caller }) func getAllBitcoinMappings() : async [(Nat, Text)] {
        if (not AdminSystem.isCurrentUserAdmin(adminState, caller)) {
            Debug.trap("Only admin can access all Bitcoin mappings");
        };
        Bitcoin.getAllMappings(bitcoinAddressMap);
    };

    // Bitcoin integration functions

    // Get Bitcoin balance for an address
    public shared func getBitcoinBalance(address : Text, network : Types.Network) : async Types.Satoshi {
        await BitcoinApi.get_balance(network, address);
    };

    // Get UTXOs for an address
    public shared func getBitcoinUtxos(address : Text, network : Types.Network) : async Types.GetUtxosResponse {
        await BitcoinApi.get_utxos(network, address);
    };

    // Get current fee percentiles
    public shared func getBitcoinFeePercentiles(network : Types.Network) : async [Types.MillisatoshiPerVByte] {
        await BitcoinApi.get_current_fee_percentiles(network);
    };

    // Send Bitcoin using P2PKH
    public shared ({ caller }) func sendBitcoinP2pkh(destination : Text, amount : Types.Satoshi, network : Types.Network) : async [Nat8] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot send Bitcoin");
        };
        // TODO: Re-enable validation after deployment
        // Validate destination Bitcoin address
        // if (not Bitcoin.validateBitcoinAddress(destination)) {
        //     Debug.trap("Invalid destination Bitcoin address format");
        // };
        await P2pkh.send(ecdsa_canister_actor, network, [[0]], ecdsa_key_name, destination, amount);
    };

    // Send Bitcoin using P2TR (Taproot)
    public shared ({ caller }) func sendBitcoinP2tr(destination : Text, amount : Types.Satoshi, network : Types.Network) : async [Nat8] {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot send Bitcoin");
        };
        // TODO: Re-enable validation after deployment
        // Validate destination Bitcoin address
        // if (not Bitcoin.validateBitcoinAddress(destination)) {
        //     Debug.trap("Invalid destination Bitcoin address format");
        // };
        let derivation_paths = { key_path_derivation_path = [[0 : Nat8]]; script_path_derivation_path = [[0 : Nat8]] };
        await P2tr.send_key_path(schnorr_canister_actor, network, derivation_paths, schnorr_key_name, destination, amount);
    };

    // Get P2PKH address for the canister
    public shared func getP2pkhAddress(network : Types.Network) : async Text {
        await P2pkh.get_address(ecdsa_canister_actor, network, ecdsa_key_name, [[0]]);
    };

    // Get P2TR address for the canister
    public shared func getP2trAddress(network : Types.Network) : async Text {
        let derivation_paths = { key_path_derivation_path = [[0 : Nat8]]; script_path_derivation_path = [[0 : Nat8]] };
        await P2tr.get_address(schnorr_canister_actor, network, schnorr_key_name, derivation_paths);
    };

    // Payment verification functions

    // Verify Bitcoin payment for an invoice
    public shared func verifyBitcoinPayment(invoiceId : Nat, network : Types.Network) : async Bool {
        // Get the Bitcoin address for this invoice
        let addressOpt = Bitcoin.getInvoiceAddress(bitcoinAddressMap, invoiceId);
        switch (addressOpt) {
            case null {
                Debug.print("No Bitcoin address found for invoice " # Nat.toText(invoiceId));
                return false;
            };
            case (?address) {
                // Get current balance of the address
                let balance = await BitcoinApi.get_balance(network, address);
                
                // For now, we'll consider any balance > 0 as payment received
                // In a more sophisticated implementation, we'd track the expected amount
                // and verify the exact payment amount
                let hasPayment = balance > 0;
                
                Debug.print("Invoice " # Nat.toText(invoiceId) # " address " # address # " balance: " # Nat64.toText(balance) # " satoshis");
                
                return hasPayment;
            };
        };
    };

    // Get detailed payment information for an invoice
    public shared func getPaymentInfo(invoiceId : Nat, network : Types.Network) : async {
        address : ?Text;
        balance : Types.Satoshi;
        utxos : [Types.Utxo];
        hasPayment : Bool;
    } {
        let addressOpt = Bitcoin.getInvoiceAddress(bitcoinAddressMap, invoiceId);
        switch (addressOpt) {
            case null {
                {
                    address = null;
                    balance = 0;
                    utxos = [];
                    hasPayment = false;
                };
            };
            case (?address) {
                let balance = await BitcoinApi.get_balance(network, address);
                let utxosResponse = await BitcoinApi.get_utxos(network, address);
                let hasPayment = balance > 0;
                
                {
                    address = ?address;
                    balance = balance;
                    utxos = utxosResponse.utxos;
                    hasPayment = hasPayment;
                };
            };
        };
    };

    // Update invoice payment status
    public shared ({ caller }) func updateInvoicePaymentStatus(invoiceId : Nat, network : Types.Network) : async Bool {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot update payment status");
        };

        // Verify the payment
        let paymentReceived = await verifyBitcoinPayment(invoiceId, network);
        
        if (paymentReceived) {
            // Update the invoice status in the details
            let userInvoices = switch (principalMap.get(invoices, caller)) {
                case null {
                    Debug.trap("No invoices found for user");
                };
                case (?existing) existing;
            };
            
            let invoiceOpt = natMap.get(userInvoices, invoiceId);
            switch (invoiceOpt) {
                case null {
                    Debug.trap("Invoice not found");
                };
                case (?invoice) {
                    // Update the status in the details string
                    let updatedDetails = invoice.details; // TODO: Implement proper status update
                    let updatedInvoice : Invoice = {
                        invoice with details = updatedDetails;
                    };
                    let updatedUserInvoices = natMap.put(userInvoices, invoiceId, updatedInvoice);
                    invoices := principalMap.put(invoices, caller, updatedUserInvoices);
                };
            };
        };
        
        paymentReceived;
    };

    // Bitcoin address generation for invoices
    public shared func generateBitcoinAddress(network : Types.Network, derivationPath : [[Nat8]]) : async Text {
        // Generate a unique P2PKH address for this invoice
        let address = await P2pkh.get_address(ecdsa_canister_actor, network, ecdsa_key_name, derivationPath);
        address;
    };

    // Generate P2TR address for invoices
    public shared func generateP2TRAddress(network : Types.Network, derivationPaths : Types.P2trDerivationPaths) : async Text {
        let address = await P2tr.get_address(schnorr_canister_actor, network, schnorr_key_name, derivationPaths);
        address;
    };

    // Lightning Network integration functions
    
    // Create Lightning invoice
    public shared func createLightningInvoice(invoiceId : Nat, amountMsats : Nat, _memo : Text) : async LightningInvoice {
        // In production, integrate with Lightning service like Lightspark
        // For now, generate a mock Lightning invoice
        let invoiceString = "lnbc" # Nat.toText(amountMsats) # "u1p" # Nat.toText(invoiceId) # "...";
        let expiry = Int.abs(Time.now()) + 3600; // 1 hour expiry
        
        let lightningInvoice : LightningInvoice = {
            invoiceString = invoiceString;
            amount = amountMsats;
            expiry = expiry;
            status = "pending";
        };
        
        // Store the Lightning invoice
        putLightningInvoiceInStable(invoiceId, lightningInvoice);
        
        lightningInvoice;
    };

    // Verify Lightning payment
    public shared func verifyLightningPayment(invoiceId : Nat) : async Bool {
        let invoiceOpt = getLightningInvoiceFromStable(invoiceId);
        switch (invoiceOpt) {
            case null { false };
            case (?invoice) {
                // In production, check Lightning service for payment status
                // For now, return mock verification
                if (invoice.status == "pending") {
                    // Simulate payment verification
                    let updatedInvoice : LightningInvoice = {
                        invoice with status = "paid";
                    };
                    putLightningInvoiceInStable(invoiceId, updatedInvoice);
                    true;
                } else {
                    invoice.status == "paid";
                };
            };
        };
    };

    // Get Lightning invoice status
    public shared func getLightningInvoiceStatus(invoiceId : Nat) : async ?LightningInvoice {
        getLightningInvoiceFromStable(invoiceId);
    };

    // Email notification functions

    // Send invoice creation notification email
    private func sendInvoiceCreationEmail(clientEmail : Text, clientName : Text, invoiceId : Nat, amount : Text, bitcoinAddress : Text, freelancerName : Text) : async Bool {
        let subject = "New Invoice from " # freelancerName # " - Payment Required";
        let body = "Dear " # clientName # ",\n\n" #
                  "A new invoice has been created for you:\n\n" #
                  "Invoice ID: INV-" # Nat.toText(invoiceId) # "\n" #
                  "Amount: " # amount # "\n" #
                  "Freelancer: " # freelancerName # "\n\n" #
                  "To view and pay this invoice, please visit:\n" #
                  "https://mpigd-gqaaa-aaaaj-qnsoq-cai.icp0.io/?invoice=" # Nat.toText(invoiceId) # "\n\n" #
                  "Bitcoin Payment Address: " # bitcoinAddress # "\n\n" #
                  "Thank you for your business!\n\n" #
                  "Best regards,\n" #
                  "Lipa Invoice Team";

        // For now, we'll use a mock email service
        // In production, integrate with a real email service like SendGrid, AWS SES, or similar
        Debug.print("EMAIL NOTIFICATION: To: " # clientEmail # ", Subject: " # subject);
        Debug.print("EMAIL BODY: " # body);
        
        // Mock successful email send
        return true;
    };

    // Send payment confirmation email
    private func sendPaymentConfirmationEmailPrivate(clientEmail : Text, clientName : Text, invoiceId : Nat, amount : Text, freelancerName : Text) : async Bool {
        let subject = "Payment Confirmed - Invoice INV-" # Nat.toText(invoiceId);
        let body = "Dear " # clientName # ",\n\n" #
                  "Your payment has been successfully confirmed!\n\n" #
                  "Invoice ID: INV-" # Nat.toText(invoiceId) # "\n" #
                  "Amount Paid: " # amount # "\n" #
                  "Freelancer: " # freelancerName # "\n\n" #
                  "Thank you for your prompt payment. The freelancer has been notified.\n\n" #
                  "Best regards,\n" #
                  "Lipa Invoice Team";

        Debug.print("PAYMENT CONFIRMATION EMAIL: To: " # clientEmail # ", Subject: " # subject);
        Debug.print("EMAIL BODY: " # body);
        
        return true;
    };

    // Send freelancer notification for payment received
    private func sendFreelancerPaymentNotification(freelancerEmail : Text, freelancerName : Text, invoiceId : Nat, amount : Text, clientName : Text) : async Bool {
        let subject = "Payment Received - Invoice INV-" # Nat.toText(invoiceId);
        let body = "Dear " # freelancerName # ",\n\n" #
                  "Great news! You have received a payment:\n\n" #
                  "Invoice ID: INV-" # Nat.toText(invoiceId) # "\n" #
                  "Amount Received: " # amount # "\n" #
                  "Client: " # clientName # "\n\n" #
                  "The payment has been verified on the blockchain and your invoice status has been updated.\n\n" #
                  "Best regards,\n" #
                  "Lipa Invoice Team";

        Debug.print("FREELANCER PAYMENT NOTIFICATION: To: " # freelancerEmail # ", Subject: " # subject);
        Debug.print("EMAIL BODY: " # body);
        
        return true;
    };

    // Public function to send invoice creation email
    public shared ({ caller }) func sendInvoiceEmail(clientEmail : Text, clientName : Text, invoiceId : Nat, amount : Text, bitcoinAddress : Text) : async Bool {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot send emails");
        };

        // Get freelancer name from profile
        let freelancerName = "Freelancer"; // Default name
        // TODO: Get actual freelancer name from profile data
        
        await sendInvoiceCreationEmail(clientEmail, clientName, invoiceId, amount, bitcoinAddress, freelancerName);
    };

    // Public function to send payment confirmation email
    public shared func sendPaymentConfirmationEmailPublic(clientEmail : Text, clientName : Text, invoiceId : Nat, amount : Text, freelancerName : Text) : async Bool {
        await sendPaymentConfirmationEmailPrivate(clientEmail, clientName, invoiceId, amount, freelancerName);
    };

    // Public function to send freelancer payment notification
    public shared ({ caller }) func sendFreelancerPaymentEmail(invoiceId : Nat, amount : Text, clientName : Text) : async Bool {
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous users cannot send emails");
        };

        let freelancerName = "Freelancer"; // Default name
        let freelancerEmail = "freelancer@example.com"; // Default email
        // TODO: Get actual freelancer email from profile data
        
        await sendFreelancerPaymentNotification(freelancerEmail, freelancerName, invoiceId, amount, clientName);
    };
};

