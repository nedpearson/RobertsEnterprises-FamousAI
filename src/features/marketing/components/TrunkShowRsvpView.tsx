import React, { useState } from 'react';
import { Users, Mail, Phone, Calendar, MapPin, CheckCircle2, Clock, Search, MoreHorizontal, UserCheck, MessageSquare } from 'lucide-react';

interface RsvpRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Attending' | 'Maybe' | 'Waitlisted' | 'Cancelled';
  vip: boolean;
  appointmentBooked: boolean;
}

const MOCK_RSVPS: RsvpRecord[] = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '(555) 123-4567', status: 'Attending', vip: true, appointmentBooked: true },
  { id: '2', name: 'Emily Thorne', email: 'emily.t@example.com', phone: '(555) 234-5678', status: 'Attending', vip: false, appointmentBooked: false },
  { id: '3', name: 'Jessica Alba', email: 'jess.a@example.com', phone: '(555) 345-6789', status: 'Waitlisted', vip: false, appointmentBooked: false },
  { id: '4', name: 'Amanda Chen', email: 'amanda.c@example.com', phone: '(555) 456-7890', status: 'Maybe', vip: true, appointmentBooked: false },
  { id: '5', name: 'Olivia Martin', email: 'olivia.m@example.com', phone: '(555) 567-8901', status: 'Attending', vip: false, appointmentBooked: true },
];

export default function TrunkShowRsvpView() {
  const [rsvps, setRsvps] = useState<RsvpRecord[]>(MOCK_RSVPS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = rsvps.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Col: Event Details */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Event
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight mb-2">Monique Lhuillier Fall 2026 Trunk Show</h2>
            
            <div className="space-y-3 mt-4 text-sm text-stone-600">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-stone-400 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Oct 24 - 26, 2026</p>
                  <p className="text-xs">Fri 10am - Sun 5pm</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-stone-400 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">I Do Bridal Couture</p>
                  <p className="text-xs">Baton Rouge, LA</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-3">Event Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
                  <p className="text-2xl font-black text-stone-900">{rsvps.filter(r => r.status === 'Attending').length}</p>
                  <p className="text-[10px] font-bold text-stone-500 uppercase mt-1">Attending</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-700">{rsvps.filter(r => r.appointmentBooked).length}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Booked</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: RSVP List */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="font-bold text-stone-900 text-lg">Guest List ({filtered.length})</h3>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search RSVPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-stone-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Appointment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filtered.map(guest => (
                    <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-900">{guest.name}</p>
                          {guest.vip && (
                            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 uppercase tracking-wider">VIP</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-500 space-y-1">
                        <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {guest.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {guest.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          guest.status === 'Attending' ? 'bg-emerald-100 text-emerald-700' :
                          guest.status === 'Waitlisted' ? 'bg-amber-100 text-amber-700' :
                          guest.status === 'Maybe' ? 'bg-blue-100 text-blue-700' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {guest.status === 'Attending' ? <CheckCircle2 className="h-3 w-3" /> :
                           guest.status === 'Waitlisted' ? <Clock className="h-3 w-3" /> : null}
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {guest.appointmentBooked ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold"><UserCheck className="h-3.5 w-3.5" /> Booked</span>
                        ) : (
                          <button className="text-rose-600 font-bold hover:text-rose-700 hover:underline">Book Now</button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors" title="Send Message">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors" title="More Options">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filtered.length === 0 && (
              <div className="p-8 text-center text-stone-500">
                No RSVPs match your search.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
