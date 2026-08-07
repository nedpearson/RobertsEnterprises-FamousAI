import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, Clock, Calendar, User, FileText, CheckCircle, MessageSquare, Play, AlertCircle, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useAIRecommendations,
  useStaffProfiles
} from '@/lib/services/schedulingService';
import { useVowosData } from '@/contexts/VowosDataContext';

export function Request360Panel({ requestId, request, onClose }: { requestId?: string, request: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('summary');
  
  const { businessId } = useVowosData();
  const { data: staff = [] } = useStaffProfiles();
  const { data: aiRecs = [] } = useAIRecommendations(requestId || request?.id);
  
  if (!request && !requestId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center bg-background">
        Select a request from the queue to view the 360° details.
      </div>
    );
  }

  const customerName = request?.customerName || request?.customer?.first_name ? `${request?.customer?.first_name} ${request?.customer?.last_name || ''}` : null;
  const initials = customerName ? customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  const status = (request?.status || 'PENDING').toUpperCase();

  const renderMissing = (label: string) => (
    <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs italic">
      <AlertCircle className="h-3 w-3" /> Missing {label}
    </div>
  );

  return (
    <div className="h-full flex flex-col border-l bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <div className="p-5 pt-6 flex justify-between items-start z-10">
          <div className="flex gap-4 items-center">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-1 ring-black/5 bg-background">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{customerName || renderMissing('Customer Identity')}</h2>
                <Badge className={
                  status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                  status === 'SCHEDULED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                  'bg-gray-500/10 text-gray-600 border-gray-200'
                } variant="outline">
                  {status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {request?.customerPhone || renderMissing('Phone')}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {request?.customerEmail || renderMissing('Email')}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-black/5">
            &times;
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="border-b overflow-x-auto custom-scrollbar">
          <TabsList className="inline-flex w-max min-w-full justify-start h-12 p-1 bg-transparent">
            <TabsTrigger value="summary" className="data-[state=active]:bg-muted">Summary</TabsTrigger>
            <TabsTrigger value="customer" className="data-[state=active]:bg-muted">Customer</TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-muted">Preferences</TabsTrigger>
            <TabsTrigger value="staffing" className="data-[state=active]:bg-muted">Staffing</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-muted flex gap-1.5"><Sparkles className="h-3 w-3 text-amber-500"/> AI Match</TabsTrigger>
            <TabsTrigger value="comms" className="data-[state=active]:bg-muted">Comms</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-muted">Files</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-muted">Tasks</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-muted">History</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-5">
          <TabsContent value="summary" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request Number</p>
                <p className="text-sm font-medium">{request?.requestNumber || request?.id?.substring(0,8) || renderMissing('Request Number')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted Date</p>
                <p className="text-sm font-medium">{request?.created_at ? new Date(request.created_at).toLocaleString() : renderMissing('Submitted Date')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                <p className="text-sm font-medium">{request?.serviceName || request?.service?.name || renderMissing('Service')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Date</p>
                <p className="text-sm font-medium">{request?.eventDate ? new Date(request.eventDate).toLocaleDateString() : renderMissing('Event Date')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</p>
                <p className="text-sm font-medium">{request?.budget ? `$${request.budget}` : renderMissing('Budget')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendees</p>
                <p className="text-sm font-medium">{request?.attendees || renderMissing('Attendees Count')}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customer" className="mt-0 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Consultant</p>
                <p className="text-sm font-medium">{request?.customer?.assigned_consultant?.name || renderMissing('Assigned Consultant')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Contact</p>
                <p className="text-sm font-medium">{request?.customer?.preferred_contact_method || renderMissing('Preference')}</p>
              </div>
             </div>
             <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Customer Notes</p>
                {request?.customer?.notes ? (
                  <p className="text-sm">{request.customer.notes}</p>
                ) : renderMissing('Customer Notes')}
             </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-0 space-y-6">
             <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">Scheduling Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Dates</p>
                    <p className="text-sm font-medium">{request?.preferredDates?.join(', ') || renderMissing('Dates')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Times</p>
                    <p className="text-sm font-medium">{request?.preferredTimes?.join(', ') || renderMissing('Times')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Locations</p>
                    <p className="text-sm font-medium">{request?.preferredLocations?.join(', ') || renderMissing('Locations')}</p>
                  </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="staffing" className="mt-0 space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eligible Employees</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {request?.eligibleEmployees?.length ? request.eligibleEmployees.map((e: any) => (
                  <Badge variant="secondary" key={e.id}>{e.name}</Badge>
                )) : renderMissing('Eligible Employees')}
              </div>
            </div>
             <div className="space-y-1 mt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Excluded Employees</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {request?.excludedEmployees?.length ? request.excludedEmployees.map((e: any) => (
                  <Badge variant="destructive" key={e.id}>{e.name}</Badge>
                )) : <span className="text-sm text-muted-foreground">None</span>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0 space-y-6">
            <h3 className="font-semibold text-xs uppercase text-blue-600 dark:text-blue-400 tracking-wider">AI Assignment Recommendations</h3>
            {aiRecs.length > 0 ? (
              <div className="space-y-3">
                {aiRecs.map((rec: any, idx: number) => (
                  <Card key={rec.id} className={`overflow-hidden border transition-all ${idx === 0 ? 'border-blue-300 shadow-md ring-1 ring-blue-500/20 bg-blue-50/30' : 'opacity-80 hover:opacity-100'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border bg-white">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {rec.employee?.first_name?.[0]}{rec.employee?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{rec.employee?.first_name} {rec.employee?.last_name}</p>
                            <p className="text-xs text-muted-foreground">{rec.employee?.role || 'Staff'}</p>
                          </div>
                        </div>
                        <Badge variant={idx === 0 ? "default" : "secondary"} className={idx === 0 ? "bg-blue-600" : ""}>
                          {rec.score}% Match
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-3 bg-muted/30 p-2 rounded-md">
                        {rec.reasoning || "AI determined this is an optimal match."}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border rounded-md border-dashed bg-muted/5">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No AI recommendations available</p>
                <p className="text-xs text-muted-foreground mt-1">This request has not been processed by the AI matching engine yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comms" className="mt-0 space-y-4 h-full flex flex-col min-h-[400px]">
             <div className="flex-1 border rounded-md p-4 bg-muted/10 flex items-center justify-center text-muted-foreground text-sm italic">
                {renderMissing('Communications Data')}
             </div>
          </TabsContent>

          <TabsContent value="files" className="mt-0 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Attached Files & Photos</h3>
              <Button size="sm" variant="outline">Upload</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <p className="text-xs text-muted-foreground col-span-2">{renderMissing('Files')}</p>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 space-y-4">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Tasks</h3>
              <Button size="sm" variant="outline">Add Task</Button>
            </div>
            <p className="text-xs text-muted-foreground">{renderMissing('Tasks')}</p>
          </TabsContent>

          <TabsContent value="history" className="mt-0 space-y-4">
             <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                {/* Timeline mock */}
                <div className="relative pl-6">
                  <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-background"></div>
                  <p className="text-sm font-medium">Request Created</p>
                  <p className="text-xs text-muted-foreground">{request?.created_at ? new Date(request.created_at).toLocaleString() : 'Unknown Date'}</p>
                </div>
             </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
