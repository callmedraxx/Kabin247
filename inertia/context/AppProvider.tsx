import { ChakraProvider, extendTheme, Spinner } from '@chakra-ui/react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { colors } from '../config/colors';
import themeJsonData from '@/config/themes.json';
import PromotionBanner from '@/components/common/PromotionBanner';
import { BrandingDataType, User } from '@/types';

// color object type
type ThemeData = (typeof themeJsonData)['default'];

// provide app config
export default function AppProvider({
  children,
  auth,
  branding,
}: {
  children: React.ReactNode;
  auth?: User;
  branding?: BrandingDataType;
}) {
  const [currentTheme] = React.useState('default');
  const [themeData, setThemeData] = React.useState<ThemeData>(themeJsonData['default']);

  const emotionCache = createCache({
    key: 'css',
    prepend: true,
  });

  useEffect(() => {
    if (branding?.theme) {
      setThemeData(branding?.theme?.default);
    } else {
      // fallback
      setThemeData(themeJsonData['default']);
    }
  }, [branding]);

  // Dynamically generate the Chakra UI theme from the loaded theme data
  const chakraTheme = extendTheme({
    colors,
    initialColorMode: currentTheme,
    useSystemColorMode: false,
    styles: {
      global: {
        ':root': {
          ...themeData,
        },

        'body': {
          bg: 'secondary.50',
          color: 'black',
        },
      },

      fonts: {
        body: "'Inter', sans-serif",
      },
    },
  });

  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={chakraTheme}>
        {!themeData ? (
          <div className="flex items-center justify-center h-screen">
            <div className="size-16">
              <Spinner size="lg" />
            </div>
          </div>
        ) : (
          <>
            {children}
            <Toaster position="top-center" richColors />
            <PromotionBanner auth={auth} />
          </>
        )}
      </ChakraProvider>
    </CacheProvider>
  );
}
