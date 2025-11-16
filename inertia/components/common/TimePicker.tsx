import { Popover, PopoverTrigger, PopoverContent, Button } from '@chakra-ui/react';
import { Clock } from 'iconsax-react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

type TimePickerProps = {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  minTime?: Date;
  maxTime?: Date;
};

export default function TimePicker({ selected, onSelect, minTime, maxTime }: TimePickerProps) {
  const { t } = useTranslation();

  return (
    <Popover placement="top-start" isLazy>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              rightIcon={<Clock size={20} color="currentColor" />}
              variant="outline"
              className="text-left justify-between text-black font-normal w-full border-secondary-200"
            >
              {(selected && format(selected, 'hh:mm a')) || t('Select date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 max-w-56">
            <div className="relative max-h-64 overflow-y-scroll">
              <DatePicker
                selected={selected}
                minTime={minTime}
                maxTime={maxTime || new Date(0, 0, 0, 23, 45)}
                onChange={(date: Date | null) => {
                  onSelect(date);
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
  );
}
