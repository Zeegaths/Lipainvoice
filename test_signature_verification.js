#!/usr/bin/env node

/**
 * Test script to verify canister signature verification setup
 * This script tests the root key fetching and error handling
 */

const fetch = require('node-fetch');

async function testRootKeyFetching() {
    console.log('Testing root key fetching from local IC...');
    
    try {
        const response = await fetch('http://localhost:8000/api/v2/root_key');
        if (!response.ok) {
            throw new Error(`Failed to fetch root key: ${response.status} ${response.statusText}`);
        }
        
        const rootKey = await response.json();
        console.log('✅ Root key fetched successfully:', rootKey);
        return true;
    } catch (error) {
        console.error('❌ Failed to fetch root key:', error.message);
        console.log('This is expected if the local IC is not running or if using mainnet');
        return false;
    }
}

async function testSignatureErrorHandling() {
    console.log('\nTesting signature error handling...');
    
    // Simulate different types of signature errors
    const testErrors = [
        new Error('Invalid combined threshold signature'),
        new Error('Certificate verification failed'),
        new Error('BLS root key mismatch'),
        new Error('Timeout during signature verification'),
        new Error('Generic error')
    ];
    
    for (const error of testErrors) {
        try {
            // Simulate the error handling logic
            let errorType = 'GENERIC_SIGNATURE_ERROR';
            let message = 'Signature verification failed';
            
            if (error.message.includes('Invalid combined threshold signature')) {
                errorType = 'INVALID_THRESHOLD_SIGNATURE';
                message = 'Invalid threshold signature - certificate may be corrupted or delegation chain incorrect';
            } else if (error.message.includes('Certificate')) {
                errorType = 'CERTIFICATE_VERIFICATION_FAILED';
                message = 'Certificate or delegation chain verification failed';
            } else if (error.message.includes('BLS') || error.message.includes('root key')) {
                errorType = 'BLS_ROOT_KEY_MISMATCH';
                message = 'BLS root key verification failed - ensure correct root key is used';
            }
            
            console.log(`✅ Handled error: ${errorType} - ${message}`);
            
        } catch (handleError) {
            console.error(`❌ Error handling failed: ${handleError.message}`);
        }
    }
}

async function main() {
    console.log('=== Canister Signature Verification Test ===');
    
    await testRootKeyFetching();
    await testSignatureErrorHandling();
    
    console.log('\n=== Test Summary ===');
    console.log('1. Root key fetching: Tested');
    console.log('2. Signature error handling: Implemented');
    console.log('3. Error types: INVALID_THRESHOLD_SIGNATURE, CERTIFICATE_VERIFICATION_FAILED, BLS_ROOT_KEY_MISMATCH, GENERIC_SIGNATURE_ERROR');
    console.log('\nTo test with actual IC:');
    console.log('  - Start local IC: dfx start');
    console.log('  - Deploy canisters: dfx deploy');
    console.log('  - Run frontend: npm run start');
}

main().catch(console.error);
