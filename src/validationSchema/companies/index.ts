import * as yup from 'yup';
import { carValidationSchema } from 'validationSchema/cars';

export const companyValidationSchema = yup.object().shape({
  name: yup.string().required(),
  owner_id: yup.string().nullable().required(),
  car: yup.array().of(carValidationSchema),
});
