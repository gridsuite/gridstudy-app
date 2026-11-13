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
import type { UUID } from 'node:crypto';
import {
    ComputingType,
    EquipmentType,
    type GlobalFilter,
    GlobalFilterType,
    RunningStatus,
    TableType,
} from '@gridsuite/commons-ui';
import { LogicalControlsResultTab } from './logical-controls-result-tab';
import {
    LimitType,
    type LogicalControlsResultDto,
    type LogicalControlsResultTableProps,
    type LogicalControlsTabProps,
    MeasurementType,
    StatusType,
} from './logical-controls-result.type';
import { fetchLogicalControlsResult } from '../../../services/study/state-estimation';
import {
    getComputationResultColumnFilters,
    getComputationResultGlobalFilters,
    setComputationResultGlobalFilters,
} from '../../../services/study/study-config';
import { store } from '../../../redux/store';
import {
    addToGlobalFilterOptions,
    openStudy,
    setComputingStatus,
    setTableSort,
    updateColumnFiltersAction,
} from '../../../redux/actions';
import { updateComputationGlobalFilters } from '../common/utils';
import {
    LOGICAL_CONTROLS_BALANCES,
    LOGICAL_CONTROLS_NON_ZERO_MEASUREMENTS_ON_DISCONNECTED,
    LOGICAL_CONTROLS_ORIGIN_EXTREMITY_DEVIATIONS,
    LOGICAL_CONTROLS_OUT_OF_BOUNDS_MEASUREMENTS,
    LOGICAL_CONTROLS_RESULT_SORT_STORE,
    LOGICAL_CONTROLS_VOLTAGE_DEVIATIONS,
    LOGICAL_CONTROLS_ZERO_MEASUREMENTS_ON_CONNECTED,
} from '../../../utils/store-sort-filter-fields';
import type { GlobalFilterSelectorProps } from '../common/global-filter/global-filter-selector';
import messages_fr from '../../../translations/messages-fr';

const mockTable: { props?: LogicalControlsResultTableProps } = {};
const mockSelector: { props?: GlobalFilterSelectorProps } = {};
const mockNotification: { listener?: (event: Partial<MessageEvent>) => void } = {};
const mockSnackError = jest.fn();
const mockOpenSLD = jest.fn();

jest.mock('./logical-controls-result-table', () => ({
    __esModule: true,
    default: (props: LogicalControlsResultTableProps) => {
        mockTable.props = props;
        return null;
    },
}));
jest.mock('../common/global-filter/global-filter-selector', () => ({
    __esModule: true,
    default: (props: GlobalFilterSelectorProps) => {
        mockSelector.props = props;
        const Selector = jest.requireActual('../common/global-filter/global-filter-selector').default;
        return <Selector {...props} />;
    },
}));
jest.mock('components/workspace/hooks/use-workspace-panel-actions', () => ({
    useWorkspacePanelActions: () => ({ openSLD: mockOpenSLD }),
}));
// Jest resolves redux/... to the npm package before src, unlike the application aliases.
jest.mock('redux/session-storage/navigation-local-storage', () => ({ saveStudyNavigationSync: jest.fn() }), {
    virtual: true,
});
jest.mock('../../../services/study/state-estimation');
jest.mock('../../../services/study/study-config');
jest.mock('../common/global-filter/adapter/global-filter-app-data', () => ({
    fetchSubstationPropertiesGlobalFilters: () =>
        Promise.resolve({ substationPropertiesGlobalFilters: new Map([['region', ['SW']]]) }),
}));
jest.mock('../../utils/localized-countries-hook', () => ({
    useLocalizedCountries: () => ({ translate: (code: string) => code, countryCodes: [] }),
}));
jest.mock('@gridsuite/commons-ui', () => {
    const actual = jest.requireActual('@gridsuite/commons-ui');
    return {
        ...actual,
        useSnackMessage: () => ({ snackError: mockSnackError }),
        fetchDirectoryElementPath: () => Promise.resolve([]),
        useNotificationsListener: (_key: unknown, { listenerCallbackMessage }: any) => {
            mockNotification.listener = listenerCallbackMessage;
        },
    };
});

