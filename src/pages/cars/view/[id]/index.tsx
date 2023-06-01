import AppLayout from 'layout/app-layout';
import Link from 'next/link';
import React, { useState } from 'react';
import { Text, Box, Spinner, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Button } from '@chakra-ui/react';
import { UserSelect } from 'components/user-select';
import { getCarById } from 'apiSdk/cars';
import { Error } from 'components/error';
import { CarInterface } from 'interfaces/car';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AccessOperationEnum, AccessServiceEnum, useAuthorizationApi, withAuthorization } from '@roq/nextjs';
import { deleteBookingById } from 'apiSdk/bookings';

function CarViewPage() {
  const { hasAccess } = useAuthorizationApi();
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<CarInterface>(
    () => (id ? `/cars/${id}` : null),
    () =>
      getCarById(id, {
        relations: ['company', 'booking'],
      }),
  );

  const bookingHandleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await deleteBookingById(id);
      await mutate();
    } catch (error) {
      setDeleteError(error);
    }
  };

  const [deleteError, setDeleteError] = useState(null);
  const [createError, setCreateError] = useState(null);

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Car Detail View
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Text fontSize="md" fontWeight="bold">
              make: {data?.make}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              model: {data?.model}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              year: {data?.year}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              location: {data?.location}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              availability: {data?.availability}
            </Text>
            {hasAccess('company', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
              <Text fontSize="md" fontWeight="bold">
                company: <Link href={`/companies/view/${data?.company?.id}`}>{data?.company?.id}</Link>
              </Text>
            )}
            {hasAccess('booking', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
              <>
                <Text fontSize="md" fontWeight="bold">
                  Booking
                </Text>
                <Link href={`/bookings/create?car_id=${data?.id}`}>
                  <Button colorScheme="blue" mr="4">
                    Create
                  </Button>
                </Link>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>id</Th>
                        <Th>start_time</Th>
                        <Th>end_time</Th>
                        <Th>Edit</Th>
                        <Th>View</Th>
                        <Th>Delete</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data?.booking?.map((record) => (
                        <Tr key={record.id}>
                          <Td>{record.id}</Td>
                          <Td>{record.start_time as unknown as string}</Td>
                          <Td>{record.end_time as unknown as string}</Td>
                          <Td>
                            <Button>
                              <Link href={`/bookings/edit/${record.id}`}>Edit</Link>
                            </Button>
                          </Td>
                          <Td>
                            <Button>
                              <Link href={`/bookings/view/${record.id}`}>View</Link>
                            </Button>
                          </Td>
                          <Td>
                            <Button onClick={() => bookingHandleDelete(record.id)}>Delete</Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'car',
  operation: AccessOperationEnum.READ,
})(CarViewPage);
