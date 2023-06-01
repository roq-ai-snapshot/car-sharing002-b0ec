import AppLayout from 'layout/app-layout';
import Link from 'next/link';
import React, { useState } from 'react';
import { Text, Box, Spinner, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Button } from '@chakra-ui/react';
import { UserSelect } from 'components/user-select';
import { getBookingById } from 'apiSdk/bookings';
import { Error } from 'components/error';
import { BookingInterface } from 'interfaces/booking';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AccessOperationEnum, AccessServiceEnum, useAuthorizationApi, withAuthorization } from '@roq/nextjs';

function BookingViewPage() {
  const { hasAccess } = useAuthorizationApi();
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<BookingInterface>(
    () => (id ? `/bookings/${id}` : null),
    () =>
      getBookingById(id, {
        relations: ['user', 'car'],
      }),
  );

  const [deleteError, setDeleteError] = useState(null);
  const [createError, setCreateError] = useState(null);

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Booking Detail View
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <Text fontSize="md" fontWeight="bold">
              start_time: {data?.start_time as unknown as string}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              end_time: {data?.end_time as unknown as string}
            </Text>
            {hasAccess('user', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
              <Text fontSize="md" fontWeight="bold">
                user: <Link href={`/users/view/${data?.user?.id}`}>{data?.user?.id}</Link>
              </Text>
            )}
            {hasAccess('car', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
              <Text fontSize="md" fontWeight="bold">
                car: <Link href={`/cars/view/${data?.car?.id}`}>{data?.car?.id}</Link>
              </Text>
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'booking',
  operation: AccessOperationEnum.READ,
})(BookingViewPage);
