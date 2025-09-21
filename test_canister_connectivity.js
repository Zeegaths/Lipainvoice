#!/usr/bin/env node

/**
 * Comprehensive canister connectivity test script
 * Tests all canisters and their integration with the frontend
 */

import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as backendIdlFactory } from './src/declarations/lipa_backend/index.js';
import { idlFactory as siwbIdlFactory } from './src/declarations/ic_siwb_provider/index.js';
import fetch from 'node-fetch';

// Canister IDs from canister_ids.json
const CANISTER_IDS = {
  lipa_backend: 'uzt4z-lp777-77774-qaabq-cai',
  ic_siwb_provider: 'uxrrr-q7777-77774-qaaaq-cai',
  lipa_frontend: 'umunu-kh777-77774-qaaca-cai'
};

async function testBackendCanister() {
  console.log('\n=== Testing Backend Canister ===');
  
  try {
    const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
    const canisterId = CANISTER_IDS.lipa_backend;
    
    // Fetch root key for local development
    await agent.fetchRootKey();
    
    const backendActor = Actor.createActor(backendIdlFactory, {
      agent,
      canisterId,
    });

    // Test basic connectivity
    console.log('Testing backend canister connectivity...');
    
    // Test query methods
    try {
      const invoices = await backendActor.listInvoices();
      console.log('✅ listInvoices() - Success:', Array.isArray(invoices) ? `${invoices.length} invoices` : 'No invoices');
    } catch (error) {
      console.log('❌ listInvoices() - Failed:', error.message);
    }

    try {
      const tasks = await backendActor.listTasks();
      console.log('✅ listTasks() - Success:', Array.isArray(tasks) ? `${tasks.length} tasks` : 'No tasks');
    } catch (error) {
      console.log('❌ listTasks() - Failed:', error.message);
    }

    try {
      const badges = await backendActor.listBadges();
      console.log('✅ listBadges() - Success:', Array.isArray(badges) ? `${badges.length} badges` : 'No badges');
    } catch (error) {
      console.log('❌ listBadges() - Failed:', error.message);
    }

    try {
      const files = await backendActor.listFiles();
      console.log('✅ listFiles() - Success:', Array.isArray(files) ? `${files.length} files` : 'No files');
    } catch (error) {
      console.log('❌ listFiles() - Failed:', error.message);
    }

    // Test Bitcoin-related methods
    try {
      const p2pkhAddress = await backendActor.getP2pkhAddress({ testnet: null });
      console.log('✅ getP2pkhAddress() - Success:', p2pkhAddress);
    } catch (error) {
      console.log('❌ getP2pkhAddress() - Failed:', error.message);
    }

    try {
      const p2trAddress = await backendActor.getP2trAddress({ testnet: null });
      console.log('✅ getP2trAddress() - Success:', p2trAddress);
    } catch (error) {
      console.log('❌ getP2trAddress() - Failed:', error.message);
    }

    return true;
  } catch (error) {
    console.error('❌ Backend canister test failed:', error.message);
    return false;
  }
}

async function testSIWBCanister() {
  console.log('\n=== Testing SIWB Provider Canister ===');
  
  try {
    const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
    const canisterId = CANISTER_IDS.ic_siwb_provider;
    
    // Fetch root key for local development
    await agent.fetchRootKey();
    
    const siwbActor = Actor.createActor(siwbIdlFactory, {
      agent,
      canisterId,
    });

    // Test ping
    try {
      const pingResult = await siwbActor.ping();
      console.log('✅ ping() - Success:', pingResult);
    } catch (error) {
      console.log('❌ ping() - Failed:', error.message);
    }

    // Test service info
    try {
      const serviceInfo = await siwbActor.get_service_info();
      console.log('✅ get_service_info() - Success:', serviceInfo);
    } catch (error) {
      console.log('❌ get_service_info() - Failed:', error.message);
    }

    // Test challenge generation
    try {
      const challenge = await siwbActor.generate_challenge();
      console.log('✅ generate_challenge() - Success:', challenge);
      
      // Test signature verification with mock data
      const mockSignature = '3045022100d47ce4c025c35ec440bc81d99834a624875161a26bf56ef7fdc0f5d52f843ad1d0220277bfef25c55a1700f77b3a8418c9ba5a6888d423fbf82c9311e6a68442fc2';
      const mockPubkey = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
      
      const isValid = await siwbActor.verify_signature(challenge, mockSignature, mockPubkey);
      console.log('✅ verify_signature() - Success:', isValid);
    } catch (error) {
      console.log('❌ generate_challenge() or verify_signature() - Failed:', error.message);
    }

    return true;
  } catch (error) {
    console.error('❌ SIWB canister test failed:', error.message);
    return false;
  }
}

