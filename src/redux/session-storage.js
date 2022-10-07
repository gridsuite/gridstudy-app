import { APP_NAME } from '../utils/config-params';

const SESSION_STORAGE_SLD_STATE_KEY = (APP_NAME + '_SLD_STATE').toUpperCase();

export const syncSldStateWithSessionStorage = (sldState) => {
    sessionStorage.setItem(
        SESSION_STORAGE_SLD_STATE_KEY,
        JSON.stringify(sldState)
    );
};

export const getSldStateFromSessionStorage = () => {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_SLD_STATE_KEY));
};