const STUDY = '11111111-1111-1111-1111-111111111111' as UUID;
const NODE = '22222222-2222-2222-2222-222222222222' as UUID;
const ROOT = '33333333-3333-3333-3333-333333333333' as UUID;
const OTHER = '44444444-4444-4444-4444-444444444444' as UUID;
const fetchResult = jest.mocked(fetchLogicalControlsResult);
const savedFilters = jest.mocked(getComputationResultGlobalFilters);
const saveFilters = jest.mocked(setComputationResultGlobalFilters);
const country = (code: string): GlobalFilter => ({
    id: code,
    label: code,
    filterType: GlobalFilterType.COUNTRY,
});
const FR = country('FR');
const BE = country('BE');

function dto(id = 'ID'): LogicalControlsResultDto {
    const common = { voltageLevelName: 'VL', nominalVoltage: 225 };
    const invalid = {
        ...common,
        measurementType: MeasurementType.ACTIVE_TRANSIT,
        value: 10,
        statusType: StatusType.HVDC_POLES_COUNT,
    };
    return {
        balances: {
            [id]: { ...common, activeBalance: 1, reactiveBalance: 2, activeValidity: true, reactiveValidity: false },
        },
        nonZeroMeasurementsOnDisconnected: { [id]: [invalid, invalid] },
        zeroMeasurementsOnConnected: { [id]: [{ ...common, measurementType: MeasurementType.ACTIVE_LOAD }] },
        originExtremityDeviations: {
            [id]: [
                {
                    ...common,
                    measurementType: MeasurementType.ACTIVE_TRANSIT,
                    originMeasurement: 1,
                    extremityMeasurement: 2,
                    deviation: 1,
                },
            ],
        },
        outOfBoundsMeasurements: {
            [id]: [{ ...common, limitType: LimitType.PMAX, threshold: 1, value: 2, deviation: 1 }],
        },
        voltageDeviations: {
            [id]: {
                ...common,
                minBusbarSection: 'B1',
                minBusbarSectionValue: 220,
                maxBusbarSection: 'B2',
                maxBusbarSectionValue: 230,
                deviation: 10,
            },
        },
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

let root: Root;
let container: HTMLElement;

async function show(props: Partial<LogicalControlsTabProps> = {}) {
    await act(async () =>
        root.render(
            <Provider store={store}>
                <IntlProvider locale="fr" messages={messages_fr as any} onError={() => {}}>
                    <LogicalControlsResultTab
                        studyUuid={STUDY}
                        nodeUuid={NODE}
                        currentRootNetworkUuid={ROOT}
                        {...props}
                    />
                </IntlProvider>
            </Provider>
        )
    );
}

async function select(filters: GlobalFilter[], tableType = TableType.LogicalControls) {
    savedFilters.mockResolvedValue(filters);
    await act(async () => updateComputationGlobalFilters(store.dispatch, STUDY, tableType));
}

async function elapse(ms = 1000) {
    await act(async () => jest.advanceTimersByTime(ms));
}

async function click(element: HTMLElement | null) {
    await act(async () => element?.click());
}

const table = () => mockTable.props!;
const ids = () => table().result.balances?.map((row) => row.equipmentIdentifier) ?? [];
const tabs = () => [...container.querySelectorAll<HTMLElement>('[role=tab]')];
const input = () => container.querySelector('#result-global-filter') as HTMLInputElement;

beforeEach(() => {
    jest.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    fetchResult.mockReset().mockResolvedValue(dto());
    savedFilters.mockReset().mockResolvedValue([]);
    saveFilters.mockReset().mockResolvedValue(undefined);
    jest.mocked(getComputationResultColumnFilters).mockReset().mockResolvedValue([]);
    mockSnackError.mockReset();
    mockTable.props = undefined;
    mockSelector.props = undefined;
    store.dispatch(openStudy(STUDY));
    store.dispatch(setComputingStatus(ComputingType.LOGICAL_CONTROLS, RunningStatus.SUCCEED));
    store.dispatch(addToGlobalFilterOptions([FR, BE]));
    container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
});

afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe('shared global filter selector', () => {
    it('uses logical-controls persistence and all logical equipment types', async () => {
        await show();

        expect(ComputingType.LOGICAL_CONTROLS).toBe('LOGICAL_CONTROLS');
        expect(TableType.LogicalControls).toBe('LogicalControls');
        expect(mockSelector.props).toEqual({
            tableType: TableType.LogicalControls,
            genericFiltersStrictMode: true,
            filterCategories: [
                GlobalFilterType.VOLTAGE_LEVEL,
                GlobalFilterType.COUNTRY,
                GlobalFilterType.SUBSTATION_PROPERTY,
                GlobalFilterType.SUBSTATION_OR_VL,
            ],
            filterableEquipmentTypes: [
                EquipmentType.LINE,
                EquipmentType.TWO_WINDINGS_TRANSFORMER,
                EquipmentType.GENERATOR,
                EquipmentType.LOAD,
                EquipmentType.HVDC_LINE,
                EquipmentType.VOLTAGE_LEVEL,
            ],
        });
        await act(async () => input().focus());
        const categories = [...document.body.querySelectorAll('[data-testid^="GlobalFilterCategory"]')].map((c) =>
            c.getAttribute('data-testid')?.replace('GlobalFilterCategory', '')
        );
        expect(categories).toEqual(['recent', 'voltageLevel', 'country', 'region', 'substationOrVoltageLevelFilter']);
    });

    it('keeps one visible selection across all six tabs without refetching', async () => {
        savedFilters.mockResolvedValue([FR]);
        await show();
        await elapse();
        const key = table().exportCsvResetKey;
        const expectedTabs = [
            LOGICAL_CONTROLS_BALANCES,
            LOGICAL_CONTROLS_NON_ZERO_MEASUREMENTS_ON_DISCONNECTED,
            LOGICAL_CONTROLS_ZERO_MEASUREMENTS_ON_CONNECTED,
            LOGICAL_CONTROLS_ORIGIN_EXTREMITY_DEVIATIONS,
            LOGICAL_CONTROLS_OUT_OF_BOUNDS_MEASUREMENTS,
            LOGICAL_CONTROLS_VOLTAGE_DEVIATIONS,
        ];
        expect(tabs()).toHaveLength(6);
        for (const [index, name] of expectedTabs.entries()) {
            await click(tabs()[index]);
            await elapse();
            expect(input()).not.toBeNull();
            expect(container.textContent).toContain('FR');
            expect(table().tableName).toBe(name);
            expect(table().exportCsvResetKey).toBe(key);
        }
        expect(fetchResult).toHaveBeenCalledTimes(1);
    });

    it('requests and saves criteria selected through the UI independently of state estimation', async () => {
        await show();
        await elapse();
        await select([BE], TableType.StateEstimation);
        await act(async () => input().focus());
        await click(document.body.querySelector('[data-testid="GlobalFilterCategorycountry"]'));
        await click(
            [...document.body.querySelectorAll<HTMLElement>('[role=option]')].find(
                (option) => option.textContent === 'FR'
            ) ?? null
        );
        await elapse(5000);

        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, { countryCode: ['FR'] });
        expect(saveFilters).toHaveBeenCalledWith(
            STUDY,
            TableType.LogicalControls,
            expect.arrayContaining([expect.objectContaining({ label: 'FR', filterType: GlobalFilterType.COUNTRY })])
        );
        const state = store.getState();
        expect(state.tableFilters.globalFilters[TableType.StateEstimation]?.selected).toContain(BE.id);
        expect(state.tableFilters.globalFilters[TableType.LogicalControls]?.selected).toContain(FR.id);
        expect(state.tableFilters.globalFilters[TableType.LogicalControls]?.selected).not.toContain(BE.id);
    });
});

describe('criteria and invalidations', () => {
    it('sends no criteria without a valid selection and returns the full result after clearing', async () => {
        await show();
        await elapse();
        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, undefined);
        await select([FR]);
        await elapse();
        await select([]);
        expect(ids()).toEqual([]);
        await elapse();
        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, undefined);
        expect(ids()).toEqual(['ID']);
    });

    it('normalizes all four categories and ignores invalid voltage criteria', async () => {
        savedFilters.mockResolvedValue([
            FR,
            {
                id: 'voltage',
                label: '225-400',
                filterType: GlobalFilterType.VOLTAGE_LEVEL,
                minValue: 225,
                maxValue: 400,
            },
            { id: 'invalid-voltage', label: 'invalid', filterType: GlobalFilterType.VOLTAGE_LEVEL },
            { id: 'region', label: 'SW', filterType: GlobalFilterType.SUBSTATION_PROPERTY, filterSubtype: 'region' },
            { id: 'site', label: 'site', filterType: GlobalFilterType.SUBSTATION_OR_VL, uuid: OTHER },
        ]);
        await show();
        await elapse();

        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, {
            countryCode: ['FR'],
            voltageRanges: [[225, 400]],
            substationProperty: { region: ['SW'] },
            substationOrVoltageLevelFilter: [OTHER],
        });
    });

    it('debounces rapid criteria changes into one query', async () => {
        await show();
        await select([FR]);
        await elapse(999);
        await select([BE]);
        await elapse();

        expect(fetchResult).toHaveBeenCalledTimes(1);
        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, { countryCode: ['BE'] });
    });

    it('does not refetch when identical criteria are rehydrated', async () => {
        savedFilters.mockResolvedValue([FR]);
        await show();
        await elapse();
        const key = table().exportCsvResetKey;
        await select([{ ...FR }]);
        await elapse();

        expect(fetchResult).toHaveBeenCalledTimes(1);
        expect(table().exportCsvResetKey).toBe(key);
    });

    it('refreshes only for matching logical-controls notifications', async () => {
        savedFilters.mockResolvedValue([FR]);
        await show();
        await elapse();
        for (const headers of [
            { updateType: 'stateEstimationResult', node: NODE },
            { updateType: 'logicalControlsResult', node: OTHER },
            { updateType: 'logicalControlsResult', node: NODE, rootNetworkUuid: OTHER },
        ]) {
            await act(async () => mockNotification.listener?.({ data: JSON.stringify({ headers }) }));
            await elapse();
        }
        expect(fetchResult).toHaveBeenCalledTimes(1);
        await act(async () =>
            mockNotification.listener?.({
                data: JSON.stringify({
                    headers: { updateType: 'logicalControlsResult', node: NODE, rootNetworkUuid: ROOT },
                }),
            })
        );
        await elapse();
        expect(fetchResult).toHaveBeenCalledTimes(2);
        expect(fetchResult).toHaveBeenLastCalledWith(STUDY, NODE, ROOT, { countryCode: ['FR'] });
    });

    it('preserves column filters and sorting without issuing a global query', async () => {
        await show();
        await elapse();
        await act(async () => {
            store.dispatch(
                updateColumnFiltersAction(TableType.LogicalControls, LOGICAL_CONTROLS_BALANCES, [
                    { column: 'equipmentIdentifier', value: 'ID', type: 'contains', dataType: 'text' } as any,
                ])
            );
            store.dispatch(
                setTableSort(LOGICAL_CONTROLS_RESULT_SORT_STORE, LOGICAL_CONTROLS_BALANCES, [
                    { colId: 'equipmentIdentifier', sort: 'desc' } as any,
                ])
            );
        });
        await elapse();
        expect(fetchResult).toHaveBeenCalledTimes(1);
        await select([FR]);
        await elapse();
        const state = store.getState();
        expect(state.tableFilters.columnsFilters[TableType.LogicalControls]?.[LOGICAL_CONTROLS_BALANCES]).toHaveLength(
            1
        );
        expect(state.tableSort[LOGICAL_CONTROLS_RESULT_SORT_STORE][LOGICAL_CONTROLS_BALANCES]).toHaveLength(1);
    });
});

