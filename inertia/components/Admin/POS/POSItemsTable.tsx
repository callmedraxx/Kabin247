import { useEffect, useRef, useState } from "react";
import {
  Box, Button, HStack, IconButton, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Text,
  Spinner, Portal, Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverBody, PopoverArrow, PopoverCloseButton, Checkbox, Stack, Textarea, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel
} from "@chakra-ui/react";
import { Add, Trash } from "iconsax-react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { POSItem, Charge } from "@/types/pos_type";

type SuggestedItem = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  variants?: Array<{
    id: number;
    name: string;
    allowMultiple?: number | boolean;
    variantOptions?: Array<{ id: number; name: string; price?: number }>;
  }>;
  addons?: Array<{ id: number; name: string; price?: number }>;
};

type Props = {
  items: POSItem[];
  onChange: (next: POSItem[]) => void;
  searchItems: (q: string) => Promise<SuggestedItem[]>;
};

function n(v: any) { const x = Number(v); return Number.isFinite(x) ? x : 0; }
function variantOptionsPerUnit(item: POSItem) {
  return (item.variants ?? []).reduce((sum: number, v: any) => {
    const opts = Array.isArray(v?.option) ? v.option : [];
    return sum + opts.reduce((s: number, o: any) => s + n(o?.price), 0);
  }, 0);
}
function compute(item: POSItem) {
  const perUnit = n(item.price) + variantOptionsPerUnit(item);
  const portionServings = n(item.quantity);
  
  // Total = price × portion servings
  const baseTotal = perUnit * portionServings;

  const perItemCharges = (item.charges ?? []).reduce((s, c) =>
    s + (c.amountType === "percentage" ? (n(c.amount) / 100) * baseTotal : n(c.amount) * portionServings), 0
  );

  const addonsTotal = (item.addons ?? []).reduce((s: number, a: any) =>
    s + n(a.price) * n(a.quantity ?? 1), 0
  );

  const total = Math.max(0, baseTotal + perItemCharges + addonsTotal);
  return { subTotal: baseTotal, total };
}