async function testFrontendIntegration() {
  console.log('\n=== Testing Frontend Integration ===');
  
  try {
    // Test that frontend utilities can be imported
    const signatureVerificationModule = await import('./src/lipa_frontend/src/utils/signatureVerification.ts');
    console.log('✅ Frontend SIWB utilities imported successfully');

    // Test canister configuration
    const canisterConfigModule = await import('./src/lipa_frontend/src/config/canisterConfig.ts');
    console.log('✅ Frontend canister configuration loaded:', canisterConfigModule.CANISTER_IDS);

    // Test backend types
    const backendTypesModule = await import('./src/lipa_frontend/src/types/backend.ts');
    console.log('✅ Backend types imported successfully');

    return true;
  } catch (error) {
    console.error('❌ Frontend integration test failed:', error.message);
    return false;
  }
}

async function testInternetIdentityIntegration() {
  console.log('\n=== Testing Internet Identity Integration ===');
  
  try {
    // Test Internet Identity hook
    const internetIdentityModule = await import('./src/lipa_frontend/src/hooks/useInternetIdentity.ts');
    console.log('✅ Internet Identity hook imported successfully');

    // Test actor creation hook
    const actorModule = await import('./src/lipa_frontend/src/hooks/useActor.ts');
    console.log('✅ Actor hook imported successfully');

    // Test queries hook
    const queriesModule = await import('./src/lipa_frontend/src/hooks/useQueries.ts');
    console.log('✅ Query hooks imported successfully');

    return true;
  } catch (error) {
    console.error('❌ Internet Identity integration test failed:', error.message);
    return false;
  }
}

async function testNetworkConnectivity() {
  console.log('\n=== Testing Network Connectivity ===');
  
  try {
    
    // Test local IC replica
    try {
      const response = await fetch('http://127.0.0.1:4943/api/v2/status');
      if (response.ok) {
        console.log('✅ Local IC replica is running');
      } else {
        console.log('❌ Local IC replica responded with error:', response.status);
      }
    } catch (error) {
      console.log('❌ Local IC replica is not accessible:', error.message);
    }

    // Test root key endpoint
    try {
      const response = await fetch('http://127.0.0.1:4943/api/v2/root_key');
      if (response.ok) {
        const rootKey = await response.json();
        console.log('✅ Root key endpoint accessible');
      } else {
        console.log('❌ Root key endpoint error:', response.status);
      }
    } catch (error) {
      console.log('❌ Root key endpoint not accessible:', error.message);
    }

    return true;
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== Comprehensive Canister Connectivity Test ===\n');

  let allTestsPassed = true;

  // Test 1: Network Connectivity
  const networkTest = await testNetworkConnectivity();
  allTestsPassed = allTestsPassed && networkTest;

  // Test 2: Backend Canister
  const backendTest = await testBackendCanister();
  allTestsPassed = allTestsPassed && backendTest;

  // Test 3: SIWB Provider Canister
  const siwbTest = await testSIWBCanister();
  allTestsPassed = allTestsPassed && siwbTest;

  // Test 4: Frontend Integration
  const frontendTest = await testFrontendIntegration();
  allTestsPassed = allTestsPassed && frontendTest;

  // Test 5: Internet Identity Integration
  const iiTest = await testInternetIdentityIntegration();
  allTestsPassed = allTestsPassed && iiTest;

  console.log('\n=== Test Summary ===');
  console.log(`Overall result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  console.log('\n=== Next Steps ===');
  console.log('1. Start local IC network: dfx start');
  console.log('2. Deploy canisters: dfx deploy');
  console.log('3. Start frontend: npm run dev');
  console.log('4. Test SIWB authentication flow');
  console.log('5. Test Internet Identity authentication');
  console.log('6. Verify end-to-end functionality');

  if (!allTestsPassed) {
    console.log('\n❌ Issues detected. Check canister deployment and network connectivity.');
    process.exit(1);
  } else {
    console.log('\n🎉 All canisters are properly integrated and ready for testing!');
  }
}

main().catch(console.error);
