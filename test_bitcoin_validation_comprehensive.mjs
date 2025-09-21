#!/usr/bin/env node

// Comprehensive Bitcoin address validation test
// This script tests the actual canister functions

import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "./src/declarations/lipa_backend/lipa_backend.did.js";

// Configuration
const CANISTER_ID = "rrkah-fqaaa-aaaah-qcaiq-cai"; // Replace with your actual canister ID
const LOCAL_AGENT_OPTIONS = {
    host: "http://127.0.0.1:4943"
};

// Test addresses - real Bitcoin addresses for testing
const testAddresses = {
    valid: [
        // P2PKH (Legacy) addresses
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", type: "P2PKH Mainnet", note: "Genesis block address" },
        { address: "mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef", type: "P2PKH Testnet", note: "Testnet example" },
        
        // P2SH addresses
        { address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", type: "P2SH Mainnet", note: "Example P2SH" },
        { address: "2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc", type: "P2SH Testnet", note: "Testnet P2SH" },
        
        // Bech32 (Native SegWit) addresses
        { address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", type: "Bech32 Mainnet", note: "Native SegWit" },
        { address: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx", type: "Bech32 Testnet", note: "Testnet Native SegWit" },
        
        // Bech32m (Taproot) addresses
        { address: "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr", type: "Bech32m Mainnet", note: "Taproot address" },
        { address: "tb1pqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesf3hn0c", type: "Bech32m Testnet", note: "Testnet Taproot" }
    ],
    invalid: [
        // Invalid formats
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN", type: "Too Short", note: "Missing characters" },
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa123456789", type: "Too Long", note: "Extra characters" },
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN0", type: "Invalid Base58", note: "Contains '0'" },
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNO", type: "Invalid Base58", note: "Contains 'O'" },
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNI", type: "Invalid Base58", note: "Contains 'I'" },
        { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNl", type: "Invalid Base58", note: "Contains 'l'" },
        
        // Invalid Bech32
        { address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5", type: "Invalid Bech32", note: "Wrong checksum" },
        { address: "ac1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", type: "Invalid Bech32", note: "Wrong prefix" },
        { address: "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4", type: "Invalid Bech32", note: "Mixed case" },
        
        // Edge cases
        { address: "", type: "Empty", note: "Empty string" },
        { address: " 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa ", type: "Whitespace", note: "Leading/trailing spaces" },
        { address: "4A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", type: "Wrong Prefix", note: "Invalid first character" },
    ]
};

async function createCanisterActor() {
    const agent = new HttpAgent(LOCAL_AGENT_OPTIONS);
    await agent.fetchRootKey(); // Only for local development
    return Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });
}

async function testValidation(address, expectedResult, description) {
    try {
        const actor = await createCanisterActor();
        const result = await actor.validateBitcoinAddress(address);
        const passed = result === expectedResult;
        
        console.log(`Testing: ${description}`);
        console.log(`Address: ${address}`);
        console.log(`Expected: ${expectedResult ? 'VALID' : 'INVALID'}`);
        console.log(`Actual: ${result ? 'VALID' : 'INVALID'}`);
        console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
        console.log('---');
        
        return passed;
    } catch (error) {
        console.log(`Testing: ${description}`);
        console.log(`Address: ${address}`);
        console.log(`Expected: ${expectedResult ? 'VALID' : 'INVALID'}`);
        console.log(`Result: ❌ ERROR - ${error.message}`);
        console.log('---');
        return false;
    }
}

async function runTests() {
    console.log("🧪 Comprehensive Bitcoin Address Validation Test");
    console.log("===============================================\n");
    
    console.log("Testing VALID addresses:");
    console.log("=======================\n");
    
    let validPassed = 0;
    let validTotal = testAddresses.valid.length;
    
    for (const testCase of testAddresses.valid) {
        if (await testValidation(testCase.address, true, `${testCase.type} - ${testCase.note}`)) {
            validPassed++;
        }
    }
    
    console.log("\nTesting INVALID addresses:");
    console.log("=========================\n");
    
    let invalidPassed = 0;
    let invalidTotal = testAddresses.invalid.length;
    
    for (const testCase of testAddresses.invalid) {
        if (await testValidation(testCase.address, false, `${testCase.type} - ${testCase.note}`)) {
            invalidPassed++;
        }
    }
    
    console.log("\n📊 Test Results Summary:");
    console.log("========================");
    console.log(`Valid addresses: ${validPassed}/${validTotal} passed`);
    console.log(`Invalid addresses: ${invalidPassed}/${invalidTotal} passed`);
    console.log(`Total: ${validPassed + invalidPassed}/${validTotal + invalidTotal} passed`);
    
    const overallSuccess = (validPassed + invalidPassed) === (validTotal + invalidTotal);
    console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
        console.log("\n🎉 Bitcoin address validation is working correctly!");
        console.log("✅ All address formats are properly validated");
        console.log("✅ P2PKH, P2SH, Bech32, and Bech32m addresses are supported");
        console.log("✅ Invalid addresses are properly rejected");
    } else {
        console.log("\n⚠️  Some tests failed. Please review the validation logic.");
    }
}

// Run the tests
runTests().catch(console.error);
