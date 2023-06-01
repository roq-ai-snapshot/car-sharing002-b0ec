import { UserInterface } from 'interfaces/user';
import { CarInterface } from 'interfaces/car';

export interface BookingInterface {
  id?: string;
  start_time: Date;
  end_time: Date;
  user_id: string;
  car_id: string;

  user?: UserInterface;
  car?: CarInterface;
  _count?: {};
}
