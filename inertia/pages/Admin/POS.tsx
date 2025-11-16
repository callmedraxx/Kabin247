import Layout from '@/components/common/Layout';
import { useTranslation } from 'react-i18next';
import POSCheckoutForm from '@/components/Admin/POS/POSCheckoutForm';
import useWindowSize from '@/hooks/useWindowSize';

export default function POS() {
  const { t } = useTranslation();
  const windowSize = useWindowSize();

  type SuggestedItem = {
    id: number;
    name: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    variants?: any[];
    addons?: any[];
  };

  async function searchMenuItems(q: string): Promise<SuggestedItem[]> {
    if (!q.trim()) return [];
    const url = new URL('/api/user/menu-items/global', window.location.origin);
    url.searchParams.set('search', q);
    url.searchParams.set('available', 'true');
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', '10');

    const res = await fetch(url.toString());
    const json = await res.json();

    const rows = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.items)
        ? json.items
        : [];

    return rows.map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      price: m.price,
      imageUrl: m.image?.url ?? m.category?.image?.url ?? undefined,
      variants: m.variants,
      addons: m.addons,
    }));
  }

  return (
    <Layout title={t('Create new order')} enableDrawerSidebar={windowSize.width < 1200}>
      <div className="flex w-full @container">
        <div className="flex w-full">
          <POSCheckoutForm
            searchMenuItems={searchMenuItems}
          />
        </div>
      </div>
    </Layout>
  );
}
