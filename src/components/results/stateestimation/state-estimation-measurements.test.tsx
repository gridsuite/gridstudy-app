/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { IntlProvider } from 'react-intl';
import { ComputingType, type GlobalFilter, GlobalFilterType, RunningStatus, TableType } from '@gridsuite/commons-ui';
import { StateEstimationMeasurements } from './state-estimation-measurements';
import { StateEstimationResultTab } from './state-estimation-result-tab';
import { fetchStateEstimationMeasurements, fetchStateEstimationResult } from '../../../services/study/state-estimation';
import {
    getComputationResultColumnFilters,
    getComputationResultGlobalFilters,
    setComputationResultGlobalFilters,
} from '../../../services/study/study-config';
import { MeasurementInformationResultDto } from './state-estimation-result.type';
import { store as appStore } from '../../../redux/store';
import {
    addToGlobalFilterOptions,
    initOrUpdateGlobalFilters,
    openStudy,
    setComputingStatus,
    setTableSort,
    updateColumnFiltersAction,
} from '../../../redux/actions';
import { updateComputationGlobalFilters } from '../common/utils';
import {
    STATEESTIMATION_MEASUREMENTS,
    STATEESTIMATION_RESULT_SORT_STORE,
} from '../../../utils/store-sort-filter-fields';
import messages_fr from '../../../translations/messages-fr';

const mockTable: { props?: any } = {};
const mockCounter: { props?: any; isLoading?: boolean } = {};
const mockNotification = new Set<(event?: MessageEvent) => void>();
const mockSnackError = jest.fn();

jest.mock('./state-estimation-result-table', () => ({
    __esModule: true,
    default: (props: unknown) => {
        mockTable.props = props;
        return null;
    },
}));
jest.mock('../../utils/row-counter/filtered-row-counter', () => ({
    FilteredRowCounter: (props: any) => {
        mockCounter.props = props;
        mockCounter.isLoading = props.rowCounterInfos.isLoading;
        return null;
    },
}));
jest.mock('../common/computation-report-viewer', () => ({ ComputationReportViewer: () => null }));
// jest resolves 'redux/...' to the npm package before ./src, so the store's own absolute import is stubbed
jest.mock('redux/session-storage/navigation-local-storage', () => ({ saveStudyNavigationSync: jest.fn() }), {
    virtual: true,
});
jest.mock('react-intl/lib', () => jest.requireActual('react-intl'));
jest.mock('../../../services/study/state-estimation');
jest.mock('../../../services/study/study-config');
jest.mock('../common/global-filter/adapter/global-filter-app-data', () => ({
    fetchSubstationPropertiesGlobalFilters: () =>
        Promise.resolve({ substationPropertiesGlobalFilters: new Map([['region', ['SW']]]) }),
}));
jest.mock('../../utils/localized-countries-hook', () => ({
    useLocalizedCountries: () => ({ translate: (code: string) => code, countryCodes: [] }),
}));
jest.mock('@gridsuite/commons-ui', () => ({
    ...jest.requireActual('@gridsuite/commons-ui'),
    useSnackMessage: () => ({ snackError: mockSnackError }),
    fetchDirectoryElementPath: () => Promise.resolve([]),
    useNotificationsListener: (_key: unknown, { listenerCallbackMessage }: any) => {
        const React = jest.requireActual('react') as typeof import('react');
        React.useEffect(() => {
            mockNotification.add(listenerCallbackMessage);
            return () => {
                mockNotification.delete(listenerCallbackMessage);
            };
        }, [listenerCallbackMessage]);
    },
}));

const fetchMeasurements = jest.mocked(fetchStateEstimationMeasurements);

const STUDY = '11111111-1111-1111-1111-111111111111' as UUID;
const NODE_A = '2222aaaa-2222-2222-2222-222222222222' as UUID;
const NODE_B = '2222bbbb-2222-2222-2222-222222222222' as UUID;
const ROOT = '33333333-3333-3333-3333-333333333333' as UUID;
const DEBOUNCE_MS = 1000;

const country = (code: string): GlobalFilter => ({
    id: code,
    label: code,
    filterType: GlobalFilterType.COUNTRY,
});
const FR = [country('FR')];
const BE = [country('BE')];
const NONE: GlobalFilter[] = [];

