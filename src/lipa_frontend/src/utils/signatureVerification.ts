/**
 * Utility functions for handling canister signature verification errors
 */

export interface SignatureVerificationError extends Error {
  code?: string;
  details?: string;
}

export const handleSignatureError = (error: unknown): SignatureVerificationError => {
  const err = error as Error;
  
  // Check for common signature verification errors
  if (err.message.includes('Invalid combined threshold signature')) {
    return {
      name: 'SignatureVerificationError',
      message: 'Invalid threshold signature - certificate may be corrupted or delegation chain incorrect',
      code: 'INVALID_THRESHOLD_SIGNATURE',
      details: err.message
    };
  }
  
  if (err.message.includes('certificate') || err.message.includes('delegation')) {
    return {
      name: 'SignatureVerificationError',
      message: 'Certificate or delegation chain verification failed',
      code: 'CERTIFICATE_VERIFICATION_FAILED',
      details: err.message
    };
  }
  
  if (err.message.includes('BLS') || err.message.includes('root key')) {
    return {
      name: 'SignatureVerificationError',
      message: 'BLS root key verification failed - ensure correct root key is used',
      code: 'BLS_ROOT_KEY_MISMATCH',
      details: err.message
    };
  }
  
  // Generic error
  return {
    name: 'SignatureVerificationError',
    message: 'Signature verification failed',
    code: 'GENERIC_SIGNATURE_ERROR',
    details: err.message
  };
};

export const logSignatureError = (error: SignatureVerificationError, context: string = '') => {
  console.error(`Signature Verification Error${context ? ` in ${context}` : ''}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date().toISOString()
  });
};

export const shouldRetrySignatureRequest = (error: SignatureVerificationError): boolean => {
  // Retry for timeout or high load issues, but not for permanent errors
  const retryableCodes = ['GENERIC_SIGNATURE_ERROR'];
  const nonRetryableCodes = ['INVALID_THRESHOLD_SIGNATURE', 'CERTIFICATE_VERIFICATION_FAILED', 'BLS_ROOT_KEY_MISMATCH'];
  
  if (nonRetryableCodes.includes(error.code || '')) {
    return false;
  }
  
  // Check if error suggests timeout or temporary issue
  if (error.details?.includes('timeout') || error.details?.includes('load')) {
    return true;
  }
  
  return retryableCodes.includes(error.code || '');
};
