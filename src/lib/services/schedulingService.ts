import { supabase } from '../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Default business context for MVP
export const useBusiness = () => {
  return useQuery({
    queryKey: ['activeBusiness'],
    queryFn: async () => {
      const { data, error } = await supabase.from('businesses').select('*').limit(1).single();
      if (error) throw error;
      return data;
    }
  });
};

// Fetchers
export const fetchAppointmentRequests = async (businessId: string, locationId?: string | 'all') => {
  let query = supabase.from('appointment_requests').select(`
    *,
    customer:customers(*)
  `).eq('business_id', businessId);
  
  if (locationId && locationId !== 'all') {
    query = query.eq('preferred_location_id', locationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchAppointments = async (businessId: string, locationId?: string | 'all') => {
  let query = supabase.from('appointments').select(`
    *,
    customer:customers(*),
    employee:staff_profiles(*),
    room:rooms(*),
    service:appointment_services(*)
  `).eq('business_id', businessId);
  
  if (locationId && locationId !== 'all') {
    query = query.eq('location_id', locationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchStaffProfiles = async () => {
  const { data, error } = await supabase.from('staff_profiles').select('*');
  if (error) throw error;
  return data || [];
};

export const fetchEmployeeSchedules = async (businessId: string, locationId?: string | 'all') => {
  let query = supabase.from('employee_schedules').select(`
    *,
    employee:staff_profiles(*)
  `).eq('business_id', businessId);
  
  if (locationId && locationId !== 'all') {
    query = query.eq('location_id', locationId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchAppointmentHolds = async (businessId: string) => {
  const { data, error } = await supabase.from('appointment_holds')
    .select(`*`)
    .eq('business_id', businessId);
    
  if (error) throw error;
  return data;
};
export const fetchAppointment360 = async (appointmentId: string) => {
  try {
    const { data: appointment, error: aptError } = await supabase.from('appointments')
      .select(`
        *,
        customer:customers(*),
        employee:staff_profiles(*),
        room:rooms(*)
      `)
      .eq('id', appointmentId)
      .single();
      
    if (aptError) throw aptError;
    
    const { data: communications } = await supabase.from('communications').select('*').eq('appointment_id', appointmentId);
    const { data: files } = await supabase.from('files').select('*, file_links!inner(*)').eq('file_links.entity_id', appointmentId);
    const { data: notes } = await supabase.from('internal_notes').select('*').eq('entity_id', appointmentId).order('created_at', { ascending: false });
    const { data: financials } = await supabase.from('payments').select('*').eq('appointment_id', appointmentId);
    const { data: tasks } = await supabase.from('tasks').select('*').eq('entity_id', appointmentId).order('due_date', { ascending: true });
    const { data: history } = await supabase.from('appointment_audit_events').select('*').eq('appointment_id', appointmentId).order('created_at', { ascending: false });
      
    return {
      appointment,
      communications: communications || [],
      files: files || [],
      notes: notes || [],
      tasks: tasks || [],
      financials: financials || [],
      history: history || []
    };
  } catch (err) {
    console.warn('Failed to fetch appointment 360 data:', err);
    throw err;
  }
};

export const fetchAIRecommendations = async (requestId: string) => {
  const { data, error } = await supabase.from('appointment_assignment_recommendations')
    .select(`
      *,
      employee:staff_profiles(*)
    `)
    .eq('request_id', requestId)
    .order('score', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

export const fetchCustomers = async (businessId: string) => {
  const { data, error } = await supabase.from('customers').select('*').eq('business_id', businessId);
  if (error) throw error;
  return data || [];
};

export const fetchServices = async (businessId: string) => {
  const { data, error } = await supabase.from('appointment_services').select('*').eq('business_id', businessId);
  if (error) throw error;
  return data || [];
};

// --- React Query Hooks ---

export const useAppointmentRequests = (businessId: string | undefined, locationId: string | 'all' = 'all') => {
  return useQuery({
    queryKey: ['appointment_requests', businessId, locationId],
    queryFn: () => fetchAppointmentRequests(businessId!, locationId),
    enabled: !!businessId
  });
};

export const useAppointments = (businessId: string | undefined, locationId: string | 'all' = 'all') => {
  return useQuery({
    queryKey: ['appointments', businessId, locationId],
    queryFn: () => fetchAppointments(businessId!, locationId),
    enabled: !!businessId
  });
};

export const useEmployeeSchedules = (businessId: string | undefined, locationId: string | 'all' = 'all') => {
  return useQuery({
    queryKey: ['employee_schedules', businessId, locationId],
    queryFn: () => fetchEmployeeSchedules(businessId!, locationId),
    enabled: !!businessId
  });
};

export const useAppointmentHolds = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['appointment_holds', businessId],
    queryFn: () => fetchAppointmentHolds(businessId!),
    enabled: !!businessId
  });
};

export const useAppointment360 = (appointmentId: string | undefined) => {
  return useQuery({
    queryKey: ['appointment360', appointmentId],
    queryFn: () => fetchAppointment360(appointmentId!),
    enabled: !!appointmentId
  });
};

export const useStaffProfiles = () => {
  return useQuery({
    queryKey: ['staff_profiles'],
    queryFn: () => fetchStaffProfiles()
  });
};

export const useAIRecommendations = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['ai_recommendations', requestId],
    queryFn: () => fetchAIRecommendations(requestId!),
    enabled: !!requestId
  });
};

export const useCustomers = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['customers', businessId],
    queryFn: () => fetchCustomers(businessId!),
    enabled: !!businessId
  });
};

export const useServices = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ['services', businessId],
    queryFn: () => fetchServices(businessId!),
    enabled: !!businessId
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string, status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ confirmation_status: status })
        .eq('id', appointmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment360', variables.appointmentId] });
    }
  });
};

