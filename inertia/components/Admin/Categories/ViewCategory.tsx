import useWindowSize from '@/hooks/useWindowSize';
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Eye } from 'iconsax-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteCategory from './DeleteCategory';
import EditCategory from './EditCategory';

export default function ViewCategory({
  category,
  refresh,
}: {
  category: any;
  refresh: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const windowSize = useWindowSize();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

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
      <Drawer
        isOpen={isOpen}
        placement={windowSize.width < 640 ? 'bottom' : 'right'}
        size="md"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className="h-[80%] sm:h-auto rounded-xl sm:rounded-none">
          <DrawerHeader className="border-b border-black/5">
            {t('Category')}
            <DrawerCloseButton className="sm:hidden" />
          </DrawerHeader>

          <DrawerBody>
            <div className="flex flex-col gap-5 sm:px-4 py-6">
              <div>
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="w-full rounded-md aspect-[3/2]"
                  onError={(e) => (e.currentTarget.src = '/default_fallback.png')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Text as="p" className="text-secondary-500">
                  {t('Category name')}
                </Text>
                <Text as="h5" className="font-semibold text-lg">
                  {t(category.name)}
                </Text>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Text as="p" className="text-secondary-500">
                    {t('Item count')}
                  </Text>
                  <Text as="h5" className="font-semibold text-lg">
                    {category.menuItems?.length}
                  </Text>
                </div>

                <div className="flex flex-col gap-2">
                  <Text as="p" className="text-secondary-500">
                    {t('Priority')}
                  </Text>
                  <Text as="h5" className="font-semibold text-lg">
                    {category.priority}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Text as="p"> {t('Availability')} </Text>
                <Badge
                  size="md"
                  colorScheme={category.isAvailable ? 'green' : 'red'}
                  className="w-fit"
                >
                  {t(category.isAvailable ? t('Available') : t('Unavailable'))}
                </Badge>
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
            <DeleteCategory id={category?.id} refresh={refresh} />
            <EditCategory category={category} refresh={refresh} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
