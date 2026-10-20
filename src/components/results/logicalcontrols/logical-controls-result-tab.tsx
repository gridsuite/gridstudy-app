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

const BALANCES_TAB_INDEX = 0;
const NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX = 1;
const ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX = 2;
const ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX = 3;
const OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX = 4;
const VOLTAGE_DEVIATIONS_TAB_INDEX = 5;

export const LogicalControlsResultTab: FunctionComponent<LogicalControlsTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const intl = useIntl();
    const [tabIndex, setTabIndex] = useState(BALANCES_TAB_INDEX);
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

    const columnDefs = useMemo(() => {
        switch (tabIndex) {
            case BALANCES_TAB_INDEX:
                return logicalControlsBalancesColumnsDefinition(intl);
            case NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX:
                return logicalControlsInvalidMeasurementsColumnsDefinition(intl);
            case ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX:
                return logicalControlsNullMeasurementsColumnsDefinition(intl);
            case ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX:
                return logicalControlsOriginExtremityDeviationsColumnsDefinition(intl);
            case OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX:
                return logicalControlsOutOfBoundsMeasurementsColumnsDefinition(intl);
            case VOLTAGE_DEVIATIONS_TAB_INDEX:
                return logicalControlsVoltageDeviationsColumnsDefinition(intl);
            default:
                return [];
        }
    }, [intl, tabIndex]);

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
                <Tab label={<FormattedMessage id="LogicalControlsBalances" />} />
                <Tab label={<FormattedMessage id="LogicalControlsNonZeroMeasurementsOnDisconnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsZeroMeasurementsOnConnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOriginExtremityDeviations" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOutOfBoundsMeasurements" />} />
                <Tab label={<FormattedMessage id="LogicalControlsVoltageDeviations" />} />
            </Tabs>

            {tabIndex === BALANCES_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameBalances"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameNonZeroMeasurementsOnDisconnected"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameZeroMeasurementsOnConnected"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameOriginExtremityDeviations"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameOutOfBoundsMeasurements"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
            {tabIndex === VOLTAGE_DEVIATIONS_TAB_INDEX && (
                <LogicalControlsResultTable
                    result={result}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="CsvNameVoltageDeviations"
                    exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
                />
            )}
        </Box>
    );
};
