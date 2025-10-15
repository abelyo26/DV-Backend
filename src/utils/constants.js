export const modelNames = {
  user: 'Users',
  report: 'reports',
  coupon: 'Coupons',
  // [INSERT NEW MODEL KEY ABOVE] < Needed for adding new models names
};

export const paymentMethodsMap = {
  Telebirr: 'Telebirr',
  CBE: 'CBE',
  Abyssinia: 'Abyssinia (BOA)',
};

export const paymentMethods = Object.values(paymentMethodsMap);

export const strongPasswordRegex = new RegExp(
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
);

export const COOKIE_AUTH_TOKEN = 'monitoring-token';

export const ENVIRONMENT_ENUM = ['production', 'staging', 'development'];
