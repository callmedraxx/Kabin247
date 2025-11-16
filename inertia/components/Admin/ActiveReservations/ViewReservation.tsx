import { startCase } from '@/utils/string_formatter';
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { Eye } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ReservationType } from '@/types/reservation_type';
import EditReservation from './EditReservation';
import DeleteReservation from './DeleteReservation';

type EditReservationProps = {
  reservation: ReservationType;
  isActive?: boolean;
  refresh: () => void;
};

export default function ViewReservation({ reservation, isActive, refresh }: EditReservationProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const { reservationDate, numberOfPeople, tableNumber, startTime, endTime, status, user } =
    reservation || {};

  return (
    <>
      <Button
        variant="outline"
        colorScheme="secondary"
        className="border-secondary-200 text-secondary-800 hover:bg-secondary-100"
        rightIcon={<Eye />}
        onClick={onOpen}
      >
        {t('View')}
      </Button>
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody py="6" className="@container">
            <div className="p-8 space-y-6 shadow-primary rounded-md mb-7">
              <h2 className="text-3xl font-bold text-secondary-700">{user.fullName}</h2>
              <Badge
                size="lg"
                variant="solid"
                colorScheme={
                  status === 'booked' ? 'purple' : status === 'completed' ? 'green' : 'red'
                }
                className="w-fit"
              >
                {t(startCase(status))}
              </Badge>
              <div className="flex flex-col gap-5 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <Text className="text-secondary-500 whitespace-nowrap">
                      {t('Number of people')}
                    </Text>
                    <Text as="h5" className="font-semibold text-lg">
                      {numberOfPeople}
                    </Text>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Text className="text-secondary-500 whitespace-nowrap">{t('Table No.')}</Text>
                    <Text as="h5" className="font-semibold text-lg">
                      {tableNumber}
                    </Text>
                  </div>
                </div>

                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Text className="text-secondary-500">{t('Reservation date')}</Text>
                      <Text as="h5" className="font-semibold text-lg">
                        {format(reservationDate, 'dd MMM yyyy')}
                      </Text>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Text className="text-secondary-500">{t('Reservation time')}</Text>
                      <Text as="h5" className="font-semibold text-lg">
                        {startTime} {t('to')} {endTime}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Text className="text-secondary-500">{t('Note')}</Text>
                  <Text as="p" color={reservation?.reservationNote ? 'initial' : 'secondary.400'}>
                    {reservation?.reservationNote || 'Note not available'}
                  </Text>
                </div>
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor="secondary.200"
            className="absolute bg-white w-full bottom-0"
          >
            <Button variant="outline" w="full" mr={3} onClick={onClose}>
              {t('Close')}
            </Button>
            {isActive && (
              <>
                <DeleteReservation id={reservation.id} refresh={refresh} />
                <EditReservation reservation={reservation} refresh={refresh} />
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
