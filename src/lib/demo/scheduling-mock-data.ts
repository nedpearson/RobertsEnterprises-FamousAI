import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns';

const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

// Helper to create dates
export const createDate = (daysOffset: number, hours: number, minutes: number = 0) => {
  const d = addDays(startOfCurrentWeek, daysOffset);
  return setMinutes(setHours(d, hours), minutes).toISOString();
};

export const MOCK_EMPLOYEES = [
  { id: 'emp_1', name: 'Sarah Smith', role: 'Senior Stylist', color: '#4ade80' },
  { id: 'emp_2', name: 'Jessica Lee', role: 'Stylist', color: '#60a5fa' },
  { id: 'emp_3', name: 'Emily Chen', role: 'Consultant', color: '#c084fc' },
];

export const MOCK_SHIFTS = [
  // Sarah's shifts
  { id: 'shift_1', resourceId: 'emp_1', title: 'Shift (Baton Rouge)', start: createDate(1, 9), end: createDate(1, 17) },
  { id: 'shift_2', resourceId: 'emp_1', title: 'Shift (Baton Rouge)', start: createDate(2, 9), end: createDate(2, 17) },
  { id: 'shift_3', resourceId: 'emp_1', title: 'Shift (Baton Rouge)', start: createDate(3, 10), end: createDate(3, 18) },
  
  // Jessica's shifts
  { id: 'shift_4', resourceId: 'emp_2', title: 'Shift (Covington)', start: createDate(2, 9), end: createDate(2, 15) },
  { id: 'shift_5', resourceId: 'emp_2', title: 'Shift (Covington)', start: createDate(4, 9), end: createDate(4, 17) },
  { id: 'shift_6', resourceId: 'emp_2', title: 'Shift (Covington)', start: createDate(5, 9), end: createDate(5, 17) },

  // Emily's shifts
  { id: 'shift_7', resourceId: 'emp_3', title: 'Shift (Baton Rouge)', start: createDate(1, 12), end: createDate(1, 18) },
  { id: 'shift_8', resourceId: 'emp_3', title: 'Shift (Baton Rouge)', start: createDate(3, 12), end: createDate(3, 18) },
  { id: 'shift_9', resourceId: 'emp_3', title: 'Shift (Baton Rouge)', start: createDate(4, 10), end: createDate(4, 18) },
];

export const MOCK_REQUESTS = [
  {
    id: 'req_1',
    customerName: 'Jane Doe',
    service: 'Bridal Consultation',
    submittedAt: '2 hrs ago',
    locationPreference: 'Baton Rouge',
    timeframe: 'Next Week',
    preferredDateOffset: 1, // Monday
    preferredHour: 10,
    status: 'submitted'
  },
  {
    id: 'req_2',
    customerName: 'Amanda Johnson',
    service: 'Alterations',
    submittedAt: '5 hrs ago',
    locationPreference: 'Covington',
    timeframe: 'Next Week',
    preferredDateOffset: 2, // Tuesday
    preferredHour: 14,
    status: 'submitted'
  },
  {
    id: 'req_3',
    customerName: 'Claire Williams',
    service: 'Accessory Styling',
    submittedAt: '1 day ago',
    locationPreference: 'Any Location',
    timeframe: 'Next available',
    preferredDateOffset: 3, // Wednesday
    preferredHour: 11,
    status: 'submitted'
  }
];

export const MOCK_RECOMMENDATIONS = {
  'req_1': [
    { employeeId: 'emp_1', employeeName: 'Sarah Smith', start: createDate(1, 10), end: createDate(1, 11, 30), score: 95 },
    { employeeId: 'emp_3', employeeName: 'Emily Chen', start: createDate(1, 12), end: createDate(1, 13, 30), score: 80 },
  ],
  'req_2': [
    { employeeId: 'emp_2', employeeName: 'Jessica Lee', start: createDate(2, 14), end: createDate(2, 15, 30), score: 90 },
  ],
  'req_3': [
    { employeeId: 'emp_1', employeeName: 'Sarah Smith', start: createDate(3, 11), end: createDate(3, 12, 30), score: 85 },
    { employeeId: 'emp_3', employeeName: 'Emily Chen', start: createDate(3, 12), end: createDate(3, 13, 30), score: 82 },
  ]
};

export const MOCK_CONFIRMED_APPOINTMENTS = [
  { id: 'appt_1', title: 'Bridal Consult - Laura M.', start: createDate(1, 14), end: createDate(1, 15, 30), backgroundColor: '#4ade80' },
  { id: 'appt_2', title: 'Alterations - Rachel K.', start: createDate(2, 10), end: createDate(2, 11, 30), backgroundColor: '#60a5fa' },
  { id: 'appt_3', title: 'Accessory Styling - Kim B.', start: createDate(4, 11), end: createDate(4, 12, 30), backgroundColor: '#c084fc' },
];
