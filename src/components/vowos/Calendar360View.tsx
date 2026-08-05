import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CalendarLeftPanel from './CalendarLeftPanel';
import CalendarCenterGrid from './CalendarCenterGrid';
import Appointment360Panel from './Appointment360Panel';
import { 
  AppointmentRequest, 
  Appointment, 
  EmployeeSchedule,
  fetchAppointmentRequests,
  fetchAppointmentsByDateRange,
  fetchEmployeeSchedules
} from '@/lib/appointment360';
import { format, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

export default function Calendar360View() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  const loadData = async () => {
    try {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');

      const [reqs, appts, scheds] = await Promise.all([
        fetchAppointmentRequests(),
        fetchAppointmentsByDateRange(startStr, endStr),
        fetchEmployeeSchedules(startStr, endStr)
      ]);

      setRequests(reqs);
      setAppointments(appts);
      setSchedules(scheds);
    } catch (err) {
      console.error("Failed to load Calendar 360 data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleSelectRequest = (req: AppointmentRequest) => {
    // Transform request into a temporary appointment to show in the panel or to drag
    console.log("Selected request:", req);
  };

  const handleAppointmentClick = (appt: Appointment) => {
    setSelectedAppointment(appt);
  };

  const handleDateSelect = (selectInfo: any) => {
    // Open a "new appointment" modal or select time
    console.log("Selected dates:", selectInfo.startStr, "to", selectInfo.endStr);
  };

  const handleEventDrop = (dropInfo: any) => {
    // An appointment was dragged
    console.log("Appointment dropped:", dropInfo.event);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden bg-white border rounded-xl shadow-sm relative">
      {/* Left Panel: Smart Queue */}
      <CalendarLeftPanel 
        requests={requests} 
        onSelectRequest={handleSelectRequest} 
      />

      {/* Center Grid: FullCalendar workspace */}
      <CalendarCenterGrid 
        appointments={appointments}
        schedules={schedules}
        onAppointmentClick={handleAppointmentClick}
        onDateSelect={handleDateSelect}
        onEventDrop={handleEventDrop}
      />

      {/* Right Panel: Appointment 360 Drawer */}
      {selectedAppointment && (
        <Appointment360Panel 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
        />
      )}
    </div>
  );
}
