import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  useBoolean,
} from '@chakra-ui/react';
import { ArrowDown2 } from 'iconsax-react';

export default function PrioritySelection({
  defaultPriority,
  id,
  total = 10,
  refresh,
}: {
  defaultPriority: number;
  id: number;
  total: number;
  refresh: () => void;
}) {
  const { t } = useTranslation();
  const [priority, setPriority] = React.useState<string>(`${defaultPriority}`);
  const [popover, setPopover] = useBoolean();

  // update category's priority
  const updatePriority = async (priority: string) => {
    try {
      const { data, status } = await axios.patch(`/api/categories/${id}`, {
        priority,
      });

      if (status === 200) {
        toast.success(data.message);
        refresh();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(t('Something went wrong'));
      }
    }
  };

  return (
    <div className="w-36">
      <Popover
        isOpen={popover}
        onOpen={setPopover.on}
        onClose={setPopover.off}
        placement="bottom-end"
      >
        <InputGroup>
          <Input
            bg="white"
            borderColor="secondary.700"
            value={priority}
            type="text"
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-r-none"
            onBlur={() => {
              updatePriority(priority);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updatePriority(priority);
              }
            }}
          />
          <PopoverAnchor>
            <InputRightAddon
              as="button"
              onClick={setPopover.on}
              className="w-fit"
              bg="secondary.200"
            >
              <ArrowDown2 size="14px" />
            </InputRightAddon>
          </PopoverAnchor>
        </InputGroup>

        <Portal>
          <PopoverContent className="w-36">
            <Flex flexDir="column" alignItems="stretch" p={1} maxH="400px" overflowY="auto">
              {Array.from({ length: total }).map((_, i) => (
                <Button
                  key={i}
                  type="button"
                  aria-label={`priority-${i}`}
                  data-selected={priority === `${i + 1}`}
                  variant="ghost"
                  className="text-left justify-start data-[selected=true]:bg-secondary-100 py-1 h-8"
                  onClick={() => {
                    setPriority(`${i + 1}`);
                    setPopover.off();
                    updatePriority(`${i + 1}`);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </Flex>
          </PopoverContent>
        </Portal>
      </Popover>
    </div>
  );
}
