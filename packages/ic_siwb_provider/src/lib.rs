use candid::{CandidType, Deserialize};
use serde::Serialize;
use k256::ecdsa::{VerifyingKey, Signature, signature::Verifier};
use sha2::{Sha256, Digest};
use hex::FromHex;

// Custom random number generator for IC
use getrandom::{register_custom_getrandom, Error};

fn custom_getrandom(dest: &mut [u8]) -> Result<(), Error> {
    // Use IC's raw_rand for random number generation
    // Note: This is a simplified implementation - in practice you'd want to cache
    // the random bytes and use them as needed
    ic_cdk::println!("Warning: Using synchronous random number generation");
    // For now, we'll use a simple approach with ic_cdk::api::time()
    let time = ic_cdk::api::time();
    for (i, byte) in dest.iter_mut().enumerate() {
        *byte = ((time >> (i * 8)) & 0xFF) as u8;
    }
    Ok(())
}

register_custom_getrandom!(custom_getrandom);

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

    // Hash the message using SHA256
    let mut hasher = Sha256::new();
    hasher.update(message.as_bytes());
    let message_hash = hasher.finalize();

    // Decode signature from hex (expecting 64 bytes for DER-encoded signature)
    let sig_bytes = match Vec::from_hex(&signature_hex) {
        Ok(bytes) => bytes,
        Err(e) => {
            ic_cdk::println!("Failed to decode signature hex: {:?}", e);
            return false;
        }
    };

    // Create signature object
    let signature = match Signature::from_der(&sig_bytes) {
        Ok(sig) => sig,
        Err(e) => {
            ic_cdk::println!("Failed to create signature from DER: {:?}", e);
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

    let verifying_key = match VerifyingKey::from_sec1_bytes(&pubkey_bytes) {
        Ok(key) => key,
        Err(e) => {
            ic_cdk::println!("Failed to create verifying key: {:?}", e);
            return false;
        }
    };

    // Verify the signature
    match verifying_key.verify(&message_hash, &signature) {
        Ok(_) => {
            ic_cdk::println!("Signature verification successful");
            true
        },
        Err(e) => {
            ic_cdk::println!("Signature verification failed: {:?}", e);
            false
        }
    }
}

// Export the Candid interface
ic_cdk::export_candid!();