const dto = (equipmentId: string, outOfBound = false): MeasurementInformationResultDto => ({
    equipmentId,
    measurementType: 'TENSION',
    validityType: 'CRITIQUE',
    currentValue: 1,
    estimatedValue: 2,
    differenceValue: 1,
    outOfBound,
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

type Props = { nodeUuid: UUID; globalFilters: GlobalFilter[] };

let root: Root;
let store: ReturnType<typeof makeStore>;

function makeStore(status: RunningStatus) {
    return configureStore({
        reducer: (state: any = { computingStatus: { [ComputingType.STATE_ESTIMATION]: status } }, action: any) =>
            action.type === 'setStatus'
                ? { computingStatus: { [ComputingType.STATE_ESTIMATION]: action.status } }
                : state,
    });
}

async function show({ nodeUuid, globalFilters }: Props) {
    await act(async () =>
        root.render(
            <Provider store={store}>
                <StateEstimationMeasurements
                    studyUuid={STUDY}
                    nodeUuid={nodeUuid}
                    rootNetworkUuid={ROOT}
                    globalFilters={globalFilters}
                    columnDefs={[]}
                />
            </Provider>
        )
    );
}

async function setStatus(status: RunningStatus) {
    await act(async () => {
        store.dispatch({ type: 'setStatus', status });
    });
}

async function notifyResult(nodeUuid = NODE_A) {
    await act(async () => {
        for (const listener of mockNotification) {
            listener({
                data: JSON.stringify({ headers: { updateType: 'stateEstimationResult', node: nodeUuid } }),
            } as MessageEvent);
        }
    });
}

async function elapse(ms = DEBOUNCE_MS) {
    await act(async () => {
        jest.advanceTimersByTime(ms);
    });
}

const rows = () => mockTable.props.measurementRows;
const rowIds = () => rows().map((row: any) => row.equipmentId);
const isLoading = () => mockTable.props.isLoadingResult;

beforeEach(() => {
    jest.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    fetchMeasurements.mockReset();
    mockNotification.clear();
    mockSnackError.mockReset();
    mockTable.props = undefined;
    mockCounter.props = undefined;
    mockCounter.isLoading = undefined;
    store = makeStore(RunningStatus.SUCCEED);
    root = createRoot(document.createElement('div'));
});

afterEach(async () => {
    await act(async () => root.unmount());
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe('query', () => {
    it('sends the selected global criteria only', async () => {
        fetchMeasurements.mockResolvedValue([]);

        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['FR'] });
    });

    it('sends no criteria when nothing is selected', async () => {
        fetchMeasurements.mockResolvedValue([]);

        await show({ nodeUuid: NODE_A, globalFilters: NONE });
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledWith(STUDY, NODE_A, ROOT, undefined);
    });

    it('coalesces quick criteria changes into one query', async () => {
        fetchMeasurements.mockResolvedValue([]);

        await show({ nodeUuid: NODE_A, globalFilters: NONE });
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse(DEBOUNCE_MS - 1);
        await show({ nodeUuid: NODE_A, globalFilters: BE });
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['BE'] });
    });

    it('does not query again when the same selection is rehydrated', async () => {
        fetchMeasurements.mockResolvedValue([]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        await show({ nodeUuid: NODE_A, globalFilters: [country('FR')] });
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
    });

    it('queries again on a result notification', async () => {
        fetchMeasurements.mockResolvedValue([]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        await notifyResult();
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledTimes(2);
    });
});

describe('rows', () => {
    it('shows the returned rows for display, duplicates included', async () => {
        fetchMeasurements.mockResolvedValue([dto('L1'), dto('L1'), dto('L2', true)]);

        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        expect(rows().map((row: any) => [row.equipmentId, row.outOfBound])).toEqual([
            ['L1', false],
            ['L1', false],
            ['L2', true],
        ]);
        expect(isLoading()).toBe(false);
    });

    it('shows nothing while the query is pending', async () => {
        fetchMeasurements.mockReturnValue(deferred<MeasurementInformationResultDto[]>().promise);

        await show({ nodeUuid: NODE_A, globalFilters: FR });
        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
        await elapse();

        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
    });

    it('shows nothing and stops loading when there is no result (204)', async () => {
        fetchMeasurements.mockResolvedValue(null);

        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(false);
    });

    it('shows nothing and stops loading on error', async () => {
        fetchMeasurements.mockRejectedValue(new Error('invalid filter'));

        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(false);
        expect(mockSnackError).toHaveBeenCalledTimes(1);
    });

    it('hides the rows while the computation is not finished', async () => {
        fetchMeasurements.mockResolvedValue([dto('L1')]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        await setStatus(RunningStatus.RUNNING);
        expect(rows()).toEqual([]);
        await setStatus(RunningStatus.PRELOADING);
        expect(rows()).toEqual([]);
        await setStatus(RunningStatus.FAILED);
        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
        await elapse();
        expect(rows()).toHaveLength(1);
    });

    it('keeps IDLE readable payload disabled and reports no pending measurement query', async () => {
        store = makeStore(RunningStatus.IDLE);
        fetchMeasurements.mockResolvedValue([dto('should-not-read')]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        expect(isLoading()).toBe(false);
        await elapse(2000);
        expect(fetchMeasurements).not.toHaveBeenCalled();
        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(false);
    });

    it('accepts criteria updates while computing and reads only the latest criteria on completion', async () => {
        store = makeStore(RunningStatus.PRELOADING);
        fetchMeasurements.mockResolvedValue([dto('latest')]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await show({ nodeUuid: NODE_A, globalFilters: BE });
        await elapse(2000);

        expect(fetchMeasurements).not.toHaveBeenCalled();
        expect(isLoading()).toBe(false);

        await setStatus(RunningStatus.SUCCEED);
        expect(isLoading()).toBe(true);
        await elapse();

        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['BE'] });
        expect(rowIds()).toEqual(['latest']);
    });

    it('changes the export reset key with the criteria', async () => {
        fetchMeasurements.mockResolvedValue([]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        const frKey = mockTable.props.exportCsvResetKey;

        await show({ nodeUuid: NODE_A, globalFilters: BE });

        expect(mockTable.props.exportCsvResetKey).not.toBe(frKey);
    });
});

describe('context and races', () => {
    it('hides the rows as soon as the criteria change, until the new query is done', async () => {
        const second = deferred<MeasurementInformationResultDto[]>();
        fetchMeasurements.mockResolvedValueOnce([dto('FR1')]).mockReturnValueOnce(second.promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        expect(rows()).toHaveLength(1);

        await show({ nodeUuid: NODE_A, globalFilters: BE });
        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
        await elapse();
        expect(rows()).toEqual([]);

        await act(async () => second.resolve([dto('BE1'), dto('BE2')]));
        expect(rowIds()).toEqual(['BE1', 'BE2']);
        expect(isLoading()).toBe(false);
    });

    it('hides the rows as soon as the node changes', async () => {
        fetchMeasurements.mockResolvedValueOnce([dto('A')]).mockReturnValueOnce(deferred<any>().promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();

        await show({ nodeUuid: NODE_B, globalFilters: FR });
        expect(rows()).toEqual([]);
        await elapse();

        expect(fetchMeasurements).toHaveBeenLastCalledWith(STUDY, NODE_B, ROOT, { countryCode: ['FR'] });
        expect(rows()).toEqual([]);
    });

    it('ignores the late response of a previous query', async () => {
        const first = deferred<MeasurementInformationResultDto[]>();
        const second = deferred<MeasurementInformationResultDto[]>();
        fetchMeasurements.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        await show({ nodeUuid: NODE_A, globalFilters: BE });
        await elapse();

        await act(async () => first.resolve([dto('FR1')]));
        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);

        await act(async () => second.resolve([dto('BE1')]));
        expect(rowIds()).toEqual(['BE1']);
    });

    it('ignores the late error of a query replaced before its debounce', async () => {
        const first = deferred<MeasurementInformationResultDto[]>();
        fetchMeasurements.mockReturnValueOnce(first.promise).mockReturnValueOnce(deferred<any>().promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        await show({ nodeUuid: NODE_A, globalFilters: BE });

        await act(async () => first.reject(new Error('late')));

        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
    });

    it('ignores the late error of a query replaced by a launched one', async () => {
        const first = deferred<MeasurementInformationResultDto[]>();
        fetchMeasurements.mockReturnValueOnce(first.promise).mockReturnValueOnce(deferred<any>().promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        await show({ nodeUuid: NODE_A, globalFilters: BE });
        await elapse();

        await act(async () => first.reject(new Error('late')));

        expect(isLoading()).toBe(true);
        expect(mockSnackError).not.toHaveBeenCalled();
    });

    it('does not show the old rows when coming back to a previous criteria', async () => {
        const again = deferred<MeasurementInformationResultDto[]>();
        fetchMeasurements.mockResolvedValueOnce([dto('FR-old')]).mockReturnValueOnce(again.promise);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        expect(rows()).toHaveLength(1);

        await show({ nodeUuid: NODE_A, globalFilters: BE });
        await show({ nodeUuid: NODE_A, globalFilters: FR });

        expect(rows()).toEqual([]);
        expect(isLoading()).toBe(true);
        await elapse();
        await act(async () => again.resolve([dto('FR-new')]));
        expect(rowIds()).toEqual(['FR-new']);
    });

    it('does not let a failed query hide the next successful one', async () => {
        fetchMeasurements.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([dto('BE1')]);
        await show({ nodeUuid: NODE_A, globalFilters: FR });
        await elapse();
        expect(isLoading()).toBe(false);

        await show({ nodeUuid: NODE_A, globalFilters: BE });
        expect(isLoading()).toBe(true);
        await elapse();

        expect(rowIds()).toEqual(['BE1']);
        expect(isLoading()).toBe(false);
    });
});

describe('result tab', () => {
    const NOT_SELECTED = 'GlobalFilterCategory';
    let tabContainer: HTMLElement;

    const fullResult = jest.mocked(fetchStateEstimationResult);
    const savedGlobalFilters = jest.mocked(getComputationResultGlobalFilters);
    const saveGlobalFilters = jest.mocked(setComputationResultGlobalFilters);
    const selectedFr = { ...country('FR'), id: 'country-FR' };
    const selectedBe = { ...country('BE'), id: 'country-BE' };

    const byTestId = (id: string) => document.body.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
    const tabs = () => [...tabContainer.querySelectorAll<HTMLElement>('[role=tab]')];
    const input = () => tabContainer.querySelector('#result-global-filter') as HTMLInputElement;
    const click = async (element: HTMLElement | null) => {
        await act(async () => element?.click());
    };
    const openMenu = async () => {
        await act(async () => input().focus());
    };
    const optionLabeled = (label: string) =>
        [...document.body.querySelectorAll<HTMLElement>('[role=option]')].find((o) => o.textContent === label) ?? null;

    async function mountTab() {
        await act(async () =>
            root.render(
                <Provider store={appStore}>
                    <IntlProvider locale="fr" messages={messages_fr as any} onError={() => {}}>
                        <StateEstimationResultTab studyUuid={STUDY} nodeUuid={NODE_A} currentRootNetworkUuid={ROOT} />
                    </IntlProvider>
                </Provider>
            )
        );
        await click(tabs()[1]);
    }

    async function mountParentOnly() {
        await act(async () =>
            root.render(
                <Provider store={appStore}>
                    <IntlProvider locale="fr" messages={messages_fr as any} onError={() => {}}>
                        <StateEstimationResultTab studyUuid={STUDY} nodeUuid={NODE_A} currentRootNetworkUuid={ROOT} />
                    </IntlProvider>
                </Provider>
            )
        );
    }

    async function readyCounter() {
        const api = {
            addEventListener: jest.fn(),
            getDisplayedRowCount: () => 1,
            getGridOption: () => [dto('L1')],
            isAnyFilterPresent: () => false,
            isRowDataEmpty: () => false,
        };
        mockTable.props.gridRef.current = { api };
        await act(async () => mockTable.props.onGridReady({ api }));
    }

    beforeEach(async () => {
        tabContainer = document.body.appendChild(document.createElement('div'));
        root = createRoot(tabContainer);
        fullResult.mockReset();
        fetchMeasurements.mockResolvedValue([dto('L1')]);
        fullResult.mockResolvedValue({
            status: 'OK',
            qualityLevel: 1,
            measurementInformationResults: [dto('EMBEDDED')],
        });
        savedGlobalFilters.mockResolvedValue([]);
        saveGlobalFilters.mockResolvedValue(undefined);
        jest.mocked(getComputationResultGlobalFilters).mockReset().mockResolvedValue([]);
        jest.mocked(getComputationResultColumnFilters).mockResolvedValue([]);
        appStore.dispatch(openStudy(STUDY));
        appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        appStore.dispatch(addToGlobalFilterOptions([selectedFr, selectedBe]));
    });

    afterEach(() => {
        tabContainer.remove();
    });

    it('offers voltage, country, region and sites, but no Ouvrages', async () => {
        await mountTab();
        await openMenu();

        const categories = [...document.body.querySelectorAll('[data-testid^="GlobalFilterCategory"]')].map((c) =>
            c.getAttribute('data-testid')?.replace(NOT_SELECTED, '')
        );
        expect(categories).toEqual(['recent', 'voltageLevel', 'country', 'region', 'substationOrVoltageLevelFilter']);
        expect(document.body.textContent).not.toContain('Ouvrages');
    });

    it('queries the measurements with the criteria selected in the selector', async () => {
        await mountTab();
        await elapse();
        await openMenu();
        await click(byTestId('GlobalFilterCategorycountry'));

        await click(optionLabeled('FR'));
        await elapse();

        expect(fetchMeasurements).toHaveBeenLastCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['FR'] });
        expect(rowIds()).toEqual(['L1']);
    });

    it('does not parameterize or repeat the full result request', async () => {
        await mountTab();
        await elapse();
        const fullResultCalls = fullResult.mock.calls.length;
        await openMenu();
        await click(byTestId('GlobalFilterCategorycountry'));

        await click(optionLabeled('FR'));
        await elapse();

        expect(fullResult).toHaveBeenCalledTimes(fullResultCalls);
        expect(fullResult.mock.calls.every((call) => call.length === 3)).toBe(true);
    });

    it('saves the selection with the existing computation global filters', async () => {
        await mountTab();
        await openMenu();
        await click(byTestId('GlobalFilterCategorycountry'));

        await click(optionLabeled('FR'));
        await elapse(5000);

        expect(saveGlobalFilters).toHaveBeenCalledWith(
            STUDY,
            TableType.StateEstimation,
            expect.arrayContaining([expect.objectContaining({ label: 'FR', filterType: GlobalFilterType.COUNTRY })])
        );
    });

    it('queries with the saved selection', async () => {
        savedGlobalFilters.mockResolvedValue([selectedBe]);

        await mountTab();
        await elapse();

        expect(fetchMeasurements).toHaveBeenLastCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['BE'] });
    });

    it('queries again only when a synchronized selection changes the criteria', async () => {
        savedGlobalFilters.mockResolvedValue([selectedBe]);
        await mountTab();
        await elapse();
        const queries = fetchMeasurements.mock.calls.length;

        await act(async () => updateComputationGlobalFilters(appStore.dispatch, STUDY, TableType.StateEstimation));
        await elapse();
        expect(fetchMeasurements).toHaveBeenCalledTimes(queries);

        savedGlobalFilters.mockResolvedValue([selectedFr]);
        await act(async () => updateComputationGlobalFilters(appStore.dispatch, STUDY, TableType.StateEstimation));
        await elapse();
        expect(fetchMeasurements).toHaveBeenCalledTimes(queries + 1);
        expect(fetchMeasurements).toHaveBeenLastCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['FR'] });
    });

    it('does not query when a column filter or the sort changes', async () => {
        await mountTab();
        await elapse();
        const queries = fetchMeasurements.mock.calls.length;

        await act(async () => {
            appStore.dispatch(
                updateColumnFiltersAction(TableType.StateEstimation, STATEESTIMATION_MEASUREMENTS, [
                    { column: 'equipmentId', value: 'L1', type: 'contains', dataType: 'text' } as any,
                ])
            );
            appStore.dispatch(
                setTableSort(STATEESTIMATION_RESULT_SORT_STORE, STATEESTIMATION_MEASUREMENTS, [
                    { colId: 'equipmentId', sort: 'desc' } as any,
                ])
            );
        });
        await elapse();

        const state = appStore.getState();
        expect(
            state.tableFilters.columnsFilters[TableType.StateEstimation]?.[STATEESTIMATION_MEASUREMENTS]
        ).toHaveLength(1);
        expect(state.tableSort[STATEESTIMATION_RESULT_SORT_STORE][STATEESTIMATION_MEASUREMENTS]).toHaveLength(1);
        expect(fetchMeasurements).toHaveBeenCalledTimes(queries);
    });

    it('keeps the selector mounted but hidden outside the measurements tab', async () => {
        await mountTab();

        await click(tabs()[2]);

        expect(input()).not.toBeNull();
        expect(getComputedStyle(input().closest('.MuiBox-root') as HTMLElement).display).toBe('none');
    });

    it.each([RunningStatus.PRELOADING, RunningStatus.RUNNING, RunningStatus.IDLE])(
        'blocks both full and measurements reads at %s, including a result event before delayed terminal status',
        async (status) => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, status));
            await mountTab();
            await elapse(2000);
            expect(fullResult).not.toHaveBeenCalled();
            expect(fetchMeasurements).not.toHaveBeenCalled();
            expect(isLoading()).toBe(false);

            await notifyResult();
            await elapse(2000);
            expect(fullResult).not.toHaveBeenCalled();
            expect(fetchMeasurements).not.toHaveBeenCalled();
            expect(mockSnackError).not.toHaveBeenCalled();

            await act(async () => {
                appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
            });
            await elapse();
            expect(fullResult).toHaveBeenCalledTimes(1);
            expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        }
    );

    it('mounts and completes the full-result reader without opening measurements', async () => {
        appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.RUNNING));
        await mountParentOnly();
        await elapse(2000);
        expect(fullResult).not.toHaveBeenCalled();
        expect(fetchMeasurements).not.toHaveBeenCalled();

        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        });
        await elapse();
        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).not.toHaveBeenCalled();
    });

    it('cancels both readers’ queued work when active status commits before debounce', async () => {
        await mountTab();
        await elapse(500);
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.PRELOADING));
        });
        await elapse(1500);
        expect(fullResult).not.toHaveBeenCalled();
        expect(fetchMeasurements).not.toHaveBeenCalled();

        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        });
        await elapse();
        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
    });

    it('reads diagnostics on an eligible FAILED mount', async () => {
        appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.FAILED));
        fetchMeasurements.mockResolvedValue([dto('diagnostic')]);
        await mountTab();
        await elapse();

        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        expect(rowIds()).toEqual(['diagnostic']);
    });

    it('does not fetch while parent and measurements are mounted during criteria changes; completion reads latest criteria', async () => {
        appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.PRELOADING));
        await mountTab();
        await act(async () => {
            appStore.dispatch(initOrUpdateGlobalFilters(TableType.StateEstimation, [selectedFr]));
            appStore.dispatch(initOrUpdateGlobalFilters(TableType.StateEstimation, [selectedBe]));
        });
        await elapse(2000);

        expect(fullResult).not.toHaveBeenCalled();
        expect(fetchMeasurements).not.toHaveBeenCalled();
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        });
        await elapse();

        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fullResult.mock.calls[0]).toHaveLength(3);
        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledWith(STUDY, NODE_A, ROOT, { countryCode: ['BE'] });
    });

    it('settles the counter after an eligible null read and remounts without a stuck loader', async () => {
        appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.RUNNING));
        await mountTab();
        await readyCounter();
        await elapse(1500);
        expect(mockCounter.isLoading).toBe(true);

        fetchMeasurements.mockResolvedValueOnce(null);
        fullResult.mockResolvedValueOnce(null);
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        });
        await elapse();
        await elapse(600);
        expect(mockCounter.isLoading).toBe(false);

        await click(tabs()[2]);
        await click(tabs()[1]);
        await readyCounter();
        await elapse();
        await elapse(600);
        expect(mockCounter.isLoading).toBe(false);

        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.RUNNING));
        });
        fullResult.mockRejectedValueOnce(new Error('404 full result'));
        fetchMeasurements.mockRejectedValueOnce(new Error('404 measurements'));
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.FAILED));
        });
        await elapse();
        await elapse(600);
        expect(mockCounter.isLoading).toBe(false);
        expect(mockSnackError).toHaveBeenCalledTimes(2);
    });

    it('re-reads both readers on a same-context rerun and retains current 404 errors at FAILED', async () => {
        await mountTab();
        await elapse();
        fullResult.mockClear();
        fetchMeasurements.mockClear();

        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.PRELOADING));
        });
        expect(rows()).toEqual([]);
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.FAILED));
        });
        expect(isLoading()).toBe(true);
        await elapse();
        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledTimes(1);

        fullResult.mockRejectedValueOnce(new Error('404 full result'));
        fetchMeasurements.mockRejectedValueOnce(new Error('404 measurements'));
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.RUNNING));
        });
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.FAILED));
        });
        await elapse();
        expect(mockSnackError).toHaveBeenCalledTimes(2);
        expect(isLoading()).toBe(false);
    });

    it('coalesces completion status with a nearby result notification', async () => {
        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.RUNNING));
        });
        await mountTab();
        await notifyResult();
        await elapse(500);

        await act(async () => {
            appStore.dispatch(setComputingStatus(ComputingType.STATE_ESTIMATION, RunningStatus.SUCCEED));
        });
        await notifyResult();
        await elapse();

        expect(fullResult).toHaveBeenCalledTimes(1);
        expect(fetchMeasurements).toHaveBeenCalledTimes(1);
    });
});
