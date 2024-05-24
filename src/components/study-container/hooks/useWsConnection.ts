import { useSnackMessage } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openStudy, studyUpdated } from 'redux/actions';
import { ReduxState, StudyUpdatedEventDataUnknown } from 'redux/reducer.type';
import { connectDeletedStudyNotificationsWebsocket } from 'services/directory-notification';
import { connectNotificationsWebsocket } from 'services/study-notification';
import useStudyDisplayError, {
    UPDATE_TYPE_HEADER,
} from './useStudyDisplayError';

const USER_HEADER = 'userId';

// the delay before we consider the WS truly connected
const DELAY_BEFORE_WEBSOCKET_CONNECTED = 12000;
const useWsConnection = (studyUuid: UUID) => {
    const websocketExpectedCloseRef = useRef<boolean>();

    const [wsConnected, setWsConnected] = useState(false);
    const displayErrorNotifications = useStudyDisplayError();
    const userName = useSelector((state: ReduxState) => state.user.profile.sub);
    const { snackError, snackWarning, snackInfo } = useSnackMessage();
    const dispatch = useDispatch();

    const sendAlert = useCallback(
        (eventData: StudyUpdatedEventDataUnknown) => {
            const userId = eventData.headers[USER_HEADER];
            if (userId !== userName) {
                return;
            }
            const payload = JSON.parse(eventData.payload);
            let snackMethod;
            if (payload.alertLevel === 'WARNING') {
                snackMethod = snackWarning;
            } else if (payload.alertLevel === 'ERROR') {
                snackMethod = snackError;
            } else {
                snackMethod = snackInfo;
            }
            snackMethod({
                messageId: payload.messageId,
                messageValues: payload.attributes,
            });
        },
        [snackInfo, snackWarning, snackError, userName]
    );

    const connectDeletedStudyNotifications = useCallback((studyUuid: UUID) => {
        console.info(`Connecting to directory notifications ...`);

        const ws = connectDeletedStudyNotificationsWebsocket(studyUuid);
        ws.onmessage = function () {
            window.close();
        };
        ws.onclose = function (event) {
            if (!websocketExpectedCloseRef.current) {
                console.error('Unexpected Notification WebSocket closed');
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, []);

    const connectNotifications = useCallback(
        (studyUuid: UUID) => {
            console.info(`Connecting to notifications '${studyUuid}'...`);

            const ws = connectNotificationsWebsocket(studyUuid, {
                // this option set the minimum duration being connected before reset the retry count to 0
                minUptime: DELAY_BEFORE_WEBSOCKET_CONNECTED,
            });
            ws.onmessage = function (event) {
                const eventData = JSON.parse(event.data);
                const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
                if (updateTypeHeader === 'STUDY_ALERT') {
                    sendAlert(eventData);
                    return; // here, we do not want to update the redux state
                }
                displayErrorNotifications(eventData);
                dispatch(studyUpdated(eventData));
            };
            ws.onclose = function (event) {
                if (!websocketExpectedCloseRef.current) {
                    console.error('Unexpected Notification WebSocket closed');
                    setWsConnected(false);
                }
            };
            ws.onerror = function (event) {
                console.error('Unexpected Notification WebSocket error', event);
            };
            ws.onopen = function (event) {
                console.log('Notification WebSocket opened');
                // we want to reload the network when the websocket is (re)connected after loosing connection
                // but to prevent reload network loop, we added a delay before considering the WS truly connected
                if (ws.retryCount === 0) {
                    // first connection at startup
                    setWsConnected(true);
                } else {
                    setTimeout(() => {
                        if (ws.retryCount === 0) {
                            // we enter here only if the WS is up for more than DELAY_BEFORE_WEBSOCKET_CONNECTED
                            setWsConnected(true);
                        }
                    }, DELAY_BEFORE_WEBSOCKET_CONNECTED);
                }
            };
            return ws;
        },
        // Note: dispatch doesn't change
        [dispatch, displayErrorNotifications, sendAlert]
    );

    useEffect(() => {
        if (studyUuid) {
            websocketExpectedCloseRef.current = false;
            dispatch(openStudy(studyUuid));

            const ws = connectNotifications(studyUuid);
            const wsDirectory = connectDeletedStudyNotifications(studyUuid);

            // study cleanup at unmount event
            return function () {
                websocketExpectedCloseRef.current = true;
                ws.close();
                wsDirectory.close();
                dispatch(closeStudy());
            };
        }
        // Note: dispach, loadGeoData
        // connectNotifications don't change
    }, [
        dispatch,
        studyUuid,
        connectNotifications,
        connectDeletedStudyNotifications,
    ]);
};

export default useWsConnection;
