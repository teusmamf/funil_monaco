export interface FunnelData {
  name: string;
  email: string;
  phone:string;
  leads: number;
  appointments: number;
  attendance: number;
  sales: number;
}

export interface Rates {
  leadsToAppointments: number;
  appointmentsToAttendance: number;
  attendanceToSales: number;
  leadsToSales: number;
}

export interface MarketRates {
  leadsToAppointments: number;
  appointmentsToAttendance: number;
  attendanceToSales: number;
  leadsToSales: number;
}