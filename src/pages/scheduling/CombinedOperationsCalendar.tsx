import React, { useState, useMemo, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment360Panel } from './Appointment360Panel';
import { AIAssignmentDrawer } from './AIAssignmentDrawer';
import { NewAppointmentModal } from './NewAppointmentModal';
import EmployeeScheduleCalendar from './EmployeeScheduleCalendar';
import { useVowosData } from '@/contexts/VowosDataContext';
import { 
  useBusiness, 
  useAppointmentRequests, 
  useAppointments, 
  useEmployeeSchedules,
  useStaffProfiles 
} from '@/lib/services/schedulingService';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export function CombinedOperationsCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appointmentIdFromUrl = searchParams.get('appointmentId');

  const [selectedRequest, setSelectedRequest] = useState<Record<string, any> | null>(null);
  const [assigningRequest, setAssigningRequest] = useState<Record<string, any> | null>(null);
  const [newAppointmentData, setNewAppointmentData] = useState<{ start_at: string, employee_id: string } | null>(null);
  const [calendarView, setCalendarView] = useState<'operations' | 'workforce'>('operations');
  
  const queryClient = useQueryClient();
  const queueRef = useRef<HTMLDivElement>(null);
  
  const { activeLocation } = useVowosData();
  const { data: business } = useBusiness();
  const businessId = business?.id;
  
  const { data: requests = [] } = useAppointmentRequests(businessId, activeLocation);
  const { data: appointments = [] } = useAppointments(businessId, activeLocation);
  const { data: schedules = [] } = useEmployeeSchedules(businessId, activeLocation);
  const { data: staff = [] } = useStaffProfiles();

  // Sync URL to local state on load
  useEffect(() => {
    if (appointmentIdFromUrl) {
      const apt = appointments.find((a: any) => a.id === appointmentIdFromUrl);
      if (apt && !selectedRequest) {
        setSelectedRequest({
          id: apt.id,
          customerName: apt.customer?.first_name + ' ' + apt.customer?.last_name,
          serviceName: apt.service?.name || 'Appointment',
          status: apt.confirmation_status || 'confirmed',
          time: `${new Date(apt.start_at).toLocaleTimeString()} - ${new Date(apt.end_at).toLocaleTimeString()}`,
          employeeName: apt.employee?.first_name || 'Unassigned',
          roomName: apt.room?.name || 'Any Room'
        });
      } else {
        const req = requests.find((r: any) => r.id === appointmentIdFromUrl);
        if (req && !selectedRequest) {
          setSelectedRequest({
            id: req.id,
            customerName: req.customer?.first_name + ' ' + req.customer?.last_name,
            serviceName: req.service?.name || 'Requested Service',
            status: req.status,
            time: req.preferred_date_1,
            employeeName: 'Unassigned',
            roomName: 'TBD'
          });
        }
      }
    } else {
      setSelectedRequest(null);
    }
  }, [appointmentIdFromUrl, appointments, requests]);

  const updateSelectedRequestUrl = (req: Record<string, any> | null) => {
    if (req) {
      setSearchParams({ appointmentId: req.id });
    } else {
      setSearchParams({});
    }
  };

  // Map schedules to background events
  const calendarEvents = useMemo(() => {
    const events: Record<string, any>[] = [];
    
    // Add shifts as background
    schedules.forEach(shift => {
      events.push({
        id: `shift_${shift.id}`,
        title: shift.employee?.first_name || 'Staff',
        start: shift.start_at || shift.start_time,
        end: shift.end_at || shift.end_time,
        display: 'background',
        backgroundColor: '#e2e8f0' // subtle background color
      });
    });
    
    // Add appointments
    appointments.forEach(apt => {
      events.push({
        id: apt.id,
        title: apt.customer?.first_name + ' ' + apt.customer?.last_name,
        start: apt.start_at,
        end: apt.end_at,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        extendedProps: { appointment: apt }
      });
    });
    
    return events;
  }, [schedules, appointments]);

  const unassignedRequests = requests.filter((r: any) => r.status === 'pending');
  const actionRequiredRequests = requests.filter((r: any) => r.status === 'waitlist' || r.status === 'reschedule_requested');

  const handleEventClick = (info: Record<string, any>) => {
    if (info.event.extendedProps?.appointment) {
      const apt = info.event.extendedProps.appointment;
      const req = {
        id: apt.id,
        customerName: apt.customer?.first_name + ' ' + apt.customer?.last_name,
        serviceName: apt.service?.name || 'Appointment',
        status: apt.confirmation_status || 'confirmed',
        time: `${new Date(apt.start_at).toLocaleTimeString()} - ${new Date(apt.end_at).toLocaleTimeString()}`,
        employeeName: apt.employee?.first_name || 'Unassigned',
        roomName: apt.room?.name || 'Any Room'
      };
      setSelectedRequest(req);
      updateSelectedRequestUrl(req);
    }
  };

  const handleAssignClick = (req: Record<string, any>, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the request
    setAssigningRequest(req);
  };

  const handleAIConfirmAssignment = async (recommendation: any) => {
    if (!assigningRequest || !businessId) return;
    
    const newApt = {
      business_id: businessId,
      request_id: assigningRequest.id,
      customer_id: assigningRequest.customer_id,
      service_id: assigningRequest.service_id,
      employee_id: recommendation.employee_id,
      start_at: recommendation.recommended_start,
      end_at: recommendation.recommended_end,
      confirmation_status: 'confirmed'
    };
    
    await supabase.from('appointments').insert(newApt);
    await supabase.from('appointment_requests').update({ status: 'assigned' }).eq('id', assigningRequest.id);
    
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['appointment_requests'] });
    
    setAssigningRequest(null);
  };

  const handleEventDropOrResize = async (info: Record<string, any>) => {
    if (!info.event.id.startsWith('evt_') && !info.event.id.startsWith('shift_')) {
      // It's a real appointment from the DB
      const newStart = info.event.start;
      const newEnd = info.event.end || new Date(info.event.start.getTime() + 60 * 60 * 1000);
      
      const { error } = await supabase.from('appointments').update({
        start_at: newStart.toISOString(),
        end_at: newEnd.toISOString()
      }).eq('id', info.event.id);
      
      if (error) {
        info.revert();
        console.error("Failed to move event", error);
      } else {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
    }
  };

  const handleDateClick = (info: Record<string, any>) => {
    setNewAppointmentData({
      start_at: info.date.toISOString(),
      employee_id: ''
    });
  };

  useEffect(() => {
    if (queueRef.current) {
      new Draggable(queueRef.current, {
        itemSelector: '.fc-event-item',
        eventData: function(eventEl) {
          const reqId = eventEl.getAttribute('data-req-id');
          const title = eventEl.getAttribute('data-title');
          return {
            title: title || 'New Appointment',
            duration: '01:30',
            create: false,
            extendedProps: { requestId: reqId }
          };
        }
      });
    }
  }, [requests]);

  const handleEventReceive = async (info: Record<string, any>) => {
    const reqId = info.event.extendedProps.requestId;
    if (!reqId || !businessId) {
      info.revert();
      return;
    }
    
    const req = requests.find((r: any) => r.id === reqId);
    if (!req) {
      info.revert();
      return;
    }
    
    const newApt = {
      business_id: businessId,
      request_id: reqId,
      customer_id: req.customer_id,
      service_id: req.service_id,
      start_at: info.event.start.toISOString(),
      end_at: info.event.end?.toISOString() || new Date(info.event.start.getTime() + 90 * 60 * 1000).toISOString(),
      confirmation_status: 'confirmed'
    };
    
    info.event.remove(); // Remove the temp dropped event
    
    await supabase.from('appointments').insert(newApt);
    await supabase.from('appointment_requests').update({ status: 'assigned' }).eq('id', reqId);
    
    queryClient.invalidateQueries({ queryKey: ['appointment_requests'] });
  };

  const renderRequestCard = (req: any) => {
    const customerName = req.customer?.first_name ? `${req.customer.first_name} ${req.customer.last_name}` : 'Unknown Customer';
    const initials = req.customer?.first_name ? req.customer.first_name[0] + (req.customer.last_name?.[0] || '') : '?';
    const serviceName = req.service?.name || 'Requested Service';
    
    return (
      <Card 
        key={req.id} 
        data-req-id={req.id}
        data-title={customerName}
        className={`fc-event-item cursor-move transition-all duration-200 border-l-4 overflow-hidden group hover:-translate-y-0.5 hover:shadow-md
          ${selectedRequest?.id === req.id 
            ? 'border-l-primary shadow-md ring-1 ring-primary/20 bg-primary/5' 
            : 'border-l-indigo-300 hover:border-l-primary'}`}
        onClick={() => {
          const reqData = {
            id: req.id,
            customerName,
            serviceName,
            status: req.status || 'pending',
            time: 'Flexible',
            employeeName: 'Unassigned',
            roomName: 'TBD'
          };
          setSelectedRequest(reqData);
          updateSelectedRequestUrl(reqData);
        }}
      >
        <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border bg-white shadow-sm">
              <AvatarFallback className="text-[10px] font-medium bg-indigo-50 text-indigo-700">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-sm font-semibold">{customerName}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted-foreground/10 font-medium">
            {req.status?.toUpperCase() || 'PENDING'}
          </Badge>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex justify-between items-center text-xs mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground font-medium text-[11px] truncate max-w-[130px]" title={serviceName}>{serviceName}</span>
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm w-fit font-medium text-[10px]">
                Flexible Time
              </span>
            </div>
            <Button 
              size="sm" 
              variant={selectedRequest?.id === req.id ? "default" : "outline"} 
              className={`h-7 text-xs px-3 shadow-sm transition-opacity ${selectedRequest?.id === req.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={(e) => handleAssignClick(req, e)}
            >
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
    <style>{`
      .fc-theme-standard td, .fc-theme-standard th {
        border-color: hsl(var(--border) / 0.4) !important;
      }
      .fc .fc-col-header-cell-cushion {
        padding: 12px 8px;
        font-weight: 600;
        color: hsl(var(--foreground));
      }
      .fc .fc-timegrid-slot {
        height: 48px;
      }
      .fc-v-event {
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border: none !important;
        overflow: hidden;
      }
      .fc .fc-timegrid-col.fc-day-today {
        background-color: hsl(var(--primary) / 0.02) !important;
      }
      .fc-event-main {
        padding: 4px;
        font-size: 0.75rem;
      }
    `}</style>
    <div className="h-[calc(100vh-5rem)] flex bg-muted/10 overflow-hidden">
      
      {/* LEFT PANEL: Request Queue & Filters */}
      <div className="w-80 flex flex-col border-r bg-background shrink-0">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="font-semibold text-lg">Action Queue</h2>
          <p className="text-sm text-muted-foreground">{unassignedRequests.length} Pending</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={queueRef}>
          {requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">No pending requests</p>
              <p className="text-xs text-muted-foreground/70 mt-1">New booking requests will appear here</p>
            </div>
          )}
          
          {actionRequiredRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Required</h3>
              {actionRequiredRequests.map(req => renderRequestCard(req))}
            </div>
          )}
          
          {unassignedRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unassigned</h3>
              {unassignedRequests.map(req => renderRequestCard(req))}
            </div>
          )}
        </div>
      </div>
      {/* CENTER PANEL: Combined Calendar Grid */}
      <div className="flex-1 min-w-0 flex flex-col bg-background relative overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-background z-10">
          <div className="flex items-center bg-muted p-1 rounded-md">
            <button 
              className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${calendarView === 'operations' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCalendarView('operations')}
            >
              Operations
            </button>
            <button 
              className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${calendarView === 'workforce' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCalendarView('workforce')}
            >
              Workforce
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{schedules.length} Staff Scheduled</Badge>
            <Badge variant="outline">{requests.length} Pending</Badge>
            <Button size="sm" onClick={() => setNewAppointmentData({ start_at: new Date().toISOString(), employee_id: '' })} className="ml-2 gap-1.5"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>New Appointment</Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto relative z-0">
          {calendarView === 'operations' ? (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="100%"
              events={calendarEvents}
              eventClick={handleEventClick}
              editable={true}
              dateClick={handleDateClick}
              eventDrop={handleEventDropOrResize}
              eventResize={handleEventDropOrResize}
              eventReceive={handleEventReceive}
              droppable={true}
            />
          ) : (
            <EmployeeScheduleCalendar />
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Appointment 360 */}
      {selectedRequest && (
        <div className="w-[450px] shrink-0 bg-background border-l shadow-2xl transition-all duration-300 z-10">
          <Appointment360Panel 
            appointmentId={selectedRequest.id} 
            request={selectedRequest} 
            onClose={() => updateSelectedRequestUrl(null)} 
          />
        </div>
      )}
      
      {/* DRAWER: AI Assignment */}
      <AIAssignmentDrawer 
        request={assigningRequest}
        isOpen={!!assigningRequest}
        onClose={() => setAssigningRequest(null)}
        onAssign={handleAIConfirmAssignment}
      />

      {/* MODAL: New Appointment */}
      <NewAppointmentModal 
        isOpen={!!newAppointmentData}
        initialData={newAppointmentData}
        onClose={() => setNewAppointmentData(null)}
      />
    </div>
    </>
  );
}
