import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MOCK_REQUESTS, MOCK_RECOMMENDATIONS, MOCK_EMPLOYEES, MOCK_SHIFTS } from '@/lib/demo/scheduling-mock-data';

export default function AssignmentCenter() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const activeRequest = requests.find(r => r.id === selectedRequest);
  const recommendations = selectedRequest ? MOCK_RECOMMENDATIONS[selectedRequest as keyof typeof MOCK_RECOMMENDATIONS] || [] : [];

  const handleAssign = (reqId: string, employeeName: string) => {
    toast.success(`Successfully assigned request to ${employeeName}`);
    setRequests(requests.filter(r => r.id !== reqId));
    setSelectedRequest(null);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assignment Center</h1>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
          AI Assignment Engine Active
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* Panel 1: Queue */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle>Request Queue</CardTitle>
            <p className="text-sm text-muted-foreground">Pending customer requests.</p>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-4 space-y-4 bg-muted/10">
            {requests.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">No pending requests.</div>
            ) : (
              requests.map(req => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedRequest(req.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRequest === req.id 
                      ? 'border-l-4 border-l-primary bg-primary/5 shadow-sm' 
                      : 'border-l-4 border-l-yellow-400 bg-white hover:bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-foreground">{req.customerName}</h3>
                    <span className="text-xs text-muted-foreground">{req.submittedAt}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1 font-medium">{req.service}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">{req.locationPreference}</Badge>
                    <Badge variant="secondary" className="text-xs">{req.timeframe}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Panel 2: Recommendations */}
        <Card className="flex flex-col">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle>AI Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">Scored availability matches.</p>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-4 bg-white">
            {!selectedRequest ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="mb-2 text-3xl">✨</div>
                <p>Select a request from the queue to see recommendations</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">No available matches found.</div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 pb-4 border-b">
                  <h4 className="font-semibold text-lg">{activeRequest?.customerName}</h4>
                  <p className="text-sm text-muted-foreground">{activeRequest?.service}</p>
                </div>
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="border rounded-lg p-4 relative overflow-hidden shadow-sm">
                    {/* Score Bar Background */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-green-50 z-0" 
                      style={{ width: `${rec.score}%` }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: MOCK_EMPLOYEES.find(e => e.id === rec.employeeId)?.color }}></span>
                          {rec.employeeName}
                        </h4>
                        <Badge variant="outline" className={`font-bold ${rec.score >= 90 ? 'text-green-600 border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                          {rec.score}% Match
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                        {new Date(rec.start).toLocaleDateString()} • {new Date(rec.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(rec.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleAssign(selectedRequest, rec.employeeName)}
                      >
                        Assign to {rec.employeeName.split(' ')[0]}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel 3: Capacity */}
        <Card className="flex flex-col">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle>Location Capacity</CardTitle>
            <p className="text-sm text-muted-foreground">Current workforce schedule.</p>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0 relative">
            <div className="absolute inset-0 p-2">
              <FullCalendar
                plugins={[timeGridPlugin]}
                initialView="timeGridDay"
                headerToolbar={{ left: 'title', right: '' }}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                events={MOCK_SHIFTS.map(shift => ({
                  ...shift,
                  backgroundColor: MOCK_EMPLOYEES.find(e => e.id === shift.resourceId)?.color || '#ccc',
                  borderColor: MOCK_EMPLOYEES.find(e => e.id === shift.resourceId)?.color || '#ccc',
                  title: MOCK_EMPLOYEES.find(e => e.id === shift.resourceId)?.name || 'Shift'
                }))}
                height="100%"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
