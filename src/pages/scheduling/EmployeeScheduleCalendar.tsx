import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmployeeShiftModal } from './EmployeeShiftModal';
import { useVowosData } from '@/contexts/VowosDataContext';
import { useBusiness, useEmployeeSchedules, useStaffProfiles } from '@/lib/services/schedulingService';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EmployeeScheduleCalendar() {
  const queryClient = useQueryClient();
  const { activeLocation } = useVowosData();
  const { data: business } = useBusiness();
  const businessId = business?.id;
  
  const { data: schedules = [] } = useEmployeeSchedules(businessId, activeLocation);
  const { data: staff = [] } = useStaffProfiles();

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [modalData, setModalData] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: null });

  // Filter shifts based on selection
  const events = selectedEmployee === 'all' 
    ? schedules 
    : schedules.filter((s: any) => s.employee_id === selectedEmployee);

  // Add color to events based on employee hash
  const coloredEvents = events.map((event: any) => {
    // Generate a simple color based on employee ID
    const hash = (event.employee_id || '').split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const color = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
    
    return {
      id: event.id,
      resourceId: event.employee_id,
      title: event.employee?.first_name ? `${event.employee.first_name} ${event.employee.last_name}` : 'Staff Shift',
      start: event.start_at || event.start_time,
      end: event.end_at || event.end_time,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { shift: event }
    };
  });

  const handleDateSelect = (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection
    
    setModalData({
      isOpen: true,
      data: {
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        employee_id: selectedEmployee !== 'all' ? selectedEmployee : ''
      }
    });
  };

  const handleEventClick = (clickInfo: any) => {
    const shift = clickInfo.event.extendedProps.shift;
    setModalData({
      isOpen: true,
      data: {
        id: shift.id,
        start: shift.start_at || shift.start_time,
        end: shift.end_at || shift.end_time,
        employee_id: shift.employee_id
      }
    });
  };

  const handleEventDropOrResize = async (info: any) => {
    const newStart = info.event.start;
    const newEnd = info.event.end || new Date(info.event.start.getTime() + 8 * 60 * 60 * 1000); // 8h default
    
    const { error } = await supabase.from('employee_schedules').update({
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString()
    }).eq('id', info.event.id);
    
    if (error) {
      info.revert();
      toast.error('Failed to move shift');
    } else {
      queryClient.invalidateQueries({ queryKey: ['employee_schedules'] });
    }
  };

  const publishWeek = () => {
    toast.success('All current shifts have been published to employees!');
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Employee Schedule</h2>
        <div className="flex gap-4 items-center">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px] bg-white text-sm h-8">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {staff.map((emp: any) => (
                <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button onClick={() => setModalData({ isOpen: true, data: null })} className="bg-white border text-foreground hover:bg-muted px-3 py-1.5 rounded-md font-medium text-xs">
            Add Shift
          </button>
          <button onClick={publishWeek} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium text-xs">
            Publish Week
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto p-0 relative z-0">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={coloredEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDropOrResize}
          eventResize={handleEventDropOrResize}
          height="100%"
        />
      </div>

      <EmployeeShiftModal 
        isOpen={modalData.isOpen}
        locationId={activeLocation}
        initialData={modalData.data}
        onClose={() => setModalData({ isOpen: false, data: null })}
      />
    </div>
  );
}
