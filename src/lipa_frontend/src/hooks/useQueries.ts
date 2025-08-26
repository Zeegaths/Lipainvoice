import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useActor } from './useActor';
import { useToast } from '../components/ToastContainer';


export function useInvoices() {
  const { showToast } = useToast();
  const actor = useActor();
  const { identity, login } = useInternetIdentity();

  return useQuery<Array<[bigint, any]>, Error>({
    queryKey: ['invoices', identity?.getPrincipal().toString()],
    queryFn: async () => {
      login();
      if (!identity) {
        showToast({
          title: "Error fetching invoices",
          message: "No authentication found",
          type: "error",
        });
        return []
      };
      try {
        const invoices = await actor.actor?.listInvoices();
        return invoices || [];
      } catch (error) {
        showToast({
          title: "Error fetching invoices",
          message: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        console.log(error)
        return []
      }
    },
    enabled: !!identity,
  });
}

export function useAddInvoice() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address:string }) => {
      if (!identity) throw new Error('Identity not available');
      if (!actor) throw new Error('Actor not available');
      return actor.addInvoice(id, details, [address]); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['invoices', identity?.getPrincipal().toString()] 
      });
      // Also invalidate admin queries if user is admin
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

// File upload for invoices
export function useUploadInvoiceFile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
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
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.uploadInvoiceFile(invoiceId, fileName, mimeType, chunk, complete);
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
}

// Get invoice files
export function useInvoiceFiles(invoiceId: bigint) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<any[], Error>({
    queryKey: ['invoice-files', invoiceId.toString(), identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getInvoiceFiles(invoiceId);
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

// Tasks
export function useTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[bigint, string]>, Error>({
    queryKey: ['tasks', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listTasks();
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, description }: { id: bigint; description: string }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.addTask(id, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', identity?.getPrincipal().toString()] 
      });
      // Also invalidate admin queries if user is admin
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
}

// Badges
export function useBadges() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[string, string]>, Error>({
    queryKey: ['badges', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listBadges();
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAddBadge() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.addBadge(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['badges', identity?.getPrincipal().toString()] 
      });
      // Also invalidate admin queries if user is admin
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
    },
  });
}

// User Profile - FIXED
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string | null, Error>({
    queryKey: ['userProfile', identity?.getPrincipal().toString()],
    queryFn: async (): Promise<string | null> => {
      if (!actor || !identity) return null;
      try {
        // For now, we'll use the badge system to store profile data
        // In a real implementation, this would be a dedicated profile endpoint
        const result = await actor.getBadge('__profile__');
        // Handle the case where result is [string] | []
        if (Array.isArray(result) && result.length > 0) {
          return result[0] as string | null;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: string) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      // For now, we'll use the badge system to store profile data
      // In a real implementation, this would be a dedicated profile endpoint
      return actor.addBadge('__profile__', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['userProfile', identity?.getPrincipal().toString()] 
      });
    },
  });
}

// Notifications
export function useNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<any>, Error>({
    queryKey: ['notifications', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // Mock notifications - in real implementation, this would fetch from backend
      return [
        {
          id: '1',
          type: 'badge_milestone',
          title: 'New Badge Achieved!',
          message: 'Congratulations! You\'ve earned the Gold tier badge.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          data: { badgeName: 'Gold', tier: 'Gold' }
        },
        {
          id: '2',
          type: 'client_review',
          title: 'New Client Review',
          message: 'TechCorp left you a 5-star review with positive feedback.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          data: { rating: 5, client: 'TechCorp' }
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Received',
          message: 'Invoice #12345 has been paid. 0.05 BTC received.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          data: { amount: 0.05, invoiceId: '12345' }
        }
      ];
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock implementation - in real app, this would call backend
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['notifications', identity?.getPrincipal().toString()] 
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      // Mock implementation - in real app, this would call backend
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['notifications', identity?.getPrincipal().toString()] 
      });
    },
  });
}

// Top Performers
export function useTopPerformers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<any>, Error>({
    queryKey: ['topPerformers'],
    queryFn: async () => {
      if (!actor) return [];
      // Mock data - in real implementation, this would fetch from backend
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboards() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<any>, Error>({
    queryKey: ['leaderboards'],
    queryFn: async () => {
      if (!actor) return [];
      // Mock data - in real implementation, this would fetch from backend
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin check
export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  const result = useQuery<boolean, Error>({
    queryKey: ['isCurrentUserAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCurrentUserAdmin();
    },
    enabled: !!actor && !!identity && !isFetching,
  });
  
  return result;
}

// Admin-specific queries (placeholder implementations until backend is updated)
export function useAdminAllInvoices() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Array<{ user: string; invoices: Array<[bigint, any]> }>, Error>({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This would call a backend method like actor.listAllInvoices() when available
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAdminAllTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Array<{ user: string; tasks: Array<[bigint, string]> }>, Error>({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This would call a backend method like actor.listAllTasks() when available
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAdminAllBadges() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Array<{ user: string; badges: Array<[string, string]> }>, Error>({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This would call a backend method like actor.listAllBadges() when available
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

// Admin files query
export function useAdminAllFiles() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  
  return useQuery<Array<{ user: string; files: Array<any> }>, Error>({
    queryKey: ['admin-files'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This would call a backend method like actor.listAllFiles() when available
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

// Admin mutation for updating other users' invoices
export function useAdminUpdateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, id, details }: { userId: string; id: bigint; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      // This would call a backend method like actor.adminUpdateInvoice(userId, id, details) when available
      throw new Error('Admin invoice update not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

// Admin mutation for deleting other users' invoices
export function useAdminDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      // This would call a backend method like actor.adminDeleteInvoice(userId, id) when available
      throw new Error('Admin invoice deletion not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
  });
}

// Admin mutation for updating other users' tasks
export function useAdminUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, id, description }: { userId: string; id: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      // This would call a backend method like actor.adminUpdateTask(userId, id, description) when available
      throw new Error('Admin task update not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
}

// Admin mutation for deleting other users' tasks
export function useAdminDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, id }: { userId: string; id: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      // This would call a backend method like actor.adminDeleteTask(userId, id) when available
      throw new Error('Admin task deletion not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });
}
