import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useFormik, FormikHelpers } from 'formik';
import { getCarById, updateCarById } from 'apiSdk/cars';
import { Error } from 'components/error';
import { carValidationSchema } from 'validationSchema/cars';
import { CarInterface } from 'interfaces/car';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { CompanyInterface } from 'interfaces/company';
import { getCompanies } from 'apiSdk/companies';
import { bookingValidationSchema } from 'validationSchema/bookings';

function CarEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<CarInterface>(
    () => (id ? `/cars/${id}` : null),
    () => getCarById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: CarInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateCarById(id, values);
      mutate(updated);
      resetForm();
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<CarInterface>({
    initialValues: data,
    validationSchema: carValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Edit Car
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {formError && <Error error={formError} />}
        {isLoading || (!formik.values && !error) ? (
          <Spinner />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="make" mb="4" isInvalid={!!formik.errors?.make}>
              <FormLabel>make</FormLabel>
              <Input type="text" name="make" value={formik.values?.make} onChange={formik.handleChange} />
              {formik.errors.make && <FormErrorMessage>{formik.errors?.make}</FormErrorMessage>}
            </FormControl>
            <FormControl id="model" mb="4" isInvalid={!!formik.errors?.model}>
              <FormLabel>model</FormLabel>
              <Input type="text" name="model" value={formik.values?.model} onChange={formik.handleChange} />
              {formik.errors.model && <FormErrorMessage>{formik.errors?.model}</FormErrorMessage>}
            </FormControl>
            <FormControl id="year" mb="4" isInvalid={!!formik.errors?.year}>
              <FormLabel>year</FormLabel>
              <NumberInput
                name="year"
                value={formik.values?.year}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('year', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.year && <FormErrorMessage>{formik.errors?.year}</FormErrorMessage>}
            </FormControl>
            <FormControl id="location" mb="4" isInvalid={!!formik.errors?.location}>
              <FormLabel>location</FormLabel>
              <Input type="text" name="location" value={formik.values?.location} onChange={formik.handleChange} />
              {formik.errors.location && <FormErrorMessage>{formik.errors?.location}</FormErrorMessage>}
            </FormControl>
            <FormControl
              id="availability"
              display="flex"
              alignItems="center"
              mb="4"
              isInvalid={!!formik.errors?.availability}
            >
              <FormLabel htmlFor="switch-availability">availability</FormLabel>
              <Switch
                id="switch-availability"
                name="availability"
                onChange={formik.handleChange}
                value={formik.values?.availability ? 1 : 0}
              />
              {formik.errors?.availability && <FormErrorMessage>{formik.errors?.availability}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<CompanyInterface>
              formik={formik}
              name={'company_id'}
              label={'company_id'}
              placeholder={'Select Company'}
              fetcher={getCompanies}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.id}
                </option>
              )}
            />
            <Button isDisabled={!formik.isValid || formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'car',
  operation: AccessOperationEnum.UPDATE,
})(CarEditPage);
