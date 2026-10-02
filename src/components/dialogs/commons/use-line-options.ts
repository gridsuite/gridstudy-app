/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { EquipmentType, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { UUID } from 'node:crypto';
import { fetchEquipmentsIds } from '../../../services/study/network-map';

/**
 * Fetches the sorted list of line IDs in the network, for the "existing line" picker used by both
 * line-split-with-voltage-level and line-attach-to-voltage-level.
 */
export function useLineOptions(
    studyUuid: UUID,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: UUID
): string[] {
    const [lineOptions, setLineOptions] = useState<string[]>([]);
    const { snackError } = useSnackMessage();

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, undefined, EquipmentType.LINE, true)
                .then((values: string[]) => {
                    setLineOptions(values.toSorted((a, b) => a.localeCompare(b)));
                })
                .catch((error: unknown) => {
                    snackWithFallback(snackError, error, { headerId: 'equipmentsLoadingError' });
                });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid, snackError]);

    return lineOptions;
}
