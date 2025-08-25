# Enhanced useActor Hook

The `useActor` hook provides a comprehensive way to create and manage authenticated actors for making calls to your Internet Computer canisters. It's designed to work seamlessly with Internet Identity authentication and React Query for state management.

## Features

- **Automatic Authentication**: Automatically creates authenticated actors when the user is logged in
- **Anonymous Actors**: Falls back to anonymous actors when not authenticated
- **Query Invalidation**: Automatically invalidates dependent queries when the actor changes
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Built-in error handling for authentication and actor creation
- **Helper Methods**: Convenient helper methods for making authenticated calls

## Basic Usage

```typescript
import { useActor } from './useActor';

function MyComponent() {
  const { actor, isAuthenticated, isReady, makeAuthenticatedCall } = useActor();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please login to continue</div>;
  }

  // Check if actor is ready
  if (!isReady) {
    return <div>Loading...</div>;
  }

  // Use the actor for authenticated calls
  const handleAddInvoice = async () => {
    try {
      const result = await makeAuthenticatedCall(async (actor) => {
        return actor.addInvoice(1n, "Invoice details", ["sam"]);
      });
      console.log('Invoice added:', result);
    } catch (error) {
      console.error('Failed to add invoice:', error);
    }
  };

  return (
    <button onClick={handleAddInvoice}>
      Add Invoice
    </button>
  );
}
```

## Hook Return Values

The `useActor` hook returns an object with the following properties:

### Core Properties

- **`actor`**: The authenticated actor instance (or null if not ready)
- **`isFetching`**: Boolean indicating if the actor is being fetched
- **`isAuthenticated`**: Boolean indicating if the user is authenticated
- **`identity`**: The Internet Identity instance (or null if not authenticated)
- **`principal`**: The user's principal ID as a string (or null if not authenticated)

### Helper Properties

- **`isReady`**: Boolean indicating if the actor is ready for authenticated calls
- **`makeAuthenticatedCall`**: Helper function for making authenticated calls with error handling

## Making Authenticated Calls

### Method 1: Using makeAuthenticatedCall Helper

```typescript
const { makeAuthenticatedCall } = useActor();

const handleOperation = async () => {
  try {
    const result = await makeAuthenticatedCall(async (actor) => {
      // Your authenticated call here
      return actor.addInvoice(1n, "Details", ["sam"]);
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Method 2: Direct Actor Usage

```typescript
const { actor, isReady } = useActor();

const handleOperation = async () => {
  if (!isReady || !actor) {
    throw new Error('Actor not ready');
  }

  try {
    const result = await actor.addInvoice(1n, "Details", ["sam"]);
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Integration with React Query

The hook is designed to work seamlessly with React Query for state management:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAddInvoice() {
  const { makeAuthenticatedCall } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }: { id: bigint; details: string }) => {
      return await makeAuthenticatedCall(async (actor) => {
        return actor.addInvoice(id, details, ["sam"]);
      });
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['invoices', identity?.getPrincipal().toString()] 
      });
    },
  });
}
```

## Error Handling

The hook provides comprehensive error handling:

```typescript
const { makeAuthenticatedCall } = useActor();

const handleOperation = async () => {
  try {
    const result = await makeAuthenticatedCall(async (actor) => {
      return actor.addInvoice(1n, "Details", ["sam"]);
    });
    // Success
  } catch (error) {
    if (error.message === 'Actor not initialized') {
      // Handle actor not ready
    } else if (error.message === 'User not authenticated') {
      // Handle authentication required
    } else {
      // Handle other errors
    }
  }
};
```

## Authentication States

The hook handles different authentication states:

1. **Not Authenticated**: Returns anonymous actor
2. **Authenticating**: Shows loading state
3. **Authenticated**: Returns authenticated actor with user's identity
4. **Error**: Handles authentication errors gracefully

## Best Practices

1. **Always check `isReady`**: Before making authenticated calls
2. **Use `makeAuthenticatedCall`**: For better error handling
3. **Invalidate queries**: After successful mutations
4. **Handle loading states**: Show appropriate UI during authentication
5. **Type your calls**: Use proper TypeScript types for better development experience

## Example: Complete Invoice Management

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useInvoiceManagement() {
  const { makeAuthenticatedCall } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const addInvoice = useMutation({
    mutationFn: async ({ id, details }: { id: bigint; details: string }) => {
      return await makeAuthenticatedCall(async (actor) => {
        return actor.addInvoice(id, details, ["sam"]);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['invoices', identity?.getPrincipal().toString()] 
      });
    },
  });

  const uploadFile = useMutation({
    mutationFn: async ({ 
      invoiceId, 
      fileName, 
      mimeType, 
      chunk, 
      complete 
    }: { 
      invoiceId: bigint; 
      fileName: string; 
      mimeType: string; 
      chunk: Uint8Array; 
      complete: boolean;
    }) => {
      return await makeAuthenticatedCall(async (actor) => {
        return actor.uploadInvoiceFile(invoiceId, fileName, mimeType, chunk, complete);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['invoices', identity?.getPrincipal().toString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['invoice-files'] 
      });
    },
  });

  return {
    addInvoice,
    uploadFile,
  };
}
```

## Troubleshooting

### Common Issues

1. **"Actor not initialized"**: Check if `isReady` is true before making calls
2. **"User not authenticated"**: Ensure user is logged in with Internet Identity
3. **Query not updating**: Make sure to invalidate queries after mutations
4. **Type errors**: Ensure proper TypeScript types are imported

### Debug Tips

- Use `console.log` to check authentication state: `console.log({ isAuthenticated, isReady, actor })`
- Check the browser console for authentication errors
- Verify Internet Identity is properly configured
- Ensure your canister ID is correct in the declarations

## Migration from AuthClient

If you're migrating from a custom AuthClient implementation:

1. Replace `AuthClient.create()` with `useInternetIdentity()`
2. Replace manual actor creation with `useActor()`
3. Use `makeAuthenticatedCall` instead of direct actor calls
4. Update your React Query mutations to use the new pattern

The enhanced `useActor` hook provides a more robust and type-safe way to handle authenticated calls to your Internet Computer canisters. 
