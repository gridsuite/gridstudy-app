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
import { ComputingType } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer';
import type { UUID } from 'node:crypto';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { SensitivityExportButton } from './sensitivity-analysis-export-button.js';
import { isSensiKind, mappingTabs, SensitivityResultTabs } from './sensitivity-analysis-result-utils.js';
import { useComputationGlobalFilters } from '../common/global-filter/use-computation-global-filters';
import { PaginationType, TableType } from '../../../types/custom-aggrid-types';
import { usePaginationSelector } from '../../../hooks/use-pagination-selector';
import { FilterType, isCriteriaFilterType } from '../common/utils';

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

    const handleSensiNOrNkIndexChange = (event: SyntheticEvent, newNOrNKIndex: number) => {
        setNOrNkIndex(newNOrNKIndex);
    };

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

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return sensiTab === SENSITIVITY_AT_NODE ? [] : [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
    }, [sensiTab]);

    const filterTypes: FilterType[] = useMemo(() => {
        const allFilterTypes = Object.values(FilterType);
        if (sensiTab === SENSITIVITY_AT_NODE) {
            // in this case we disable generic filters
            return allFilterTypes.filter((filterType) => !isCriteriaFilterType(filterType));
        }
        return allFilterTypes;
    }, [sensiTab]);

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
                        <SensitivityExportButton
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            csvHeaders={csvHeaders}
                            nOrNkIndex={nOrNkIndex}
                            sensiKind={sensiTab}
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
