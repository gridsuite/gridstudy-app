/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    fetchDirectoryElementPath,
    NotificationsUrlKeys,
    useNotificationsListener,
    usePrevious,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { computeFullPath } from '../utils/compute-title';
import { studyUpdated } from '../redux/actions';
import { directoriesNotificationType } from '../utils/directories-notification-type';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { AppState } from '../redux/reducer';
import { isMetadataUpdatedNotification } from 'types/notification-types';

export default function useStudyPath(studyUuid: UUID | null) {
    const [studyName, setStudyName] = useState<string>();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState<string>();
    const prevStudyPath = usePrevious(studyPath);
    const [parentDirectoriesNames, setParentDirectoriesNames] = useState<string[]>([]);

    const { snackError, snackInfo } = useSnackMessage();
    const [initialTitle] = useState(document.title);
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const dispatch = useDispatch();

    // using a ref because this is not used for rendering, it is used in the websocket onMessage()
    const studyParentDirectoriesUuidsRef = useRef<UUID[]>([]);

    const fetchStudyPath = useCallback(() => {
        studyUuid &&
            fetchDirectoryElementPath(studyUuid)
                .then((response) => {
                    const parentDirectoriesNames = response
                        .slice(0, response.length - 1)
                        .map((parent) => parent.elementName);
                    setParentDirectoriesNames(parentDirectoriesNames);
                    const parentDirectoriesUuid = response
                        .slice(0, response.length - 1)
                        .map((parent) => parent.elementUuid);
                    studyParentDirectoriesUuidsRef.current = parentDirectoriesUuid;

                    const studyName = response[response.length - 1]?.elementName;
                    const path = computeFullPath(parentDirectoriesNames);
                    setStudyName(studyName);
                    setStudyPath(path);

                    document.title = studyName;
                })
                .catch((error) => {
                    document.title = initialTitle;
                    snackError({
                        messageTxt: error.message,
                        headerId: 'LoadStudyAndParentsInfoError',
                    });
                });
    }, [initialTitle, snackError, studyUuid]);
    const onStudyUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            dispatch(studyUpdated(eventData));
            if (eventData.headers) {
                if (eventData.headers['notificationType'] === directoriesNotificationType.UPDATE_DIRECTORY) {
                    // TODO: this receives notifications for all the public directories and all the user's private directories
                    // At least we don't fetch everytime a notification is received, but we should instead limit the
                    // number of notifications (they are sent to all the clients every time). Here we are only
                    // interested in changes in parent directories of the study (study is moved, or any parent is moved
                    // or renamed)
                    if (studyParentDirectoriesUuidsRef.current.includes(eventData.headers['directoryUuid'])) {
                        fetchStudyPath();
                    }
                }
            }
        },
        [dispatch, fetchStudyPath]
    );

    useNotificationsListener(NotificationsUrlKeys.DIRECTORY, {
        listenerCallbackMessage: onStudyUpdated,
    });

    useEffect(() => {
        if (prevStudyPath && prevStudyPath !== studyPath) {
            snackInfo({
                headerId: 'moveStudyNotification',
                headerValues: {
                    oldStudyPath: prevStudyPath,
                    studyPath: studyPath ?? '',
                },
            });
        }

        if (prevStudyName && prevStudyName !== studyName) {
            snackInfo({
                headerId: 'renameStudyNotification',
                headerValues: {
                    oldStudyName: prevStudyName,
                    studyName: studyName ?? '',
                },
            });
        }
    }, [snackInfo, studyName, studyPath, prevStudyPath, prevStudyName]);

    useEffect(() => {
        if (!studyUuid) {
            document.title = initialTitle;
            return;
        }
        fetchStudyPath();
    }, [studyUuid, initialTitle, fetchStudyPath]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (isMetadataUpdatedNotification(studyUpdatedForce.eventData)) {
                fetchStudyPath();
            }
        }
    }, [studyUuid, studyUpdatedForce, fetchStudyPath, snackInfo]);
    return { studyName: studyName, parentDirectoriesNames: parentDirectoriesNames };
}
