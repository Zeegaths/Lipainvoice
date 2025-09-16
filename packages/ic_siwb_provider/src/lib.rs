use candid::{CandidType, Deserialize};
use serde::Serialize;
use secp256k1::{Secp256k1, Message, PublicKey};
use secp256k1::ecdsa::{RecoverableSignature, RecoveryId};
use sha2::{Sha256, Digest};
use hex::FromHex;

#[derive(CandidType, Deserialize, Serialize)]
pub struct ServiceInfo {
    pub name: String,
    pub version: String,
    pub status: String,
}

#[ic_cdk::query]
fn get_service_info() -> ServiceInfo {
    ServiceInfo {
        name: "ic_siwb_provider".to_string(),
        version: "0.1.0".to_string(),
        status: "operational".to_string(),
    }
}

#[ic_cdk::update]
fn set_status(new_status: String) -> ServiceInfo {
    ServiceInfo {
        name: "ic_siwb_provider".to_string(),
        version: "0.1.0".to_string(),
        status: new_status,
    }
}

#[ic_cdk::query]
fn ping() -> String {
    "pong".to_string()
}

// Generate a random challenge string for SIWB authentication
#[ic_cdk::update]
async fn generate_challenge() -> String {
    let random_bytes = ic_cdk::management_canister::raw_rand().await.unwrap();
    let challenge_bytes = &random_bytes[0..16];
    hex::encode(challenge_bytes)
}

// Verify Bitcoin signature for SIWB authentication
#[ic_cdk::update]
fn verify_signature(message: String, signature_hex: String, pubkey_hex: String) -> bool {
    ic_cdk::println!("Verifying signature for message: {}", message);

    let secp = Secp256k1::new();

    // Hash the message using SHA256
    let mut hasher = Sha256::new();
    hasher.update(message.as_bytes());
    let message_hash = hasher.finalize();

    // Create secp256k1 message object
    let msg = match Message::from_digest_slice(&message_hash) {
        Ok(m) => m,
        Err(e) => {
            ic_cdk::println!("Failed to create message from digest: {:?}", e);
            return false;
        }
    };

    // Decode signature from hex
    let sig_bytes = match Vec::from_hex(&signature_hex) {
        Ok(bytes) => bytes,
        Err(e) => {
            ic_cdk::println!("Failed to decode signature hex: {:?}", e);
            return false;
        }
    };

    // Recoverable signature requires 65 bytes (64 + 1 recovery id)
    if sig_bytes.len() != 65 {
        ic_cdk::println!("Invalid signature length: {}, expected 65", sig_bytes.len());
        return false;
    }

    let recovery_id = match RecoveryId::from_i32(sig_bytes[64] as i32) {
        Ok(id) => id,
        Err(e) => {
            ic_cdk::println!("Invalid recovery ID: {:?}", e);
            return false;
        }
    };

    let rec_sig = match RecoverableSignature::from_compact(&sig_bytes[0..64], recovery_id) {
        Ok(sig) => sig,
        Err(e) => {
            ic_cdk::println!("Failed to create recoverable signature: {:?}", e);
            return false;
        }
    };

    // Recover public key from signature and message
    let recovered_pubkey = match secp.recover_ecdsa(&msg, &rec_sig) {
        Ok(pk) => pk,
        Err(e) => {
            ic_cdk::println!("Failed to recover public key: {:?}", e);
            return false;
        }
    };

    // Decode provided public key from hex
    let pubkey_bytes = match Vec::from_hex(&pubkey_hex) {
        Ok(bytes) => bytes,
        Err(e) => {
            ic_cdk::println!("Failed to decode public key hex: {:?}", e);
            return false;
        }
    };

    let provided_pubkey = match PublicKey::from_slice(&pubkey_bytes) {
        Ok(pk) => pk,
        Err(e) => {
            ic_cdk::println!("Failed to create public key from slice: {:?}", e);
            return false;
        }
    };

    // Compare recovered public key with provided public key
    if recovered_pubkey != provided_pubkey {
        ic_cdk::println!("Public key mismatch: recovered != provided");
        return false;
    }

    ic_cdk::println!("Signature verification successful");
    true
}

// Export the Candid interface
ic_cdk::export_candid!();
