import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Char "mo:base/Char";

module {

    // Bitcoin address validation and utilities
    public type BitcoinAddress = Text;

    // Invoice-Address mapping storage
    public type InvoiceAddressMap = [(Nat, BitcoinAddress)];

    // Simple Bitcoin address validation (basic format check)
    public func validateBitcoinAddress(address : Text) : Bool {
        // Basic validation for bech32 addresses (Native SegWit)
        if (Text.size(address) < 14 or Text.size(address) > 90) {
            return false;
        };

        // Convert to char array for easier manipulation
        let chars = Iter.toArray(Text.toIter(address));
        
        // Check if it starts with "bc1" for mainnet or "tb1" for testnet
        if (chars.size() < 3) return false;
        
        let firstThree = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(3, func(i) = chars[i])));
        if (firstThree != "bc1" and firstThree != "tb1") {
            return false;
        };

        // Check for valid characters in bech32 address (basic check)
        let validChars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
        
        // Skip the first 3 characters (prefix)
        for (i in Iter.range(3, chars.size() - 1)) {
            let char = chars[i];
            if (not Text.contains(validChars, #char char)) {
                return false;
            };
        };

        // Additional validation could be added here for checksum verification
        // For now, we'll rely on the frontend's more comprehensive validation
        return true;
    };

    // Simple functions for Bitcoin address management
    public func addInvoiceAddress(invoiceAddressMap : InvoiceAddressMap, invoiceId : Nat, address : BitcoinAddress) : InvoiceAddressMap {
        if (validateBitcoinAddress(address)) {
            // Check if invoice ID already exists
            for ((id, _) in invoiceAddressMap.vals()) {
                if (id == invoiceId) {
                    Debug.trap("Invoice ID already exists in Bitcoin address map");
                };
            };
            // Add new mapping
            Array.append<(Nat, BitcoinAddress)>(invoiceAddressMap, [(invoiceId, address)]);
        } else {
            Debug.trap("Invalid Bitcoin address format");
        };
    };

    public func getInvoiceAddress(invoiceAddressMap : InvoiceAddressMap, invoiceId : Nat) : ?BitcoinAddress {
        for ((id, address) in invoiceAddressMap.vals()) {
            if (id == invoiceId) {
                return ?address;
            };
        };
        null;
    };

    public func isAddressUsed(invoiceAddressMap : InvoiceAddressMap, address : BitcoinAddress) : Bool {
        for ((_, storedAddress) in invoiceAddressMap.vals()) {
            if (storedAddress == address) {
                return true;
            };
        };
        return false;
    };

    public func getAllMappings(invoiceAddressMap : InvoiceAddressMap) : [(Nat, BitcoinAddress)] {
        invoiceAddressMap;
    };

    public func removeInvoiceAddress(invoiceAddressMap : InvoiceAddressMap, invoiceId : Nat) : InvoiceAddressMap {
        Array.filter<(Nat, BitcoinAddress)>(invoiceAddressMap, func((id, _)) = id != invoiceId);
    };

    // Bitcoin network types
    public type BitcoinNetwork = {
        #mainnet;
        #testnet;
    };

    // Convert network to string
    public func networkToString(network : BitcoinNetwork) : Text {
        switch (network) {
            case (#mainnet) "mainnet";
            case (#testnet) "testnet";
        };
    };

    // Get expected address prefix for network
    public func getExpectedPrefix(network : BitcoinNetwork) : Text {
        switch (network) {
            case (#mainnet) "bc1";
            case (#testnet) "tb1";
        };
    };

    // Validate address against specific network
    public func validateAddressForNetwork(address : Text, network : BitcoinNetwork) : Bool {
        let expectedPrefix = getExpectedPrefix(network);
        
        // Convert to char array for prefix check
        let chars = Iter.toArray(Text.toIter(address));
        if (chars.size() < Text.size(expectedPrefix)) return false;
        
        let actualPrefix = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(Text.size(expectedPrefix), func(i) = chars[i])));
        
        if (actualPrefix != expectedPrefix) {
            return false;
        };
        
        validateBitcoinAddress(address);
    };


};
