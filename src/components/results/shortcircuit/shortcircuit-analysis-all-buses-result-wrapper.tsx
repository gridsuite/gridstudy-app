/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { DisplayedColumnsChangedEvent, GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { fetchShortCircuitAnalysisPagedResults } from '../../../services/study/short-circuit-analysis';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import { SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { PaginationType, ShortcircuitAnalysisTab } from '../../../types/custom-aggrid-types';
import {
    mappingTabs,
    ShortCircuitAnalysisType,
    FetchPagedResultsParams,
    FetchFilterEnumValuesParams,
    ComputingType,
    ShortCircuitAnalysisAllBusesResult,
    TableType,
} from '@gridsuite/commons-ui';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import { buildValidGlobalFilters } from '../common/global-filter/utils/build-valid-global-filters';
import { useSelectedGlobalFilters } from '../common/global-filter/hooks/use-selected-global-filters';
import { useComputationColumnFilters } from '../common/column-filter/use-computation-column-filters';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { useWorkspacePanelActions } from 'components/workspace/hooks/use-workspace-panel-actions';
import { PanelType } from '../../workspace/types/workspace.types';
import { useAgGridInitialColumnFilters } from '../common/use-ag-grid-initial-column-filters';

interface ShortCircuitAnalysisAllBusesResultWrapperProps {
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    onDisplayedColumnsChanged: (event: DisplayedColumnsChangedEvent) => void;
}

export const ShortCircuitAnalysisAllBusesResultWrapper: FunctionComponent<
    ShortCircuitAnalysisAllBusesResultWrapperProps
> = ({ onGridColumnsChanged, onRowDataUpdated, onDisplayedColumnsChanged }) => {
    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
    );

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const sortConfig = useSelector(
        (state: AppState) =>
            state.tableSort[SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE][mappingTabs(ShortCircuitAnalysisType.ALL_BUSES)]
    );

    const { filters } = useComputationColumnFilters(
        TableType.ShortcircuitAnalysis,
        mappingTabs(ShortCircuitAnalysisType.ALL_BUSES)
    );
    const globalFiltersFromState = useSelectedGlobalFilters(TableType.ShortcircuitAnalysis);
    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.ShortcircuitAnalysis,
        mappingTabs(ShortCircuitAnalysisType.ALL_BUSES) as ShortcircuitAnalysisTab
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            dispatchPagination({ ...pagination, page: newPage });
        },
        [pagination, dispatchPagination]
    );

    const handleRowsPerPageChange = useCallback(
        (newRowsPerPage: number) => {
            dispatchPagination({ page: 0, rowsPerPage: newRowsPerPage });
        },
        [dispatchPagination]
    );

    const fetchPagedResults = useCallback(
        (params: FetchPagedResultsParams) => fetchShortCircuitAnalysisPagedResults(params),
        []
    );

    const fetchFilterEnumValues = useCallback(
        (params: FetchFilterEnumValuesParams) =>
            fetchAvailableFilterEnumValues(
                params.studyUuid,
                params.currentNodeUuid,
                params.currentRootNetworkUuid,
                params.computingType,
                params.filterType
            ),
        []
    );

    const globalFilters = useMemo(() => buildValidGlobalFilters(globalFiltersFromState), [globalFiltersFromState]);

    const { openSLD } = useWorkspacePanelActions();
    const handleVoltageLevelClick = useCallback(
        (voltageLevelId: string) => {
            openSLD({ equipmentId: voltageLevelId, panelType: PanelType.SLD_VOLTAGE_LEVEL });
        },
        [openSLD]
    );

    const onGridReady = useAgGridInitialColumnFilters(
        TableType.ShortcircuitAnalysis,
        mappingTabs(ShortCircuitAnalysisType.ALL_BUSES),
        onGridColumnsChanged
    );

    return (
        <ShortCircuitAnalysisAllBusesResult
            analysisStatus={allBusesShortCircuitAnalysisStatus}
            onGridColumnsChanged={onGridColumnsChanged}
            onRowDataUpdated={onRowDataUpdated}
            onDisplayedColumnsChanged={onDisplayedColumnsChanged}
            studyUuid={studyUuid}
            currentNodeUuid={currentNode?.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
            sortConfig={sortConfig}
            columnFilters={filters}
            globalFilters={globalFilters}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            fetchPagedResults={fetchPagedResults}
            fetchFilterEnumValues={fetchFilterEnumValues}
            mapFieldsToColumnsFilter={mapFieldsToColumnsFilter}
            onVoltageLevelClick={handleVoltageLevelClick}
            onGridReady={onGridReady}
        />
    );
};
