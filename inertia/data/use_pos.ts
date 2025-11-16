import { Charge, Customer, POSItem, POSItemAddon, POSItemVariant } from '@/types/pos_type';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface POSState {
  customer?: Customer;
  type: 'delivery';
  paymentType: string;
  subTotal: number;
  discount: number;
  total: number;
  note: string;
  packagingNote: string;
  reheatMethod: string;
  tailNumber: string;
  dietaryRes: string;
  priority: string;
  deliveryDate: string;
  deliveryTime: string;
  POSItems: POSItem[];
  POSCharges: Charge[];
  deliveryAirport?: any;
  deliveryCaterer?: any;
  setPOSItems: (items: POSItem[]) => void;
  setNote: (note: string) => void;
  setPackagingNote: (packagingNote: string) => void;
  setReheatMethod: (reheatMethod: string) => void;
  setTailNumber: (tailNumber: string) => void;
  setDietaryRes: (dietaryRes: string) => void;
  setPriority: (priority: string) => void;
  setDeliveryDate: (deliveryDate: string) => void;
  setDeliveryTime: (deliveryTime: string) => void;
  changeType: (type: 'delivery', deliveryCharge: number) => void;
  addItemToPOS: (item: POSItem) => void;
  setPrice: (item: POSItem, price: number) => void;
  updateItemField: (item: POSItem, field: keyof POSItem, value: any) => void;
  selectAddon: (
    addon: any,
    addonsSelected: POSItemAddon[],
    setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
  ) => void;
  selectVariant: (
    variant: any,
    type: 'radio' | 'checkbox',
    variantsSelected: POSItemVariant[],
    setVariantsSelected: (variantsSelected: any[]) => void
  ) => void;
  setAddonQty: (
    addonId: number,
    qty: number,
    addonsSelected: POSItemAddon[],
    setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
  ) => void;
  updateItemInPOS: (item: POSItem) => void;
  removeItemFromPOS: (item: POSItem) => void;
  setQuantity: (item: POSItem, quantity: number) => void;
  setDiscount: (discount: number, type: 'percentage' | 'amount') => void;
  changePaymentType: (paymentType: string) => void;
  calculate: () => void;
  resetPOS: () => void;
  setCustomer: (customer: Customer) => void;
  setDeliveryAirport: (airport: any) => void;
  setDeliveryCaterer: (caterer: any) => void;
}

