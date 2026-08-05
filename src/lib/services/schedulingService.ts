import { supabase } from '../supabase';
import { useQuery } from '@tanstack/react-query';

// Default business context for MVP
export const useBusiness = () => {
  return useQuery({
    queryKey: ['activeBusiness'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('businesses').select('*').limit(1).single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Failed to fetch business, using fallback', err);
        return { id: 'b_demo_123', name: 'Roberts Enterprises Demo' };
      }
    }
  });
};

// Fetchers
export const fetchAppointmentRequests = async (businessId: string, locationId?: string | 'all') => {
  try {
    let query = supabase.from('appointment_requests').select(`
      *,
      customer:customers(*)
    `).eq('business_id', businessId);
    
    if (locationId && locationId !== 'all') {
      query = query.eq('preferred_location_id', locationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data : generateMockRequests();
  } catch (err) {
    console.warn('Using mock appointment requests');
    return generateMockRequests();
  }
};

function generateMockRequests() {
  return [
    {
      id: 'req_1',
      customer_id: 'cust_1',
      service_id: 'svc_1',
      customer: { first_name: 'Sarah', last_name: 'Jenkins' },
      service: { name: 'Bridal Consultation' },
      status: 'pending'
    },
    {
      id: 'req_2',
      customer_id: 'cust_2',
      service_id: 'svc_2',
      customer: { first_name: 'Emily', last_name: 'Chen' },
      service: { name: 'Fitting' },
      status: 'pending'
    }
  ];
}

export const fetchAppointments = async (businessId: string, locationId?: string | 'all') => {
  try {
    let query = supabase.from('appointments').select(`
      *,
      customer:customers(*),
      employee:employees(*),
      room:rooms(*),
      service:appointment_services(*)
    `).eq('business_id', businessId);
    
    if (locationId && locationId !== 'all') {
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data : generateMockAppointments();
  } catch (err) {
    console.warn('Using mock appointments');
    return generateMockAppointments();
  }
};

function generateMockAppointments() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  
  return [
    {
      id: 'apt_1',
      customer: { first_name: 'Jessica', last_name: 'Smith' },
      employee: { first_name: 'Jane', last_name: 'Stylist' },
      room: { name: 'Suite A' },
      service: { name: 'Bridal Styling' },
      start_at: new Date(year, month, date, 10, 0).toISOString(),
      end_at: new Date(year, month, date, 11, 30).toISOString(),
      confirmation_status: 'confirmed'
    },
    {
      id: 'apt_2',
      customer: { first_name: 'Amanda', last_name: 'Davis' },
      employee: { first_name: 'Jane', last_name: 'Stylist' },
      room: { name: 'Suite B' },
      service: { name: 'Alterations' },
      start_at: new Date(year, month, date, 13, 0).toISOString(),
      end_at: new Date(year, month, date, 14, 0).toISOString(),
      confirmation_status: 'confirmed'
    }
  ];
}

export const fetchEmployeeSchedules = async (businessId: string, locationId?: string | 'all') => {
  try {
    let query = supabase.from('employee_schedules').select(`
      *,
      employee:employees(*)
    `).eq('business_id', businessId);
    
    if (locationId && locationId !== 'all') {
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data : generateMockSchedules();
  } catch (err) {
    console.warn('Using mock schedules');
    return generateMockSchedules();
  }
};

function generateMockSchedules() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  
  return [
    {
      id: 'shift_1',
      employee: { first_name: 'Jane', last_name: 'Stylist' },
      start_time: new Date(year, month, date, 9, 0).toISOString(),
      end_time: new Date(year, month, date, 17, 0).toISOString()
    }
  ];
}

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
        employee:employees(*),
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
    console.warn('Using mock appointment 360 data');
    const mockApt = generateMockAppointments().find(a => a.id === appointmentId) || generateMockAppointments()[0];
    return {
      appointment: mockApt,
      communications: [{ id: 'msg_1', sender: 'system', content: 'Confirmation sent', created_at: new Date().toISOString() }],
      files: [{ id: 'f_1', name: 'Inspiration_Board.pdf', size: 1024000 }],
      notes: [{ id: 'n_1', content: 'VIP Customer - prefers champagne', author: { first_name: 'Admin' }, created_at: new Date().toISOString() }],
      financials: [{ id: 'pay_1', amount: 150.00, status: 'paid' }]
    };
  }
};

export const fetchAIRecommendations = async (requestId: string) => {
  try {
    const { data, error } = await supabase.from('appointment_assignment_recommendations')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('request_id', requestId)
      .order('score', { ascending: false });
      
    if (error) throw error;
    return data && data.length > 0 ? data : generateMockRecommendations();
  } catch (err) {
    return generateMockRecommendations();
  }
};

function generateMockRecommendations() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  return [
    {
      id: 'rec_1',
      employee: { first_name: 'Jane', last_name: 'Stylist', id: 'emp_1' },
      recommended_start: new Date(year, month, date, 14, 0).toISOString(),
      recommended_end: new Date(year, month, date, 15, 30).toISOString(),
      score: 98,
      match_reasons: ['Perfect schedule alignment', 'Customer favorite'],
      conflict_warnings: []
    }
  ];
}

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

export const useAIRecommendations = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['ai_recommendations', requestId],
    queryFn: () => fetchAIRecommendations(requestId!),
    enabled: !!requestId
  });
};
