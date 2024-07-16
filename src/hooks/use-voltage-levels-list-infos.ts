/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import { fetchVoltageLevelsListInfos } from '../services/study/network';
import { UUID } from 'crypto';

export default function useVoltageLevelsListInfos(
    studyUuid: UUID,
    nodeUuid: UUID
) {
    const [voltageLevelsListInfos, setVoltageLevelsListInfos] = useState([]);
    useEffect(() => {
        if (studyUuid && nodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, nodeUuid).then((values) => {
                setVoltageLevelsListInfos(
                    values.sort((a: { id: string }, b: { id: string }) =>
                        a.id.localeCompare(b.id)
                    )
                );
            });
        }
    }, [studyUuid, nodeUuid]);
    return voltageLevelsListInfos;
}
