import Layout from '@/components/common/Layout';
import OrderStatus from '@/components/Admin/OrderStatus/OrderStatus';

export default function AllOrders() {
  return (
    <Layout title="Order status">
      <div className="p-6 w-full flex-1">
        <OrderStatus index={0} />
      </div>
    </Layout>
  );
}
