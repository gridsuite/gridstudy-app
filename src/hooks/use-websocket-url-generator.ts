import { WS_URL_KEYS } from 'components/utils/websocket-utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { getUrlWithToken, getWsBase } from 'services/utils';
import { APP_NAME } from 'utils/config-params';

const PREFIX_DIRECTORY_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/directory-notification';

const PREFIX_CONFIG_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/config-notification';

const PREFIX_STUDY_NOTIFICATION_WS = import.meta.env.VITE_WS_GATEWAY + '/study-notification';

const useWebsocketUrlGenerator = () => {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    const studyUuid = useSelector((state: { studyUuid: string }) => state.studyUuid);
    const tokenId = useSelector((state: AppState) => state.user?.id_token);
    // Add params to Url
    const urlParams = useCallback((mapper: Record<string, string>) => {
        const usp = new URLSearchParams();
        Object.entries(mapper).forEach(([key, value]) => {
            usp.append(key, value);
        });
        return usp;
    }, []);

    const urlMapper = useMemo(() => {
        if (!tokenId) {
            return {};
        }
        let mapper: Object = {
            [WS_URL_KEYS.DIRECTORIES]: getUrlWithToken(
                `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlParams({
                    updateType: 'directories',
                })}`
            ),
            [WS_URL_KEYS.APP]: getUrlWithToken(
                `${wsBase}${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${urlParams({ appName: APP_NAME })}`
            ),
        };
        if (studyUuid) {
            mapper = {
                ...mapper,
                [WS_URL_KEYS.DELETE_STUDY]: getUrlWithToken(
                    `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?${urlParams({
                        updateType: 'deleteStudy',
                        elementUuid: studyUuid,
                    })}`
                ),
                [WS_URL_KEYS.STUDY]: getUrlWithToken(
                    `${wsBase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?${urlParams({
                        studyUuid: studyUuid,
                    })}`
                ),
            };
        }
        console.log('🚀 QCA :  ~ urlMapper ~ urlMapper:', mapper);
        return mapper;
    }, [wsBase, urlParams, studyUuid, tokenId]);
    return urlMapper;
};

export default useWebsocketUrlGenerator;
