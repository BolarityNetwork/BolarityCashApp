/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error object (Error, string, or any)
 * @param t - Optional translation function from react-i18next
 * @returns A user-friendly error message
 */
const getErrorMessage = (
  error: unknown,
  t?: (key: string) => string
): string => {
  let errorMessage = '';
  let errorString = '';

  // Extract error message from various error formats
  if (error instanceof Error) {
    errorString = error.message;
  } else if (typeof error === 'string') {
    errorString = error;
  } else if (error && typeof error === 'object') {
    // Handle RPC error objects
    const errObj = error as any;
    if (errObj.message) {
      errorString = errObj.message;
    } else if (errObj.error?.message) {
      errorString = errObj.error.message;
    } else if (errObj.body) {
      try {
        const body =
          typeof errObj.body === 'string'
            ? JSON.parse(errObj.body)
            : errObj.body;
        if (body.error?.message) {
          errorString = body.error.message;
        }
      } catch {
        // Ignore JSON parse errors
      }
    } else {
      errorString = String(error);
    }
  } else {
    errorString = String(error);
  }

  errorMessage = errorString.toLowerCase();

  // Map common blockchain errors to user-friendly messages
  if (t) {
    // Insufficient funds for gas + value
    if (
      errorMessage.includes('insufficient funds for gas') ||
      errorMessage.includes('insufficient funds') ||
      errorMessage.includes('insufficient balance') ||
      (errorMessage.includes('want') && errorMessage.includes('have'))
    ) {
      return t('errors.insufficientBalance');
    }

    // Gas related errors
    if (
      errorMessage.includes('gas required exceeds allowance') ||
      errorMessage.includes('out of gas') ||
      errorMessage.includes('gas too low')
    ) {
      return t('errors.gasTooHigh');
    }

    // Transaction execution failures
    if (
      errorMessage.includes('execution reverted') ||
      errorMessage.includes('transaction failed') ||
      errorMessage.includes('revert')
    ) {
      return t('errors.transactionFailed');
    }

    // User rejected/cancelled
    if (
      errorMessage.includes('user rejected') ||
      errorMessage.includes('user cancelled') ||
      errorMessage.includes('user denied') ||
      errorMessage.includes('rejected by user')
    ) {
      return t('errors.transactionCancelled');
    }

    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('fetch failed')
    ) {
      return t('errors.networkError');
    }

    // Server/RPC errors
    if (
      errorMessage.includes('server error') ||
      errorMessage.includes('rpc error') ||
      errorMessage.includes('internal error')
    ) {
      return t('errors.serverError');
    }

    // Invalid address
    if (
      errorMessage.includes('invalid address') ||
      errorMessage.includes('invalid recipient')
    ) {
      return t('errors.invalidAddress');
    }

    // Invalid amount
    if (
      errorMessage.includes('invalid amount') ||
      errorMessage.includes('amount too low') ||
      errorMessage.includes('amount too high')
    ) {
      return t('errors.invalidAmount');
    }
  }

  // Fallback: return original error message if no translation function or no match
  return errorString || String(error);
};

export default getErrorMessage;