export default function POSItemsTable({ items, onChange, searchItems }: Props) {
  const patch = (id: number, p: Partial<POSItem> & Record<string, any>) => {
    onChange(items.map(it => {
      if (it.id !== id) return it;
      const next: any = { ...it, ...p };
      const { subTotal, total } = compute(next);
      return { ...next, subTotal, total };
    }));
  };
  const remove = (id: number) => onChange(items.filter(r => r.id !== id));

  const add = () =>
    onChange([
      ...items,
      {
        id: Date.now(),
        name: "", description: "",
        price: 0, image: {},
        variants: [], addons: [],
        quantity: 1, subTotal: 0, total: 0,
        charges: [] as Charge[],
        __variantDefs: [] as any[],
        __addonDefs: [] as any[],
      } as any,
    ]);

  return (
    <Box border="1px solid" borderColor="blackAlpha.200" rounded="md" overflowX="auto" overflowY="visible" style={{ overscrollBehavior: 'contain' }}>
      <Box px={3} py={2} borderBottom="1px solid" borderColor="blackAlpha.200">
        <Text fontSize="sm" fontWeight="medium">Items</Text>
      </Box>

      <Table size="sm" variant="simple">
        <Thead bg="blackAlpha.50">
          <Tr>
            <Th minW="30px">#</Th>
            <Th minW="160px">Item</Th>
            <Th minW="200px">Description</Th>
            <Th minW="160px">Variants</Th>
            <Th minW="160px">Addons</Th>
            <Th minW="100px">Portion Servings</Th>
            <Th minW="120px">Price</Th>
            <Th minW="120px">Total</Th>
            <Th minW="80px">Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {items.map((r: any, idx) => (
            <Tr key={r.id} _hover={{ bg: "gray.50" }}>
              <Td>{idx + 1}.</Td>
              <Td position="relative" overflow="visible">
                <NameAutocomplete
                  value={r.name}
                  onChange={(name) => patch(r.id, { name })}
                  searchItems={searchItems}
                  onSelect={(s) => {
                    const variantDefs = s.variants ?? [];
                    const addonDefs = s.addons ?? [];
                    const mappedSelectedVariants = variantDefs.map((v) => ({
                      id: v.id,
                      name: v.name,
                      price: 0, // or v.price ?? 0 if available
                      option: (v.variantOptions ?? []).map(opt => ({
                        id: opt.id,
                        variantId: v.id,
                        name: opt.name,
                        price: opt.price ?? 0
                      })),
                    }));
                    patch(r.id, {
                      name: s.name,
                      description: s.description ?? "",
                      price: typeof s.price === "number" ? s.price : r.price,
                      image: s.imageUrl ? { url: s.imageUrl } : r.image,
                      variants: mappedSelectedVariants,
                      addons: [],
                      __variantDefs: variantDefs,
                      __addonDefs: addonDefs,
                    });
                  }}

                />
              </Td>

              <Td>
                <Input
                  size="sm"
                  value={r.description ?? ""}
                  onChange={(e) => patch(r.id, { description: e.target.value })}
                  placeholder="Item description (editable for this order)"
                  bg="white"
                />
              </Td>

              <Td>
                <VariantsCell
                  variantDefs={r.__variantDefs ?? []}
                  selected={r.variants ?? []}
                  onChange={(variants, defs) =>
                    patch(r.id, { variants, __variantDefs: defs })
                  }
                />
              </Td>

              <Td>
                <AddonsCell
                  addonDefs={r.__addonDefs ?? []}
                  selected={r.addons ?? []}
                  onChange={(addons, defs) =>
                    patch(r.id, { addons, __addonDefs: defs })
                  }
                />
              </Td>

              <Td>
                <Input
                  size="sm" type="number"
                  value={r.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    // If value is "0" followed by digits (not decimals), remove leading zeros
                    // This handles cases like "010" -> "10", but allows "0.5" to stay
                    if (val.length > 1 && val.startsWith('0') && !val.includes('.')) {
                      const cleaned = val.replace(/^0+/, '') || '0';
                      patch(r.id, { quantity: Math.max(0, n(cleaned)) });
                    } else {
                      patch(r.id, { quantity: Math.max(0, n(val)) });
                    }
                  }}
                  onFocus={(e) => {
                    // Select all text when focused, so typing replaces the value
                    e.target.select();
                  }}
                  placeholder="Portion servings"
                  bg="white"
                />
              </Td>

              <Td>
                <Input
                  size="sm" type="number"
                  value={r.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    // If value is "0" followed by digits (not decimals), remove leading zeros
                    // This handles cases like "010" -> "10", but allows "0.5" to stay
                    if (val.length > 1 && val.startsWith('0') && !val.includes('.')) {
                      const cleaned = val.replace(/^0+/, '') || '0';
                      patch(r.id, { price: n(cleaned) });
                    } else {
                      patch(r.id, { price: n(val) });
                    }
                  }}
                  onFocus={(e) => {
                    // Select all text when focused, so typing replaces the value
                    e.target.select();
                  }}
                  placeholder="Price (editable)"
                  bg="white"
                />
              </Td>

              <Td><Input size="sm" value={r.total.toFixed(2)} isReadOnly bg="gray.50" /></Td>

              <Td>
                <IconButton
                  aria-label="Delete row" size="sm" variant="ghost"
                  icon={<Trash size={16} color="red" />} onClick={() => remove(r.id)}
                />
              </Td>
            </Tr>
          ))}

          <Tr>
            <Td colSpan={9}>
              <Button onClick={add} size="sm" variant="outline" leftIcon={<Add size={16} color="currentColor" />} w="full">
                Add Item
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

