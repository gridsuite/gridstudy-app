/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type {
    AuthenticationRouterErrorState,
    BaseVoltage,
    CommonStoreState,
    ComputingType,
    GsLang,
    GsLangUser,
    GsTheme,
    Identifiable,
    NetworkVisualizationParameters,
    PARAM_DEVELOPER_MODE,
    PARAM_LANGUAGE,
    PARAM_THEME,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { ValueOf } from 'type-fest';
import type { ViewBoxLike } from '@svgdotjs/svg.js';
import type {
    FilterConfig,
    LogsPaginationConfig,
    PaginationConfig,
    PccminTab,
    SecurityAnalysisTab,
    SensitivityAnalysisTab,
    ShortcircuitAnalysisTab,
    TableSort,
} from '../types/custom-aggrid-types';
import type { RunningStatus } from '../components/utils/running-status';
import type { IOptionalService } from '../components/utils/optional-services';
import type { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import type { CopyType } from '../components/network-modification.type';
import type {
    CurrentTreeNode,
    NetworkModificationNodeInfos,
    NetworkModificationNodeType,
} from '../components/graph/tree-node.type';
import type GSMapEquipments from '../components/network/gs-map-equipments';
import type {
    SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    SpreadsheetOptionalLoadingParameters,
    SpreadsheetTabDefinition,
} from '../components/spreadsheet-view/types/spreadsheet.type';
import type {
    NetworkModificationCopyInfos,
    RootNetworkMetadata,
} from '../components/graph/menus/network-modifications/network-modification-menu.type';
import type { CalculationType } from '../components/spreadsheet-view/types/calculation.type';
import type { RootNetworkIndexationStatus } from '../types/notification-types';
import type { NodeAlias } from '../components/spreadsheet-view/types/node-alias.type';
import type NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import {
    LOGS_PAGINATION_STORE_FIELD,
    LOGS_STORE_FIELD,
    PCCMIN_ANALYSIS_PAGINATION_STORE_FIELD,
    SECURITY_ANALYSIS_PAGINATION_STORE_FIELD,
    SENSITIVITY_ANALYSIS_PAGINATION_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_PAGINATION_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
} from '../utils/store-sort-filter-fields';
import { PARAM_COMPUTED_LANGUAGE, PARAM_LIMIT_REDUCTION, PARAM_USE_NAME, PARAMS_LOADED } from '../utils/config-params';
import { VOLTAGE_LEVEL_ID } from '../components/utils/field-constants';

// ——— Equipment types ———

export enum EquipmentUpdateType {
    LINES = 'lines',
    TIE_LINES = 'tieLines',
    TWO_WINDINGS_TRANSFORMERS = 'twoWindingsTransformers',
    THREE_WINDINGS_TRANSFORMERS = 'threeWindingsTransformers',
    GENERATORS = 'generators',
    LOADS = 'loads',
    BATTERIES = 'batteries',
    DANGLING_LINES = 'danglingLines',
    HVDC_LINES = 'hvdcLines',
    LCC_CONVERTER_STATIONS = 'lccConverterStations',
    VSC_CONVERTER_STATIONS = 'vscConverterStations',
    SHUNT_COMPENSATORS = 'shuntCompensators',
    STATIC_VAR_COMPENSATORS = 'staticVarCompensators',
    VOLTAGE_LEVELS = 'voltageLevels',
    SUBSTATIONS = 'substations',
    BUSES = 'buses',
    BUSBAR_SECTIONS = 'busbarSections',
    BRANCHES = 'branches', // LINE + TWO_WINDINGS_TRANSFORMER
}

export type Substation = Identifiable & {
    voltageLevels: Identifiable[];
};

export type Bus = Identifiable & { [VOLTAGE_LEVEL_ID]: string };

// ——— Computing status ———

export interface ComputingStatus {
    [ComputingType.LOAD_FLOW]: RunningStatus;
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus;
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus;
    [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.DYNAMIC_MARGIN_CALCULATION]: RunningStatus;
    [ComputingType.VOLTAGE_INITIALIZATION]: RunningStatus;
    [ComputingType.STATE_ESTIMATION]: RunningStatus;
    [ComputingType.PCC_MIN]: RunningStatus;
}

export interface LoadFlowStatusParameters {
    withRatioTapChangers: boolean;
}

export interface ComputingStatusParameters {
    [ComputingType.LOAD_FLOW]: LoadFlowStatusParameters | null;
}

// ——— Diagram types ———

export type NadViewBox = Record<UUID, ViewBoxLike | null>;

export type NadNodeMovement = {
    diagramId: UUID;
    equipmentId: string;
    x: number;
    y: number;
    scalingFactor: number;
};

export type NadTextMovement = {
    diagramId: UUID;
    equipmentId: string;
    shiftX: number;
    shiftY: number;
    connectionShiftX: number;
    connectionShiftY: number;
};

export interface OneBusShortCircuitAnalysisDiagram {
    diagramId: string;
    studyUuid: UUID;
    rootNetworkUuid: UUID;
    nodeId: UUID;
}

// ——— Copy / clipboard ———

/**
 * Represent a node in the network modifications tree that is selected.
 */
export type NodeSelectionForCopy = {
    sourceStudyUuid: UUID | null;
    nodeId: UUID | null;
    nodeType?: NetworkModificationNodeType | null;
    copyType: ValueOf<typeof CopyType> | null;
    allChildren?: NetworkModificationNodeInfos[] | null;
};

export type CopiedNetworkModifications = {
    networkModificationUuids: UUID[];
    copyInfos: NetworkModificationCopyInfos | null;
};

// ——— Filter / sort state ———

export type SpreadsheetFilterState = Record<UUID, FilterConfig[]>;

export type ComputationResultColumnFilter = {
    columns: FilterConfig[];
};

export type TableFiltersState = {
    columnsFilters: Record<string, Record<string, ComputationResultColumnFilter>>;
    globalFilters: Record<string, string[]>; // filter IDs
};

export type LogsFilterState = Record<string, FilterConfig[]>;

export type LogsPaginationState = Record<string, LogsPaginationConfig>;

// ——— Others ———

export type SpreadsheetNetworkState = {
    nodesIds: UUID[];
    equipments: Record<SpreadsheetEquipmentType, SpreadsheetEquipmentsByNodes>;
};

export interface AppConfigState {
    [PARAM_THEME]: GsTheme;
    [PARAM_LANGUAGE]: GsLang;
    [PARAM_COMPUTED_LANGUAGE]: GsLangUser;
    [PARAM_LIMIT_REDUCTION]: number;
    [PARAM_USE_NAME]: boolean;
    [PARAM_DEVELOPER_MODE]: boolean;
    [PARAMS_LOADED]: boolean;
}

interface TablesState {
    uuid: UUID | null;
    definitions: SpreadsheetTabDefinition[];
    activeTabUuid: UUID | null;
    addedTable: UUID | null; // to track the last added table for setting the focus on it
}

// ——— Main application state ———

export interface AppState extends CommonStoreState, AppConfigState {
    signInCallbackError: Error | null;
    authenticationRouterError: AuthenticationRouterErrorState | null;
    showAuthenticationRouterLogin: boolean;
    appTabIndex: number;
    attemptedLeaveParametersTabIndex: number | null;
    isDirtyComputationParameters: boolean;
    studyUuid: UUID | null;
    currentTreeNode: CurrentTreeNode | null;
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
    computingStatus: ComputingStatus;
    computingStatusParameters: ComputingStatusParameters;
    lastCompletedComputation: ComputingType | null;
    computationStarting: boolean;
    optionalServices: IOptionalService[];
    oneBusShortCircuitAnalysisDiagram: OneBusShortCircuitAnalysisDiagram | null;
    notificationIdList: UUID[];
    globalFilterOptions: GlobalFilter[];
    mapEquipments: GSMapEquipments | undefined;
    networkAreaDiagramDepth: number;
    rootNetworkIndexationStatus: RootNetworkIndexationStatus;
    tableSort: TableSort;
    tables: TablesState;
    nodeAliases: NodeAlias[];

    nodeSelectionForCopy: NodeSelectionForCopy;
    nadViewBox: NadViewBox;
    copiedNetworkModifications: CopiedNetworkModifications;
    geoData: null;
    networkModificationTreeModel: NetworkModificationTreeModel | null;
    isNetworkModificationTreeModelUpToDate: boolean;
    mapDataLoading: boolean;
    nadNodeMovements: NadNodeMovement[];
    nadTextNodeMovements: NadTextMovement[];
    isExplorerDrawerOpen: boolean;
    centerOnSubstation: undefined | { to: string };
    isModificationsInProgress: boolean;
    isMonoRootStudy: boolean;
    reloadMapNeeded: boolean;
    isEditMode: boolean;
    freezeMapUpdates: boolean;
    isMapEquipmentsInitialized: boolean;
    spreadsheetNetwork: SpreadsheetNetworkState;

    spreadsheetOptionalLoadingParameters: SpreadsheetOptionalLoadingParameters;
    networkVisualizationsParameters: NetworkVisualizationParameters | null;
    syncEnabled: boolean;
    baseVoltages: BaseVoltage[] | null;
    [SECURITY_ANALYSIS_PAGINATION_STORE_FIELD]: Record<SecurityAnalysisTab, PaginationConfig>;
    [SENSITIVITY_ANALYSIS_PAGINATION_STORE_FIELD]: Record<SensitivityAnalysisTab, PaginationConfig>;
    [SHORTCIRCUIT_ANALYSIS_PAGINATION_STORE_FIELD]: Record<ShortcircuitAnalysisTab, PaginationConfig>;
    [PCCMIN_ANALYSIS_PAGINATION_STORE_FIELD]: Record<PccminTab, PaginationConfig>;

    [SPREADSHEET_STORE_FIELD]: SpreadsheetFilterState;

    [LOGS_STORE_FIELD]: LogsFilterState;
    [LOGS_PAGINATION_STORE_FIELD]: LogsPaginationState;

    calculationSelections: Record<UUID, CalculationType[]>;
    highlightedModificationUuid: UUID | null;
    tableFilters: TableFiltersState;
}
