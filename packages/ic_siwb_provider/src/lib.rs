use candid::{CandidType, Deserialize};
use serde::Serialize;

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

// Export the Candid interface
ic_cdk::export_candid!();
