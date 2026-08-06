import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

const MOCK_EMPLOYEES = [
  { id: '1', name: 'Alice Smith', color: '#10b981' },
  { id: '2', name: 'Bob Johnson', color: '#f59e0b' },
  { id: '3', name: 'Carol Williams', color: '#ef4444' }
];

const MOCK_SHIFTS = [
  { id: 's1', resourceId: '1', title: 'Morning Shift', start: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), end: new Date(new Date().setHours(16, 0, 0, 0)).toISOString() },
  { id: 's2', resourceId: '2', title: 'Afternoon Shift', start: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), end: new Date(new Date().setHours(20, 0, 0, 0)).toISOString() }
];

export default function EmployeeScheduleCalendar() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [shifts, setShifts] = useState(MOCK_SHIFTS);

  // Filter shifts based on selection
  const events = selectedEmployee === 'all' 
    ? shifts 
    : shifts.filter(s => s.resourceId === selectedEmployee);

  // Add color to events based on employee
  const coloredEvents = events.map(event => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === event.resourceId);
    return {
      ...event,
      backgroundColor: emp?.color || '#3788d8',
      borderColor: emp?.color || '#3788d8',
    };
  });

  const handleDateSelect = (selectInfo: any) => {
    if (selectedEmployee === 'all') {
      toast.error('Please select a specific employee to add a shift.');
      selectInfo.view.calendar.unselect();
      return;
    }

    const title = prompt('Enter shift location/notes:');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    if (title) {
      const newShift = {
        id: String(Date.now()),
        resourceId: selectedEmployee,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      };
      setShifts([...shifts, newShift]);
      toast.success('Shift added successfully');
    }
  };

  const handleEventClick = (clickInfo: any) => {
    if (confirm(`Are you sure you want to delete the shift '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
      setShifts(shifts.filter(s => s.id !== clickInfo.event.id));
      toast.success('Shift deleted');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Employee Schedule Calendar</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {MOCK_EMPLOYEES.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
            Publish Week
          </button>
        </div>
      </div>
      
      <Card className="flex-grow flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>Weekly Workforce Plan</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag to create shifts for the selected employee. Click an existing shift to delete it.
          </p>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-0">
          <div className="h-full min-h-[600px] p-4">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
              }}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={coloredEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="100%"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
