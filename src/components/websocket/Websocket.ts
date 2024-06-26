import { UPDATE_TYPE_HEADER } from 'components/study-container';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { closeWebsocket, openWebsocket } from 'redux/actionsTyped';
import { ReduxState } from 'redux/reducer.type';
import { getUrlWithToken, getWsBase } from 'services/utils';

// the delay before we consider the WS truly connected
const DELAY_BEFORE_WEBSOCKET_CONNECTED = 12000;

const PREFIX_STUDY_NOTIFICATION_WS =
    import.meta.env.VITE_WS_GATEWAY + '/study-notification';

const extractUpdateTypeFromHearder = (eventData: {
    [k: string]: unknown;
}): string | undefined => {
    if (
        'headers' in eventData &&
        eventData.headers &&
        typeof eventData.headers === 'object'
    ) {
        if (
            UPDATE_TYPE_HEADER in eventData.headers &&
            typeof eventData.headers.updateType === 'string'
        ) {
            return eventData.headers.updateType;
        }
    }
    return;
};

const Websocket = () => {
    const listeners = useSelector((state: ReduxState) => state.listeners);
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const dispatch = useDispatch();
    const listenersRef = useRef<typeof listeners>();

    useEffect(() => {
        listenersRef.current = listeners;
    }, [listeners]);

    const broadcastMessage = useCallback((event: MessageEvent) => {
        const listenerList = listenersRef.current;
        if (listenerList) {
            listenerList.forEach(({ callback, eventsListenerKeys }) => {
                const eventData = JSON.parse(event.data) as Record<
                    string,
                    unknown
                >;
                const updateType = extractUpdateTypeFromHearder(eventData);
                if (
                    !eventsListenerKeys.length ||
                    (updateType &&
                        eventsListenerKeys.some((e) => e === updateType))
                ) {
                    callback(event);
                }
            });
        }
    }, []);

    useEffect(() => {
        const wsBase = getWsBase();
        const wsAdress = `${wsBase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?studyUuid=${encodeURIComponent(
            studyUuid
        )}`;
        const rws = new ReconnectingWebSocket(
            () => getUrlWithToken(wsAdress),
            [],
            { minUptime: DELAY_BEFORE_WEBSOCKET_CONNECTED }
        );

        rws.onmessage = broadcastMessage;

        rws.onclose = () => {
            console.error('Unexpected Notification WebSocket closed');
            dispatch(closeWebsocket());
        };
        rws.onerror = (event) => {
            console.error('Unexpected Notification WebSocket error', event);
        };

        rws.onopen = () => {
            console.log('Notification WebSocket opened');
            // we want to reload the network when the websocket is (re)connected after loosing connection
            // but to prevent reload network loop, we added a delay before considering the WS truly connected
            if (rws.retryCount === 0) {
                // first connection at startup
                dispatch(openWebsocket());
            } else {
                setTimeout(() => {
                    if (rws.retryCount === 0) {
                        // we enter here only if the WS is up for more than DELAY_BEFORE_WEBSOCKET_CONNECTED
                        dispatch(openWebsocket());
                    }
                }, DELAY_BEFORE_WEBSOCKET_CONNECTED);
            }
        };
        return () => rws.close();
    }, [broadcastMessage, dispatch, studyUuid]);
};

export default Websocket;
