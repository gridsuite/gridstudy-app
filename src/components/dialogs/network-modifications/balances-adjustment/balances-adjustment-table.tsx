/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DndTable, DndColumnType, SelectInput } from '@gridsuite/commons-ui';
import {
    BALANCES_ADJUSTMENT,
    BALANCES_ADJUSTMENT_COUNTRIES,
    BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE,
    BALANCES_ADJUSTMENT_SHIFT_TYPE,
    BALANCES_ADJUSTMENT_TARGET,
    BALANCES_ADJUSTMENT_ZONE,
    BALANCES_ADJUSTMENT_ZONES,
    SELECTED,
} from '../../../utils/field-constants';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { ShiftEquipmentType, ShiftType } from '../../../../services/network-modification-types';
import { useIntl } from 'react-intl';
import CountriesAutocomplete from './countries-autocomplete';
import { styles } from './styles';

export default function BalancesAdjustmentTable() {
    const intl = useIntl();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'BalancesAdjustmentZone',
                dataKey: BALANCES_ADJUSTMENT_ZONE,
                editable: true,
                type: DndColumnType.TEXT as const,
                initialValue: '',
                width: '100px',
            },
            {
                label: 'BalancesAdjustmentCountry',
                dataKey: BALANCES_ADJUSTMENT_COUNTRIES,
                editable: true,
                type: DndColumnType.CUSTOM as const,
                component: (rowIndex: number) =>
                    CountriesAutocomplete({
                        name: `${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ZONES}[${rowIndex}].${BALANCES_ADJUSTMENT_COUNTRIES}`,
                    }),
                initialValue: [],
                width: '300px',
                maxWidth: '300px',
            },
            {
                label: 'BalancesAdjustmentShiftEquipmentType',
                dataKey: BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE,
                editable: true,
                type: DndColumnType.CUSTOM as const,
                component: (rowIndex: number) =>
                    SelectInput({
                        name: `${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ZONES}[${rowIndex}].${BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE}`,
                        options: Object.keys(ShiftEquipmentType).map((value) => {
                            return { id: value, label: value };
                        }),
                        disableClearable: true,
                        sx: styles.autocomplete,
                    }),
                initialValue: ShiftEquipmentType.GENERATOR,
                width: '150px',
            },
            {
                label: 'BalancesAdjustmentShiftType',
                dataKey: BALANCES_ADJUSTMENT_SHIFT_TYPE,
                editable: true,
                type: DndColumnType.CUSTOM as const,
                component: (rowIndex: number) =>
                    SelectInput({
                        name: `${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ZONES}[${rowIndex}].${BALANCES_ADJUSTMENT_SHIFT_TYPE}`,
                        options: Object.keys(ShiftType).map((value) => {
                            return { id: value, label: value };
                        }),
                        disableClearable: true,
                        sx: styles.autocomplete,
                    }),
                initialValue: ShiftType.PROPORTIONAL,
                width: '150px',
            },
            {
                label: 'BalancesAdjustmentTarget',
                dataKey: BALANCES_ADJUSTMENT_TARGET,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                initialValue: 0,
                width: '100px',
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [intl]);
    const useFieldArrayOutputBalancesAdjustment = useFieldArray({
        name: `${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ZONES}`,
    });

    const createRow = useCallback(() => {
        const newRowData: Record<string, unknown> = {};
        newRowData[SELECTED] = false;
        columnsDefinition.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return [newRowData];
    }, [columnsDefinition]);

    return (
        <DndTable
            arrayFormName={`${BALANCES_ADJUSTMENT}.${BALANCES_ADJUSTMENT_ZONES}`}
            useFieldArrayOutput={useFieldArrayOutputBalancesAdjustment}
            createRows={createRow}
            columnsDefinition={columnsDefinition}
            tableHeight={450}
            withAddRowsDialog={false}
            disableDragAndDrop={true}
            showMoveArrow={false}
        />
    );
}
