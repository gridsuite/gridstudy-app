import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { UPDATE_TYPE_ERROR_MAPPER } from '../study-mapper';

type EventHeader = Record<string, string>;

export const UPDATE_TYPE_HEADER = 'updateType';
const ERROR_HEADER = 'error';
const USER_HEADER = 'userId';

const useStudyDisplayError = () => {
    const userName = useSelector((state: ReduxState) => state.user.profile.sub);
    const { snackError } = useSnackMessage();

    const displayErrorNotifications = useCallback(
        (eventHeader: EventHeader) => {
            const updateTypeHeader = eventHeader[
                UPDATE_TYPE_HEADER
            ] as keyof typeof UPDATE_TYPE_ERROR_MAPPER;
            const errorMessage = eventHeader[ERROR_HEADER];
            const userId = eventHeader[USER_HEADER];
            if ((userId != null && userId !== userName) || !updateTypeHeader) {
                return;
            }
            snackError({
                headerId: UPDATE_TYPE_ERROR_MAPPER[updateTypeHeader],
                messageTxt: errorMessage,
            });
        },
        [snackError, userName]
    );
    return displayErrorNotifications;
};

export default useStudyDisplayError;