export const useAssignStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, employeeId }: { appointmentId: string, employeeId: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ employee_id: employeeId })
        .eq('id', appointmentId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment360', variables.appointmentId] });
    }
  });
};

// --- Transactional RPC Mutations ---

export const useAssignAppointmentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      requestId: string;
      employeeId: string;
      roomId: string;
      startAt: string;
      endAt: string;
    }) => {
      const { data, error } = await supabase.rpc('assign_appointment_request', {
        p_request_id: params.requestId,
        p_employee_id: params.employeeId,
        p_room_id: params.roomId,
        p_start_at: params.startAt,
        p_end_at: params.endAt
      });
      
      if (error) throw error;
      return data; // Returns the new appointment UUID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment_requests'] });
    }
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      appointmentId: string;
      newStartAt: string;
      newEndAt: string;
      newEmployeeId: string;
    }) => {
      const { data, error } = await supabase.rpc('reschedule_appointment', {
        p_appointment_id: params.appointmentId,
        p_new_start_at: params.newStartAt,
        p_new_end_at: params.newEndAt,
        p_new_employee_id: params.newEmployeeId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

export const useGenerateAIRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('generate_ai_recommendations', {
        p_request_id: requestId
      });
      if (error) throw error;
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['ai_recommendations', requestId] });
    }
  });
};

export const useAddAppointmentNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, content, businessId }: { appointmentId: string, content: string, businessId: string }) => {
      const { data, error } = await supabase.from('internal_notes').insert({
        entity_id: appointmentId,
        entity_type: 'appointment',
        business_id: businessId,
        content
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment360', variables.appointmentId] });
    }
  });
};

export const useAddAppointmentTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, title, businessId }: { appointmentId: string, title: string, businessId: string }) => {
      const { data, error } = await supabase.from('tasks').insert({
        entity_id: appointmentId,
        entity_type: 'appointment',
        business_id: businessId,
        title,
        status: 'pending'
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment360', variables.appointmentId] });
    }
  });
};

export const useAddCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, content, businessId }: { appointmentId: string, content: string, businessId: string }) => {
      const { data, error } = await supabase.from('communications').insert({
        appointment_id: appointmentId,
        business_id: businessId,
        content,
        type: 'sms',
        direction: 'outbound',
        status: 'sent'
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment360', variables.appointmentId] });
    }
  });
};
