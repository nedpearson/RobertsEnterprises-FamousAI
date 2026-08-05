import { supabase } from '@/lib/supabase';

// Define the core types corresponding to the new schema
export interface AppointmentRequest {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string | null;
  status: string;
  priority: string;
  notes: string;
  submitted_at: string;
  customer?: { name: string; email: string; phone: string };
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  shift_date: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string;
}

export interface Appointment {
  id: string;
  request_id: string | null;
  employee_id: string | null;
  room_id: string | null;
  start_at: string;
  end_at: string;
  status: string;
  customer?: { name: string };
  employee?: { name: string };
  room?: { name: string };
}

export async function fetchAppointmentRequests() {
  const { data, error } = await supabase
    .from('appointment_requests')
    .select('*, customer:customers(name, email, phone)')
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('Error fetching appointment requests:', error);
    return [];
  }
  return data as AppointmentRequest[];
}

export async function fetchAppointmentsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, customer:customers(name), room:rooms(name), employee:auth.users(name)')
    .gte('start_at', startDate)
    .lte('end_at', endDate);
  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  return data as Appointment[];
}

export async function fetchEmployeeSchedules(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('employee_schedules')
    .select('*')
    .gte('shift_date', startDate)
    .lte('shift_date', endDate);
  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
  return data as EmployeeSchedule[];
}

export async function createAppointment(payload: Partial<Appointment>) {
  const { data, error } = await supabase.from('appointments').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
  const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}
