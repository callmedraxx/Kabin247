import { useState } from 'react';
import { SortingState } from '@tanstack/react-table';
import { Button, Popover, PopoverContent, PopoverTrigger, Switch } from '@chakra-ui/react';
import { Clock } from 'iconsax-react';
import { format, parse } from 'date-fns';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { toast } from 'sonner';
import useSchedules from '@/data/use_schedules';
import DataTable from '@/components/common/DataTable';
import { useTranslation } from 'react-i18next';

export default function OpenHours() {
  const { data, isLoading, refresh } = useSchedules();
  const { t } = useTranslation();

  const [openingTime, setOpeningTime] = useState<Date>(new Date());
  const [closingTime, setClosingTime] = useState<Date>(new Date());
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleIsOpen = async (id: number, value: boolean) => {
    try {
      const { data } = await axios.put(`/api/schedules/${id}`, {
        isOpen: value,
      });
      if (data?.success) {
        toast.success(t('Schedule updated!'));
        refresh();
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    }
  };

  const handleTimeUpdate = async (id: number, date: Date, type: string, isOpen: boolean) => {
    try {
      if (type === 'openingTime') {
        const { data } = await axios.put(`/api/schedules/${id}`, {
          isOpen: Boolean(isOpen),
          openingTime: format(date, 'HH:mm:ss'),
        });
        if (data?.success) {
          toast.success(t('Schedule updated!'));
          refresh();
        }
      }
      if (type === 'closingTime') {
        const { data } = await axios.put(`/api/schedules/${id}`, {
          isOpen: Boolean(isOpen),
          closingTime: format(date, 'HH:mm:ss'),
        });
        if (data?.success) {
          toast.success(t('Schedule updated!'));
          refresh();
        }
      }
    } catch (e) {
      toast.error(t(e.response.data.message) || t('Something went wrong'));
    }
  };

  return (
    <div>
      <DataTable
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
        structure={[
          {
            accessorKey: 'day',
            header: () => t('Days'),
          },
          {
            accessorKey: 'isOpen',
            header: () => t('Open'),
            cell: ({ row }) => (
              <Switch
                colorScheme="green"
                onChange={() => handleIsOpen(row.original.id, !row.original?.isOpen)}
                defaultChecked={row.original?.isOpen}
                size="lg"
              />
            ),
          },
          {
            accessorKey: 'openingTime',
            header: () => t('Opening time'),
            cell: ({ row }) => (
              <Popover placement="bottom-start">
                {({ onClose }) => (
                  <>
                    <PopoverTrigger>
                      <Button
                        disabled={!row.original?.isOpen}
                        rightIcon={<Clock size={20} color="currentColor" />}
                        variant="outline"
                        className="text-left justify-between bg-white text-black font-normal w-full border-secondary-200"
                      >
                        {row.original?.openingTime
                          ? format(
                              parse(row.original?.openingTime, 'HH:mm:ss', new Date()),
                              'hh:mm a'
                            )
                          : t('Select time')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4 max-w-56">
                      <div className="relative max-h-64 overflow-y-scroll">
                        <DatePicker
                          selected={openingTime}
                          onChange={(date: Date | null) => {
                            date && setOpeningTime(date);
                            date &&
                              handleTimeUpdate(
                                row.original.id,
                                date,
                                'openingTime',
                                row.original.isOpen
                              );
                            onClose();
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat="h:mm aa"
                          inline
                        />
                      </div>
                    </PopoverContent>
                  </>
                )}
              </Popover>
            ),
          },
          {
            accessorKey: 'closingTime',
            header: () => t('Closing time'),
            cell: ({ row }) => (
              <Popover placement="bottom-start">
                {({ onClose }) => (
                  <>
                    <PopoverTrigger>
                      <Button
                        disabled={!row.original?.isOpen}
                        rightIcon={<Clock size={20} color="currentColor" />}
                        variant="outline"
                        className="text-left justify-between bg-white text-black font-normal w-full border-secondary-200"
                      >
                        {!row.original?.closingTime
                          ? t('Select time')
                          : format(
                              parse(row.original?.closingTime, 'HH:mm:ss', new Date()),
                              'hh:mm a'
                            )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4 max-w-56">
                      <div className="relative max-h-64 overflow-y-scroll">
                        <DatePicker
                          selected={closingTime}
                          onChange={(date: Date | null) => {
                            date && setClosingTime(date);
                            date &&
                              handleTimeUpdate(
                                row.original.id,
                                date,
                                'closingTime',
                                row.original.isOpen
                              );
                            onClose();
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat="h:mm aa"
                          inline
                        />
                      </div>
                    </PopoverContent>
                  </>
                )}
              </Popover>
            ),
          },
        ]}
      />
    </div>
  );
}
