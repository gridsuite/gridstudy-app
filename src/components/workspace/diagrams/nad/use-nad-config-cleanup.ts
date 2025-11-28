/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES } from '../../../../services/study';
import { backendFetch } from '@gridsuite/commons-ui';

export const useSavedNadConfigCleanup = (studyUuid: UUID, savedWorkspaceConfigUuid?: UUID) => {
    const previousConfigUuidRef = useRef<UUID | undefined>();

    useEffect(() => {
        previousConfigUuidRef.current = savedWorkspaceConfigUuid;
        // Cleanup function: delete current config when it changes or on unmount
        return () => {
            if (savedWorkspaceConfigUuid) {
                const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/nad-configs/${savedWorkspaceConfigUuid}`;
                backendFetch(url, { method: 'DELETE' }).catch((error) =>
                    console.error('Failed to delete NAD config:', error)
                );
            }
        };
    }, [studyUuid, savedWorkspaceConfigUuid]);
};
