/* eslint-disable no-process-env */

export const IKConstants = {
    LOGIN_URL: process.env.LOGIN_ENDPOINT,
    LOGOUT_URL: `${process.env.LOGIN_ENDPOINT}logout`,
    CLIENT_ID: 'A7376A6D-9A79-4B06-A837-7D92DB93965B',
    MANAGER_URL: process.env.MANAGER_ENDPOINT,
    KMEET_ENDPOINT: process.env.KMEET_ENDPOINT,
};
