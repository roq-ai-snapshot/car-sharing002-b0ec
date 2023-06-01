import { CarInterface } from 'interfaces/car';
import { UserInterface } from 'interfaces/user';

export interface CompanyInterface {
  id?: string;
  name: string;
  owner_id: string;
  car?: CarInterface[];
  user?: UserInterface;
  _count?: {
    car?: number;
  };
}
