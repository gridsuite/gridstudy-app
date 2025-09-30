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
import { isDirectoryUpdateNotification } from '../utils/directories-notification-type';
import { UUID } from 'crypto';
import { isMetadataUpdatedNotification } from 'types/notification-types';

export default function useStudyPath(studyUuid: UUID | null) {
    const [studyName, setStudyName] = useState<string>();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState<string>();
    const prevStudyPath = usePrevious(studyPath);
    const [parentDirectoriesNames, setParentDirectoriesNames] = useState<string[]>([]);

    const { snackError, snackInfo } = useSnackMessage();
    const [initialTitle] = useState(document.title);

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

    const onParentDirectoryUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (isDirectoryUpdateNotification(eventData)) {
                // TODO: this receives notifications for all the public directories and all the user's private directories
                // At least we don't fetch everytime a notification is received, but we should instead limit the
                // number of notifications (they are sent to all the clients every time). Here we are only
                // interested in changes in parent directories of the study (study is moved, or any parent is moved
                // or renamed)
                if (studyParentDirectoriesUuidsRef.current.includes(eventData.headers['directoryUuid'])) {
                    fetchStudyPath();
                }
            }
        },
        [fetchStudyPath]
    );

    useNotificationsListener(NotificationsUrlKeys.DIRECTORY, {
        listenerCallbackMessage: onParentDirectoryUpdated,
    });

    const onMetadataUpdated = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (isMetadataUpdatedNotification(eventData)) {
                fetchStudyPath();
            }
        },
        [fetchStudyPath]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: onMetadataUpdated,
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

    return { studyName: studyName, parentDirectoriesNames: parentDirectoriesNames };
}
