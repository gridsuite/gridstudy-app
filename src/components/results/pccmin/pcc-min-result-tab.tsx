/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ComputationReportViewer } from '../common/computation-report-viewer';

import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '@gridsuite/commons-ui';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ColDef, GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import useGlobalFilters, { isGlobalFilterParameter } from '../common/global-filter/use-global-filters';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';
import { PccMinResultTabProps } from './pcc-min-result.type';
import { PccMinResult } from './pcc-min-result';

export const PccMinResultTab: FunctionComponent<PccMinResultTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const [resultOrLogIndex, setResultOrLogIndex] = useState(0);

    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

    const RESULTS_TAB_INDEX = 0;
    const LOGS_TAB_INDEX = 1;

    const { globalFilters, handleGlobalFilterChange } = useGlobalFilters();
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    const handleSubTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setResultOrLogIndex(newIndex);
        },
        [setResultOrLogIndex]
    );

    const openLoader = useOpenLoaderShortWait({
        isLoading: pccMinStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return [EQUIPMENT_TYPES.VOLTAGE_LEVEL];
    }, []);

    useEffect(() => {
        // Clear the globalfilter when tab changes
        handleGlobalFilterChange([]);
    }, [handleGlobalFilterChange]);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, mb: 1 }}>
                    <Tabs value={resultOrLogIndex} onChange={handleSubTabChange}>
                        <Tab label={<FormattedMessage id="Results" />} />
                        <Tab label={<FormattedMessage id="ComputationResultsLogs" />} />
                    </Tabs>

                    {/* Global filter */}
                    <Box sx={{ flex: 1 }}>
                        <GlobalFilterSelector
                            onChange={handleGlobalFilterChange}
                            filters={globalFilterOptions}
                            filterableEquipmentTypes={filterableEquipmentTypes}
                            genericFiltersStrictMode
                        />
                    </Box>
                </Box>

                {/* Tab panel content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {resultOrLogIndex === RESULTS_TAB_INDEX && (
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                            <PccMinResult
                                studyUuid={studyUuid}
                                nodeUuid={nodeUuid}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                globalFilters={isGlobalFilterParameter(globalFilters) ? globalFilters : undefined}
                                customTablePaginationProps={{
                                    labelRowsPerPageId: 'muiTablePaginationLabelRowsPerPage',
                                }}
                            />
                        </Box>
                    )}

                    {resultOrLogIndex === LOGS_TAB_INDEX && (
                        <>
                            {/* Loader */}
                            {openLoader && <LinearProgress sx={{ height: 4, flexShrink: 0 }} />}

                            {/* Logs viewer */}
                            {(pccMinStatus === RunningStatus.SUCCEED || pccMinStatus === RunningStatus.FAILED) && (
                                <Box sx={{ flex: 1, minHeight: 0 }}>
                                    <ComputationReportViewer reportType={ComputingType.PCC_MIN} />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </>
    );
};
