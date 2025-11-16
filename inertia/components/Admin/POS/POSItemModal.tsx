import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton,
  Button, Input, Textarea, Select, Flex, Box,
  Text, VStack, FormLabel, Divider, IconButton, Image
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { POSItem, POSItemAddon, POSItemVariant } from '@/types/pos_type';
import { Add, Trash } from 'iconsax-react';

const defaultItem = (): POSItem => ({
  id: Date.now(),
  name: '',
  description: '',
  quantity: 1,
  price: 0,
  discount: 0,
  discountType: 'amount',
  total: 0,
  subTotal: 0,
  image: { url: '' },
  charges: [],
  addons: [],
  variants: [],
});

export const POSItemModal = ({
  isOpen,
  onClose,
  initialItem,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: POSItem | null;
  onSave: (item: POSItem) => void;
}) => {
  const [item, setItem] = useState<POSItem>(defaultItem());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItem(initialItem ? { ...initialItem } : defaultItem());
  }, [initialItem]);

  const handleChange = (key: keyof POSItem, value: any) => {
    const updated = { ...item, [key]: value };
    setItem(recalculateTotal(updated));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleChange('image', { url });
  };

  const updateAddon = (index: number, field: keyof POSItemAddon, value: any) => {
    const newAddons = [...item.addons];
    (newAddons[index] as any)[field] = value;
    setItem(recalculateTotal({ ...item, addons: newAddons }));
  };

  const removeAddon = (index: number) => {
    const newAddons = [...item.addons];
    newAddons.splice(index, 1);
    setItem(recalculateTotal({ ...item, addons: newAddons }));
  };

  const addAddon = () => {
    const newAddon: POSItemAddon = {
      id: Date.now(),
      name: '',
      price: 0,
      quantity: 1,
      image: { url: '' },
    };
    setItem(recalculateTotal({ ...item, addons: [...item.addons, newAddon] }));
  };

  const removeVariant = (index: number) => {
    const newVariants = [...item.variants];
    newVariants.splice(index, 1);
    setItem({ ...item, variants: newVariants });
  };

  const addVariant = () => {
    const newVariant: POSItemVariant = {
      id: Date.now(),
      name: '',
      price: 0,
      option: [],
    };
    setItem({ ...item, variants: [...item.variants, newVariant] });
  };

  const recalculateTotal = (item: POSItem): POSItem => {
    const baseTotal = item.quantity * item.price;

    const addonsTotal = item.addons.reduce(
      (sum, addon) => sum + addon.price * (addon.quantity || 1),
      0
    );

    const variantTotal = item.variants.reduce((sum, variant) => {
      const optionTotal = variant.option?.reduce(
        (optSum, opt) => optSum + (opt.price || 0),
        0
      ) || 0;
      return sum + optionTotal;
    }, 0);

    const total = baseTotal + addonsTotal + variantTotal;

    return { ...item, total, subTotal: total };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialItem ? 'Edit Item' : 'Add Item'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={2} align="stretch">
            <Box>
              <FormLabel>Name</FormLabel>
              <Input value={item.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Box>

            <Box>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={item.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={1}
              />
            </Box>

            <Flex gap={4}>
              <Box flex={1}>
                <FormLabel>Quantity</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                />
              </Box>
              <Box flex={1}>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                />
              </Box>
            </Flex>

            <Flex gap={4}>
              <Box flex={1}>
                <FormLabel>Discount Type</FormLabel>
                <Select
                  value={item.discountType}
                  onChange={(e) => handleChange('discountType', e.target.value)}
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
                </Select>
              </Box>
              <Box flex={1}>
                <FormLabel>Discount</FormLabel>
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
                />
              </Box>
            </Flex>

            <Box>
              <FormLabel>Image Upload</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileRef}
              />
              {item.image?.url && (
                <Image
                  mt={2}
                  boxSize="96px"
                  src={item.image.url}
                  alt="preview"
                  objectFit="cover"
                  rounded="md"
                  border="1px solid #ddd"
                />
              )}
            </Box>

            <Divider />
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Addons</Text>
              <IconButton
                icon={<Add size={18} />}
                aria-label="Add Addon"
                onClick={addAddon}
                size="sm"
                variant="ghost"
              />
            </Flex>
            <Flex gap={2} align="center" className="w-full flex-1 justify-between">
              <Text textAlign="left" w={100}>Addon name</Text>
              <Text textAlign="left" w={100}>Price</Text>
              <Text textAlign="left" w={100}>Quantity</Text>
              <Text textAlign="left" w={8}></Text>
            </Flex>
            {item.addons.map((addon, index) => (
              <Flex key={index} gap={2} align="center">
                <Input
                  placeholder="Addon name"
                  value={addon.name}
                  onChange={(e) => updateAddon(index, 'name', e.target.value)}
                />
                <Input
                  type="number"
                  value={addon.price}
                  placeholder="Price"
                  onChange={(e) => updateAddon(index, 'price', parseFloat(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  value={addon.quantity}
                  placeholder="Qty"
                  onChange={(e) => updateAddon(index, 'quantity', parseFloat(e.target.value) || 1)}
                />
                <IconButton
                  icon={<Trash size={18} />}
                  aria-label="Remove"
                  onClick={() => removeAddon(index)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                />
              </Flex>
            ))}

            <Divider />
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Variants</Text>
              <IconButton
                icon={<Add size={18} />}
                aria-label="Add Variant"
                onClick={addVariant}
                size="sm"
                variant="ghost"
              />
            </Flex>

            <Flex gap={2} align="center" className="w-full flex-1 justify-between">
              <Text textAlign="left" w={100}>Variant</Text>
              <Text textAlign="left" w={100}>Price</Text>
              <Text textAlign="left" w={8}></Text>
            </Flex>

            {item.variants.map((variant, index) => (
              <Flex key={index} gap={2} align="center">
                <Input
                  placeholder="Variant name"
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...item.variants];
                    const newName = e.target.value;
                    newVariants[index].name = newName;

                    // Keep option[0] in sync
                    if (!newVariants[index].option || !newVariants[index].option[0]) {
                      newVariants[index].option = [{
                        id: Date.now(),
                        variantId: variant.id,
                        name: newName,
                        price: 0,
                      }];
                    } else {
                      newVariants[index].option[0].name = newName;
                    }

                    setItem(recalculateTotal({ ...item, variants: newVariants }));
                  }}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={variant.option?.[0]?.price || 0}
                  onChange={(e) => {
                    const newVariants = [...item.variants];
                    if (!newVariants[index].option || !newVariants[index].option[0]) {
                      newVariants[index].option = [{
                        id: Date.now(),
                        variantId: variant.id,
                        name: variant.name,
                        price: 0,
                      }];
                    }
                    newVariants[index].option[0].price = parseFloat(e.target.value) || 0;
                    newVariants[index].price = newVariants[index].option[0].price;
                    setItem(recalculateTotal({ ...item, variants: newVariants }));
                  }}
                />
                <IconButton
                  icon={<Trash size={18} />}
                  aria-label="Remove Variant"
                  onClick={() => removeVariant(index)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                />
              </Flex>
            ))}

            <Text pt={2} fontWeight="bold" textAlign="right">
              Total: {item.total.toFixed(2)}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>Cancel</Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onSave(item);
              onClose();
            }}
          >
            {initialItem ? 'Edit' : 'Add'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
