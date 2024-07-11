import { WS_URL_KEYS } from 'components/utils/websocket-utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { getWsBase } from 'services/utils';
import { APP_NAME } from 'utils/config-params';

const PREFIX_DIRECTORY_NOTIFICATION_WS =
    import.meta.env.VITE_WS_GATEWAY + '/directory-notification';

const PREFIX_CONFIG_NOTIFICATION_WS =
    import.meta.env.VITE_WS_GATEWAY + '/config-notification';

const PREFIX_STUDY_NOTIFICATION_WS =
    import.meta.env.VITE_WS_GATEWAY + '/study-notification';

const useWebsocketUrlGenerator = () => {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    // Add params to Url
    const urlParams = useCallback((mapper: Record<string, string>) => {
        const usp = new URLSearchParams();
        Object.entries(mapper).forEach(([key, value]) => {
            usp.append(key, value);
        });
        return usp;
    }, []);

    const urlMapper = useMemo(() => {
        const mapper = {
            [WS_URL_KEYS.DIRECTORIES]: `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlParams(
                { updateType: 'directories' }
            )}`,
            [WS_URL_KEYS.APP]: `${wsBase}${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${urlParams(
                { appName: APP_NAME }
            )}`,
        };
        if (studyUuid) {
            Object.assign(mapper, {
                [WS_URL_KEYS.DELETE_STUDY]: `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlParams(
                    { updateType: 'deleteStudy', elementUuid: studyUuid }
                )}`,
                [WS_URL_KEYS.STUDY]: `${wsBase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?${urlParams(
                    { studyUuid: studyUuid }
                )}`,
            });
        }
        return mapper;
    }, [wsBase, urlParams, studyUuid]);
    return urlMapper;
};

export default useWebsocketUrlGenerator;
