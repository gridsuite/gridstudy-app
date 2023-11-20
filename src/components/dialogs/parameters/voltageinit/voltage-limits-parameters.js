/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import DndTable from 'components/utils/dnd-table/dnd-table';
import {
    FILTERS,
    HIGH_VOLTAGE_LIMIT,
    LOW_VOLTAGE_LIMIT,
    SELECTED,
    VOLTAGE_LIMITS_DEFAULT,
    VOLTAGE_LIMITS_MODIFICATION,
} from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import InfoIcon from '@mui/icons-material/Info';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { elementType } from '@gridsuite/commons-ui';
import { VoltageAdornment } from 'components/dialogs/dialogUtils';

const VoltageLimitsParameters = () => {
    const intl = useIntl();
    const VoltageLevelFilterTooltip = useMemo(() => {
        return (
            <Tooltip
                title={intl.formatMessage({
                    id: 'VoltageLevelFilterTooltip',
                })}
            >
                <IconButton>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
        );
    }, [intl]);

    const VOLTAGE_LIMITS_MODIFICATION_COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'VoltageLevelFilter',
                dataKey: FILTERS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: [EQUIPMENT_TYPES.VOLTAGE_LEVEL],
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
                extra: VoltageLevelFilterTooltip,
            },
            {
                label: 'LowVoltageLimitAdjustment',
                dataKey: LOW_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
            {
                label: 'HighVoltageLimitAdjustment',
                dataKey: HIGH_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [VoltageLevelFilterTooltip, intl]);

    const VOLTAGE_LIMITS_DEFAULT_COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'VoltageLevelFilter',
                dataKey: FILTERS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: [EQUIPMENT_TYPES.VOLTAGE_LEVEL],
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
                extra: VoltageLevelFilterTooltip,
            },
            {
                label: 'LowVoltageLimitDefault',
                dataKey: LOW_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
            {
                label: 'HighVoltageLimitDefault',
                dataKey: HIGH_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [VoltageLevelFilterTooltip, intl]);

    const newModificationRowData = useMemo(() => {
        const newRowData = {};
        newRowData[SELECTED] = false;
        VOLTAGE_LIMITS_MODIFICATION_COLUMNS_DEFINITIONS.forEach(
            (column) => (newRowData[column.dataKey] = column.initialValue)
        );
        return newRowData;
    }, [VOLTAGE_LIMITS_MODIFICATION_COLUMNS_DEFINITIONS]);

    const createVoltageLimitModificationRows = () => [newModificationRowData];

    const newDefaultRowData = useMemo(() => {
        const newRowData = {};
        newRowData[SELECTED] = false;
        VOLTAGE_LIMITS_DEFAULT_COLUMNS_DEFINITIONS.forEach(
            (column) => (newRowData[column.dataKey] = column.initialValue)
        );
        return newRowData;
    }, [VOLTAGE_LIMITS_DEFAULT_COLUMNS_DEFINITIONS]);

    const createVoltageLimitDefaultRows = () => [newDefaultRowData];

    const useVoltageLimitsModificationFieldArrayOutput = useFieldArray({
        name: `${VOLTAGE_LIMITS_MODIFICATION}`,
    });

    const useVoltageLimitsDefaultFieldArrayOutput = useFieldArray({
        name: `${VOLTAGE_LIMITS_DEFAULT}`,
    });

    return (
        <Grid container>
            <Typography component="span" variant="h6">
                <FormattedMessage id="AdjustExistingLimits" />
            </Typography>
            <DndTable
                arrayFormName={`${VOLTAGE_LIMITS_MODIFICATION}`}
                columnsDefinition={
                    VOLTAGE_LIMITS_MODIFICATION_COLUMNS_DEFINITIONS
                }
                useFieldArrayOutput={
                    useVoltageLimitsModificationFieldArrayOutput
                }
                createRows={createVoltageLimitModificationRows}
                tableHeight={270}
                withAddRowsDialog={false}
                withLeftButtons={false}
            />

            <Typography component="span" variant="h6">
                <FormattedMessage id="SetDefaultLimits" />
            </Typography>
            <DndTable
                arrayFormName={`${VOLTAGE_LIMITS_DEFAULT}`}
                columnsDefinition={VOLTAGE_LIMITS_DEFAULT_COLUMNS_DEFINITIONS}
                useFieldArrayOutput={useVoltageLimitsDefaultFieldArrayOutput}
                createRows={createVoltageLimitDefaultRows}
                tableHeight={270}
                withAddRowsDialog={false}
                withLeftButtons={false}
            />
        </Grid>
    );
};

export default VoltageLimitsParameters;
