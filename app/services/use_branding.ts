import BusinessSetup from '#models/business_setup';
import Setting from '#models/setting';
import env from '#start/env';

const useBranding = async () => {
  const business = await BusinessSetup.query().firstOrFail();
  const branding = await Setting.query()
    .where({
      key: 'branding',
    })
    ?.firstOrFail();

  const theme = await Setting.query()
    .where({
      key: 'theme',
    })
    ?.firstOrFail();

  // Fallback to server URL from environment if siteUrl is not set or invalid
  let siteUrl = branding?.value1;
  if (!siteUrl) {
    const host = env.get('HOST');
    const port = env.get('PORT');
    const protocol = env.get('NODE_ENV') === 'production' ? 'https' : 'http';
    // Only include port if it's not the default HTTP/HTTPS port
    const portSuffix = (port === 80 || port === 443) ? '' : `:${port}`;
    siteUrl = `${protocol}://${host}${portSuffix}`;
  } else if (env.get('NODE_ENV') === 'development' && siteUrl.includes('localhost:8000')) {
    // Fix incorrect localhost:8000 URLs in development - use actual server port
    const host = env.get('HOST');
    const port = env.get('PORT');
    const protocol = 'http';
    const portSuffix = (port === 80) ? '' : `:${port}`;
    siteUrl = `${protocol}://${host}${portSuffix}`;
  }

  return {
    business,
    siteUrl,
    langs: branding?.value5,
    theme: theme.value6 ? JSON.parse(theme.value6) : null,
  };
};

export default useBranding;
