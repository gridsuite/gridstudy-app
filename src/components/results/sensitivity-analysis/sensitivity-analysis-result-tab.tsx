/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, useMemo, useState } from 'react';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs.js';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputingType } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer';
import type { UUID } from 'node:crypto';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import useGlobalFilters, { isGlobalFilterParameter } from '../common/global-filter/use-global-filters';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';
import { SensitivityExportButton } from './sensitivity-analysis-export-button.js';
import { isSensiKind, mappingTabs, SensitivityResultTabs } from './sensitivity-analysis-result-utils.js';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import { PaginationType, SensitivityAnalysisTab } from '../../../types/custom-aggrid-types';

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

    const sensiKindForPagination = isSensiKind(sensiTab) ? sensiTab : SENSITIVITY_IN_DELTA_MW;

    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.SensitivityAnalysis,
        mappingTabs(sensiKindForPagination, nOrNkIndex) as SensitivityAnalysisTab
    );
    const { rowsPerPage } = pagination;

    const { globalFilters, handleGlobalFilterChange } = useGlobalFilters({
        onChange: () => {
            if (!isSensiKind(sensiTab)) {
                return;
            }
            dispatchPagination({ page: 0, rowsPerPage });
        },
    });

    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    const handleSensiNOrNkIndexChange = (event: SyntheticEvent, newNOrNKIndex: number) => {
        setNOrNkIndex(newNOrNKIndex);
    };

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return sensiTab === SENSITIVITY_AT_NODE ? [] : [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
    }, [sensiTab]);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
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
                        <SensitivityExportButton
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            csvHeaders={csvHeaders}
                            nOrNkIndex={nOrNkIndex}
                            sensiKind={sensiTab}
                            globalFilters={isGlobalFilterParameter(globalFilters) ? globalFilters : undefined}
                            disabled={isCsvButtonDisabled}
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
                        globalFilters={isGlobalFilterParameter(globalFilters) ? globalFilters : undefined}
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
