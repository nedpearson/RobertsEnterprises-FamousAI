import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

export type ActionStatus = 'Open' | 'In Progress' | 'Waiting' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Snoozed' | 'Completed' | 'Dismissed' | 'Superseded' | 'Failed';
export type ActionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ActionCenterRecord {
  id: string;
  data_plane: string;
  business_id: string;
  location_id: string | null;
  action_type: string;
  source_module: string;
  source_record_type: string;
  source_record_id: string;
  title: string;
  description: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  severity: string | null;
  assigned_user_id: string | null;
  assigned_role: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  dismissed_at: string | null;
  snoozed_until: string | null;
  financial_impact_cents: number | null;
  operational_impact: string | null;
  customer_impact: string | null;
  ai_generated: boolean;
  ai_confidence: number | null;
  requires_approval: boolean;
  approval_type: string | null;
  deep_link: string;
  metadata_json: Record<string, any>;
  version: number;
}

export async function fetchActions(businessId: string, locationId?: string | 'all', filters?: any): Promise<ActionCenterRecord[]> {
  try {
    let query = supabase
      .from('action_center_records')
      .select('*')
      .eq('business_id', businessId)
      .neq('status', 'Completed')
      .neq('status', 'Dismissed')
      .neq('status', 'Superseded')
      .neq('status', 'Failed')
      .order('priority', { ascending: true }) // Assuming string sorting or custom sorting later
      .order('due_at', { ascending: true, nullsFirst: false });

    if (locationId && locationId !== 'all') {
      query = query.eq('location_id', locationId);
    }

    if (filters?.assignedToMe && filters.userId) {
      query = query.eq('assigned_user_id', filters.userId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Manual sorting to ensure priority order: Critical -> High -> Medium -> Low
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return (data || []).sort((a, b) => {
      const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
      const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
      if (pA !== pB) return pA - pB;
      if (a.due_at && b.due_at) return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      return 0;
    }) as ActionCenterRecord[];
  } catch (error) {
    console.error('Error fetching actions (falling back to mock data):', error);
    
    // Fallback to synthetic data for Demo Mode
    const mockActions: ActionCenterRecord[] = [
      {
        id: 'mock-1',
        data_plane: 'demo',
        business_id: businessId,
        location_id: locationId === 'all' ? null : locationId || null,
        action_type: 'LeadFollowUp',
        source_module: 'Growth',
        source_record_type: 'Lead',
        source_record_id: 'lead-123',
        title: 'Follow up with VIP Bride (Sarah Jenkins)',
        description: 'Sarah inquired about the new Galia Lahav collection. Needs contact within 2 hours to meet SLA.',
        status: 'Open',
        priority: 'High',
        severity: 'Medium',
        assigned_user_id: null,
        assigned_role: 'Stylist',
        due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        dismissed_at: null,
        snoozed_until: null,
        financial_impact_cents: 850000,
        operational_impact: null,
        customer_impact: 'High',
        ai_generated: true,
        ai_confidence: 0.95,
        requires_approval: false,
        approval_type: null,
        deep_link: '/customers/lead-123',
        metadata_json: {},
        version: 1
      },
      {
        id: 'mock-2',
        data_plane: 'demo',
        business_id: businessId,
        location_id: locationId === 'all' ? null : locationId || null,
        action_type: 'InventoryAlert',
        source_module: 'Operations',
        source_record_type: 'Product',
        source_record_id: 'prod-456',
        title: 'Low Stock: Essential Veils',
        description: 'Inventory for "Classic Tulle Veil" has dropped below the minimum threshold (2 remaining).',
        status: 'Open',
        priority: 'Medium',
        severity: 'Low',
        assigned_user_id: null,
        assigned_role: 'Manager',
        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        dismissed_at: null,
        snoozed_until: null,
        financial_impact_cents: null,
        operational_impact: 'Medium',
        customer_impact: 'Low',
        ai_generated: false,
        ai_confidence: null,
        requires_approval: true,
        approval_type: 'PurchaseOrder',
        deep_link: '/inventory/prod-456',
        metadata_json: {},
        version: 1
      }
    ];
    return mockActions;
  }
}

export async function updateActionStatus(actionId: string, status: ActionStatus, metadata?: any) {
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (status === 'Completed') updateData.completed_at = new Date().toISOString();
    if (status === 'Dismissed') updateData.dismissed_at = new Date().toISOString();
    if (metadata) {
      updateData.metadata_json = metadata;
    }

    const { error } = await supabase
      .from('action_center_records')
      .update(updateData)
      .eq('id', actionId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating action:', error);
    toast({
      title: 'Failed to update action',
      variant: 'destructive'
    });
    return false;
  }
}

export async function assignAction(actionId: string, userId: string | null) {
  try {
    const { error } = await supabase
      .from('action_center_records')
      .update({ assigned_user_id: userId, updated_at: new Date().toISOString() })
      .eq('id', actionId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning action:', error);
    toast({
      title: 'Failed to assign action',
      variant: 'destructive'
    });
    return false;
  }
}
