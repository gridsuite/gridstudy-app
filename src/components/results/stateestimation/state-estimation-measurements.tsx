/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { ColDef } from 'ag-grid-community';
import { buildValidGlobalFilters, ComputingType, type GlobalFilter, RunningStatus } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer.type';
import { useNodeData } from '../../use-node-data';
import { fetchStateEstimationMeasurements } from '../../../services/study/state-estimation';
import { stateEstimationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { STATEESTIMATION_MEASUREMENTS } from '../../../utils/store-sort-filter-fields';
import GlassPane from '../common/glass-pane';
import StateEstimationResultTable from './state-estimation-result-table';
import { mapMeasurementResults } from './state-estimation-result-utils';
import { MeasurementInformationResultDto } from './state-estimation-result.type';

interface StateEstimationMeasurementsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    globalFilters: GlobalFilter[];
    columnDefs: ColDef<any>[];
}

type MeasurementsQueryResult = { query: object; rows: MeasurementInformationResultDto[] };

export const StateEstimationMeasurements: FunctionComponent<StateEstimationMeasurementsProps> = ({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    globalFilters,
    columnDefs,
}) => {
    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );
    // Only the criteria content matters: a rehydration of the same selection must not trigger a new query
    const criteria = JSON.stringify(buildValidGlobalFilters(globalFilters) ?? null);

    // One identity per study/node/root/criteria. Rows are only shown for the identity that fetched them.
    const [launchedQuery, setLaunchedQuery] = useState<object>();
    const { query, fetcher } = useMemo(() => {
        const query = {};
        const parsedCriteria = JSON.parse(criteria);
        const fetcher = () => {
            setLaunchedQuery(query);
            return fetchStateEstimationMeasurements(
                studyUuid,
                nodeUuid,
                rootNetworkUuid,
                parsedCriteria ?? undefined
            ).then((rows): MeasurementsQueryResult => ({ query, rows: rows ?? [] }));
        };
        return { query, fetcher };
    }, [studyUuid, nodeUuid, rootNetworkUuid, criteria]);

    const { result, isLoading } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        fetcher,
        invalidations: stateEstimationResultInvalidations,
    });

    // A failed query (no result) is settled once it has been launched and is over
    const currentRows = result?.query === query ? result.rows : undefined;
    const isSettled = currentRows !== undefined || (launchedQuery === query && !isLoading);
    const isComputed =
        stateEstimationStatus === RunningStatus.SUCCEED || stateEstimationStatus === RunningStatus.FAILED;

    const measurementRows = useMemo(
        () => (currentRows && isComputed ? mapMeasurementResults(currentRows) : []),
        [currentRows, isComputed]
    );
    const isLoadingRows = !isSettled || isLoading;

    return (
        <GlassPane active={isLoadingRows}>
            <StateEstimationResultTable
                measurementRows={measurementRows}
                isLoadingResult={isLoadingRows}
                columnDefs={columnDefs}
                tableName={STATEESTIMATION_MEASUREMENTS}
                exportCsvResetKey={`${studyUuid}-${nodeUuid}-${rootNetworkUuid}-${criteria}`}
                filter={true}
                sortable={true}
            />
        </GlassPane>
    );
};