describe('result display and request identity', () => {
    it('flattens all six maps preserving measurement order and duplicates', async () => {
        const result = dto();
        fetchResult.mockResolvedValue(result);
        await show();
        await elapse();
        for (const [name, map] of Object.entries(result)) {
            const expected = Object.entries(map).flatMap(([equipmentIdentifier, value]) =>
                (Array.isArray(value) ? value : [value]).map((row) => ({ ...row, equipmentIdentifier }))
            );
            expect(table().result[name as keyof LogicalControlsResultDto]).toEqual(expected);
        }
        expect(table().result.nonZeroMeasurementsOnDisconnected).toHaveLength(2);
        expect(table().isLoadingResult).toBe(false);
    });

    it.each([
        null,
        {
            balances: {},
            nonZeroMeasurementsOnDisconnected: {},
            zeroMeasurementsOnConnected: {},
            originExtremityDeviations: {},
            outOfBoundsMeasurements: {},
            voltageDeviations: {},
        },
    ])('settles an empty or missing result: %p', async (result) => {
        fetchResult.mockResolvedValue(result);
        await show();
        expect(table().isLoadingResult).toBe(true);
        await elapse();
        expect(ids()).toEqual([]);
        expect(table().isLoadingResult).toBe(false);
    });

    it('settles failures and recovers for the next criteria', async () => {
        fetchResult.mockRejectedValueOnce(new Error('bad filter')).mockResolvedValueOnce(dto('BE'));
        await show();
        await elapse();
        expect(ids()).toEqual([]);
        expect(table().isLoadingResult).toBe(false);
        expect(mockSnackError).toHaveBeenCalledTimes(1);
        await select([BE]);
        expect(table().isLoadingResult).toBe(true);
        await elapse();
        expect(ids()).toEqual(['BE']);
        expect(table().isLoadingResult).toBe(false);
    });

    it('hides results during computation and allows both success and failure results', async () => {
        await show();
        await elapse();
        for (const status of [
            RunningStatus.RUNNING,
            RunningStatus.PRELOADING,
            RunningStatus.SUCCEED,
            RunningStatus.FAILED,
        ]) {
            await act(async () => store.dispatch(setComputingStatus(ComputingType.LOGICAL_CONTROLS, status)));
            expect(ids()).toEqual(status === RunningStatus.SUCCEED || status === RunningStatus.FAILED ? ['ID'] : []);
        }
    });

    it('hides previous criteria immediately during debounce and resets CSV', async () => {
        const second = deferred<LogicalControlsResultDto>();
        fetchResult.mockResolvedValueOnce(dto('OLD')).mockReturnValueOnce(second.promise);
        await show();
        await elapse();
        const key = table().exportCsvResetKey;
        await select([BE]);
        expect(ids()).toEqual([]);
        expect(table().isLoadingResult).toBe(true);
        expect(table().exportCsvResetKey).not.toBe(key);
        await elapse();
        expect(ids()).toEqual([]);
        await act(async () => second.resolve(dto('BE')));
        expect(ids()).toEqual(['BE']);
        expect(table().isLoadingResult).toBe(false);
    });

    it.each([{ studyUuid: OTHER }, { nodeUuid: OTHER }, { currentRootNetworkUuid: OTHER }])(
        'hides old results and queries again when context changes: %p',
        async (props) => {
            fetchResult
                .mockResolvedValueOnce(dto('OLD'))
                .mockReturnValueOnce(deferred<LogicalControlsResultDto>().promise);
            await show();
            await elapse();
            const key = table().exportCsvResetKey;
            await show(props);
            expect(ids()).toEqual([]);
            expect(table().isLoadingResult).toBe(true);
            expect(table().exportCsvResetKey).not.toBe(key);
            await elapse();
            expect(fetchResult).toHaveBeenLastCalledWith(
                props.studyUuid ?? STUDY,
                props.nodeUuid ?? NODE,
                props.currentRootNetworkUuid ?? ROOT,
                undefined
            );
        }
    );

    it('ignores an old response even when it arrives after the newer response', async () => {
        const first = deferred<LogicalControlsResultDto>();
        const second = deferred<LogicalControlsResultDto>();
        fetchResult.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        await show();
        await elapse();
        await select([BE]);
        await elapse();
        await act(async () => second.resolve(dto('BE')));
        await act(async () => first.resolve(dto('OLD')));
        expect(ids()).toEqual(['BE']);
        expect(table().isLoadingResult).toBe(false);
    });

    it('does not show a replaced response received before the new debounce finishes', async () => {
        const first = deferred<LogicalControlsResultDto>();
        fetchResult
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(deferred<LogicalControlsResultDto>().promise);
        await show();
        await elapse();
        await select([BE]);
        await act(async () => first.resolve(dto('OLD')));
        expect(ids()).toEqual([]);
        expect(table().isLoadingResult).toBe(true);
    });

    it('ignores late errors after a replacement request is launched', async () => {
        const first = deferred<LogicalControlsResultDto>();
        fetchResult.mockReturnValueOnce(first.promise).mockResolvedValueOnce(dto('BE'));
        await show();
        await elapse();
        await select([BE]);
        await elapse();
        await act(async () => first.reject(new Error('late')));
        expect(ids()).toEqual(['BE']);
        expect(mockSnackError).not.toHaveBeenCalled();
    });

    it('does not reuse old rows when returning to previous criteria', async () => {
        savedFilters.mockResolvedValue([FR]);
        fetchResult.mockResolvedValueOnce(dto('FR-old')).mockResolvedValueOnce(dto('FR-new'));
        await show();
        await elapse();
        await select([BE]);
        await select([FR]);
        expect(ids()).toEqual([]);
        expect(table().isLoadingResult).toBe(true);
        await elapse();
        expect(ids()).toEqual(['FR-new']);
    });
});
