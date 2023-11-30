/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { NonEvacuatedEnergyTabProps } from './non-evacuated-energy-result.type';
import { NonEvacuatedEnergyResult } from './non-evacuated-energy-result';
import { useNodeData } from '../../../study-container';
import { fetchNonEvacuatedEnergyResult } from '../../../../services/study/non-evacuated-energy';

export const NonEvacuatedEnergyResultTab: FunctionComponent<
    NonEvacuatedEnergyTabProps
> = ({ studyUuid, nodeUuid }) => {
    const nonEvacuatedEnergyResultInvalidations = ['nonEvacuatedEnergyResult'];

    const [nonEvacuatedEnergyResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchNonEvacuatedEnergyResult,
        nonEvacuatedEnergyResultInvalidations
    );
    return (
        <>
            <NonEvacuatedEnergyResult
                studyUuid={studyUuid}
                nodeUuid={nodeUuid}
                result={nonEvacuatedEnergyResult}
                isWaiting={isWaiting}
            />
        </>
    );
};
