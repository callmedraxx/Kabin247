export const formatRoleUrl = (
  url: string,
  role?: string,
  queryParams?: string | Record<string, any>
): string => {
  // If no role is provided, return the URL as it is
  let formattedUrl = url;

  // Add role prefix if a role is provided
  if (role) {
    formattedUrl = `/${role.toLowerCase()}${formattedUrl}`;
  }

  // If queryParams are provided, append them to the URL
  if (queryParams) {
    const queryString =
      typeof queryParams === 'string' ? queryParams : new URLSearchParams(queryParams).toString();

    formattedUrl += `?${queryString}`;
  }

  return formattedUrl;
};
