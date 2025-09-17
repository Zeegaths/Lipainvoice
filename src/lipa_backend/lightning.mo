// Lightning Network Canister for ICP
// File: src/lipa_backend/lightning.mo

import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

persistent actor LightningBackend {
  
  // Types for Lightning Network
  public type Result<T, E> = Result.Result<T, E>;
  
  public type LightningWallet = {
    principal: Principal;
    lightning_address: Text;
    node_pubkey: Text;
    balance_sats: Nat64;
    created_at: Int;
  };
  
  public type LightningInvoice = {
    id: Text;
    payment_request: Text;
    payment_hash: Text;
    amount_msat: Nat64;
    description: Text;
    expires_at: Int;
    status: InvoiceStatus;
    created_at: Int;
  };
  
  public type InvoiceStatus = {
    #pending;
    #paid;
    #expired;
  };
  
  public type PaymentResult = {
    success: Bool;
    payment_hash: Text;
    amount_paid_msat: Nat64;
    fee_msat: Nat64;
  };

  // Error types
  public type LightningError = {
    #WalletNotFound;
    #InvoiceNotFound;
    #PaymentFailed;
    #InsufficientBalance;
    #InvalidAmount;
    #Unauthorized;
    #NetworkError: Text;
  };

  // Storage
  private stable var walletEntries: [(Principal, LightningWallet)] = [];
  private stable var invoiceEntries: [(Text, LightningInvoice)] = [];
  private stable var nextInvoiceId: Nat64 = 1;
  
  private transient var wallets = HashMap.HashMap<Principal, LightningWallet>(10, Principal.equal, Principal.hash);
  private transient var invoices = HashMap.HashMap<Text, LightningInvoice>(100, Text.equal, Text.hash);
  
  // Lightning Network configuration
  private let LIGHTNING_DOMAIN = "lipa-invoice.icp";
  private let NETWORK = "mainnet"; // or "testnet"
  
  // System upgrade hooks
  system func preupgrade() {
    walletEntries := Iter.toArray(wallets.entries());
    invoiceEntries := Iter.toArray(invoices.entries());
  };
  
  system func postupgrade() {
    wallets := HashMap.fromIter<Principal, LightningWallet>(
      walletEntries.vals(), walletEntries.size(), Principal.equal, Principal.hash
    );
    invoices := HashMap.fromIter<Text, LightningInvoice>(
      invoiceEntries.vals(), invoiceEntries.size(), Text.equal, Text.hash
    );
    walletEntries := [];
    invoiceEntries := [];
  };

  // Utility functions
  private func generateInvoiceId(): Text {
    let id = nextInvoiceId;
    nextInvoiceId += 1;
    "ln_" # Nat64.toText(id) # "_" # Int.toText(Time.now());
  };
  
  private func generatePaymentHash(): Text {
    // In production, this should use proper cryptographic hash
    let timestamp = Int.toText(Time.now());
    let random = Int.toText(Time.now() % 1000000);
    timestamp # random;
  };

  

private func generateLightningAddress(principal: Principal): Text {
  let principalText = Principal.toText(principal);
  
  // Simple approach: use a hash of the principal
  let principalSize = Text.size(principalText);
  let shortId = if (principalSize > 8) {
    // Use first few characters before any dashes
    switch (Text.split(principalText, #char '-').next()) {
      case (?part) {
        if (Text.size(part) > 6) "user" # Int.toText(principalSize)
        else part;
      };
      case null "user";
    };
  } else {
    principalText;
  };
  
  shortId # "@lipa.invoice";
};

private func generateNodePubkey(): Text {
  let actorPrincipal = Principal.toText(Principal.fromActor(LightningBackend));
  "03" # actorPrincipal;
};

private func generateSimplePaymentRequest(
  amount_msat: Nat64,
  description: Text,
  payment_hash: Text
): Text {
  let prefix = if (NETWORK == "mainnet") "lnbc" else "lntb";
  let amount_sats = amount_msat / 1000;
  
  // Simple format: prefix + amount + hash
  prefix # Nat64.toText(amount_sats) # "n1p" # payment_hash;
};

  // Wallet Management Functions
  public shared(msg) func generate_lightning_wallet(): async Result<Text, Text> {
    let caller = msg.caller;
    
    // Check if wallet already exists
    switch (wallets.get(caller)) {
      case (?existing) {
        return #err("Wallet already exists for this principal");
      };
      case null {
        let wallet: LightningWallet = {
          principal = caller;
          lightning_address = generateLightningAddress(caller);
          node_pubkey = generateNodePubkey();
          balance_sats = 0;
          created_at = Time.now();
        };
        
        wallets.put(caller, wallet);
        #ok("Lightning wallet created successfully");
      };
    };
  };
  
  public query(msg) func get_wallet(): async ?LightningWallet {
    let caller = msg.caller;
    wallets.get(caller);
  };
  
  public query(msg) func get_wallet_balance(): async Nat64 {
    let caller = msg.caller;
    switch (wallets.get(caller)) {
      case (?wallet) { wallet.balance_sats };
      case null { 0 };
    };
  };

  // Invoice Management Functions
 public shared(msg) func create_lightning_invoice(
  amount_msat: Nat64,
  description: Text,
  expiry_seconds: Nat64
): async Result<Text, Text> {
  let caller = msg.caller;
  
  // Verify wallet exists
  switch (wallets.get(caller)) {
    case null {
      return #err("No wallet found. Please create a wallet first.");
    };
    case (?wallet) {
      if (amount_msat == 0) {
        return #err("Amount must be greater than 0");
      };
      
      let invoiceId = generateInvoiceId();
      let paymentHash = generatePaymentHash();
      let now = Time.now();
      let expirySecondsInt = Int.abs(Nat64.toNat(expiry_seconds));
      let expiresAt = now + (expirySecondsInt * 1_000_000_000);
      
      // Use the fixed payment request generation
      let paymentRequest = generateSimplePaymentRequest(amount_msat, description, paymentHash);
      
      let invoice: LightningInvoice = {
        id = invoiceId;
        payment_request = paymentRequest;
        payment_hash = paymentHash;
        amount_msat = amount_msat;
        description = description;
        expires_at = expiresAt;
        status = #pending;
        created_at = now;
      };
      
      invoices.put(invoiceId, invoice);
      
      // Return invoice data as JSON string that matches frontend expectations
      let invoiceJson = "{" #
        "\"id\":\"" # invoiceId # "\"," #
        "\"payment_request\":\"" # paymentRequest # "\"," #
        "\"payment_hash\":\"" # paymentHash # "\"," #
        "\"amount_msat\":" # Nat64.toText(amount_msat) # "," #
        "\"description\":\"" # description # "\"," #
        "\"expires_at\":" # Int.toText(expiresAt) # "," #
        "\"status\":\"pending\"," #
        "\"created_at\":" # Int.toText(now) #
      "}";
      
      #ok(invoiceJson);
    };
  };
}; 
 
  
  public query func get_invoice(invoice_id: Text): async ?LightningInvoice {
    invoices.get(invoice_id);
  };
  
  public query func check_payment_status(payment_hash: Text): async Text {
    // Find invoice by payment hash
    for ((id, invoice) in invoices.entries()) {
      if (invoice.payment_hash == payment_hash) {
        return switch (invoice.status) {
          case (#pending) { "pending" };
          case (#paid) { "paid" };
          case (#expired) { "expired" };
        };
      };
    };
    "not_found";
  };
  
  public query(msg) func list_invoices(): async [LightningInvoice] {
    let caller = msg.caller;
    let userInvoices = Array.filter<LightningInvoice>(
      Iter.toArray(invoices.vals()),
      func(invoice) {
        // Find the wallet that created this invoice
        switch (wallets.get(caller)) {
          case (?wallet) { true };
          case null { false };
        };
      }
    );
    userInvoices;
  };

  // Payment Processing Functions
  public shared(msg) func process_payment(
    payment_request: Text,
    payment_hash: Text
  ): async Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify wallet exists
    switch (wallets.get(caller)) {
      case null {
        #err("No wallet found");
      };
      case (?wallet) {
        // Find the invoice
        var foundInvoice: ?LightningInvoice = null;
        var invoiceId: Text = "";
        
        for ((id, invoice) in invoices.entries()) {
          if (invoice.payment_hash == payment_hash) {
            foundInvoice := ?invoice;
            invoiceId := id;
          };
        };
        
        switch (foundInvoice) {
          case null {
            #err("Invoice not found");
          };
          case (?invoice) {
            if (invoice.status != #pending) {
              return #err("Invoice already processed or expired");
            };
            
            let now = Time.now();
            if (now > invoice.expires_at) {
              // Mark as expired
              let expiredInvoice = {
                invoice with status = #expired;
              };
              invoices.put(invoiceId, expiredInvoice);
              return #err("Invoice has expired");
            };
            
            // Process the payment (mock for demo)
            let paidInvoice = {
              invoice with status = #paid;
            };
            invoices.put(invoiceId, paidInvoice);
            
            // Update wallet balance
            let updatedWallet = {
              wallet with 
              balance_sats = wallet.balance_sats + (invoice.amount_msat / 1000);
            };
            wallets.put(caller, updatedWallet);
            
            #ok("Payment processed successfully");
          };
        };
      };
    };
  };

  // Administrative functions
  public query func get_stats(): async {
    total_wallets: Nat;
    total_invoices: Nat;
    total_volume_msat: Nat64;
  } {
    let totalVolume = Array.foldLeft<LightningInvoice, Nat64>(
      Iter.toArray(invoices.vals()),
      0,
      func(acc, invoice) {
        if (invoice.status == #paid) {
          acc + invoice.amount_msat;
        } else {
          acc;
        };
      }
    );
    
    {
      total_wallets = wallets.size();
      total_invoices = invoices.size();
      total_volume_msat = totalVolume;
    };
  };

  // Cleanup expired invoices
  public func cleanup_expired_invoices(): async Nat {
    let now = Time.now();
    var cleaned = 0;
    
    let expiredInvoices = Array.filter<(Text, LightningInvoice)>(
      Iter.toArray(invoices.entries()),
      func((id, invoice)) {
        now > invoice.expires_at and invoice.status == #pending;
      }
    );
    
    for ((id, invoice) in expiredInvoices.vals()) {
      let expiredInvoice = {
        invoice with status = #expired;
      };
      invoices.put(id, expiredInvoice);
      cleaned += 1;
    };
    
    cleaned;
  };

  // Health check
  public query func health_check(): async {
    status: Text;
    timestamp: Int;
    canister_id: Text;
  } {
    {
      status = "healthy";
      timestamp = Time.now();
      canister_id = Principal.toText(Principal.fromActor(LightningBackend));
    };
  };
}