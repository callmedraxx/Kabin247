import {
  Button,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { ArrowLeft2, ArrowRight2, Calendar } from 'iconsax-react';
import { format } from 'date-fns';
import DatePickerComponent from 'react-datepicker';
import { useTranslation } from 'react-i18next';

export default function DatePicker({
  selected,
  onSelect,
  minDate = new Date(),
}: {
  selected?: Date;
  onSelect: (date?: Date) => void;
  minDate?: Date;
}) {
  const { t } = useTranslation();

  return (
    <Popover matchWidth placement="bottom-start">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              rightIcon={<Calendar size={20} color="currentColor" />}
              variant="outline"
              className="text-left justify-between text-black font-normal w-full bg-transparent border-secondary-200"
            >
              <Text color={selected ? '' : 'secondary.500'}>
                {selected ? format(selected, 'dd MMM yyyy') : t('Select date')}
              </Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-72">
            <PopoverBody className="p-4">
              <DatePickerComponent
                selected={selected}
                minDate={minDate}
                onChange={(date: Date | null) => {
                  onSelect(date!);
                  onClose();
                }}
                inline
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium text-secondary-700">
                      {date && format(date, 'MMM yyyy')}
                    </span>

                    <div className="space-x-2">
                      <IconButton
                        aria-label={t('Previous month')}
                        icon={<ArrowLeft2 size={14} color="currentColor" />}
                        size="sm"
                        onClick={decreaseMonth}
                        isDisabled={prevMonthButtonDisabled}
                        variant="outline"
                        className="text-secondary-700"
                      />
                      <IconButton
                        aria-label={t('Next month')}
                        icon={<ArrowRight2 size={14} color="currentColor" />}
                        size="sm"
                        onClick={increaseMonth}
                        isDisabled={nextMonthButtonDisabled}
                        variant="outline"
                        className="text-secondary-700"
                      />
                    </div>
                  </div>
                )}
              />
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
