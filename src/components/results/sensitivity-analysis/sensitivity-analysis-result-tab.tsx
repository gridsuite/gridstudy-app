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
import {
    DATA_KEY_TO_FILTER_KEY_N,
    DATA_KEY_TO_FILTER_KEY_NK,
    DATA_KEY_TO_SORT_KEY,
    FUNCTION_TYPES,
    isSensiKind,
    mappingTabs,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { exportSensitivityResultsAsCsv } from '../../../services/study/sensitivity-analysis';
import { downloadZipFile } from '../../../services/utils';
import { ComputingType, PARAM_LANGUAGE, useSnackMessage } from '@gridsuite/commons-ui';
import { ExportButton } from '../../utils/export-button';
import { AppState } from '../../../redux/reducer';
import { UUID } from 'crypto';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiKind,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import useGlobalFilters from '../common/global-filter/use-global-filters';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { FilterType as AgGridFilterType, SortWay } from '../../../types/custom-aggrid-types';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';

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
    const { snackError } = useSnackMessage();
    const [nOrNkIndex, setNOrNkIndex] = useState<number>(0);
    const [sensiTab, setSensiTab] = useState<SensiTab>(SENSITIVITY_IN_DELTA_MW);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState<boolean>(false);
    const [isCsvExportLoading, setIsCsvExportLoading] = useState<boolean>(false);
    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);

    const { globalFilters, handleGlobalFilterChange, getGlobalFilterParameter } = useGlobalFilters({});
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();
    const { filters } = useFilterSelector(
        AgGridFilterType.SensitivityAnalysis,
        mappingTabs(sensiTab as SensiKind, nOrNkIndex)
    );
    const sortConfig = useSelector(
        (state: AppState) =>
            state.tableSort[SENSITIVITY_ANALYSIS_RESULT_SORT_STORE][mappingTabs(sensiTab as SensiKind, nOrNkIndex)]
    );

    const initTable = () => {
        setIsCsvExportSuccessful(false);
    };

    const handleSensiTabChange = (newSensiTab: SensiTab) => {
        initTable();
        setSensiTab(newSensiTab);
    };

    const handleSensiNOrNkIndexChange = (event: SyntheticEvent, newNOrNKIndex: number) => {
        initTable();
        setNOrNkIndex(newNOrNKIndex);
    };

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const handleExportResultAsCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
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
            functionType: FUNCTION_TYPES[sensiTab as SensiKind],
            offset: 0,
            pageNumber: 0,
            pageSize: -1, // meaning 'All'
            ...sortSelector,
        };

        exportSensitivityResultsAsCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            {
                csvHeaders: csvHeaders,
                resultTab: SensitivityResultTabs[nOrNkIndex].id,
                sensitivityFunctionType: isSensiKind(sensiTab) ? FUNCTION_TYPES[sensiTab] : undefined,
                language: language,
            },
            selector,
            mappedFilters,
            getGlobalFilterParameter(globalFilters)
        )
            .then((response) => {
                response.blob().then((blob: Blob) => {
                    downloadZipFile(blob, 'sensitivity_analyse_results.zip');
                    setIsCsvExportSuccessful(true);
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'csvExportSensitivityResultError',
                });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        filters,
        sortConfig,
        nOrNkIndex,
        sensiTab,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        csvHeaders,
        language,
        getGlobalFilterParameter,
        globalFilters,
        snackError,
    ]);

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return sensiTab === SENSITIVITY_AT_NODE ? [] : [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
    }, [sensiTab]);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

    return (
        <>
            <SensitivityAnalysisTabs sensiTab={sensiTab} setSensiTab={handleSensiTabChange} />
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
                                <Tab key={tab.label} label={tab.label} />
                            ))}
                        </Tabs>
                        <Box sx={{ display: 'flex', flexGrow: 0 }}>
                            <GlobalFilterSelector
                                onChange={handleGlobalFilterChange}
                                filters={globalFilterOptions}
                                filterableEquipmentTypes={filterableEquipmentTypes}
                                genericFiltersStrictMode={true}
                                disableGenericFilters={sensiTab === SENSITIVITY_AT_NODE}
                            />
                        </Box>
                        <ExportButton
                            disabled={isCsvButtonDisabled}
                            onClick={handleExportResultAsCsv}
                            isDownloadLoading={isCsvExportLoading}
                            isDownloadSuccessful={isCsvExportSuccessful}
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
                        globalFilters={getGlobalFilterParameter(globalFilters)}
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
