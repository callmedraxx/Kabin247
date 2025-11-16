import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import { Form, Formik } from 'formik';
import { CalendarAdd } from 'iconsax-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useSWRConfig } from 'swr';
import Layout from '@/components/common/Layout';
import FieldRenderer from '@/components/Admin/Reservations/FieldRenderer';
import { Button } from '@chakra-ui/react';
import ExistingReservations from './ExistingReservations';
import useWindowSize from '@/hooks/useWindowSize';
import useTableData from '@/data/use_table_data';

const page = 1;
const limit = 10;

// Reservation form fields
const RESERVATION_FIELDS = [
  {
    type: 'block',
    label: 'Client information',
    items: [
      { name: 'userId', type: 'customer' },
      {
        type: 'group',
        groupItems: [
          { name: 'numberOfPeople', type: 'numberWithController', label: 'Number of people' },
          { name: 'tableNumber', type: 'number', label: 'Table number' },
        ],
      },
      { name: 'reservationNote', type: 'textarea', placeholder: 'Write customer note' },
    ],
  },
  {
    type: 'block',
    label: 'Date and time',
    items: [
      { type: 'datepicker', name: 'reservationDate' },
      {
        type: 'group',
        groupItems: [
          { type: 'time', name: 'startTime', label: 'Start time' },
          { type: 'time', name: 'endTime', label: 'End time' },
        ],
      },
    ],
  },
];

// Reservation
export default function Reservation() {
  const { t } = useTranslation();
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const { mutate } = useSWRConfig();
  const windowSize = useWindowSize();

  const { items, isLoading, refresh } = useTableData('/api/reservations', {
    search: '',
    page,
    limit,
    status: '',
    listType: 'active',
  });

  return (
    <Layout title={t('Reservation / Create')} enableDrawerSidebar={windowSize.width < 1124}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(350px,1fr),minmax(30rem,36rem)] md:flex-nowrap gap-6 lg:gap-0 py-8 px-4 md:px-8 lg:px-0 lg:py-0">
        <div className="flex items-center w-full lg:overflow-y-scroll">
          <div className="max-w-2xl w-full flex flex-col items-center mx-auto">
            <CalendarAdd size={100} className="text-purple-500 mb-6" variant="Bulk" />
            <Formik
              initialValues={{
                fullName: '',
                email: '',
                phoneNumber: '',
                userId: '',
                reservationDate: new Date(),
                reservationNote: '',
                numberOfPeople: 1,
                tableNumber: 1,
                startTime: new Date(),
                endTime: new Date(),
              }}
              onSubmit={async (values, actions) => {
                const reservationData = {
                  userId: values.userId,
                  reservationDate: format(values.reservationDate, 'yyyy-MM-dd'),
                  startTime: format(values.startTime, 'h:mm a'),
                  endTime: format(values.endTime, 'h:mm a'),
                  numberOfPeople: values.numberOfPeople,
                  tableNumber: String(values.tableNumber),
                  reservationNote: values.reservationNote,
                };
                try {
                  actions.setSubmitting(true);
                  const { data } = await axios.post('/api/reservations', reservationData);
                  if (data?.success) {
                    refresh();
                    mutate((key: string) => key.startsWith('/api/reservations'));
                    toast.success(t(data?.message || 'Reservation created successfully'));
                  }
                } catch (e) {
                  toast.error(t(e.response.data.message || 'Something went wrong'));
                } finally {
                  actions.resetForm();
                  actions.setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4 w-full lg:px-4">
                  {RESERVATION_FIELDS.map((block, index) => (
                    <div
                      key={`block-${index}`}
                      className="flex flex-col gap-2 w-full p-6 bg-white rounded-md shadow-primary @container"
                    >
                      <h3 className="text-xl border-b border-black/10 pb-2 font-medium">
                        {t(block.label)}
                      </h3>

                      {block.items.map((item, itemIndex) =>
                        match(item)
                          // Render group fields
                          .with({ type: 'group' }, (item) => (
                            <div
                              key={`group-${itemIndex}`}
                              className="grid grid-cols-1 @sm:grid-cols-2 gap-2"
                            >
                              {item?.groupItems?.map((groupItem, groupItemIndex) => (
                                <FieldRenderer
                                  key={`${groupItem.name}-${groupItemIndex}`}
                                  {...groupItem}
                                  isHidden={
                                    isCreatingCustomer &&
                                    block.label === 'Client information' &&
                                    groupItem.type !== 'customer'
                                  }
                                />
                              ))}
                            </div>
                          ))

                          // Render all fields
                          .otherwise((item) => (
                            <React.Fragment key={`${item.name}-${itemIndex}`}>
                              {item.name && (
                                <FieldRenderer
                                  {...item}
                                  toggleCreationMode={setIsCreatingCustomer}
                                  isHidden={
                                    isCreatingCustomer &&
                                    block.label === 'Client information' &&
                                    item.type !== 'customer'
                                  }
                                />
                              )}
                            </React.Fragment>
                          ))
                      )}
                    </div>
                  ))}

                  <Button
                    className="bg-purple-500 hover:bg-purple-600 disabled:hover:bg-purple-600 text-white"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    {t('Make reservation')}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <ExistingReservations items={items} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
