/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs.js';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import {
    ComputingType,
    EquipmentType,
    ManagedExportCsvButton,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer.type';
import type { UUID } from 'node:crypto';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import {
    DATA_KEY_TO_FILTER_KEY_N,
    DATA_KEY_TO_FILTER_KEY_NK,
    DATA_KEY_TO_SORT_KEY,
    FUNCTION_TYPES,
    isSensiKind,
    mappingTabs,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { useComputationGlobalFilters } from '../common/global-filter/hooks/use-computation-global-filters';
import { PaginationType, SortWay, TableType } from '../../../types/custom-aggrid-types';
import { usePaginationSelector } from '../../../hooks/use-pagination-selector';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { buildValidGlobalFilters } from '../common/global-filter/utils/build-valid-global-filters';
import { getColumnFiltersFromStore } from '../../../redux/selectors/filter-store-selectors';
import { getSelectedGlobalFilters } from '../common/global-filter/hooks/use-selected-global-filters';
import { exportSensitivityResultsAsCsv } from 'services/study/sensitivity-analysis';
import { downloadZipFile } from '../../../services/utils';

import { FilterType, isCriteriaFilterType } from '../common/global-filter/filter.type';

export type SensitivityAnalysisResultTabProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
};

function SensitivityAnalysisResultTab({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}: Readonly<SensitivityAnalysisResultTabProps>) {
    const [nOrNkIndex, setNOrNkIndex] = useState<number>(0);
    const [sensiTab, setSensiTab] = useState<SensiTab>(SENSITIVITY_IN_DELTA_MW);

    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const { snackError } = useSnackMessage();

    const handleSensiNOrNkIndexChange = (event: SyntheticEvent, newNOrNKIndex: number) => {
        setNOrNkIndex(newNOrNKIndex);
    };

    // Narrow to SensiKind when needed (pagination, filters, sort)
    const sensiKindForPagination = isSensiKind(sensiTab) ? sensiTab : SENSITIVITY_IN_DELTA_MW;

    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.SensitivityAnalysis,
        mappingTabs(sensiKindForPagination, nOrNkIndex)
    );

    const { rowsPerPage } = pagination;

    const resetPagination = useCallback(() => {
        dispatchPagination({ page: 0, rowsPerPage });
    }, [dispatchPagination, rowsPerPage]);

    useComputationGlobalFilters(TableType.SensitivityAnalysis, resetPagination);

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const filterableEquipmentTypes: EquipmentType[] = useMemo(() => {
        return sensiTab === SENSITIVITY_AT_NODE ? [] : [EquipmentType.TWO_WINDINGS_TRANSFORMER, EquipmentType.LINE];
    }, [sensiTab]);

    const filterTypes: FilterType[] = useMemo(() => {
        const allFilterTypes = Object.values(FilterType);
        if (sensiTab === SENSITIVITY_AT_NODE) {
            // in this case we disable generic filters
            return allFilterTypes.filter((filterType) => !isCriteriaFilterType(filterType));
        }
        return allFilterTypes;
    }, [sensiTab]);

    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const sortConfig = useSelector(
        (state: AppState) =>
            state.tableSort[SENSITIVITY_ANALYSIS_RESULT_SORT_STORE][mappingTabs(sensiKindForPagination, nOrNkIndex)]
    );

    const resetKey = `${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}-${nOrNkIndex}-${sensiKindForPagination}-${appTabIndex}`;

    const exportCsv = useCallback(async () => {
        const filters = getColumnFiltersFromStore(
            TableType.SensitivityAnalysis,
            mappingTabs(sensiKindForPagination, nOrNkIndex)
        );

        const mappedFilters = filters?.map((elem) => {
            const keyMap = nOrNkIndex === 0 ? DATA_KEY_TO_FILTER_KEY_N : DATA_KEY_TO_FILTER_KEY_NK;
            const newColumn = keyMap[elem.column as keyof typeof keyMap];
            return { ...elem, column: newColumn };
        });

        const sortSelector = sortConfig?.length
            ? {
                  sortKeysWithWeightAndDirection: Object.fromEntries(
                      sortConfig.map((value) => [
                          DATA_KEY_TO_SORT_KEY[value.colId as keyof typeof DATA_KEY_TO_SORT_KEY],
                          value.sort === SortWay.DESC ? -1 : 1,
                      ])
                  ),
              }
            : {};

        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKindForPagination],
            offset: 0,
            pageNumber: 0,
            pageSize: -1, // meaning 'All'
            ...sortSelector,
        };

        const globalFilters = buildValidGlobalFilters(getSelectedGlobalFilters(TableType.SensitivityAnalysis));

        const response = await exportSensitivityResultsAsCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            {
                csvHeaders,
                resultTab: SensitivityResultTabs[nOrNkIndex].id,
                sensitivityFunctionType: FUNCTION_TYPES[sensiKindForPagination],
                language,
            },
            selector,
            mappedFilters,
            globalFilters
        );

        const blob = await response.blob();
        downloadZipFile(blob, 'sensitivity_analyse_results.zip');
    }, [
        sortConfig,
        nOrNkIndex,
        sensiKindForPagination,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        csvHeaders,
        language,
    ]);

    const handleExportError = useCallback(
        (error: unknown) => {
            snackWithFallback(snackError, error, { headerId: 'csvExportSensitivityResultError' });
        },
        [snackError]
    );

    return (
        <>
            <SensitivityAnalysisTabs sensiTab={sensiTab} setSensiTab={setSensiTab} />
            {isSensiKind(sensiTab) && (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Tabs value={nOrNkIndex} onChange={handleSensiNOrNkIndexChange}>
                            {SensitivityResultTabs.map((tab) => (
                                <Tab
                                    key={tab.label}
                                    label={tab.label}
                                    data-testid={`SensitivityAnalysis${tab.label}Tab`}
                                />
                            ))}
                        </Tabs>
                        <Box sx={{ display: 'flex', flexGrow: 0 }}>
                            <GlobalFilterSelector
                                filterCategories={filterTypes}
                                filterableEquipmentTypes={filterableEquipmentTypes}
                                genericFiltersStrictMode={true}
                                tableType={TableType.SensitivityAnalysis}
                            />
                        </Box>
                        <ManagedExportCsvButton
                            exportCsv={exportCsv}
                            resetKey={resetKey}
                            disabled={isCsvButtonDisabled}
                            onError={handleExportError}
                        />
                    </Box>
                    <PagedSensitivityAnalysisResult
                        nOrNkIndex={nOrNkIndex}
                        sensiKind={sensiTab}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        setCsvHeaders={setCsvHeaders}
                        setIsCsvButtonDisabled={setIsCsvButtonDisabled}
                    />
                </>
            )}
            {sensiTab === COMPUTATION_RESULTS_LOGS && (
                <>
                    <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
                    {(sensitivityAnalysisStatus === RunningStatus.SUCCEED ||
                        sensitivityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.SENSITIVITY_ANALYSIS} />
                    )}
                </>
            )}
        </>
    );
}

export default SensitivityAnalysisResultTab;
