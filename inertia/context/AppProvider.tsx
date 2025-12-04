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
    fonts: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      normal: 'normal',
      none: 1,
      shorter: 1.25,
      short: 1.375,
      base: 1.5,
      tall: 1.625,
      taller: 2,
    },
    radii: {
      none: '0',
      sm: '0.375rem',
      base: '0.5rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    shadows: {
      xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      outline: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    },
    space: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },
    components: {
      Button: {
        baseStyle: {
          fontWeight: 'semibold',
          borderRadius: 'lg',
          color: 'white',
          _focus: {
            boxShadow: 'outline',
          },
          _disabled: {
            opacity: 0.6,
            cursor: 'not-allowed',
            _hover: {
              transform: 'none',
            },
          },
        },
        sizes: {
          lg: {
            h: '12',
            minW: '12',
            fontSize: 'lg',
            px: '6',
          },
          md: {
            h: '10',
            minW: '10',
            fontSize: 'md',
            px: '4',
          },
          sm: {
            h: '8',
            minW: '8',
            fontSize: 'sm',
            px: '3',
          },
          xs: {
            h: '6',
            minW: '6',
            fontSize: 'xs',
            px: '2',
          },
        },
        variants: {
          solid: {
            color: 'white',
            _hover: {
              transform: 'translateY(-1px)',
              boxShadow: 'md',
              _disabled: {
                transform: 'none',
              },
            },
            _active: {
              transform: 'translateY(0)',
            },
            transition: 'all 0.2s',
          },
          outline: {
            borderWidth: '1.5px',
            color: 'secondary.800',
            _hover: {
              bg: 'primary.50',
              borderColor: 'primary.500',
              color: 'primary.700',
              transform: 'translateY(-1px)',
              boxShadow: 'sm',
            },
            transition: 'all 0.2s',
          },
          ghost: {
            color: 'secondary.700',
            _hover: {
              bg: 'secondary.100',
              color: 'secondary.900',
            },
            transition: 'all 0.2s',
          },
          link: {
            color: 'primary.600',
            _hover: {
              color: 'primary.700',
              textDecoration: 'underline',
            },
          },
        },
      },
      IconButton: {
        baseStyle: {
          _focus: {
            boxShadow: 'outline',
          },
          _disabled: {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
        },
        variants: {
          solid: {
            color: 'white',
          },
          outline: {
            color: 'secondary.800',
            _hover: {
              bg: 'primary.50',
              borderColor: 'primary.500',
              color: 'primary.700',
            },
          },
          ghost: {
            color: 'secondary.700',
            _hover: {
              bg: 'secondary.100',
              color: 'secondary.900',
            },
          },
        },
      },
      Input: {
        baseStyle: {
          field: {
            borderRadius: 'lg',
            borderWidth: '1.5px',
            borderColor: 'secondary.200',
            color: 'secondary.900',
            bg: 'white',
            _hover: {
              borderColor: 'secondary.300',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              bg: 'white',
            },
            _invalid: {
              borderColor: 'red.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
            },
            _placeholder: {
              color: 'secondary.400',
              opacity: 1,
            },
            _disabled: {
              bg: 'secondary.50',
              color: 'secondary.500',
              cursor: 'not-allowed',
            },
            transition: 'all 0.2s',
          },
        },
        sizes: {
          lg: {
            field: {
              fontSize: 'lg',
              px: '4',
              h: '12',
            },
          },
          md: {
            field: {
              fontSize: 'md',
              px: '4',
              h: '10',
            },
          },
          sm: {
            field: {
              fontSize: 'sm',
              px: '3',
              h: '8',
            },
          },
        },
      },
      Textarea: {
        baseStyle: {
          borderRadius: 'lg',
          borderWidth: '1.5px',
          borderColor: 'secondary.200',
          color: 'secondary.900',
          bg: 'white',
          _hover: {
            borderColor: 'secondary.300',
          },
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            bg: 'white',
          },
          _placeholder: {
            color: 'secondary.400',
            opacity: 1,
          },
          _disabled: {
            bg: 'secondary.50',
            color: 'secondary.500',
            cursor: 'not-allowed',
          },
          transition: 'all 0.2s',
        },
      },
      Select: {
        baseStyle: {
          field: {
            borderRadius: 'lg',
            borderWidth: '1.5px',
            borderColor: 'secondary.200',
            color: 'secondary.900',
            bg: 'white',
            _hover: {
              borderColor: 'secondary.300',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              bg: 'white',
            },
            _disabled: {
              bg: 'secondary.50',
              color: 'secondary.500',
              cursor: 'not-allowed',
            },
            transition: 'all 0.2s',
          },
        },
      },
      Card: {
        baseStyle: {
          container: {
            borderRadius: 'xl',
            boxShadow: 'md',
            borderWidth: '1px',
            borderColor: 'secondary.200',
            bg: 'white',
            transition: 'all 0.2s',
            _hover: {
              boxShadow: 'lg',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      Badge: {
        baseStyle: {
          borderRadius: 'full',
          px: '2.5',
          py: '1',
          fontSize: 'xs',
          fontWeight: 'semibold',
          lineHeight: '1.5',
        },
        variants: {
          solid: {
            color: 'white',
          },
          subtle: {
            color: 'secondary.800',
          },
          outline: {
            color: 'secondary.800',
            borderWidth: '1px',
          },
        },
      },
      Menu: {
        baseStyle: {
          list: {
            borderRadius: 'lg',
            borderWidth: '1px',
            borderColor: 'secondary.200',
            boxShadow: 'lg',
            py: '2',
            bg: 'white',
          },
          item: {
            borderRadius: 'md',
            color: 'secondary.800',
            fontWeight: 'medium',
            _hover: {
              bg: 'secondary.50',
              color: 'secondary.900',
            },
            _focus: {
              bg: 'secondary.50',
              color: 'secondary.900',
            },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
            transition: 'all 0.15s',
          },
        },
      },
      Popover: {
        baseStyle: {
          content: {
            borderRadius: 'xl',
            borderWidth: '1px',
            borderColor: 'secondary.200',
            boxShadow: 'xl',
            bg: 'white',
            color: 'secondary.900',
          },
          header: {
            color: 'secondary.900',
            fontWeight: 'semibold',
          },
          body: {
            color: 'secondary.700',
          },
          footer: {
            color: 'secondary.700',
          },
        },
      },
      Tooltip: {
        baseStyle: {
          bg: 'secondary.900',
          color: 'white',
          borderRadius: 'md',
          px: '3',
          py: '2',
          fontSize: 'sm',
          fontWeight: 'medium',
          boxShadow: 'lg',
          maxW: '200px',
        },
      },
      Modal: {
        baseStyle: {
          dialog: {
            borderRadius: 'xl',
            boxShadow: '2xl',
          },
          header: {
            px: '6',
            pt: '6',
            pb: '4',
          },
          body: {
            px: '6',
            py: '4',
          },
          footer: {
            px: '6',
            pt: '4',
            pb: '6',
          },
        },
      },
      Table: {
        baseStyle: {
          table: {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
          th: {
            fontWeight: 'semibold',
            textTransform: 'none',
            letterSpacing: 'normal',
            borderBottom: '2px solid',
            borderColor: 'secondary.200',
            bg: 'secondary.50',
            color: 'secondary.800',
            fontSize: 'sm',
          },
          td: {
            borderBottom: '1px solid',
            borderColor: 'secondary.100',
            color: 'secondary.900',
            fontSize: 'sm',
          },
        },
        variants: {
          striped: {
            tbody: {
              tr: {
                '&:nth-of-type(odd)': {
                  bg: 'secondary.50',
                },
                '&:nth-of-type(even)': {
                  bg: 'white',
                },
              },
            },
          },
        },
      },
      Tabs: {
        baseStyle: {
          tab: {
            fontWeight: 'medium',
            color: 'secondary.600',
            _selected: {
              color: 'primary.600',
              borderColor: 'primary.600',
              fontWeight: 'semibold',
            },
            _hover: {
              color: 'primary.500',
            },
            _focus: {
              boxShadow: 'none',
            },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          },
        },
      },
      Text: {
        baseStyle: {
          color: 'secondary.900',
        },
        variants: {
          subtle: {
            color: 'secondary.600',
          },
          muted: {
            color: 'secondary.500',
          },
        },
      },
      Heading: {
        baseStyle: {
          color: 'secondary.900',
          fontWeight: 'bold',
        },
      },
      Link: {
        baseStyle: {
          color: 'primary.600',
          _hover: {
            color: 'primary.700',
            textDecoration: 'underline',
          },
        },
      },
    },
    styles: {
      global: {
        ':root': {
          ...themeData,
        },
        'html, body': {
          bg: 'secondary.50',
          color: 'secondary.900',
          fontFamily: 'body',
          lineHeight: 'base',
        },
        body: {
          bg: 'secondary.50',
          color: 'secondary.900',
        },
        '*::placeholder': {
          color: 'secondary.400',
          opacity: 1,
        },
        '*, *::before, &::after': {
          borderColor: 'secondary.200',
        },
        // Ensure all text is readable
        p: {
          color: 'secondary.900',
        },
        span: {
          color: 'inherit',
        },
        label: {
          color: 'secondary.700',
          fontWeight: 'medium',
        },
        // Improve icon button visibility
        '[role="button"]': {
          _focus: {
            outline: '2px solid',
            outlineColor: 'primary.500',
            outlineOffset: '2px',
          },
        },
        // Ensure disabled states are visible but clearly disabled
        '[disabled], [aria-disabled="true"]': {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
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
