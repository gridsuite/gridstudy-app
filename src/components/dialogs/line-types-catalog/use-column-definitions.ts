/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';

export const useColumnDefinitions = () => {
    const intl = useIntl();

    const aerialColumnDefs = useMemo(
        (): ColDef[] => [
            {
                headerName: intl.formatMessage({ id: 'lineTypes.type' }),
                field: 'type',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.voltage' }),
                field: 'voltage',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.conductorType' }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.section' }),
                field: 'section',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.conductorsNumber' }),
                field: 'conductorsNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.circuitsNumber' }),
                field: 'circuitsNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.groundWiresNumber' }),
                field: 'groundWiresNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearResistance' }),
                field: 'linearResistance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearReactance' }),
                field: 'linearReactance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearCapacity' }),
                field: 'linearCapacity',
                cellRenderer: DefaultCellRenderer,
            },
        ],
        [intl]
    );

    const undergroundColumnDefs = useMemo(
        (): ColDef[] => [
            {
                headerName: intl.formatMessage({ id: 'lineTypes.type' }),
                field: 'type',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.voltage' }),
                field: 'voltage',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.conductorType' }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.section' }),
                field: 'section',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.insulator' }),
                field: 'insulator',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.screen' }),
                field: 'screen',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearResistance' }),
                field: 'linearResistance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearReactance' }),
                field: 'linearReactance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.linearCapacity' }),
                field: 'linearCapacity',
                cellRenderer: DefaultCellRenderer,
            },
        ],
        [intl]
    );

    return { aerialColumnDefs, undergroundColumnDefs };
};
