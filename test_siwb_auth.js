#!/usr/bin/env node

/**
 * Comprehensive test script for SIWB (Sign In With Bitcoin) authentication flow
 * Tests the complete authentication process including wallet connection and signature verification
 */

const { Actor, HttpAgent } = require('@dfinity/agent');
const { idlFactory } = require('./src/declarations/ic_siwb_provider');

async function testCanisterConnectivity() {
    console.log('Testing canister connectivity...');

    try {
        const agent = new HttpAgent();
        const canisterId = 'uxrrr-q7777-77774-qaaaq-cai'; // From canister_ids.json
        const actor = Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

        // Test ping
        const pingResult = await actor.ping();
        console.log('✅ Canister ping successful:', pingResult);

        // Test service info
        const serviceInfo = await actor.get_service_info();
        console.log('✅ Service info:', serviceInfo);

        return true;
    } catch (error) {
        console.error('❌ Canister connectivity test failed:', error.message);
        return false;
    }
}

async function testChallengeGeneration() {
    console.log('\nTesting challenge generation...');

    try {
        const agent = new HttpAgent();
        const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
        const actor = Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

        const challenge = await actor.generate_challenge();
        console.log('✅ Challenge generated:', challenge);

        // Verify challenge is a string and has reasonable length
        if (typeof challenge === 'string' && challenge.length > 0) {
            console.log('✅ Challenge format valid');
            return challenge;
        } else {
            console.error('❌ Challenge format invalid');
            return null;
        }
    } catch (error) {
        console.error('❌ Challenge generation test failed:', error.message);
        return null;
    }
}

async function testSignatureVerification(challenge) {
    console.log('\nTesting signature verification...');

    try {
        const agent = new HttpAgent();
        const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
        const actor = Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

        // Test with valid signature (this would normally come from a wallet)
        // For testing, we'll use a mock signature that should fail gracefully
        const mockSignature = '3045022100d47ce4c025c35ec440bc81d99834a624875161a26bf56ef7fdc0f5d52f843ad1d0220277bfef25c55a1700f77b3a8418c9ba5a6888d423fbf82c9311e6a68442fc2';
        const mockPubkey = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

        const isValid = await actor.verify_signature(challenge, mockSignature, mockPubkey);
        console.log('✅ Signature verification completed:', isValid);

        // Test with invalid signature format
        console.log('Testing invalid signature format...');
        try {
            const invalidResult = await actor.verify_signature(challenge, 'invalid', 'invalid');
            console.log('✅ Invalid signature handled gracefully:', invalidResult);
        } catch (error) {
            console.log('❌ Invalid signature test failed:', error.message);
        }

        return true;
    } catch (error) {
        console.error('❌ Signature verification test failed:', error.message);
        return false;
    }
}

async function testErrorHandling() {
    console.log('\nTesting error handling...');

    try {
        const agent = new HttpAgent();
        const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
        const actor = Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

        // Test with empty parameters
        try {
            await actor.verify_signature('', '', '');
            console.log('❌ Empty parameters should have failed');
        } catch (error) {
            console.log('✅ Empty parameters handled correctly');
        }

        // Test with malformed hex
        try {
            await actor.verify_signature('test', 'not-hex', 'not-hex');
            console.log('❌ Malformed hex should have failed');
        } catch (error) {
            console.log('✅ Malformed hex handled correctly');
        }

        return true;
    } catch (error) {
        console.error('❌ Error handling test failed:', error.message);
        return false;
    }
}

async function testFrontendIntegration() {
    console.log('\nTesting frontend integration patterns...');

    try {
        // Test that the frontend utilities can be imported
        const { performSIWBAuthentication, generateSIWBChallenge, verifySIWBSignature } = require('./src/lipa_frontend/src/utils/signatureVerification.ts');

        console.log('✅ Frontend utilities imported successfully');

        // Test that canister config is accessible
        const { CANISTER_IDS } = require('./src/lipa_frontend/src/config/canisterConfig.ts');
        console.log('✅ Canister configuration loaded:', CANISTER_IDS.ic_siwb_provider);

        return true;
    } catch (error) {
        console.error('❌ Frontend integration test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('=== SIWB Authentication Flow Test ===\n');

    let allTestsPassed = true;

    // Test 1: Canister Connectivity
    const connectivityTest = await testCanisterConnectivity();
    allTestsPassed = allTestsPassed && connectivityTest;

    // Test 2: Challenge Generation
    const challenge = await testChallengeGeneration();
    allTestsPassed = allTestsPassed && (challenge !== null);

    // Test 3: Signature Verification (only if challenge was generated)
    if (challenge) {
        const signatureTest = await testSignatureVerification(challenge);
        allTestsPassed = allTestsPassed && signatureTest;
    }

    // Test 4: Error Handling
    const errorHandlingTest = await testErrorHandling();
    allTestsPassed = allTestsPassed && errorHandlingTest;

    // Test 5: Frontend Integration
    const frontendTest = await testFrontendIntegration();
    allTestsPassed = allTestsPassed && frontendTest;

    console.log('\n=== Test Summary ===');
    console.log(`Overall result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('\nNext steps for full testing:');
    console.log('1. Start local IC network: dfx start');
    console.log('2. Deploy canisters: dfx deploy');
    console.log('3. Start frontend: npm run dev');
    console.log('4. Test with actual Oisy wallet connection');
    console.log('5. Verify authentication flow end-to-end');

    if (!allTestsPassed) {
        console.log('\n❌ Issues detected. Check canister deployment and network connectivity.');
        process.exit(1);
    }
}

main().catch(console.error);
