/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import InitTransmit from '../components/common/InitTransmit';
import '../lib/i18n';
import '../scss/app.scss';

import CurrencyConfig from '../components/common/CurrencyConfig';
import AppProvider from '../context/AppProvider';
import { BrandingDataType } from '../types';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
  progress: { color: '#ed8936' },
  title: (title) => title,
  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'));
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <AppProvider {...props.initialPage.props}>
        <InitTransmit />
        <CurrencyConfig branding={props.initialPage.props.branding as BrandingDataType} />
        <App {...props} />
      </AppProvider>
    );
  },
});
