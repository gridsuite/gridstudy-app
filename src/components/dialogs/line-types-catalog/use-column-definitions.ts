/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { useCallback, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';

export const useColumnDefinitions = () => {
    const intl = useIntl();

    const createColumn = useCallback(
        (id: string, field: string, options: Partial<ColDef> = {}): ColDef => ({
            headerName: intl.formatMessage({ id }),
            field,
            ...options,
        }),
        [intl]
    );

    const columnConfigs = {
        common: [
            { id: 'lineTypes.type', field: 'type', options: { pinned: 'left' as const } },
            { id: 'lineTypes.voltage', field: 'voltage', options: { cellRenderer: DefaultCellRenderer } },
            { id: 'lineTypes.conductorType', field: 'conductorType' },
            { id: 'lineTypes.section', field: 'section', options: { cellRenderer: DefaultCellRenderer } },
        ],
        aerial: [
            {
                id: 'lineTypes.conductorsNumber',
                field: 'conductorsNumber',
                options: { cellRenderer: DefaultCellRenderer },
            },
            { id: 'lineTypes.circuitsNumber', field: 'circuitsNumber', options: { cellRenderer: DefaultCellRenderer } },
            {
                id: 'lineTypes.groundWiresNumber',
                field: 'groundWiresNumber',
                options: { cellRenderer: DefaultCellRenderer },
            },
        ],
        underground: [
            { id: 'lineTypes.insulator', field: 'insulator' },
            { id: 'lineTypes.screen', field: 'screen' },
        ],
        electrical: [
            {
                id: 'lineTypes.linearResistance',
                field: 'linearResistance',
                options: { cellRenderer: DefaultCellRenderer },
            },
            {
                id: 'lineTypes.linearReactance',
                field: 'linearReactance',
                options: { cellRenderer: DefaultCellRenderer },
            },
            { id: 'lineTypes.linearCapacity', field: 'linearCapacity', options: { cellRenderer: DefaultCellRenderer } },
        ],
    };

    const aerialColumnDefs = useMemo(
        (): ColDef[] => [
            ...columnConfigs.common.map((c) => createColumn(c.id, c.field, c.options)),
            ...columnConfigs.aerial.map((c) => createColumn(c.id, c.field, c.options)),
            ...columnConfigs.electrical.map((c) => createColumn(c.id, c.field, c.options)),
        ],
        [columnConfigs.aerial, columnConfigs.common, columnConfigs.electrical, createColumn]
    );

    const undergroundColumnDefs = useMemo(
        (): ColDef[] => [
            ...columnConfigs.common.map((c) => createColumn(c.id, c.field, c.options)),
            ...columnConfigs.underground.map((c) => createColumn(c.id, c.field, c)),
            ...columnConfigs.electrical.map((c) => createColumn(c.id, c.field, c.options)),
        ],
        [columnConfigs.common, columnConfigs.electrical, columnConfigs.underground, createColumn]
    );

    return { aerialColumnDefs, undergroundColumnDefs };
};
