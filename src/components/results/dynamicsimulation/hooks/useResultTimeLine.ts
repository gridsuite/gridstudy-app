/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { useNodeData } from '../../../study-container';
import { fetchDynamicSimulationResultTimeLine } from '../../../../services/study/dynamic-simulation';
import {
    dynamicSimulationResultInvalidations,
    StringTimeSeries,
    transformTimeLinesData,
} from '../dynamic-simulation-result.type';

const useResultTimeLine = (studyUuid: UUID, nodeUuid: UUID) => {
    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResultTimeLine,
        dynamicSimulationResultInvalidations,
        null,
        (timeLines: StringTimeSeries[]) => ({
            timeLines: transformTimeLinesData(timeLines),
        })
    );
    return [result, isLoading];
};

export default useResultTimeLine;
