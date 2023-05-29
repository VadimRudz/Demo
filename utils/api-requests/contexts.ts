let baseURL;

if (process.env.NODE_ENV!.trim() === 'customer_stage') {
  baseURL = process.env.CUSTOMER_URL_STAGE;
} else if (process.env.NODE_ENV!.trim() === 'admin_stage') {
  baseURL = process.env.ADMIN_URL_STAGE;
} else {
  baseURL = process.env.BASE_URL_MOCK;
}

export const ContextDefaultMock = {
  baseURL,
  extraHTTPHeaders: {
    'x-api-key': process.env.X_API_KEY_STAGE ?? '654321',
  },
};

export const ContextForbiddenMock = {
  baseURL,
  extraHTTPHeaders: {
    'x-api-key': '',
  },
};
