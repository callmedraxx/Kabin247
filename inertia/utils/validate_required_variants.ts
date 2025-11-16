import { toast } from 'sonner';

export const validateRequiredVariants = (
  variants: Record<string, any>,
  variantsSelected: Record<string, any>,
  t: (key: string) => string
): string[] => {
  const validationErrors: string[] = [];
  // Validate the required variants are selected
  const requiredVariants = variants?.filter((v: any) => v.requirement === 'required');

  if (requiredVariants?.length) {
    requiredVariants.forEach((variant: any) => {
      const selectedVariantIds = variantsSelected?.map((v: any) => ({
        id: v.id,
        option: v.option,
      }));
      const findVariant = selectedVariantIds.find(
        (v: any) => v.id === variant.id && v.option.length !== 0
      );

      // check if multiple or single required
      if (variant.allowMultiple && findVariant && findVariant.option.length < variant.min) {
        toast.error(t('Please select all required variants.'));
        validationErrors.push(t('Please select all required variants.'));
      } else if (!findVariant) {
        toast.error(t('Please select all required variants.'));
        validationErrors.push(t('Please select all required variants.'));
      }
    });
  }

  return validationErrors;
};
