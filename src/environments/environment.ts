type GlobalRuntimeConfig = typeof globalThis & {
  __appConfig?: AppRuntimeConfig;
};

const runtimeConfig = (globalThis as GlobalRuntimeConfig).__appConfig;

export const environment = {
  apiUrl: runtimeConfig?.apiUrl?.trim() || 'http://localhost:8080/api',
  googleClientId: runtimeConfig?.googleClientId?.trim() || '',
};
