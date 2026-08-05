import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, Clock, DollarSign, FileText, CheckCircle, MessageSquare, Play, Calendar } from 'lucide-react';

export function Appointment360Panel({ appointmentId, request, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!request) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
        Select an appointment or request from the calendar or queue to view the 360° details.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-l bg-background">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-start sticky top-0 bg-background z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{request.customerName || 'Customer Name'}</h2>
            <Badge variant={request.status === 'confirmed' ? 'default' : 'secondary'}>
              {request.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="h-3 w-3" /> {request.customerPhone || '(555) 123-4567'}
            <Mail className="h-3 w-3 ml-2" /> {request.customerEmail || 'customer@example.com'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          &times;
        </Button>
      </div>

      {/* Check-in / Execution Action Bar */}
      <div className="bg-muted/30 p-3 border-b flex gap-2 overflow-x-auto">
        <Button size="sm" variant="outline" className="flex gap-2 whitespace-nowrap"><Clock className="h-4 w-4"/> Check In</Button>
        <Button size="sm" variant="default" className="flex gap-2 whitespace-nowrap"><Play className="h-4 w-4"/> Start Appt</Button>
        <Button size="sm" variant="secondary" className="flex gap-2 whitespace-nowrap"><CheckCircle className="h-4 w-4"/> Complete</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comms">Comms</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Request Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Request Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Service</span>
                  <p className="font-medium">{request.serviceName || 'Bridal Consultation'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Assigned To</span>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-3 w-3"/> {request.employeeName || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Time</span>
                  <p className="font-medium">{request.time || '10:00 AM - 11:30 AM'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Room</span>
                  <p className="font-medium">{request.roomName || 'Suite A'}</p>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider flex justify-between">
                Internal Notes
                <Button variant="link" size="sm" className="h-auto p-0">Add Note</Button>
              </h3>
              <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900 shadow-none">
                <CardContent className="p-3 text-sm">
                  <p className="font-medium text-xs text-yellow-800 dark:text-yellow-500 mb-1">Jane Stylist • Today 9:00 AM</p>
                  Customer is looking for a mermaid fit, budget is strictly under $2,500. Brought 3 guests.
                </CardContent>
              </Card>
            </div>

            {/* Tasks & Next Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider flex justify-between">
                Next Actions
                <Button variant="link" size="sm" className="h-auto p-0">Add Task</Button>
              </h3>
              <div className="border rounded-md p-3 text-sm flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div>
                  <p className="font-medium">Send follow-up thank you email</p>
                  <p className="text-muted-foreground text-xs">Due tomorrow • Assigned to Jane</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comms" className="space-y-4 mt-0 h-full flex flex-col">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" className="flex-1"><MessageSquare className="h-4 w-4 mr-2"/> SMS</Button>
              <Button size="sm" variant="outline" className="flex-1"><Mail className="h-4 w-4 mr-2"/> Email</Button>
              <Button size="sm" variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2"/> Log Call</Button>
            </div>
            
            <div className="flex-1 border rounded-md p-4 bg-muted/10 space-y-4 mb-4">
              <div className="flex justify-center text-xs text-muted-foreground">Yesterday</div>
              <div className="bg-primary/10 text-foreground p-3 rounded-lg rounded-tl-none max-w-[85%] text-sm">
                Hi! Just confirming your appointment for tomorrow at 10 AM. We look forward to seeing you!
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[85%] text-sm">
                  Thank you! I'll be there with my mom and sister.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button size="icon"><Play className="h-4 w-4"/></Button>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-0">
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Attached Files & Photos</h3>
              <Button size="sm" variant="outline">Upload</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="overflow-hidden">
                <div className="h-24 bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50"/>
                </div>
                <CardContent className="p-2 text-xs truncate font-medium">Inspiration_1.jpg</CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="h-24 bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50"/>
                </div>
                <CardContent className="p-2 text-xs truncate font-medium">Signed_Agreement.pdf</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6 mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex justify-between">
                  Booking Fee
                  <Badge variant="default" className="bg-green-500">PAID</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">$50.00</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3"/> Credit Card (...1234)</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid On</span>
                  <span className="font-medium">Aug 1, 2026</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex justify-between">
                  Open Invoices
                  <Badge variant="outline" className="text-amber-500 border-amber-500">PENDING</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Gown Balance</span>
                  <span className="font-medium">$1,500.00</span>
                </div>
                <Button size="sm" className="w-full mt-3">Request Payment via SMS</Button>
              </CardContent>
            </Card>
          </TabsContent>

        </ScrollArea>
      </Tabs>
    </div>
  );
}