function NameAutocomplete({ value, onChange, searchItems, onSelect }: {
  value: string;
  onChange: (v: string) => void;
  searchItems: (q: string) => Promise<SuggestedItem[]>;
  onSelect: (s: SuggestedItem) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value ?? "");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SuggestedItem[]>([]);
  const [anchor, setAnchor] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<any>(null);
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => setQ(value ?? ""), [value]);
  const updateAnchor = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
  };
  const runSearch = (term: string) => {
    if (!term.trim()) { setItems([]); setOpen(false); return; }
    updateAnchor();
    setLoading(true);
    searchItems(term).then(res => { setItems(res); setOpen(true); }).finally(() => setLoading(false));
  };

  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) {
      toast.error(t("Item name is required"));
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", newItemName.trim());
      if (newItemDescription.trim()) {
        formData.append("description", newItemDescription.trim());
      }
      if (newItemPrice) {
        formData.append("price", newItemPrice);
      }
      formData.append("isAvailable", "true");
      
      // Add required array fields (empty arrays)
      formData.append("chargeIds[]", "");
      formData.append("addonIds[]", "");
      formData.append("variantIds[]", "");

      const { data } = await axios.post(`/api/menu-items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.content?.id) {
        const newItem: SuggestedItem = {
          id: data.content.id,
          name: data.content.name,
          description: data.content.description,
          price: data.content.price,
          imageUrl: data.content.image?.url,
          variants: data.content.variants || [],
          addons: data.content.addons || [],
        };
        toast.success(t("Menu item created successfully"));
        onSelect(newItem);
        setOpen(false);
        onCreateModalClose();
        setNewItemName("");
        setNewItemDescription("");
        setNewItemPrice("");
      } else {
        toast.error(t(data?.message) || t("Failed to create menu item"));
      }
    } catch (e: any) {
      if (e?.response?.data?.message) {
        toast.error(t(e.response.data.message));
      } else {
        toast.error(t("Failed to create menu item"));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateClick = () => {
    setNewItemName(q.trim());
    onCreateModalOpen();
    setOpen(false);
  };

  return (
    <>
      <Box position="relative">
        <Input
          ref={inputRef}
          size="sm"
          value={q}
          onChange={(e) => {
            const term = e.target.value;
            setQ(term);
            onChange(term);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => runSearch(term), 250);
          }}
          onFocus={() => { updateAnchor(); q && runSearch(q); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type to search, create new, or edit name..."
          bg="white"
        />
        {open && (
          <Portal>
            <Box
              position="absolute"
              top={`${anchor.top}px`}
              left={`${anchor.left}px`}
              w={`${anchor.width}px`}
              zIndex={2000}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              rounded="md"
              maxH="240px"
              overflowY="auto"
              boxShadow="sm"
            >
              {loading ? (
                <HStack p={2}><Spinner size="sm" /><Text fontSize="sm">Searching…</Text></HStack>
              ) : items.length === 0 ? (
                <Box>
                  <Text p={2} fontSize="sm" color="gray.500">No matches found</Text>
                  {q.trim() && (
                    <Box
                      p={2}
                      borderTop="1px solid"
                      borderColor="gray.200"
                      _hover={{ bg: "blue.50", cursor: "pointer" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreateClick}
                    >
                      <HStack>
                        <Add size={16} />
                        <Text fontSize="sm" fontWeight="medium" color="blue.600">
                          Create new item: "{q}"
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </Box>
              ) : (
                <>
                  {items.map((it) => (
                    <Box
                      key={it.id}
                      p={2}
                      _hover={{ bg: "gray.50", cursor: "pointer" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { onSelect(it); setOpen(false); }}
                    >
                      <Text fontSize="sm" fontWeight="medium">{it.name}</Text>
                      {it.description && <Text fontSize="xs" color="gray.500">{it.description}</Text>}
                      {typeof it.price === "number" && <Text fontSize="xs">${it.price.toFixed(2)}</Text>}
                    </Box>
                  ))}
                  {q.trim() && (
                    <Box
                      p={2}
                      borderTop="1px solid"
                      borderColor="gray.200"
                      _hover={{ bg: "blue.50", cursor: "pointer" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreateClick}
                    >
                      <HStack>
                        <Add size={16} />
                        <Text fontSize="sm" fontWeight="medium" color="blue.600">
                          Create new item: "{q}"
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Portal>
        )}
      </Box>

      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Create New Menu Item")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t("Item Name")}</FormLabel>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={t("Enter item name")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("Description")}</FormLabel>
                <Textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder={t("Enter item description")}
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("Price")}</FormLabel>
                <Input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder={t("Enter price")}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
              {t("Cancel")}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateNewItem}
              isLoading={isCreating}
            >
              {t("Create")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function VariantsCell({ variantDefs, selected, onChange }: {
  variantDefs: Array<{ id: number; name: string; allowMultiple?: number | boolean; variantOptions?: Array<{ id: number; name: string; price?: number }> }>;
  selected: Array<{ id: number; name: string; option: Array<{ id: number; name: string; price?: number }> }>;
  onChange: (variants: any[], defs: any[]) => void;
}) {
  const [defs, setDefs] = useState(variantDefs);
  useEffect(() => setDefs(variantDefs), [variantDefs]);

  const addDef = () => {
    const id = Date.now();
    setDefs([...defs, { id, name: "New Variant", allowMultiple: 0, variantOptions: [] }]);
  };
  const addOption = (vid: number) => {
    setDefs(defs.map(d => d.id === vid
      ? {
        ...d,
        variantOptions: [
          ...(d.variantOptions ?? []),
          { id: Date.now(), variantId: vid, name: "Option", price: 0 } // ✅ add variantId
        ]
      }
      : d
    ));
  };

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button size="xs" variant="outline">Edit Variants</Button>
      </PopoverTrigger>
      <PopoverContent w="360px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize="sm" fontWeight="semibold">
          Variants <Button size="xs" ml={2} onClick={addDef}>+ Add</Button>
        </PopoverHeader>
        <PopoverBody>
          <Stack spacing={4}>
            {defs.map((def, di) => (
              <Box key={def.id} borderBottom="1px solid #eee" pb={2}>
                <Input
                  size="xs"
                  value={def.name}
                  onChange={(e) => {
                    const updated = [...defs];
                    updated[di].name = e.target.value;
                    setDefs(updated);
                  }}
                />
                <Button size="xs" mt={1} onClick={() => addOption(def.id)}>+ Option</Button>
                {(def.variantOptions ?? []).map((o, oi) => (
                  <HStack key={o.id} mt={1}>
                    <Input
                      size="xs"
                      value={o.name}
                      onChange={(e) => {
                        const updated = [...defs];
                        if (updated[di].variantOptions && updated[di].variantOptions[oi]) {
                          updated[di].variantOptions[oi].name = e.target.value;
                          setDefs(updated);
                        } else {
                          setDefs(updated);
                        }
                      }}
                    />
                    <Input
                      size="xs"
                      type="number"
                      value={o.price ?? ''}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const updated = [...defs];
                        if (updated[di].variantOptions && updated[di].variantOptions[oi]) {
                          updated[di].variantOptions[oi].price = n(e.target.value);
                          setDefs(updated);
                        } else {
                          setDefs(updated);
                        }
                      }}
                    />
                  </HStack>
                ))}
              </Box>
            ))}
            <Button size="sm" onClick={() => onChange(selected, defs)}>Save</Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

function AddonsCell({ addonDefs, selected, onChange }: {
  addonDefs: Array<{ id: number; name: string; price?: number }>;
  selected: Array<{ id: number; name: string; price?: number; quantity?: number }>;
  onChange: (addons: any[], defs: any[]) => void;
}) {
  const [defs, setDefs] = useState(addonDefs);
  useEffect(() => setDefs(addonDefs), [addonDefs]);

  const addDef = () => {
    setDefs([...defs, { id: Date.now(), name: "New Addon", price: 0 }]);
  };

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button size="xs" variant="outline">Edit Addons</Button>
      </PopoverTrigger>
      <PopoverContent w="340px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize="sm" fontWeight="semibold">
          Addons <Button size="xs" ml={2} onClick={addDef}>+ Add</Button>
        </PopoverHeader>
        <PopoverBody>
          <Stack spacing={2}>
            {defs.map((a, ai) => (
              <HStack key={a.id}>
                <Checkbox
                  isChecked={selected.some(s => s.id === a.id)}
                  onChange={(e) => {
                    let next = [...selected];
                    if (e.target.checked) {
                      next.push({ ...a, quantity: 1 });
                    } else {
                      next = next.filter(s => s.id !== a.id);
                    }
                    onChange(next, defs);
                  }}
                />
                <Input
                  size="xs"
                  value={a.name}
                  onChange={(e) => {
                    const updated = [...defs];
                    updated[ai].name = e.target.value;
                    setDefs(updated);
                  }}
                />
                <Input
                  size="xs"
                  type="number"
                  value={a.price ?? ''}
                  placeholder="0"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const updated = [...defs];
                    updated[ai].price = n(e.target.value);
                    setDefs(updated);
                  }}
                />
              </HStack>
            ))}
            <Button size="sm" onClick={() => onChange(selected, defs)}>Save</Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
