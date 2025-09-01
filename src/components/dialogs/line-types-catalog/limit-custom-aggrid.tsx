/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AgGridReact } from 'ag-grid-react';
import { CATEGORIES_TABS, LineTypeInfo } from './line-catalog.type';
import { ColDef } from 'ag-grid-community';
import { RefObject, useMemo } from 'react';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import { suppressEventsToPreventEditMode } from '../commons/utils';

const defaultColDef: ColDef = {
    filter: true,
    sortable: true,
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressKeyboardEvent: suppressEventsToPreventEditMode,
};

interface LimitsCustomAgGridProps {
    gridRef: RefObject<AgGridReact>;
    currentTab: number;
    aerialRowData: LineTypeInfo[];
    undergroundRowData: LineTypeInfo[];
    aerialColumnDefs: ColDef[];
    undergroundColumnDefs: ColDef[];
    onSelectionChanged: () => void;
    onGridReady: () => void;
}

export default function LimitCustomAgGrid({
    gridRef,
    currentTab,
    aerialRowData,
    undergroundRowData,
    aerialColumnDefs,
    undergroundColumnDefs,
    onSelectionChanged,
    onGridReady,
}: Readonly<LimitsCustomAgGridProps>) {
    const { rowData, columnDefs } = useMemo(() => {
        if (currentTab === CATEGORIES_TABS.AERIAL.id) {
            return { rowData: aerialRowData, columnDefs: aerialColumnDefs };
        }
        return { rowData: undergroundRowData, columnDefs: undergroundColumnDefs };
    }, [currentTab, aerialRowData, undergroundRowData, aerialColumnDefs, undergroundColumnDefs]);

    return (
        <CustomAGGrid
            ref={gridRef}
            rowData={rowData}
            defaultColDef={defaultColDef}
            columnDefs={columnDefs}
            rowSelection="single"
            onSelectionChanged={onSelectionChanged}
            onGridReady={onGridReady}
            overrideLocales={AGGRID_LOCALES}
        />
    );
}
