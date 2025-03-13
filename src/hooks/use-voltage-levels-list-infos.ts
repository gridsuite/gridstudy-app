/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { useEffect, useState } from 'react';
import { type Identifiable } from '@gridsuite/commons-ui';
import { fetchVoltageLevelsListInfos } from '../services/study/network';

export default function useVoltageLevelsListInfos({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
}: {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}) {
    const [voltageLevelsListInfos, setVoltageLevelsListInfos] = useState<Identifiable[]>([]);
    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchVoltageLevelsListInfos({
                studyUuid: studyUuid,
                currentNodeUuid: currentNodeUuid,
                currentRootNetworkUuid: currentRootNetworkUuid,
            }).then((values) => setVoltageLevelsListInfos(values.sort((a, b) => a.id.localeCompare(b.id))));
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);
    return voltageLevelsListInfos;
}
