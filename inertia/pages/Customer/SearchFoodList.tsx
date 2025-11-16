import CustomerLayout from '@/components/Customer/CustomerLayout';
import SearchProducts from '@/components/Customer/Home/SearchProducts';

export default function SearchFoodList({ ...props }) {
  return (
    <CustomerLayout>
      <SearchProducts search={props.queries.q} />
    </CustomerLayout>
  );
}
