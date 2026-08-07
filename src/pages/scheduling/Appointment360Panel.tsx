import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, Clock, DollarSign, FileText, CheckCircle, MessageSquare, Play, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useAppointment360, 
  useStaffProfiles, 
  useAIRecommendations, 
  useUpdateAppointmentStatus, 
  useAssignStaff,
  useAddAppointmentNote,
  useAddAppointmentTask,
  useAddCommunication
} from '@/lib/services/schedulingService';
import { useVowosData } from '@/contexts/VowosDataContext';
import { OutcomeModal } from './OutcomeModal';

export function Appointment360Panel({ appointmentId, request, onClose }: { appointmentId: string, request: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  
  const { businessId } = useVowosData();
  const { data: apt360, isLoading } = useAppointment360(appointmentId);
  const { data: staff = [] } = useStaffProfiles();
  const { data: aiRecs = [] } = useAIRecommendations(request?.id || appointmentId);
  
  const assignMutation = useAssignStaff();
  const statusMutation = useUpdateAppointmentStatus();
  const addNoteMutation = useAddAppointmentNote();
  const addTaskMutation = useAddAppointmentTask();
  const addCommMutation = useAddCommunication();

  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  
  const [newTask, setNewTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);

  const [newComm, setNewComm] = useState('');

  const handleAssignStaff = (employeeId: string) => {
    if (!appointmentId) return;
    assignMutation.mutate({ appointmentId, employeeId });
  };

  const handleCheckIn = () => {
    if (!appointmentId) return;
    statusMutation.mutate({ appointmentId, status: 'arrived' });
  };
  
  const handleStart = () => {
    if (!appointmentId) return;
    statusMutation.mutate({ appointmentId, status: 'in-progress' });
  };

  const handleAddNote = () => {
    if (!appointmentId || !newNote.trim()) return;
    addNoteMutation.mutate({ appointmentId, content: newNote, businessId }, {
      onSuccess: () => {
        setNewNote('');
        setShowNoteInput(false);
      }
    });
  };

  const handleAddTask = () => {
    if (!appointmentId || !newTask.trim()) return;
    addTaskMutation.mutate({ appointmentId, title: newTask, businessId }, {
      onSuccess: () => {
        setNewTask('');
        setShowTaskInput(false);
      }
    });
  };

  const handleSendComm = () => {
    if (!appointmentId || !newComm.trim()) return;
    addCommMutation.mutate({ appointmentId, content: newComm, businessId }, {
      onSuccess: () => {
        setNewComm('');
      }
    });
  };

  if (!request && !appointmentId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
        Select an appointment or request from the calendar or queue to view the 360° details.
      </div>
    );
  }

  const customerName = request?.customerName || (apt360?.appointment?.customer ? apt360.appointment.customer.first_name + ' ' + apt360.appointment.customer.last_name : 'Customer Name');
  const initials = customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  const status = (request?.status || apt360?.appointment?.confirmation_status || 'PENDING').toUpperCase();

  return (
    <div className="h-full flex flex-col border-l bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <div className="p-5 pt-6 flex justify-between items-start z-10">
          <div className="flex gap-4 items-center">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-1 ring-black/5">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{customerName}</h2>
                <Badge className={
                  status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200' : 
                  status === 'ARRIVED' || status === 'IN-PROGRESS' ? 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-200' :
                  status === 'COMPLETED' ? 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-200' :
                  'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200'
                } variant="outline">
                  {status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {apt360?.appointment?.customer?.phone || request?.customerPhone || 'No phone on file'}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {apt360?.appointment?.customer?.email || request?.customerEmail || 'No email on file'}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-black/5">
            &times;
          </Button>
        </div>
      </div>

      {/* Check-in / Execution Action Bar */}
      {appointmentId && (
        <div className="bg-background px-5 py-3 border-b flex gap-2 overflow-x-auto shadow-sm z-20">
          <Button size="sm" variant="outline" className="flex-1 flex gap-2 font-medium" onClick={handleCheckIn}><Clock className="h-4 w-4 text-indigo-500"/> Check In</Button>
          <Button size="sm" variant="default" className="flex-1 flex gap-2 font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" onClick={handleStart}><Play className="h-4 w-4"/> Start Appt</Button>
          <Button size="sm" variant="secondary" className="flex-1 flex gap-2 font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400" onClick={() => setOutcomeModalOpen(true)}><CheckCircle className="h-4 w-4"/> Complete</Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai">AI Match</TabsTrigger>
            <TabsTrigger value="comms">Comms</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Request Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Service Details</h3>
              </div>
              <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-card">
                <CardContent className="p-4 grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1.5 text-xs font-medium">Service</span>
                    <p className="font-medium text-foreground">{apt360?.appointment?.service?.name || request?.serviceName || 'Bridal Consultation'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1.5 text-xs font-medium">Assigned To</span>
                    {appointmentId ? (
                      <Select 
                        value={apt360?.appointment?.employee_id || ''} 
                        onValueChange={handleAssignStaff}
                      >
                        <SelectTrigger className="h-8 text-xs border-indigo-100 bg-white">
                          <SelectValue placeholder="Assign staff..." />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.first_name} {s.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-indigo-500"/> {request?.employeeName || 'Unassigned'}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1.5 text-xs font-medium">Time</span>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-purple-500" />
                      {request?.time || (apt360?.appointment ? `${new Date(apt360.appointment.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(apt360.appointment.end_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '10:00 AM - 11:30 AM')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1.5 text-xs font-medium">Room</span>
                    <p className="font-medium text-foreground">{apt360?.appointment?.room?.name || request?.roomName || 'Suite A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider flex justify-between">
                Internal Notes
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setShowNoteInput(!showNoteInput)}>
                  {showNoteInput ? 'Cancel' : 'Add Note'}
                </Button>
              </h3>
              
              {showNoteInput && (
                <div className="space-y-2 mb-4">
                  <Textarea 
                    placeholder="Enter internal note..." 
                    value={newNote} 
                    onChange={(e) => setNewNote(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleAddNote} disabled={addNoteMutation.isPending || !newNote.trim()}>
                    {addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              )}

              {apt360?.notes?.length ? (
                apt360.notes.map((note: any) => (
                  <Card key={note.id} className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900 shadow-none mb-2">
                    <CardContent className="p-3 text-sm">
                      <p className="font-medium text-xs text-yellow-800 dark:text-yellow-500 mb-1">Note • {new Date(note.created_at).toLocaleString()}</p>
                      {note.content}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900 shadow-none">
                  <CardContent className="p-3 text-sm">
                    <p className="text-muted-foreground italic">No internal notes.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tasks & Next Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider flex justify-between">
                Next Actions
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setShowTaskInput(!showTaskInput)}>
                  {showTaskInput ? 'Cancel' : 'Add Task'}
                </Button>
              </h3>
              
              {showTaskInput && (
                <div className="space-y-2 mb-4">
                  <Input 
                    placeholder="Task title..." 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleAddTask} disabled={addTaskMutation.isPending || !newTask.trim()}>
                    {addTaskMutation.isPending ? 'Saving...' : 'Save Task'}
                  </Button>
                </div>
              )}

              {apt360?.tasks?.length ? (
                apt360.tasks.map((task: any) => (
                  <div key={task.id} className="border rounded-md p-3 text-sm flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-muted-foreground text-xs">{task.due_date ? `Due ${task.due_date}` : 'No due date'} • Assigned to {task.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border rounded-md p-3 text-sm text-muted-foreground italic text-center bg-muted/10">
                  No tasks or next actions
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-0">
            <div className="space-y-4">
              <h3 className="font-semibold text-xs uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">AI Assignment Recommendations</h3>
              {aiRecs.length > 0 ? (
                <div className="space-y-3">
                  {aiRecs.map((rec: any, idx: number) => (
                    <Card key={rec.id} className={`overflow-hidden border transition-all ${idx === 0 ? 'border-indigo-300 shadow-md ring-1 ring-indigo-500/20 bg-indigo-50/30' : 'opacity-80 hover:opacity-100'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border bg-white">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                {rec.employee?.first_name?.[0]}{rec.employee?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{rec.employee?.first_name} {rec.employee?.last_name}</p>
                              <p className="text-xs text-muted-foreground">{rec.employee?.role || 'Staff'}</p>
                            </div>
                          </div>
                          <Badge variant={idx === 0 ? "default" : "secondary"} className={idx === 0 ? "bg-indigo-600" : ""}>
                            {rec.score}% Match
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-3 bg-muted/30 p-2 rounded-md">
                          {rec.reasoning || "AI determined this is an optimal match."}
                        </div>
                        
                        {appointmentId && apt360?.appointment?.employee_id !== rec.employee_id && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-3 h-8 text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            onClick={() => handleAssignStaff(rec.employee_id)}
                            disabled={assignMutation.isPending}
                          >
                            Assign to {rec.employee?.first_name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border rounded-md border-dashed bg-muted/5">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-sm font-medium">No AI recommendations available</p>
                  <p className="text-xs text-muted-foreground mt-1">This request has not been processed by the AI matching engine yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comms" className="space-y-4 mt-0 h-full flex flex-col">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" className="flex-1"><MessageSquare className="h-4 w-4 mr-2"/> SMS</Button>
              <Button size="sm" variant="outline" className="flex-1"><Mail className="h-4 w-4 mr-2"/> Email</Button>
              <Button size="sm" variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2"/> Log Call</Button>
            </div>
            
            <div className="flex-1 border rounded-md p-4 bg-muted/10 space-y-4 mb-4 overflow-y-auto">
              {apt360?.communications?.length ? (
                apt360.communications.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                    <div className={`${msg.direction === 'outbound' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-primary/10 text-foreground rounded-tl-none'} p-3 rounded-lg max-w-[85%] text-sm`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                  No communications yet
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="Type a message..." 
                className="flex-1" 
                value={newComm}
                onChange={(e) => setNewComm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendComm(); }}
              />
              <Button size="icon" onClick={handleSendComm} disabled={addCommMutation.isPending || !newComm.trim()}>
                <Play className="h-4 w-4"/>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-0">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Attached Files & Photos</h3>
              <Button size="sm" variant="outline">Upload</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {apt360?.files?.length ? (
                apt360.files.map((f: any) => (
                  <Card key={f.id} className="overflow-hidden">
                    <div className="h-24 bg-muted flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/50"/>
                    </div>
                    <CardContent className="p-2 text-xs truncate font-medium">{f.name}</CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-2">No files attached.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6 mt-0">
            {(!apt360?.payments?.length && !apt360?.invoices?.length) ? (
              <div className="flex items-center justify-center h-32 border rounded-md bg-muted/10 text-muted-foreground text-sm italic">
                No payment recorded
              </div>
            ) : (
              <>
                {apt360?.payments?.map((payment: any) => (
                  <Card key={payment.id}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg flex justify-between">
                        {payment.title || 'Payment'}
                        <Badge variant="default" className="bg-green-500">{payment.status || 'PAID'}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">${payment.amount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium flex items-center gap-1"><DollarSign className="h-3 w-3"/> {payment.method || 'Credit Card'} {payment.last4 ? `(...${payment.last4})` : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid On</span>
                        <span className="font-medium">{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {apt360?.invoices?.map((invoice: any) => (
                  <Card key={invoice.id}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg flex justify-between">
                        {invoice.title || 'Invoice'}
                        <Badge variant="outline" className="text-amber-500 border-amber-500">{invoice.status || 'PENDING'}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Balance</span>
                        <span className="font-medium">${invoice.balance?.toFixed(2)}</span>
                      </div>
                      <Button size="sm" className="w-full mt-3">Request Payment via SMS</Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

        </ScrollArea>
      </Tabs>
      
      {apt360?.appointment && (
        <OutcomeModal 
          appointment={apt360.appointment}
          isOpen={outcomeModalOpen}
          onClose={() => setOutcomeModalOpen(false)}
        />
      )}
    </div>
  );
}
