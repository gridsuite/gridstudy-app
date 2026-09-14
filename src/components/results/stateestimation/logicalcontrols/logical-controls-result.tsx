/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, Key, SyntheticEvent, useMemo, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { FormattedMessage, useIntl } from 'react-intl';
import { LogicalControlsResultDto } from './logicalControls.types';
import { LogicalControlsTable } from './logical-controls-table';
import {
    flattenRecord,
    flattenRecordOfArrays,
    flattenRecordWithKey,
    logicalControlsBalancesColumnsDefinition,
    logicalControlsInvalidMeasurementsColumnsDefinition,
    logicalControlsOriginExtremityDeviationsColumnsDefinition,
    logicalControlsOutOfBoundsMeasurementsColumnsDefinition,
    logicalControlsVoltageDeviationsColumnsDefinition,
} from './logicalcontrols-result-utils';

const BALANCES_TAB_INDEX = 0;
const NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX = 1;
const ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX = 2;
const ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX = 3;
const OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX = 4;
const VOLTAGE_DEVIATIONS_TAB_INDEX = 5;

interface LogicalControlsResultProps {
    result?: LogicalControlsResultDto;
    isLoadingResult: boolean;
    exportCsvResetKey: Key;
}

export const LogicalControlsResult: FunctionComponent<LogicalControlsResultProps> = ({
    result,
    isLoadingResult,
    exportCsvResetKey,
}) => {
    const intl = useIntl();
    const [subTabIndex, setSubTabIndex] = useState(BALANCES_TAB_INDEX);

    const handleSubTabChange = (_event: SyntheticEvent, newSubTabIndex: number) => {
        setSubTabIndex(newSubTabIndex);
    };

    const columnDefs = useMemo(() => {
        switch (subTabIndex) {
            case BALANCES_TAB_INDEX:
                return logicalControlsBalancesColumnsDefinition(intl);
            case NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX:
            case ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX:
                return logicalControlsInvalidMeasurementsColumnsDefinition(intl);
            case ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX:
                return logicalControlsOriginExtremityDeviationsColumnsDefinition(intl);
            case OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX:
                return logicalControlsOutOfBoundsMeasurementsColumnsDefinition(intl);
            case VOLTAGE_DEVIATIONS_TAB_INDEX:
                return logicalControlsVoltageDeviationsColumnsDefinition(intl);
            default:
                return [];
        }
    }, [intl, subTabIndex]);

    const balances = useMemo(() => flattenRecordWithKey(result?.balances), [result]);
    const nonZeroMeasurementsOnDisconnected = useMemo(
        () => flattenRecordOfArrays(result?.nonZeroMeasurementsOnDisconnected),
        [result]
    );
    const zeroMeasurementsOnConnected = useMemo(
        () => flattenRecordOfArrays(result?.zeroMeasurementsOnConnected),
        [result]
    );
    const originExtremityDeviations = useMemo(() => flattenRecordOfArrays(result?.originExtremityDeviations), [result]);
    const outOfBoundsMeasurements = useMemo(() => flattenRecordOfArrays(result?.outOfBoundsMeasurements), [result]);
    const voltageDeviations = useMemo(() => flattenRecord(result?.voltageDeviations), [result]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs value={subTabIndex} onChange={handleSubTabChange}>
                <Tab label={<FormattedMessage id="LogicalControlsBalances" />} />
                <Tab label={<FormattedMessage id="LogicalControlsNonZeroMeasurementsOnDisconnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsZeroMeasurementsOnConnected" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOriginExtremityDeviations" />} />
                <Tab label={<FormattedMessage id="LogicalControlsOutOfBoundsMeasurements" />} />
                <Tab label={<FormattedMessage id="LogicalControlsVoltageDeviations" />} />
            </Tabs>

            {subTabIndex === BALANCES_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={balances}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="balances"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
            {subTabIndex === NON_ZERO_MEASUREMENTS_ON_DISCONNECTED_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={nonZeroMeasurementsOnDisconnected}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="nonZeroMeasurementsOnDisconnected"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
            {subTabIndex === ZERO_MEASUREMENTS_ON_CONNECTED_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={zeroMeasurementsOnConnected}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="zeroMeasurementsOnConnected"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
            {subTabIndex === ORIGIN_EXTREMITY_DEVIATIONS_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={originExtremityDeviations}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="originExtremityDeviations"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
            {subTabIndex === OUT_OF_BOUNDS_MEASUREMENTS_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={outOfBoundsMeasurements}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="outOfBoundsMeasurements"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
            {subTabIndex === VOLTAGE_DEVIATIONS_TAB_INDEX && (
                <LogicalControlsTable
                    resultAvailable={!!result}
                    rows={voltageDeviations}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    tableName="voltageDeviations"
                    exportCsvResetKey={exportCsvResetKey}
                />
            )}
        </Box>
    );
};
