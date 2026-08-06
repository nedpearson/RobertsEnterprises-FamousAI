import { supabase } from '../supabase';
import { useQuery } from '@tanstack/react-query';

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
    const { data: notes } = await supabase.from('internal_notes').select('*').eq('entity_id', appointmentId);
    const { data: financials } = await supabase.from('payments').select('*').eq('appointment_id', appointmentId);
      
    return {
      appointment,
      communications: communications || [],
      files: files || [],
      notes: notes || [],
      financials: financials || []
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
