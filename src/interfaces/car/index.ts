import { BookingInterface } from 'interfaces/booking';
import { CompanyInterface } from 'interfaces/company';

export interface CarInterface {
  id?: string;
  make: string;
  model: string;
  year: number;
  location: string;
  availability: boolean;
  company_id: string;
  booking?: BookingInterface[];
  company?: CompanyInterface;
  _count?: {
    booking?: number;
  };
}
