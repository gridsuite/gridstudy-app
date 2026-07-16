/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import { FunctionComponent, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { ShortCircuitAnalysisResultTabs, ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';
import {
    computingTypeToShortcircuitTabRedirection,
    ResultTabIndexRedirection,
    useResultsTab,
} from '../use-results-tab';
import { FormattedMessage } from 'react-intl';
import { ComputationReportViewer } from '../common/computation-report-viewer';

import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import {
    ComputingType,
    EquipmentType,
    ManagedExportCsvButton,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { RunningStatus } from '../../utils/running-status';
import { ShortCircuitAnalysisOneBusResult } from './shortcircuit-analysis-one-bus-result';
import { ShortCircuitAnalysisAllBusesResult } from 'components/results/shortcircuit/shortcircuit-analysis-all-buses-result';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import type { UUID } from 'node:crypto';
import { ColDef, DisplayedColumnsChangedEvent, GridApi, GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { useComputationGlobalFilters } from '../common/global-filter/hooks/use-computation-global-filters';
import { PaginationType, ShortcircuitAnalysisTab, TableType } from '../../../types/custom-aggrid-types';
import { usePaginationSelector } from '../../../hooks/use-pagination-selector';
import {
    convertFilterValues,
    FROM_COLUMN_TO_FIELD,
    FROM_COLUMN_TO_FIELD_ONE_BUS,
    mappingTabs,
} from './shortcircuit-analysis-result-content';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { BranchSide } from 'components/utils/constants';
import { getColumnFiltersFromStore } from '../../../redux/selectors/filter-store-selectors';
import { SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import {
    downloadShortCircuitResultZippedCsv,
    ShortCircuitCsvExportParams,
} from '../../../services/study/short-circuit-analysis';
import { downloadZipFile } from '../../../services/utils';
import { buildValidGlobalFilters } from '../common/global-filter/utils/build-valid-global-filters';
import { getSelectedGlobalFilters } from '../common/global-filter/hooks/use-selected-global-filters';

interface ShortCircuitAnalysisResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

const getDisplayedColumns = (gridApi: GridApi) => {
    return (
        (gridApi
            ?.getColumnDefs()
            ?.filter((col: ColDef) => !col.hide)
            ?.map((col) => col.headerName) as string[]) ?? []
    );
};

export const ShortCircuitAnalysisResultTab: FunctionComponent<ShortCircuitAnalysisResultTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const lastCompletedComputation = useSelector((state: AppState) => state.lastCompletedComputation);
    const { snackError } = useSnackMessage();

    const [csvHeader, setCsvHeader] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const resultTabIndexRedirection = useMemo<ResultTabIndexRedirection>(
        () =>
            // @ts-expect-error TODO: manage null case
            computingTypeToShortcircuitTabRedirection(lastCompletedComputation),
        [lastCompletedComputation]
    );

    const [tabIndex, setTabIndex] = useState<number>(resultTabIndexRedirection);

    const [resultOrLogIndex, setResultOrLogIndex] = useState(0);

    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.ShortcircuitAnalysis,
        mappingTabs(tabIndex) as ShortcircuitAnalysisTab
    );
    const { rowsPerPage } = pagination;

    const RESULTS_TAB_INDEX = 0;
    const LOGS_TAB_INDEX = 1;

    const resetPaginationIfAllBuses = useCallback(() => {
        if (tabIndex !== ShortCircuitAnalysisResultTabs.ALL_BUSES) {
            return;
        }
        if (resultOrLogIndex !== RESULTS_TAB_INDEX) {
            return;
        }
        dispatchPagination({ page: 0, rowsPerPage });
    }, [tabIndex, resultOrLogIndex, dispatchPagination, rowsPerPage]);

    const AllBusesShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
    );
    const OneBusShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const setRedirectionLock = useResultsTab(resultTabIndexRedirection, setTabIndex);

    const handleTabChange = useCallback(
        (event: SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
            //when we manually browse results we ought to block further redirections until the next completed computation
            setRedirectionLock(true);
        },
        [setTabIndex, setRedirectionLock]
    );

    useComputationGlobalFilters(TableType.ShortcircuitAnalysis, resetPaginationIfAllBuses);

    const handleSubTabChange = useCallback(
        (event: SyntheticEvent, newIndex: number) => {
            setResultOrLogIndex(newIndex);
        },
        [setResultOrLogIndex]
    );

    const shortCircuitTabResultStatusSucceedOrFailed = useMemo(() => {
        return (
            (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES &&
                (AllBusesShortCircuitStatus === RunningStatus.SUCCEED ||
                    AllBusesShortCircuitStatus === RunningStatus.FAILED)) ||
            (tabIndex === ShortCircuitAnalysisResultTabs.ONE_BUS &&
                (OneBusShortCircuitStatus === RunningStatus.SUCCEED ||
                    OneBusShortCircuitStatus === RunningStatus.FAILED))
        );
    }, [AllBusesShortCircuitStatus, OneBusShortCircuitStatus, tabIndex]);

    const shortCircuitTabIsRunning = useMemo(() => {
        return tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES
            ? AllBusesShortCircuitStatus
            : OneBusShortCircuitStatus;
    }, [AllBusesShortCircuitStatus, OneBusShortCircuitStatus, tabIndex]);

    const openLoader = useOpenLoaderShortWait({
        isLoading: shortCircuitTabIsRunning === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const handleGridColumnsChanged = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            setCsvHeader(getDisplayedColumns(params?.api));
        }
    }, []);

    const handleRowDataUpdated = useCallback((event: RowDataUpdatedEvent) => {
        if (event?.api) {
            setIsCsvButtonDisabled(event.api.getDisplayedRowCount() === 0);
        }
    }, []);

    const handleDisplayedColumnsChanged = useCallback((event: DisplayedColumnsChangedEvent) => {
        if (event?.api) {
            setCsvHeader(getDisplayedColumns(event.api));
        }
    }, []);

    const filterableEquipmentTypes: EquipmentType[] = useMemo(() => {
        return [EquipmentType.VOLTAGE_LEVEL];
    }, []);

    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE][mappingTabs(tabIndex)]
    );

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {};
        const enumValuesToTranslate = [
            'THREE_PHASE',
            'SINGLE_PHASE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'CURRENT',
            'LOW_VOLTAGE',
            'HIGH_VOLTAGE',
            'LOW_SHORT_CIRCUIT_CURRENT',
            'HIGH_SHORT_CIRCUIT_CURRENT',
            BranchSide.ONE,
            BranchSide.TWO,
            'OTHER',
        ];

        enumValuesToTranslate.forEach((value) => {
            returnedValue[value] = (window as any).intl?.formatMessage
                ? (window as any).intl.formatMessage({ id: value })
                : value;
        });

        return returnedValue;
    }, []);

    const resetKey = `${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}-${tabIndex}-${resultOrLogIndex}-${appTabIndex}`;

    const exportCsv = useCallback(async () => {
        const analysisType = tabIndex;
        const oneBusCase = analysisType === ShortCircuitAnalysisType.ONE_BUS;
        const fromFrontColumnToBackKeys = oneBusCase ? FROM_COLUMN_TO_FIELD_ONE_BUS : FROM_COLUMN_TO_FIELD;

        const backSortConfig = sortConfig?.map((sort) => ({
            ...sort,
            colId: fromFrontColumnToBackKeys[sort.colId],
        }));

        const filters = getColumnFiltersFromStore(TableType.ShortcircuitAnalysis, mappingTabs(analysisType));
        const updatedFilters = filters
            ? mapFieldsToColumnsFilter(convertFilterValues(filters), fromFrontColumnToBackKeys)
            : null;

        const selector = {
            filter: updatedFilters,
            sort: backSortConfig,
        };

        const exportParams: ShortCircuitCsvExportParams = {
            csvHeader,
            enumValueTranslations,
            language,
            oneBusCase,
        };

        const response = await downloadShortCircuitResultZippedCsv({
            studyUuid,
            currentNodeUuid: nodeUuid,
            currentRootNetworkUuid,
            type: analysisType,
            globalFilters: buildValidGlobalFilters(getSelectedGlobalFilters(TableType.ShortcircuitAnalysis)),
            selector,
            csvParams: exportParams,
        });

        const fileBlob = await response.blob();
        downloadZipFile(fileBlob, oneBusCase ? 'oneBus-results.zip' : 'allBuses_results.zip');
    }, [tabIndex, sortConfig, csvHeader, enumValueTranslations, language, studyUuid, nodeUuid, currentRootNetworkUuid]);

    const handleExportError = useCallback(
        (error: unknown) => {
            snackWithFallback(snackError, error, { headerId: 'shortCircuitAnalysisCsvResultsError' });
        },
        [snackError]
    );

    return (
        <>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab
                    label={<FormattedMessage id={'ShortCircuitAnalysisTabAllBuses'} />}
                    data-testid="ShortCircuitAnalysisAllBusesTab"
                />
                <Tab
                    label={<FormattedMessage id={'ShortCircuitAnalysisTabOneBus'} />}
                    data-testid="ShortCircuitAnalysisOneBusTab"
                />
            </Tabs>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                }}
            >
                <Tabs value={resultOrLogIndex} onChange={handleSubTabChange}>
                    <Tab label={<FormattedMessage id={'Results'} />} data-testid="ShortCircuitResultsTab" />
                    <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} data-testid="ShortCircuitLogsTab" />
                </Tabs>
                {resultOrLogIndex === RESULTS_TAB_INDEX && tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES && (
                    <GlobalFilterSelector
                        filterableEquipmentTypes={filterableEquipmentTypes}
                        genericFiltersStrictMode={true}
                        tableType={TableType.ShortcircuitAnalysis}
                    />
                )}
                <Box sx={{ flexGrow: 1 }}></Box>
                {resultOrLogIndex === RESULTS_TAB_INDEX &&
                    (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES ||
                        tabIndex === ShortCircuitAnalysisResultTabs.ONE_BUS) && (
                        <ManagedExportCsvButton
                            exportCsv={exportCsv}
                            resetKey={resetKey}
                            disabled={isCsvButtonDisabled}
                            onError={handleExportError}
                        />
                    )}
            </Box>
            {resultOrLogIndex === RESULTS_TAB_INDEX &&
                (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES ? (
                    <ShortCircuitAnalysisAllBusesResult
                        onGridColumnsChanged={handleGridColumnsChanged}
                        onRowDataUpdated={handleRowDataUpdated}
                        onDisplayedColumnsChanged={handleDisplayedColumnsChanged}
                    />
                ) : (
                    <ShortCircuitAnalysisOneBusResult
                        onGridColumnsChanged={handleGridColumnsChanged}
                        onRowDataUpdated={handleRowDataUpdated}
                        onDisplayedColumnsChanged={handleDisplayedColumnsChanged}
                    />
                ))}
            {resultOrLogIndex === LOGS_TAB_INDEX && (
                <>
                    <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
                    {shortCircuitTabResultStatusSucceedOrFailed && (
                        <ComputationReportViewer
                            reportType={
                                tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES
                                    ? ComputingType.SHORT_CIRCUIT
                                    : ComputingType.SHORT_CIRCUIT_ONE_BUS
                            }
                        />
                    )}
                </>
            )}
        </>
    );
};
