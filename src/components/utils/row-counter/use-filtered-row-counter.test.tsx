/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import { type FilterConfig, type GlobalFilter, GlobalFilterType } from '@gridsuite/commons-ui';
import { useFilteredRowCounterInfo, UseFilteredRowCounterInfoReturn } from './use-filtered-row-counter';

const messages = {
    Rows: '{count, plural, one {row} other {rows}}',
    NoMatch: 'No match',
    ClickToReset: 'Click to reset',
    ExternalFilters: 'External filters',
    ColumnsFilters: 'Columns filters',
    RowCounterInfo: 'Info',
    'filter.equals': 'Equals',
};

const countryFilter: GlobalFilter = { id: 'FR', label: 'FR', filterType: GlobalFilterType.COUNTRY } as GlobalFilter;

function mockGridApi(displayedRows: number, rowData: unknown[], isAnyFilterPresent = false) {
    return {
        getDisplayedRowCount: () => displayedRows,
        getGridOption: () => rowData,
        isAnyFilterPresent: () => isAnyFilterPresent,
        isRowDataEmpty: () => rowData.length === 0,
        addEventListener: jest.fn(),
        getColumn: () => ({ getColDef: () => ({ headerName: 'Header' }) }),
    } as any;
}

type HarnessProps = {
    api: any;
    globalFilters?: GlobalFilter[];
    columnsFilters?: FilterConfig[];
    unfilteredRowCount?: number;
    isDataPending?: boolean;
};

let infos: UseFilteredRowCounterInfoReturn;

function Harness({ api, globalFilters = [], columnsFilters, unfilteredRowCount, isDataPending = false }: HarnessProps) {
    infos = useFilteredRowCounterInfo({
        gridRef: { current: { api } as any },
        globalFilters,
        columnsFilters,
        unfilteredRowCount,
        disabled: false,
        isDataPending,
    });
    return null;
}

let root: Root;

async function show(props: HarnessProps) {
    const store = configureStore({
        reducer: () => ({ currentTreeNode: { id: 'node' }, currentRootNetworkUuid: 'root' }),
    });
    await act(async () =>
        root.render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages} onError={() => {}}>
                    <Harness {...props} />
                </IntlProvider>
            </Provider>
        )
    );
    await act(async () => {
        infos.registerRowCounterEvents({ api: props.api });
        jest.runAllTimers();
    });
}

beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    root = createRoot(document.createElement('div'));
});

afterEach(async () => {
    await act(async () => root.unmount());
    jest.useRealTimers();
});

describe('useFilteredRowCounterInfo', () => {
    it('counts the grid rows when every filter is applied by the grid', async () => {
        await show({ api: mockGridApi(2, [1, 2, 3], true) });

        expect(infos.isLoading).toBe(false);
        expect(infos.isAnyFilterPresent).toBe(true);
        expect(infos.rowCountLabel).toBe('2 / 3 rows');
    });

    it('shows the total only when nothing is filtered', async () => {
        await show({ api: mockGridApi(3, [1, 2, 3]) });

        expect(infos.isAnyFilterPresent).toBe(false);
        expect(infos.rowCountLabel).toBe('3 rows');
    });

    it('uses the given unfiltered count when rows are already filtered outside the grid', async () => {
        await show({ api: mockGridApi(2, [1, 2, 3]), globalFilters: [countryFilter], unfilteredRowCount: 10 });

        expect(infos.isAnyFilterPresent).toBe(true);
        expect(infos.rowCountLabel).toBe('2 / 10 rows');
    });

    it('lists the global and columns filters in the tooltip', async () => {
        await show({
            api: mockGridApi(1, [1, 2]),
            globalFilters: [countryFilter],
            columnsFilters: [{ column: 'equipmentId', type: 'equals', dataType: 'text', value: 'L1' }],
            unfilteredRowCount: 5,
        });

        const container = document.createElement('div');
        const tooltipRoot = createRoot(container);
        await act(async () => tooltipRoot.render(infos.tooltipContent));
        expect(container.textContent).toContain('External filters');
        expect(container.textContent).toContain('"FR"');
        expect(container.textContent).toContain('Header : Equals "L1"');
        await act(async () => tooltipRoot.unmount());
    });

    it('stays loading while the data is pending', async () => {
        await show({ api: mockGridApi(1, [1]), isDataPending: true });

        expect(infos.isLoading).toBe(true);
    });
});