const usePOS = create<POSState>()(
  persist(
    (set, get) => ({
      customer: null,
      type: 'delivery',
      paymentType: 'stripe',
      subTotal: 0,
      discount: 0,
      total: 0,
      note: '',
      packagingNote: '',
      reheatMethod: '',
      tailNumber: '',
      dietaryRes: '',
      deliveryDate: '',
      deliveryTime: '',
      priority: '',
      POSItems: [],
      POSCharges: [],
      deliveryAirport: undefined,
      deliveryCaterer: undefined,
      setPOSItems: (items: POSItem[]) => {
        set({ POSItems: items });
        get().calculate();
      },
      setPrice: (item: POSItem, price: number) => {
        set((state) => {
          const POSItems = state.POSItems.map((i) => {
            if (i.id === item.id) {
              i.price = price;
              i.total = i.quantity * price;
              i.subTotal = price; // base unit price
            }
            return i;
          });
          return { POSItems };
        });
        get().calculate();
      },

      updateItemField: (item: POSItem, field: keyof POSItem, value: any) => {
        set((state) => {
          const POSItems = state.POSItems.map((i) => {
            if (i.id === item.id) {
              const updated = { ...i, [field]: value };
              if (field === 'price' || field === 'quantity') {
                updated.total = (updated.price ?? 0) * (updated.quantity ?? 0);
                updated.subTotal = updated.price ?? 0;
              }
              return updated;
            }
            return i;
          });
          return { POSItems };
        });
        get().calculate();
      },
      setNote: (note: string) => set({ note }),
      setPackagingNote: (packagingNote: string) => set({ packagingNote }),
      setReheatMethod: (reheatMethod: string) => set({ reheatMethod }),
      setTailNumber: (tailNumber: string) => set({ tailNumber }),
      setDietaryRes: (dietaryRes: string) => set({ dietaryRes }),
      setPriority: (priority: string) => set({ priority }),
      setDeliveryDate: (deliveryDate: string) => set({ deliveryDate }),
      setDeliveryTime: (deliveryTime: string) => set({ deliveryTime }),
      changeType: (type: 'delivery', deliveryCharge: number) => {
        if (type === 'delivery') {
          set((state) => ({
            type,
            POSCharges: [
              ...state.POSCharges,
              {
                id: 999,
                type: 'delivery',
                name: 'Delivery Charge',
                amount: deliveryCharge,
                amountType: 'amount',
                isAvailable: 1,
              },
            ],
          }));
        } else {
          set({ type, POSCharges: [] });
        }
        get().calculate();
      },
      changePaymentType: (paymentType: string) => set({ paymentType }),
      setDiscount: (discount: number, type: 'percentage' | 'amount') => {
        let discountAmount = 0;
        if (type === 'percentage') {
          discountAmount = (discount / 100) * get().subTotal;
        } else {
          discountAmount = discount;
        }
        set({ discount: discountAmount });
        get().calculate();
      },
      setCustomer: (customer: Customer) => set({ customer }),
      setDeliveryAirport: (airport: any) => set({ deliveryAirport: airport }),
      setDeliveryCaterer: (caterer: any) => set({ deliveryCaterer: caterer }),
      addItemToPOS: (item: POSItem) => {
        set((state) => {
          let POSItems = [...state.POSItems];
          const itemIndex = POSItems.findIndex((i) => JSON.stringify(i) === JSON.stringify(item));
          if (itemIndex !== -1) {
            POSItems[itemIndex].quantity += 1;
            POSItems[itemIndex].total =
              state.POSItems[itemIndex].quantity * state.POSItems[itemIndex].subTotal;
            return { POSItems };
          } else {
            POSItems = [...state.POSItems, item];
          }
          return { POSItems };
        });
        get().calculate();
      },
      selectAddon: (
        addon: any,
        addonsSelected: POSItemAddon[],
        setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
      ) => {
        const index = addonsSelected.findIndex((a) => a.id === addon.id);
        let newAddonsSelected = [...addonsSelected];

        if (index === -1) {
          newAddonsSelected = [...addonsSelected, { ...addon, quantity: 1 }];
        } else {
          newAddonsSelected = newAddonsSelected.filter((a) => a.id !== addon.id);
        }
        setAddonsSelected(newAddonsSelected);
      },
      selectVariant: (
        variant: any,
        type: 'radio' | 'checkbox',
        variantsSelected: POSItemVariant[],
        setVariantsSelected: (variantsSelected: any[]) => void
      ) => {
        const index = variantsSelected.findIndex((v) => v.id === variant.id);
        let newVariantsSelected = [...variantsSelected];

        if (type === 'radio') {
          if (index === -1) {
            newVariantsSelected = [...variantsSelected, { ...variant, option: [variant.option] }];
          } else {
            newVariantsSelected[index] = { ...variant, option: [variant.option] };
          }
        } else {
          if (index === -1) {
            newVariantsSelected = [...variantsSelected, variant];
          } else {
            const optionIndex = newVariantsSelected[index].option.findIndex(
              (o: any) => o.id === variant.option?.[0].id
            );
            if (optionIndex === -1) {
              newVariantsSelected[index].option.push(variant.option?.[0]);
            } else {
              newVariantsSelected[index].option = newVariantsSelected[index].option.filter(
                (o: any) => o.id !== variant.option?.[0].id
              );
            }
          }
        }
        setVariantsSelected(newVariantsSelected);
      },
      setAddonQty: (
        addonId: number,
        qty: number,
        addonsSelected: POSItemAddon[],
        setAddonsSelected: (addonsSelected: POSItemAddon[]) => void
      ) => {
        const index = addonsSelected.findIndex((a) => a.id === addonId);
        let newAddonsSelected = [...addonsSelected];
        if (index !== -1) {
          newAddonsSelected[index].quantity = qty;
        }
        setAddonsSelected(newAddonsSelected);
      },
      updateItemInPOS: (updatedItem: POSItem) => {
        set((state) => {
          const updatedPOSItems = state.POSItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          return {
            ...state,
            POSItems: updatedPOSItems,
          };
        });
        get().calculate();
      },
      removeItemFromPOS: (item: POSItem) => {
        set((state) => {
          const POSItems = state.POSItems.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
          return { POSItems };
        });
        get().calculate();
      },
      setQuantity: (item: POSItem, quantity: number) => {
        set((state) => {
          const POSItems = state.POSItems.map((i) => {
            if (JSON.stringify(i) === JSON.stringify(item)) {
              i.quantity = quantity;
              i.total = i.quantity * i.subTotal;
            }
            return i;
          });
          return { POSItems };
        });
        get().calculate();
      },
      calculate: () => {
        set((state) => {
          // calculate sub total
          const subTotal = state.POSItems.reduce((acc, item) => acc + item.total, 0);
          const POSCharges: Charge[] = [];
          const deliveryCharge = state.POSCharges.find((charge) => charge.id === 999);
          if (deliveryCharge) POSCharges.push(deliveryCharge);
          // calculate charges
          state.POSItems.forEach((item) => {
            if (item.charges) {
              item.charges.forEach((charge) => {
                let totalCharge = 0;
                if (charge.amountType === 'percentage') {
                  const amount = (charge.amount / 100) * item.total;
                  totalCharge += amount;
                } else {
                  totalCharge += charge.amount * item.quantity;
                }
                const chargeIndex = POSCharges.findIndex((c) => c.id === charge.id);
                if (chargeIndex === -1) {
                  POSCharges.push({ ...charge, amount: totalCharge });
                } else {
                  POSCharges[chargeIndex].amount += totalCharge;
                }
              });
            }
          });
          const totalCharges = POSCharges.reduce((acc, charge) => acc + charge.amount, 0);
          const total = subTotal + totalCharges - state.discount;
          return { subTotal, total, POSCharges };
        });
      },
      resetPOS: () =>
        set({
          POSItems: [],
          POSCharges: [],
          subTotal: 0,
          discount: 0,
          total: 0,
          note: '',
          packagingNote: '',
          reheatMethod: '',
          tailNumber: '',
          dietaryRes: '',
          deliveryDate: '',
          deliveryTime: '',
          priority: '',
          customer: null,
          type: 'delivery',
          paymentType: 'stripe',
          deliveryAirport: undefined,
          deliveryCaterer: undefined,
        }),
    }),
    {
      name: 'pos-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default usePOS;
