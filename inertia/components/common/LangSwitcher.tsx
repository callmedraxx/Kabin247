import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import { ArrowDown2, Translate } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LangSwitcher({ isCustomer = false }: { isCustomer?: boolean }) {
  const [lang, setLang] = useState(
    JSON.parse(localStorage.getItem('lang') || '{"name": "English", "code": "en"}')
  );
  const { branding }: any = usePage().props;
  const { i18n } = useTranslation();

  const appLangs = JSON.parse(branding?.langs || '[]');

  useEffect(() => {
    i18n.changeLanguage(lang?.code);
  }, [lang]);

  const switchLang = (lang: string) => {
    const data = appLangs.find((item: any) => item.name === lang);
    setLang(data);
    localStorage.setItem('lang', JSON.stringify(data));
  };

  return (
    <Menu placement="bottom-end">
      {isCustomer ? (
        <MenuButton as={Button} variant="ghost" className="h-12 px-0 bg-transparent rounded-full">
          <div className="flex items-center px-6 py-2 gap-2">
            <span className="text-sm uppercase">{lang?.code}</span>
            <ArrowDown2 size="24" />
          </div>
        </MenuButton>
      ) : (
        <MenuButton as={Button} className="h-12 rounded-lg px-0 bg-white border border-gray-200">
          <div className="flex items-center px-3 md:px-6 py-2 gap-2">
            <Translate size="24" />
            <span className="hidden md:block text-sm">{lang?.name}</span>
            <ArrowDown2 size="24" className="hidden md:block" />
          </div>
        </MenuButton>
      )}

      <MenuList className="p-1">
        {appLangs?.map((item: any) => (
          <MenuItem key={item.code} onClick={() => switchLang(item.name)}>
            {item.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
