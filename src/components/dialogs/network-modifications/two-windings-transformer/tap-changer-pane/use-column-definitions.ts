/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { DndColumnType } from '../../../../utils/dnd-table/dnd-table.type';

export const STEPS_TAP = 'tap';
export const STEPS_RESISTANCE = 'resistance';
export const STEPS_REACTANCE = 'reactance';
export const STEPS_CONDUCTANCE = 'conductance';
export const STEPS_SUSCEPTANCE = 'susceptance';
export const STEPS_RATIO = 'ratio';
export const STEPS_ALPHA = 'alpha';

export interface ColumnDefinition {
    label: string;
    dataKey: string;
    type: DndColumnType;
    initialValue?: number;
    editable?: boolean;
    clearable?: boolean;
}

export interface ColumnOptionsProps {
    includeAlpha?: boolean;
    additionalColumns?: ColumnDefinition[];
    excludeColumns?: string[];
}

const getBaseColumns = (): ColumnDefinition[] => [
    {
        label: 'Tap',
        dataKey: STEPS_TAP,
        type: DndColumnType.TEXT,
    },
    {
        label: 'DeltaResistance',
        dataKey: STEPS_RESISTANCE,
        initialValue: 0,
        editable: true,
        type: DndColumnType.NUMERIC,
        clearable: false,
    },
    {
        label: 'DeltaReactance',
        dataKey: STEPS_REACTANCE,
        initialValue: 0,
        editable: true,
        type: DndColumnType.NUMERIC,
        clearable: false,
    },
    {
        label: 'DeltaConductance',
        dataKey: STEPS_CONDUCTANCE,
        initialValue: 0,
        editable: true,
        type: DndColumnType.NUMERIC,
        clearable: false,
    },
    {
        label: 'DeltaSusceptance',
        dataKey: STEPS_SUSCEPTANCE,
        initialValue: 0,
        editable: true,
        type: DndColumnType.NUMERIC,
        clearable: false,
    },
    {
        label: 'Ratio',
        dataKey: STEPS_RATIO,
        initialValue: 1,
        editable: true,
        type: DndColumnType.NUMERIC,
        clearable: false,
    },
];

const getAlphaColumn = (): ColumnDefinition => ({
    label: 'Alpha',
    dataKey: STEPS_ALPHA,
    initialValue: 0,
    editable: true,
    type: DndColumnType.NUMERIC,
    clearable: false,
});

export const useColumnDefinitions = (options: ColumnOptionsProps = {}): ColumnDefinition[] => {
    const intl = useIntl();

    return useMemo(() => {
        let columns = getBaseColumns();
        if (options.includeAlpha) {
            columns.push(getAlphaColumn());
        }
        if (options.excludeColumns?.length) {
            columns = columns.filter((column) => !options.excludeColumns?.includes(column.dataKey));
        }
        if (options.additionalColumns?.length) {
            columns = [...columns, ...options.additionalColumns];
        }
        return columns.map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }, [intl, options.includeAlpha, options.excludeColumns, options.additionalColumns]);
};
