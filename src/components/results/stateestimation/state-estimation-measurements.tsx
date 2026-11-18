/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, RefObject, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ComputingType, type GlobalFilter, RunningStatus } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer.type';
import { fetchStateEstimationMeasurements } from '../../../services/study/state-estimation';
import { stateEstimationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { STATEESTIMATION_MEASUREMENTS } from '../../../utils/store-sort-filter-fields';
import StateEstimationResultTable from './state-estimation-result-table';
import { mapMeasurementResults } from './state-estimation-result-utils';
import { useFilteredNodeData } from '../common/use-filtered-node-data';

interface StateEstimationMeasurementsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    globalFilters: GlobalFilter[];
    columnDefs: ColDef<any>[];
    gridRef?: RefObject<AgGridReact | null>;
    onGridReady?: (params: GridReadyEvent) => void;
    onLoadingChange?: (isLoading: boolean) => void;
}

export const StateEstimationMeasurements: FunctionComponent<StateEstimationMeasurementsProps> = ({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    globalFilters,
    columnDefs,
    gridRef,
    onGridReady,
    onLoadingChange,
}) => {
    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );
    const {
        result: currentRows,
        isLoadingResult,
        criteria,
    } = useFilteredNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        globalFilters,
        fetcher: fetchStateEstimationMeasurements,
        invalidations: stateEstimationResultInvalidations,
    });

    const isComputed =
        stateEstimationStatus === RunningStatus.SUCCEED || stateEstimationStatus === RunningStatus.FAILED;

    const measurementRows = useMemo(
        () => (currentRows && isComputed ? mapMeasurementResults(currentRows) : []),
        [currentRows, isComputed]
    );
    useEffect(() => {
        onLoadingChange?.(isLoadingResult);
    }, [isLoadingResult, onLoadingChange]);

    return (
        <StateEstimationResultTable
            measurementRows={measurementRows}
            isLoadingResult={isLoadingResult}
            columnDefs={columnDefs}
            tableName={STATEESTIMATION_MEASUREMENTS}
            exportCsvResetKey={`${studyUuid}-${nodeUuid}-${rootNetworkUuid}-${criteria}`}
            filter={true}
            sortable={true}
            gridRef={gridRef}
            onGridReady={onGridReady}
        />
    );
};
