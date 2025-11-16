import CustomerLayout from '@/components/Customer/CustomerLayout';
import MenuItemByCategory from '@/components/Customer/Home/MenuItemByCategory';
import { PageProps } from '@/types';

export default function CategoryFoodList({ params }: PageProps & { params: { category: string } }) {
  return (
    <CustomerLayout>
      <MenuItemByCategory categoryId={params.category} />
    </CustomerLayout>
  );
}
