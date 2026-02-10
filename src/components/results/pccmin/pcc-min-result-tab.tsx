/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import { FunctionComponent, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ComputationReportViewer } from '../common/computation-report-viewer';

import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '@gridsuite/commons-ui';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';
import { PccMinResultTabProps } from './pcc-min-result.type';
import { PccMinResult } from './pcc-min-result';
import { useComputationGlobalFilters } from '../common/global-filter/use-computation-global-filters';
import { FilterType as AgGridFilterType, PaginationType } from '../../../types/custom-aggrid-types';
import { usePaginationSelector } from '../../../hooks/use-pagination-selector';
import { PCCMIN_RESULT } from '../../../utils/store-sort-filter-fields';

export const PccMinResultTab: FunctionComponent<PccMinResultTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const [resultOrLogIndex, setResultOrLogIndex] = useState(0);

    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

    const RESULTS_TAB_INDEX = 0;
    const LOGS_TAB_INDEX = 1;

    const { globalFiltersFromState, updateGlobalFilters } = useComputationGlobalFilters(AgGridFilterType.PccMin);
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    const { pagination, dispatchPagination } = usePaginationSelector(PaginationType.PccMin, PCCMIN_RESULT);
    const { rowsPerPage } = pagination;

    const resetPagination = useCallback(() => {
        dispatchPagination({ page: 0, rowsPerPage });
    }, [dispatchPagination, rowsPerPage]);

    const handleSubTabChange = useCallback((event: SyntheticEvent, newIndex: number) => {
        setResultOrLogIndex(newIndex);
    }, []);

    const openLoader = useOpenLoaderShortWait({
        isLoading: pccMinStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return [EQUIPMENT_TYPES.VOLTAGE_LEVEL];
    }, []);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, mb: 1 }}>
                <Tabs value={resultOrLogIndex} onChange={handleSubTabChange}>
                    <Tab label={<FormattedMessage id="Results" />} />
                    <Tab label={<FormattedMessage id="ComputationResultsLogs" />} />
                </Tabs>
                {resultOrLogIndex === RESULTS_TAB_INDEX && (
                    <Box sx={{ flex: 1 }}>
                        <GlobalFilterSelector
                            onChange={updateGlobalFilters}
                            afterChange={resetPagination}
                            filters={globalFilterOptions}
                            filterableEquipmentTypes={filterableEquipmentTypes}
                            preloadedGlobalFilters={globalFiltersFromState}
                            genericFiltersStrictMode
                        />
                    </Box>
                )}
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {resultOrLogIndex === RESULTS_TAB_INDEX && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <PccMinResult
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            globalFilter={globalFiltersFromState}
                            customTablePaginationProps={{
                                labelRowsPerPageId: 'muiTablePaginationLabelRowsPerPage',
                            }}
                        />
                    </Box>
                )}

                {resultOrLogIndex === LOGS_TAB_INDEX && (
                    <>
                        {openLoader && <LinearProgress sx={{ height: 4, flexShrink: 0 }} />}
                        {(pccMinStatus === RunningStatus.SUCCEED || pccMinStatus === RunningStatus.FAILED) && (
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <ComputationReportViewer reportType={ComputingType.PCC_MIN} />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};
