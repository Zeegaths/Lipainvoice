import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useActor } from './useActor';
import { createActor } from '../backend';

// Invoices
export function useInvoices() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[bigint, any]>>({
    queryKey: ['invoices', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listInvoices();
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAddInvoice() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }: { id: bigint; details: string }) => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.addInvoice(id, details);
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

  return useQuery({
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

  return useQuery<Array<[bigint, string]>>({
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

  return useQuery<Array<[string, string]>>({
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

// User Profile
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string | null>({
    queryKey: ['userProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      // For now, we'll use the badge system to store profile data
      // In a real implementation, this would be a dedicated profile endpoint
      return actor.getBadge('__profile__');
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

  return useQuery<Array<any>>({
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

  return useQuery<Array<any>>({
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

  return useQuery<Array<any>>({
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
  
  const result = useQuery<boolean>({
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
  
  return useQuery<Array<{ user: string; invoices: Array<[bigint, any]> }>>({
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
  
  return useQuery<Array<{ user: string; tasks: Array<[bigint, string]> }>>({
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
  
  return useQuery<Array<{ user: string; badges: Array<[string, string]> }>>({
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
  
  return useQuery<Array<{ user: string; files: Array<any> }>>({
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
