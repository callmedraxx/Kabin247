import EditReservationSchema from '@/schemas/EditReservationSchema';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { Form, Formik } from 'formik';
import { Edit2 } from 'iconsax-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import FieldRenderer from '../Reservations/FieldRenderer';

type EditReservationProps = {
  reservation: any;
  refresh: () => void;
  isIconButton?: boolean;
};

// Reservation fields
const RESERVATION_FIELDS = [
  { type: 'datepicker', name: 'reservationDate', label: 'Reservation date' },
  {
    type: 'group',
    groupItems: [
      { type: 'number', name: 'numberOfPeople', label: 'Number of people' },
      { type: 'number', name: 'tableNumber', label: 'Table number' },
    ],
  },
  {
    type: 'group',
    groupItems: [
      { type: 'time', name: 'startTime', label: 'Start time' },
      { type: 'time', name: 'endTime', label: 'End time' },
    ],
  },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    options: [
      { label: 'Booked', value: 'booked' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
];

export default function EditReservation({
  reservation,
  refresh,
  isIconButton = false,
}: EditReservationProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { id, reservationDate, numberOfPeople, tableNumber, startTime, endTime, status, user } =
    reservation || {};

  return (
    <>
      {isIconButton ? (
        <IconButton
          aria-label="Edit"
          icon={<Edit2 size="18" color="currentColor" />}
          colorScheme="blue"
          className="hover:bg-blue-100 text-blue-600"
          onClick={onOpen}
          variant="outline"
        />
      ) : (
        <Button
          aria-label="Edit"
          rightIcon={<Edit2 size="18" />}
          colorScheme="blue"
          width="full"
          className="hover:bg-blue-100 text-blue-600"
          variant="outline"
          onClick={onOpen}
        >
          {t('Edit')}
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader className="border-b border-black/5">{t('Edit reservation')}</DrawerHeader>

          <Formik
            initialValues={{
              reservationDate: new Date(reservationDate),
              numberOfPeople,
              tableNumber,
              startTime: parse(startTime, 'hh:mm a', new Date()),
              endTime: parse(endTime, 'hh:mm a', new Date()),
              status,
              userId: user.id,
            }}
            onSubmit={async (values, actions) => {
              const formattedData = {
                ...values,
                tableNumber: String(values.tableNumber),
                reservationDate: format(values.reservationDate, 'yyyy-MM-dd'),
                startTime: format(values.startTime, 'h:mm a'),
                endTime: format(values.endTime, 'h:mm a'),
              };

              try {
                actions.setSubmitting(true);
                const { data } = await axios.put(`/api/reservations/${id}`, formattedData);
                if (data?.success) {
                  refresh();
                  onClose();
                  toast.success(t(data?.message) || t('Reservation updated successfully'));
                }
              } catch (e) {
                toast.error(t(e.response.data.message) || t('Something went wrong'));
              } finally {
                actions.setSubmitting(false);
              }
            }}
            validationSchema={EditReservationSchema}
          >
            {({ isSubmitting }) => (
              <Form className="h-full">
                <DrawerBody className="space-y-4 h-full">
                  <div className="flex flex-col gap-5">
                    {RESERVATION_FIELDS.map((field, index) =>
                      match(field)
                        // Render group fields
                        .with({ type: 'group' }, (field) => (
                          <div key={`group-${index}`} className="grid grid-cols-2 gap-2">
                            {field?.groupItems?.map((groupItem, groupItemIndex) => (
                              <FieldRenderer
                                key={`${groupItem.name}-${groupItemIndex}`}
                                {...groupItem}
                              />
                            ))}
                          </div>
                        ))

                        // Render all fields
                        .otherwise((field) => (
                          <React.Fragment key={`${field.name}-${index}`}>
                            {field.name && <FieldRenderer {...field} />}
                          </React.Fragment>
                        ))
                    )}
                  </div>
                </DrawerBody>
                <DrawerFooter
                  borderTopWidth="1px"
                  borderColor="secondary.200"
                  className="absolute bg-white w-full bottom-0"
                >
                  <Button variant="outline" w="full" mr={3} onClick={onClose}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="primary"
                    w="full"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-primary-400 hover:bg-primary-500"
                  >
                    {t('Save')}
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}
