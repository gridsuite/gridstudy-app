/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ComputingType, RunningStatus } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer.type';
import { useNodeData } from 'components/use-node-data';
import { fetchLogicalControlsResult } from '../../../services/study/state-estimation';
import { logicalControlsResultInvalidations } from '../../computing-status/use-all-computing-status';
import { LogicalControlsResult, LogicalControlsTabProps } from './logical-controls-result.type';
import LogicalControlsResultTable from './logical-controls-result-table';
import {
    flattenRecord,
    flattenRecordOfArrays,
    logicalControlsBalancesColumnsDefinition,
    logicalControlsInvalidMeasurementsColumnsDefinition,
    logicalControlsNullMeasurementsColumnsDefinition,
    logicalControlsOriginExtremityDeviationsColumnsDefinition,
    logicalControlsOutOfBoundsMeasurementsColumnsDefinition,
    logicalControlsVoltageDeviationsColumnsDefinition,
} from './logical-controls-result-utils';

const LOGICAL_CONTROLS_TABS = [
    {
        label: 'LogicalControlsBalances',
        tableName: 'CsvNameBalances',
        columnsDefinition: logicalControlsBalancesColumnsDefinition,
    },
    {
        label: 'LogicalControlsNonZeroMeasurementsOnDisconnected',
        tableName: 'CsvNameNonZeroMeasurementsOnDisconnected',
        columnsDefinition: logicalControlsInvalidMeasurementsColumnsDefinition,
    },
    {
        label: 'LogicalControlsZeroMeasurementsOnConnected',
        tableName: 'CsvNameZeroMeasurementsOnConnected',
        columnsDefinition: logicalControlsNullMeasurementsColumnsDefinition,
    },
    {
        label: 'LogicalControlsOriginExtremityDeviations',
        tableName: 'CsvNameOriginExtremityDeviations',
        columnsDefinition: logicalControlsOriginExtremityDeviationsColumnsDefinition,
    },
    {
        label: 'LogicalControlsOutOfBoundsMeasurements',
        tableName: 'CsvNameOutOfBoundsMeasurements',
        columnsDefinition: logicalControlsOutOfBoundsMeasurementsColumnsDefinition,
    },
    {
        label: 'LogicalControlsVoltageDeviations',
        tableName: 'CsvNameVoltageDeviations',
        columnsDefinition: logicalControlsVoltageDeviationsColumnsDefinition,
    },
] as const;

export const LogicalControlsResultTab: FunctionComponent<LogicalControlsTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(0);
    const logicalControlsStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.LOGICAL_CONTROLS]
    );

    const { result: logicalControlsResult, isLoading: isLoadingResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchLogicalControlsResult,
        invalidations: logicalControlsResultInvalidations,
    });

    const selectedTab = LOGICAL_CONTROLS_TABS[tabIndex];
    const columnDefs = useMemo(() => selectedTab.columnsDefinition(intl), [intl, selectedTab]);

    const handleTabChange = (_event: SyntheticEvent, newTabIndex: number) => {
        setTabIndex(newTabIndex);
    };

    const result = useMemo<Partial<LogicalControlsResult>>(() => {
        const isProcessing =
            logicalControlsStatus !== RunningStatus.SUCCEED && logicalControlsStatus !== RunningStatus.FAILED;
        if (isProcessing || !logicalControlsResult) {
            return {};
        }
        return {
            balances: flattenRecord(logicalControlsResult.balances),
            nonZeroMeasurementsOnDisconnected: flattenRecordOfArrays(
                logicalControlsResult.nonZeroMeasurementsOnDisconnected
            ),
            zeroMeasurementsOnConnected: flattenRecordOfArrays(logicalControlsResult.zeroMeasurementsOnConnected),
            originExtremityDeviations: flattenRecordOfArrays(logicalControlsResult.originExtremityDeviations),
            outOfBoundsMeasurements: flattenRecordOfArrays(logicalControlsResult.outOfBoundsMeasurements),
            voltageDeviations: flattenRecord(logicalControlsResult.voltageDeviations),
        };
    }, [logicalControlsStatus, logicalControlsResult]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                {LOGICAL_CONTROLS_TABS.map(({ label }) => (
                    <Tab key={label} label={<FormattedMessage id={label} />} />
                ))}
            </Tabs>

            <LogicalControlsResultTable
                key={selectedTab.tableName}
                result={result}
                columnDefs={columnDefs}
                isLoadingResult={isLoadingResult}
                tableName={selectedTab.tableName}
                exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
            />
        </Box>
    );
};
