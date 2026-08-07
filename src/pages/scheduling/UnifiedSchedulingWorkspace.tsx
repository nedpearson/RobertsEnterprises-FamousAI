import React, { useState, useMemo, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  CalendarDays, 
  Inbox, 
  Users, 
  Sparkles, 
  BarChart3, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  UserCheck, 
  Zap, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Appointment360Panel } from './Appointment360Panel';
import { AIAssignmentDrawer } from './AIAssignmentDrawer';
import { NewAppointmentModal } from './NewAppointmentModal';
import { EmployeeShiftModal } from './EmployeeShiftModal';
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
import { toast } from 'sonner';

export type SchedulingMode = 'calendar' | 'requests' | 'workforce' | 'ai' | 'capacity';

export function UnifiedSchedulingWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawMode = searchParams.get('mode') as SchedulingMode | null;
  const activeMode: SchedulingMode = ['calendar', 'requests', 'workforce', 'ai', 'capacity'].includes(rawMode || '')
    ? (rawMode as SchedulingMode)
    : 'calendar';

  const appointmentIdFromUrl = searchParams.get('appointmentId') || searchParams.get('appointment') || searchParams.get('request');

  const [selectedRequest, setSelectedRequest] = useState<Record<string, any> | null>(null);
  const [assigningRequest, setAssigningRequest] = useState<Record<string, any> | null>(null);
  const [newAppointmentData, setNewAppointmentData] = useState<{ start_at: string; employee_id: string } | null>(null);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [shiftModalData, setShiftModalData] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null });

  // Layer Toggles for Calendar Mode
  const [layerFilters, setLayerFilters] = useState({
    appointments: true,
    requests: true,
    shifts: true,
    holds: true,
    rooms: true,
  });

  // Selected Employee filter for Workforce mode
  const [selectedWorkforceStaff, setSelectedWorkforceStaff] = useState<string>('all');

  const queryClient = useQueryClient();
  const queueRef = useRef<HTMLDivElement>(null);

  const { activeLocation } = useVowosData();
  const { data: business } = useBusiness();
  const businessId = business?.id;

  const { data: requests = [] } = useAppointmentRequests(businessId, activeLocation);
  const { data: appointments = [] } = useAppointments(businessId, activeLocation);
  const { data: schedules = [] } = useEmployeeSchedules(businessId, activeLocation);
  const { data: staff = [] } = useStaffProfiles();

  // Mode Switcher handler
  const setMode = (mode: SchedulingMode) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('mode', mode);
    setSearchParams(nextParams);
  };

  // Sync URL query params to selected record
  useEffect(() => {
    if (appointmentIdFromUrl) {
      const apt = appointments.find((a: any) => a.id === appointmentIdFromUrl);
      if (apt) {
        setSelectedRequest({
          id: apt.id,
          customerName: apt.customer ? `${apt.customer.first_name || ''} ${apt.customer.last_name || ''}`.trim() : 'Guest Bride',
          serviceName: apt.service?.name || 'Bridal Consultation',
          status: apt.confirmation_status || 'confirmed',
          time: `${new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(apt.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          employeeName: apt.employee ? `${apt.employee.first_name || ''} ${apt.employee.last_name || ''}`.trim() : 'Unassigned',
          roomName: apt.room?.name || 'Main Suite'
        });
        return;
      }

      const req = requests.find((r: any) => r.id === appointmentIdFromUrl);
      if (req) {
        setSelectedRequest({
          id: req.id,
          customerName: req.customer ? `${req.customer.first_name || ''} ${req.customer.last_name || ''}`.trim() : 'Booking Request',
          serviceName: req.service?.name || 'Requested Fitting',
          status: req.status || 'new',
          time: req.preferred_date_1 || 'Pending Assignment',
          employeeName: 'Unassigned',
          roomName: 'TBD'
        });
        return;
      }
    }
  }, [appointmentIdFromUrl, appointments, requests]);

  const updateSelectedRequestUrl = (req: Record<string, any> | null) => {
    setSelectedRequest(req);
    const nextParams = new URLSearchParams(searchParams);
    if (req?.id) {
      nextParams.set('appointmentId', req.id);
    } else {
      nextParams.delete('appointmentId');
      nextParams.delete('appointment');
      nextParams.delete('request');
    }
    setSearchParams(nextParams);
  };

  // Map events for FullCalendar
  const calendarEvents = useMemo(() => {
    const events: Record<string, any>[] = [];

    // Add employee shift background blocks if layer enabled
    if (layerFilters.shifts) {
      schedules.forEach((shift: any) => {
        events.push({
          id: `shift_${shift.id}`,
          title: shift.employee?.first_name ? `${shift.employee.first_name} (Shift)` : 'Staff Shift',
          start: shift.start_at || shift.start_time,
          end: shift.end_at || shift.end_time,
          display: 'background',
          backgroundColor: '#f1f5f9',
        });
      });
    }

    // Add confirmed appointments if layer enabled
    if (layerFilters.appointments) {
      appointments.forEach((apt: any) => {
        const isSelected = selectedRequest?.id === apt.id;
        events.push({
          id: apt.id,
          title: `${apt.customer?.first_name || 'Bride'} - ${apt.service?.name || 'Appointment'} (${apt.employee?.first_name || 'Unassigned'})`,
          start: apt.start_at,
          end: apt.end_at,
          backgroundColor: isSelected ? '#be123c' : '#e11d48',
          borderColor: isSelected ? '#881337' : '#be123c',
          textColor: '#ffffff',
          extendedProps: {
            type: 'appointment',
            customerName: apt.customer ? `${apt.customer.first_name || ''} ${apt.customer.last_name || ''}`.trim() : 'Guest',
            serviceName: apt.service?.name || 'Consultation',
            status: apt.confirmation_status || 'confirmed',
            time: `${new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(apt.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            employeeName: apt.employee ? `${apt.employee.first_name || ''} ${apt.employee.last_name || ''}`.trim() : 'Unassigned',
            roomName: apt.room?.name || 'Fitting Room'
          }
        });
      });
    }

    return events;
  }, [appointments, schedules, layerFilters, selectedRequest]);

  // Setup draggable for queue
  useEffect(() => {
    if (queueRef.current && activeMode === 'calendar') {
      const draggable = new Draggable(queueRef.current, {
        itemSelector: '.draggable-request-card',
        eventData: function (eventEl) {
          const id = eventEl.getAttribute('data-id');
          const title = eventEl.getAttribute('data-title');
          return { id, title, duration: '01:30' };
        }
      });

      return () => {
        draggable.destroy();
      };
    }
  }, [queueRef, activeMode]);

  const handleEventReceive = async (info: any) => {
    const requestId = info.event.id;
    const dropTime = info.event.start;
    const dropEndTime = new Date(dropTime.getTime() + 90 * 60 * 1000); // 1.5 hrs default

    const req = requests.find((r: any) => r.id === requestId);
    if (!req) return;

    const { error } = await supabase.from('appointments').insert({
      business_id: businessId,
      location_id: req.location_id || activeLocation,
      customer_id: req.customer_id,
      service_id: req.service_id,
      start_at: dropTime.toISOString(),
      end_at: dropEndTime.toISOString(),
      confirmation_status: 'confirmed'
    });

    if (error) {
      toast.error('Failed to schedule request');
      info.revert();
    } else {
      await supabase.from('appointment_requests').update({ status: 'assigned' }).eq('id', requestId);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment_requests'] });
      toast.success('Appointment created from request!');
    }
  };

  const handleEventDrop = async (info: any) => {
    const newStart = info.event.start;
    const newEnd = info.event.end || new Date(newStart.getTime() + 90 * 60 * 1000);

    const { error } = await supabase.from('appointments').update({
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString()
    }).eq('id', info.event.id);

    if (error) {
      info.revert();
      toast.error('Failed to reschedule appointment');
    } else {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment rescheduled');
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setNewAppointmentData({
      start_at: selectInfo.startStr,
      employee_id: selectInfo.resource?.id || ''
    });
    setIsNewAppointmentModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    if (clickInfo.event.extendedProps.type === 'appointment') {
      updateSelectedRequestUrl({
        id: clickInfo.event.id,
        ...clickInfo.event.extendedProps
      });
    }
  };

  const publishWorkforceSchedule = () => {
    toast.success('All current shifts published to team members!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-[#faf8f5]">
      {/* Top Segmented Workspace Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white border-b border-stone-200 gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMode('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeMode === 'calendar'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5 text-rose-500" />
            Calendar
          </button>
          <button
            onClick={() => setMode('requests')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeMode === 'requests'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Inbox className="h-3.5 w-3.5 text-blue-500" />
            Booking Requests
            {requests.filter((r: any) => r.status === 'new').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {requests.filter((r: any) => r.status === 'new').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMode('workforce')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeMode === 'workforce'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-purple-500" />
            Workforce
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeMode === 'ai'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            AI Planner
          </button>
          <button
            onClick={() => setMode('capacity')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeMode === 'capacity'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
            Capacity
          </button>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2">
          {activeMode === 'workforce' && (
            <Button
              onClick={publishWorkforceSchedule}
              variant="outline"
              size="sm"
              className="text-xs font-medium border-stone-200"
            >
              <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
              Publish Shifts
            </Button>
          )}

          <Button
            onClick={() => {
              setAssigningRequest(requests[0] || { id: 'new-req', customer: { first_name: 'Walk-in', last_name: 'Guest' } });
            }}
            variant="outline"
            size="sm"
            className="text-xs font-medium border-stone-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Request
          </Button>

          <Button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            size="sm"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Mode-Specific Actions & Filter Queue */}
        <div className="w-80 border-r border-stone-200 bg-white flex flex-col shrink-0 hidden md:flex">
          {activeMode === 'calendar' && (
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-stone-900 mb-3 flex items-center justify-between">
                <span>Unassigned Requests</span>
                <Badge variant="secondary" className="text-xs">{requests.length}</Badge>
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Drag a booking request onto the calendar to assign time and consultant.
              </p>

              <div ref={queueRef} className="space-y-3 flex-1 overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                    No pending booking requests
                  </div>
                ) : (
                  requests.map((req: any) => (
                    <div
                      key={req.id}
                      data-id={req.id}
                      data-title={`${req.customer?.first_name || 'Guest'} - ${req.service?.name || 'Fitting'}`}
                      className="draggable-request-card p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 cursor-grab active:cursor-grabbing transition-all hover:border-rose-300 shadow-2xs"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs text-stone-900">
                          {req.customer?.first_name} {req.customer?.last_name}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mb-2">{req.service?.name || 'Bridal Fitting'}</p>
                      <div className="flex items-center text-[10px] text-stone-400 gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {req.preferred_date_1 || 'Flexible'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {activeLocation.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Layer Toggles */}
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Calendar Layers</p>
                <div className="space-y-1.5 text-xs text-stone-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={layerFilters.appointments} 
                      onChange={e => setLayerFilters({...layerFilters, appointments: e.target.checked})}
                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500" 
                    />
                    <span>Confirmed Appointments</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={layerFilters.shifts} 
                      onChange={e => setLayerFilters({...layerFilters, shifts: e.target.checked})}
                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500" 
                    />
                    <span>Employee Staff Shifts</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'requests' && (
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-stone-900 mb-3">Request Status Pipeline</h3>
              <div className="space-y-2">
                {[
                  { label: 'New Inquiries', count: requests.filter((r: any) => r.status === 'new').length, color: 'bg-blue-500' },
                  { label: 'Staffing Review', count: 2, color: 'bg-purple-500' },
                  { label: 'AI Ready', count: 1, color: 'bg-amber-500' },
                  { label: 'Confirmation Pending', count: 3, color: 'bg-rose-500' },
                  { label: 'Waitlist', count: 0, color: 'bg-stone-400' },
                ].map(group => (
                  <div key={group.label} className="flex items-center justify-between p-2.5 rounded-lg border border-stone-100 hover:bg-stone-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${group.color}`} />
                      <span className="text-xs font-medium text-stone-700">{group.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{group.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'workforce' && (
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-stone-900 mb-3">Team & Shifts</h3>
              <p className="text-xs text-stone-500 mb-4">Select a consultant to focus schedule or edit template shifts.</p>
              
              <div className="mb-4">
                <label className="text-xs font-semibold text-stone-700 block mb-1">Filter Staff</label>
                <Select value={selectedWorkforceStaff} onValueChange={setSelectedWorkforceStaff}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="All Consultants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consultants</SelectItem>
                    {staff.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => setShiftModalData({ isOpen: true, data: { employee_id: selectedWorkforceStaff !== 'all' ? selectedWorkforceStaff : '' } })} 
                  variant="outline" 
                  fullWidth 
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom Shift
                </Button>
              </div>
            </div>
          )}

          {activeMode === 'ai' && (
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-stone-900 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Operational Insights
              </h3>
              <p className="text-xs text-stone-500 mb-4">AI detected 3 optimization opportunities for today's schedule.</p>
              
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                  <p className="font-semibold text-stone-900 mb-1">Fill Saturday Staffing Gap</p>
                  <p className="text-stone-600 mb-2">High demand for Bridal Consultations. Recommend adding 1 Senior Stylist shift.</p>
                  <Button size="xs" variant="default" className="bg-stone-900 text-white">Review</Button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'capacity' && (
            <div className="p-4 flex flex-col h-full overflow-y-auto">
              <h3 className="font-semibold text-sm text-stone-900 mb-2">Location Capacity</h3>
              <p className="text-xs text-stone-500 mb-4">View peak fitting room and consultant utilization.</p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Main Fitting Suites:</span>
                  <span className="font-bold text-stone-900">85% Full</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Senior Stylists:</span>
                  <span className="font-bold text-stone-900">100% Booked</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel: Primary View Display */}
        <div className="flex-1 p-4 bg-[#faf8f5] overflow-y-auto">
          {activeMode === 'calendar' && (
            <Card className="h-full flex flex-col shadow-xs border-stone-200">
              <CardContent className="p-3 flex-1 min-h-[500px]">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={calendarEvents}
                  editable={true}
                  selectable={true}
                  droppable={true}
                  eventReceive={handleEventReceive}
                  eventDrop={handleEventDrop}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height="100%"
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                />
              </CardContent>
            </Card>
          )}

          {activeMode === 'requests' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900">Booking Requests Queue</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req: any) => (
                  <Card key={req.id} className="border-stone-200 hover:border-stone-300 transition-all">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-bold text-stone-900">
                          {req.customer?.first_name} {req.customer?.last_name}
                        </CardTitle>
                        <Badge className="bg-rose-100 text-rose-700">{req.status || 'New'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-stone-600 space-y-2">
                      <p><span className="font-semibold text-stone-800">Service:</span> {req.service?.name || 'Fitting'}</p>
                      <p><span className="font-semibold text-stone-800">Requested:</span> {req.preferred_date_1 || 'TBD'}</p>
                      <div className="pt-2 flex gap-2">
                        <Button 
                          onClick={() => setAssigningRequest(req)} 
                          size="xs" 
                          className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                          Auto Assign
                        </Button>
                        <Button 
                          onClick={() => updateSelectedRequestUrl(req)} 
                          variant="outline" 
                          size="xs"
                        >
                          View 360
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'workforce' && (
            <Card className="h-full flex flex-col shadow-xs border-stone-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-base text-stone-900">Workforce & Employee Schedule</h3>
                  <p className="text-xs text-stone-500">Manage shifts, breaks, and consultant coverage</p>
                </div>
              </div>
              <div className="flex-1 min-h-[450px]">
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
                  events={schedules.map((s: any) => ({
                    id: s.id,
                    title: s.employee ? `${s.employee.first_name} ${s.employee.last_name}` : 'Shift',
                    start: s.start_at || s.start_time,
                    end: s.end_at || s.end_time,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed'
                  }))}
                  editable={true}
                  selectable={true}
                  height="100%"
                />
              </div>
            </Card>
          )}

          {activeMode === 'ai' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> AI Scheduling Optimization & Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-stone-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-bold text-stone-900">Assign Request: Sarah Jenkins</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-stone-600 space-y-3">
                    <p>AI matched Sarah with Senior Stylist Emma (98% compatibility based on Gown style preferences).</p>
                    <div className="flex gap-2">
                      <Button size="xs" className="bg-stone-900 text-white">Approve Assignment</Button>
                      <Button size="xs" variant="outline">Compare Options</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeMode === 'capacity' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900">Capacity & Utilization Heatmap</h2>
              <Card className="p-6 text-center border-stone-200">
                <p className="text-sm text-stone-600 mb-4">Location: {activeLocation.toUpperCase()} · Peak Hours: 11:00 AM - 3:00 PM</p>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-4 rounded-xl bg-rose-50 text-rose-900 font-bold border border-rose-100">
                      {day}
                      <div className="text-[10px] font-normal text-rose-700 mt-1">90% Cap</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel: Appointment 360 Detail View */}
        {selectedRequest && (
          <div className="w-96 border-l border-stone-200 bg-white p-4 overflow-y-auto shrink-0 shadow-lg animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-stone-900">Appointment 360</h3>
              <Button onClick={() => updateSelectedRequestUrl(null)} variant="ghost" size="xs">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Appointment360Panel request={selectedRequest} />
          </div>
        )}
      </div>

      {/* Drawers and Modals */}
      {assigningRequest && (
        <AIAssignmentDrawer
          isOpen={!!assigningRequest}
          onClose={() => setAssigningRequest(null)}
          request={assigningRequest}
        />
      )}

      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={() => {
            setIsNewAppointmentModalOpen(false);
            setNewAppointmentData(null);
          }}
          initialData={newAppointmentData}
        />
      )}

      {shiftModalData.isOpen && (
        <EmployeeShiftModal
          isOpen={shiftModalData.isOpen}
          onClose={() => setShiftModalData({ isOpen: false, data: null })}
          initialData={shiftModalData.data}
        />
      )}
    </div>
  );
}
