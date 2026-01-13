import type { Workspace } from '../types';
import { authFetch } from '../app/authFetch';

export const workspaceApi = {
  list: async (): Promise<Workspace[]> => {
    const res = await authFetch('/api/workspaces');
    if (!res.ok) throw new Error('Failed to list workspaces');
    return res.json();
  },

  create: async (name: string, description?: string, icon?: string, password?: string): Promise<Workspace> => {
    const res = await authFetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, icon, password })
    });
    if (!res.ok) throw new Error('Failed to create workspace');
    return res.json();
  },

  update: async (id: string, updates: Partial<Workspace>): Promise<Workspace> => {
    const res = await authFetch(`/api/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update workspace');
    const data = await res.json();
    return data.workspace;
  },

  delete: async (id: string): Promise<void> => {
    const res = await authFetch(`/api/workspaces/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete workspace');
  }
};