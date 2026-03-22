import Constants from 'expo-constants';

const LOCAL_IP = Constants.expoConfig?.hostUri?.split(':')[0];

export const BASE_URL = __DEV__
  ? `http://${LOCAL_IP}:3000/api`
  : 'https://your-api.com/api';
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  CHECK_AUTH: '/auth/check-auth',
  CATEGORY_CREATE: '/category/create',
  CATEGORY_GET_ALL: '/category/get-all-categories',
  BOOK_CREATE: '/books/create-book',
  BOOK_GET_ALL: '/books/get-all-books',
  BOOK_GET_ONE: '/books/get-book',
  USER_LIBRARY_GET_ALL: '/user-library/get-all-books',
  USER_LIBRARY_ADD: '/user-library/add-book',
  USER_LIBRARY_REMOVE: '/user-library/remove-book',
  PURCHASE_CREATE_INTENT: '/purchase/create-intent',
  PURCHASE_CONFIRM: '/purchase/confirm',
  PURCHASE_MY_BOOKS: '/purchase/my-books',
} as const;
