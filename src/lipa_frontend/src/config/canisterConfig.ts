import { getEnvironment } from "../utils";

interface CanisterConfig {
  [canisterName: string]: {
    [network: string]: string;
  };
}

const canisterIds: CanisterConfig = {
 ic_siwb_provider: {
    "ic": "vuhp5-qiaaa-aaaan-qz6vq-cai",
    "local": "uxrrr-q7777-77774-qaaaq-cai"
  },
  lipa_backend: {
    "ic": "vba6q-raaaa-aaaan-qz6wa-cai",
    "local": "u6s2n-gx777-77774-qaaba-cai"
  },
  lipa_frontend: {
    "ic": "vgbye-4yaaa-aaaan-qz6wq-cai",
    "local": "uzt4z-lp777-77774-qaabq-cai"
  }
};

export const getCanisterId = (canisterName: string): string => {
  const environment = getEnvironment();
  const network = environment === "development" ? "local" : "ic";
  const canisterConfig = canisterIds[canisterName];

  if (!canisterConfig) {
    throw new Error(`Canister ${canisterName} not found in canister configuration`);
  }

  const canisterId = canisterConfig[network];
  if (!canisterId) {
    throw new Error(`Canister ${canisterName} does not have an ID for network ${network}`);
  }

  return canisterId;
};

export const CANISTER_IDS = {
  lipa_backend: getCanisterId('lipa_backend'),
  ic_siwb_provider: getCanisterId('ic_siwb_provider'),
  lipa_frontend: getCanisterId('lipa_frontend'),
};
