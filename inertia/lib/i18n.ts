import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import i18nHttpLoader from 'i18next-http-backend';
import axios, { AxiosResponse } from 'axios';

i18n
  .use(initReactI18next)
  .use(i18nHttpLoader)
  .init({
    interpolation: {
      escapeValue: false,
    },
    lng: JSON.parse(localStorage.getItem('lang') || '{"name": "English", "code": "en"}')?.code,
    fallbackLng: false,
    react: {
      useSuspense: false,
    },
    saveMissing: true,
    backend: {
      loadPath: '/translations/{{lng}}',
      addPath: '/translations/{{lng}}',
      parse: (data: any) => {
        return data;
      },
      parsePayload: function (_namespace: any, _key: any, fallbackValue: any) {
        return { key: fallbackValue || '' };
      },
      request: (
        _options: any,
        url: string,
        payload: any,
        callback: (arg0: null, arg1: AxiosResponse<any, any> | null) => void
      ) => {
        if (!payload) {
          axios
            .get(url)
            .then((res) => {
              callback(null, res);
            })
            .catch((err) => {
              callback(err, null);
            });
        } else {
          axios
            .post(url, payload)
            .then((res) => {
              callback(null, res);
            })
            .catch((err) => {
              callback(err, null);
            });
        }
      },
    },
  });
export default i18n;
