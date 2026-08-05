import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment360Panel } from './Appointment360Panel';

// Mock data for requests
const MOCK_REQUESTS = [
  { id: 'req_1', customerName: 'Emma Watson', serviceName: 'Bridal Consultation', status: 'submitted', time: 'Preferred: Sat Morning', employeeName: null },
  { id: 'req_2', customerName: 'Sophia Taylor', serviceName: 'Alterations', status: 'submitted', time: 'Flexible', employeeName: null },
];

export function CombinedOperationsCalendar() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  const handleEventClick = (info: any) => {
    // Mock selection
    setSelectedRequest({
      id: info.event.id,
      customerName: info.event.title,
      serviceName: 'Bridal Consultation',
      status: 'confirmed',
      time: '10:00 AM - 11:30 AM',
      employeeName: 'Jane Stylist',
      roomName: 'Suite A'
    });
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-muted/20">
      
      {/* LEFT PANEL: Request Queue & Filters */}
      <div className="w-80 flex flex-col border-r bg-background shrink-0">
        <div className="p-4 border-b bg-muted/10">
          <h2 className="font-semibold text-lg">Action Queue</h2>
          <p className="text-sm text-muted-foreground">Unassigned & Pending</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {MOCK_REQUESTS.map(req => (
            <Card 
              key={req.id} 
              className={`cursor-pointer hover:border-primary transition-colors ${selectedRequest?.id === req.id ? 'border-primary shadow-sm ring-1 ring-primary/20' : ''}`}
              onClick={() => setSelectedRequest(req)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm">{req.customerName}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase">{req.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{req.serviceName}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-muted px-2 py-0.5 rounded-sm">{req.time}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2">Assign</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CENTER PANEL: Combined Calendar Grid */}
      <div className="flex-1 min-w-0 flex flex-col bg-background relative overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-background z-10">
          <h2 className="font-semibold text-lg">Operations Calendar</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Jane Stylist</Badge>
            <Badge variant="outline">Suite A</Badge>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto relative z-0">
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
            events={[
              { id: 'evt_1', title: 'Jessica Smith', start: new Date(new Date().setHours(10, 0, 0, 0)), end: new Date(new Date().setHours(11, 30, 0, 0)), backgroundColor: '#10b981', borderColor: '#059669' },
              { id: 'evt_2', title: 'Olivia Brown (Hold)', start: new Date(new Date().setHours(14, 0, 0, 0)), end: new Date(new Date().setHours(15, 0, 0, 0)), backgroundColor: '#f59e0b', borderColor: '#d97706' }
            ]}
            eventClick={handleEventClick}
          />
        </div>
      </div>

      {/* RIGHT PANEL: Appointment 360 */}
      {selectedRequest && (
        <div className="w-[450px] shrink-0 bg-background border-l shadow-xl transition-all duration-300">
          <Appointment360Panel 
            appointmentId={selectedRequest.id} 
            request={selectedRequest} 
            onClose={() => setSelectedRequest(null)} 
          />
        </div>
      )}
    </div>
  );
}
