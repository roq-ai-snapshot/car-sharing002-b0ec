import * as yup from 'yup';
import { bookingValidationSchema } from 'validationSchema/bookings';

export const carValidationSchema = yup.object().shape({
  make: yup.string().required(),
  model: yup.string().required(),
  year: yup.number().integer().required(),
  location: yup.string().required(),
  availability: yup.boolean().required(),
  company_id: yup.string().nullable().required(),
  booking: yup.array().of(bookingValidationSchema),
});
