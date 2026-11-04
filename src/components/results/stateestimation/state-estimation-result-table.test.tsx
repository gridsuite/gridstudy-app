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
import { createTheme, ThemeProvider } from '@mui/material';
import { ComputingType, RunningStatus, TableType } from '@gridsuite/commons-ui';
import StateEstimationResultTable from './state-estimation-result-table';
import { MeasurementInformationResult, MeasurementType, ValidityType } from './state-estimation-result.type';
import {
    STATEESTIMATION_MEASUREMENTS,
    STATEESTIMATION_QUALITY_CRITERION,
    STATEESTIMATION_RESULT_SORT_STORE,
} from '../../../utils/store-sort-filter-fields';
import { useInitialColumnSort } from '../common/use-initial-column-sort';

const mockGrid: { props?: any } = {};
const mockOnGridReady = jest.fn();

jest.mock('../../utils/renderTable-ExportCsv', () => ({
    RenderTableAndExportCsv: (props: unknown) => {
        mockGrid.props = props;
        return null;
    },
}));
jest.mock('../common/use-initial-column-sort', () => ({
    useInitialColumnSort: jest.fn(() => mockOnGridReady),
}));

const measurement = (equipmentId: string): MeasurementInformationResult => ({
    equipmentId,
    measurementType: MeasurementType.TENSION,
    validityType: ValidityType.CRITIQUE,
    currentValue: 1,
    estimatedValue: 2,
    differenceValue: 1,
    outOfBound: false,
});

const embeddedResult: any = {
    measurementInformationResults: [measurement('EMBEDDED')],
    qualityCriterionResults: [{ type: 'Q', validity: 1, value: 1, threshold: 1 }],
};

let root: Root;

async function show(props: Record<string, unknown>) {
    const store = configureStore({
        reducer: () => ({
            computingStatus: { [ComputingType.STATE_ESTIMATION]: RunningStatus.SUCCEED },
            computedLanguage: 'en',
        }),
    });
    await act(async () =>
        root.render(
            <Provider store={store}>
                <ThemeProvider theme={createTheme({ selectedRow: { background: 'grey' } } as any)}>
                    <IntlProvider locale="en" onError={() => {}}>
                        <StateEstimationResultTable
                            isLoadingResult={false}
                            columnDefs={[]}
                            exportCsvResetKey="key"
                            tableName={STATEESTIMATION_MEASUREMENTS}
                            filter={true}
                            sortable={true}
                            {...props}
                        />
                    </IntlProvider>
                </ThemeProvider>
            </Provider>
        )
    );
}

const rowIds = () => mockGrid.props.rows.map((row: any) => row.equipmentId);

beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.mocked(useInitialColumnSort).mockClear();
    mockGrid.props = undefined;
    root = createRoot(document.createElement('div'));
});

afterEach(async () => {
    await act(async () => root.unmount());
});

describe('measurement rows', () => {
    it('shows exactly the given rows, duplicates included', async () => {
        await show({ result: embeddedResult, measurementRows: [measurement('L1'), measurement('L1')] });

        expect(rowIds()).toEqual(['L1', 'L1']);
    });

    it('never falls back to the embedded rows when none are given', async () => {
        await show({ result: embeddedResult, measurementRows: [] });

        expect(rowIds()).toEqual([]);
    });

    it('needs no full result', async () => {
        await show({ measurementRows: [measurement('L1')] });

        expect(rowIds()).toEqual(['L1']);
    });

    it('still shows the embedded rows when the prop is not used', async () => {
        await show({ result: embeddedResult });

        expect(rowIds()).toEqual(['EMBEDDED']);
    });

    it('leaves the other tables to the full result', async () => {
        await show({
            result: embeddedResult,
            measurementRows: [measurement('L1')],
            tableName: STATEESTIMATION_QUALITY_CRITERION,
        });

        expect(mockGrid.props.rows).toEqual(embeddedResult.qualityCriterionResults);
    });
});

describe('native grid behavior', () => {
    it('keeps the stored column filters and sort of the measurement table', async () => {
        await show({ measurementRows: [] });

        expect(useInitialColumnSort).toHaveBeenCalledWith(
            STATEESTIMATION_RESULT_SORT_STORE,
            STATEESTIMATION_MEASUREMENTS,
            true
        );
        expect(mockGrid.props.onGridReady).toBe(mockOnGridReady);
        expect(mockGrid.props.computationType).toBe(TableType.StateEstimation);
        expect(mockGrid.props.computationSubType).toBe(STATEESTIMATION_MEASUREMENTS);
    });

    it('gives client-side filter and sort to the columns', async () => {
        await show({ measurementRows: [] });

        expect(mockGrid.props.defaultColDef).toMatchObject({ filter: true, sortable: true });
    });
});
