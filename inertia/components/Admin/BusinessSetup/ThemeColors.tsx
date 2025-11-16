import theme from '@/config/themes.json';
import { PageProps } from '@/types';
import { startCase } from '@/utils/string_formatter';
import { Button } from '@chakra-ui/react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ColorPicker from './ColorPicker';

// convert group color
const convertToGroupedColors = (colors: Record<string, string>) => {
  const groupedColors: Record<string, Record<number, string>> = {};

  // convert to group
  Object.entries(colors).forEach(([key, value]) => {
    const [color, shade] = key.replace('--color-', '').split('-');
    if (!groupedColors[color]) {
      groupedColors[color] = {};
    }

    groupedColors[color][+shade] = value;
  });

  return groupedColors;
};

export default function ThemeColors() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // page props
  const {
    props: { branding },
  } = usePage() as { props: PageProps };

  // color state
  const [colorInput, setColorInput] = useState<Record<string, string>>(() => {
    if (branding?.theme) {
      return branding.theme.default;
    }
    return theme.default; // Fallback
  });

  // update theme color
  const updateThemeColors = async () => {
    setIsLoading(true);
    try {
      const { status } = await axios.put('/api/settings/theme', {
        key: 'theme',
        value: {
          default: colorInput,
        },
      });

      if (status === 200 || status === 201) {
        toast.success(t('Theme updated successfully'));
        window.location.reload();
      }
    } catch (err) {
      toast.error('Theme update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetThemeColors = async () => {
    try {
      const { status } = await axios.put('/api/settings/restore-default-theme', {});

      if (status === 200 || status === 201) {
        toast.success(t('Theme reset successfully'));
        window.location.reload();
      }
    } catch (err) {
      toast.error('Theme reset failed');
    }
  };

  return (
    <div className="mb-6 p-6 py-30 rounded-md space-y-4 max-w-[800px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <div className=" rounded-t-xl sm:h-auto sm:rounded-t-none">
        <div className="space-y-4">
          {Object.entries(convertToGroupedColors(colorInput)).map(([color, value]) => (
            <div className="space-y-2 border-b border-black/[6%] pb-6" key={color}>
              <h4 className="font-semibold"> {t(startCase(color))} </h4>

              <div className="flex flex-wrap gap-3">
                {Object.entries(value).map(([shade, haxCode]) => (
                  <ColorPicker
                    key={color + shade}
                    shade={shade}
                    value={haxCode}
                    ariaLabel={startCase(color) + shade}
                    onChange={(val) => {
                      setColorInput((prev) => ({
                        ...prev,
                        [`--color-${color}-${shade}`]: val,
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="@[900px]:absolute py-6 @[900px]:py-0 top-0 right-4 gap-x-2 flex">
          <Button
            colorScheme="primary"
            variant="outline"
            className="border-primary-500 text-primary-500"
            onClick={resetThemeColors}
          >
            {t('Reset')}
          </Button>

          <Button
            isLoading={isLoading}
            colorScheme="primary"
            className="bg-primary-400 hover:bg-primary-500"
            onClick={updateThemeColors}
          >
            {t('Update')}
          </Button>
        </div>
      </div>
    </div>
  );
}
