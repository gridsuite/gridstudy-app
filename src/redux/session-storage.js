import { APP_NAME } from '../utils/config-params';

const SESSION_STORAGE_SLD_STATE_KEY = (APP_NAME + '_SLD_STATE').toUpperCase();

export const syncSldStateWithSessionStorage = (sldState, studyUuid) => {
    if (studyUuid == null) {
        return;
    }

    sessionStorage.setItem(
        SESSION_STORAGE_SLD_STATE_KEY,
        JSON.stringify({
            studyUuid: studyUuid,
            sldtate: sldState,
        })
    );
};

export const loadSldStateFromSessionStorage = (studyUuid) => {
    const sldState = JSON.parse(
        sessionStorage.getItem(SESSION_STORAGE_SLD_STATE_KEY)
    );

    if (sldState?.studyUuid === studyUuid) {
        return sldState.sldtate;
    }

    // if state from session storage was for another study, it is reseted
    return [];
};
