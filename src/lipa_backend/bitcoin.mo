import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Char "mo:base/Char";
// import Result "mo:base/Result"; // Not used in current implementation

// Import Bitcoin validation modules
import P2pkh "mo:bitcoin/bitcoin/P2pkh";
import Segwit "mo:bitcoin/Segwit";
import Base58Check "mo:bitcoin/Base58Check";

module {

    // Bitcoin address validation and utilities
    public type BitcoinAddress = Text;

    // Invoice-Address mapping storage
    public type InvoiceAddressMap = [(Nat, BitcoinAddress)];

    // Comprehensive Bitcoin address validation using proper Bitcoin library modules
    public func validateBitcoinAddress(address : Text) : Bool {
        if (Text.size(address) == 0) return false;

        // Try P2PKH validation first (Legacy addresses starting with 1)
        if (validateP2pkhAddress(address)) {
            return true;
        };

        // Try P2SH validation (addresses starting with 3)
        if (validateP2shAddress(address)) {
            return true;
        };

        // Try Bech32/Bech32m validation (addresses starting with bc1, tb1, bcrt1)
        if (validateBech32Address(address)) {
            return true;
        };

        return false;
    };

    // Validate Bech32/Bech32m addresses for specific network (defined before validateBitcoinAddressForNetwork)
    private func validateBech32AddressForNetwork(address : Text, isMainnet : Bool) : Bool {
        let chars = Iter.toArray(Text.toIter(address));
        
        // Bech32 addresses are typically 42-62 characters
        if (chars.size() < 42 or chars.size() > 62) {
            return false;
        };

        // Check for network-specific prefixes
        if (chars.size() >= 4) {
            let prefix = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(4, func(i) = chars[i])));
            if (isMainnet and (prefix == "bc1q" or prefix == "bc1p")) {
                // Use the Bitcoin library's Segwit decoder for proper validation
                switch (Segwit.decode(address)) {
                    case (#ok _) true;
                    case (#err _) false;
                };
            } else if (not isMainnet and chars.size() >= 5) {
                let prefix5 = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(5, func(i) = chars[i])));
                if (prefix5 == "tb1q" or prefix5 == "tb1p" or prefix5 == "bcrt1") {
                    // Use the Bitcoin library's Segwit decoder for proper validation
                    switch (Segwit.decode(address)) {
                        case (#ok _) true;
                        case (#err _) false;
                    };
                } else {
                    false
                };
            } else {
                false
            };
        } else {
            false
        };
    };

    // Enhanced validation with network specification
    public func validateBitcoinAddressForNetwork(address : Text, network : BitcoinNetwork) : Bool {
        if (Text.size(address) == 0) return false;

        // For mainnet, validate mainnet addresses only
        // For testnet, validate both mainnet and testnet addresses (for compatibility)
        switch (network) {
            case (#mainnet) {
                // Mainnet addresses: P2PKH (1...), P2SH (3...), Bech32 (bc1...)
                validateP2pkhAddress(address) or 
                validateP2shAddress(address) or 
                validateBech32AddressForNetwork(address, true);
            };
            case (#testnet) {
                // Testnet addresses: P2PKH (m..., n...), P2SH (2...), Bech32 (tb1...), Bech32m (tb1p...)
                // Also allow mainnet addresses for compatibility
                validateP2pkhAddress(address) or 
                validateP2shAddress(address) or 
                validateBech32AddressForNetwork(address, false) or
                validateBech32AddressForNetwork(address, true); // Allow mainnet addresses too
            };
        };
    };

    // Validate P2PKH addresses (Legacy addresses starting with 1)
    private func validateP2pkhAddress(address : Text) : Bool {
        let chars = Iter.toArray(Text.toIter(address));
        
        // P2PKH addresses start with '1' and are 26-35 characters
        if (chars.size() < 26 or chars.size() > 35 or chars[0] != '1') {
            return false;
        };

        // Use the Bitcoin library's P2PKH decoder for proper validation
        switch (P2pkh.decodeAddress(address)) {
            case (#ok _) true;
            case (#err _) false;
        };
    };

    // Validate P2SH addresses (addresses starting with 3)
    private func validateP2shAddress(address : Text) : Bool {
        let chars = Iter.toArray(Text.toIter(address));
        
        // P2SH addresses start with '3' and are 26-35 characters
        if (chars.size() < 26 or chars.size() > 35 or chars[0] != '3') {
            return false;
        };

        // Use Base58Check decoding to validate P2SH addresses
        // P2SH addresses have version byte 0x05 for mainnet, 0xc4 for testnet
        switch (Base58Check.decode(address)) {
            case (?decoded) {
                let decodedArray = Iter.toArray(decoded.vals());
                if (decodedArray.size() == 21) { // 1 version byte + 20 hash bytes
                    let versionByte = decodedArray[0];
                    // Valid P2SH version bytes
                    versionByte == 0x05 or versionByte == 0xc4
                } else {
                    false
                };
            };
            case null false;
        };
    };

    // Validate Bech32/Bech32m addresses (addresses starting with bc1, tb1, bcrt1)
    private func validateBech32Address(address : Text) : Bool {
        let chars = Iter.toArray(Text.toIter(address));
        
        // Bech32 addresses are typically 42-62 characters
        if (chars.size() < 42 or chars.size() > 62) {
            return false;
        };

        // Check for valid prefixes
        if (chars.size() >= 4) {
            let prefix = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(4, func(i) = chars[i])));
            if (prefix == "bc1q" or prefix == "bc1p") {
                // Use the Bitcoin library's Segwit decoder for proper validation
                switch (Segwit.decode(address)) {
                    case (#ok _) true;
                    case (#err _) false;
                };
            } else if (chars.size() >= 5) {
                let prefix5 = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(5, func(i) = chars[i])));
                if (prefix5 == "tb1q" or prefix5 == "tb1p" or prefix5 == "bcrt1") {
                    // Use the Bitcoin library's Segwit decoder for proper validation
                    switch (Segwit.decode(address)) {
                        case (#ok _) true;
                        case (#err _) false;
                    };
                } else {
                    false
                };
            } else {
                false
            };
        } else {
            false
        };
    };

    // Simple functions for Bitcoin address management
    public func addInvoiceAddress(invoiceAddressMap : InvoiceAddressMap, invoiceId : Nat, address : BitcoinAddress) : InvoiceAddressMap {
        // Check if invoice ID already exists
        for ((id, _) in invoiceAddressMap.vals()) {
            if (id == invoiceId) {
                Debug.trap("Invoice ID already exists in Bitcoin address map");
            };
        };
        // Add new mapping (no validation - accept any address)
        Array.append<(Nat, BitcoinAddress)>(invoiceAddressMap, [(invoiceId, address)]);
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
        false;
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
        // First validate the address format using comprehensive validation
        if (not validateBitcoinAddress(address)) {
            return false;
        };

        // For mainnet, accept all valid Bitcoin address formats
        // For testnet, only accept testnet Bech32 addresses (tb1)
        if (network == #testnet) {
            let chars = Iter.toArray(Text.toIter(address));
            if (chars.size() < 3) return false;

            let prefix = Text.fromIter(Iter.fromArray(Array.tabulate<Char>(3, func(i) = chars[i])));
            if (prefix != "tb1") {
                return false;
            };
        };

        return true;
    };


};
