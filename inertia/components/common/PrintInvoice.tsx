import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'iconsax-react';
import { generateInvoice } from '../../utils/generate_invoice';

export default function PrintInvoice({
  orderId,
  title = 'Print Invoice',
}: {
  orderId: number;
  title?: string;
}) {
  const { t } = useTranslation();

  if (!orderId) return null;

  return (
    <Button
      variant="outline"
      colorScheme="blue"
      className="flex-1 w-full gap-2"
      onClick={() => generateInvoice(orderId, t)}
    >
      <Printer size={16} />
      {t(title)}
    </Button>
  );
}
