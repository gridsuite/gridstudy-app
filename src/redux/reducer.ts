/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer, type Draft } from '@reduxjs/toolkit';
import {
    type AuthenticationActions,
    type AuthenticationRouterErrorAction,
    type AuthenticationRouterErrorState,
    type CommonStoreState,
    ComputingType,
    type GsLang,
    type GsLangUser,
    type GsTheme,
    type Identifiable,
    LOGOUT_ERROR,
    type LogoutErrorAction,
    type NetworkVisualizationParameters,
    RESET_AUTHENTICATION_ROUTER_ERROR,
    SHOW_AUTH_INFO_LOGIN,
    type ShowAuthenticationRouterLoginAction,
    UNAUTHORIZED_USER_INFO,
    type UnauthorizedUserAction,
    USER,
    USER_VALIDATION_ERROR,
    type UserAction,
    type UserValidationErrorAction,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    ADD_FILTER_FOR_NEW_SPREADSHEET,
    ADD_NOTIFICATION,
    ADD_SORT_FOR_NEW_SPREADSHEET,
    ADD_TO_RECENT_GLOBAL_FILTERS,
    type AddFilterForNewSpreadsheetAction,
    type AddNotificationAction,
    type AddSortForNewSpreadsheetAction,
    type AddToRecentGlobalFiltersAction,
    type AppActions,
    ATTEMPT_LEAVE_PARAMETERS_TAB,
    type AttemptLeaveParametersTabAction,
    CANCEL_LEAVE_PARAMETERS_TAB,
    CENTER_ON_SUBSTATION,
    type CenterOnSubstationAction,
    CLOSE_STUDY,
    type CloseStudyAction,
    CONFIRM_LEAVE_PARAMETERS_TAB,
    CURRENT_ROOT_NETWORK_UUID,
    CURRENT_TREE_NODE,
    type CurrentRootNetworkUuidAction,
    type CurrentTreeNodeAction,
    DELETE_EQUIPMENTS,
    DELETED_OR_RENAMED_NODES,
    type DeletedOrRenamedNodesAction,
    type DeleteEquipmentsAction,
    DYNAMIC_SIMULATION_RESULT_FILTER,
    type DynamicSimulationResultFilterAction,
    ENABLE_DEVELOPER_MODE,
    type EnableDeveloperModeAction,
    FAVORITE_CONTINGENCY_LISTS,
    type FavoriteContingencyListsAction,
    INIT_TABLE_DEFINITIONS,
    type InitTableDefinitionsAction,
    LOAD_EQUIPMENTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    type LoadEquipmentsAction,
    LOADFLOW_RESULT_FILTER,
    type LoadflowResultFilterAction,
    type LoadNetworkModificationTreeSuccessAction,
    LOGS_FILTER,
    type LogsFilterAction,
    MAP_DATA_LOADING,
    MAP_EQUIPMENTS_CREATED,
    MAP_EQUIPMENTS_INITIALIZED,
    type MapDataLoadingAction,
    type MapEquipmentsCreatedAction,
    type MapEquipmentsInitializedAction,
    NETWORK_MODIFICATION_HANDLE_SUBTREE,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_REORDER,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
    type NetworkModificationHandleSubtreeAction,
    type NetworkModificationTreeNodeAddedAction,
    type NetworkModificationTreeNodeMovedAction,
    type NetworkModificationTreeNodesRemovedAction,
    type NetworkModificationTreeNodesReorderAction,
    type NetworkModificationTreeNodesUpdatedAction,
    NODE_SELECTION_FOR_COPY,
    type NodeSelectionForCopyAction,
    OPEN_DIAGRAM,
    OPEN_NAD_LIST,
    OPEN_STUDY,
    type OpenDiagramAction,
    type OpenNadListAction,
    type OpenStudyAction,
    type ParameterizedComputingType,
    REMOVE_COLUMN_DEFINITION,
    REMOVE_EQUIPMENT_DATA,
    REMOVE_FROM_RECENT_GLOBAL_FILTERS,
    REMOVE_NODE_DATA,
    REMOVE_NOTIFICATION_BY_NODE,
    REMOVE_TABLE_DEFINITION,
    type RemoveColumnDefinitionAction,
    type RemoveEquipmentDataAction,
    type RemoveFromRecentGlobalFiltersAction,
    type RemoveNodeDataAction,
    type RemoveNotificationByNodeAction,
    type RemoveTableDefinitionAction,
    RENAME_TABLE_DEFINITION,
    type RenameTableDefinitionAction,
    REORDER_TABLE_DEFINITIONS,
    type ReorderTableDefinitionsAction,
    RESET_ALL_SPREADSHEET_GS_FILTERS,
    RESET_DIAGRAM_EVENT,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_BY_TYPES,
    RESET_EQUIPMENTS_POST_COMPUTATION,
    RESET_LOGS_FILTER,
    RESET_MAP_EQUIPMENTS,
    type ResetAllSpreadsheetGlobalFiltersAction,
    type ResetDiagramEventAction,
    type ResetEquipmentsAction,
    type ResetEquipmentsByTypesAction,
    type ResetEquipmentsPostComputationAction,
    type ResetLogsFilterAction,
    type ResetMapEquipmentsAction,
    SAVE_SPREADSHEET_GS_FILTER,
    type SaveSpreadSheetGlobalFilterAction,
    SECURITY_ANALYSIS_RESULT_FILTER,
    type SecurityAnalysisResultFilterAction,
    SELECT_COMPUTED_LANGUAGE,
    SELECT_LANGUAGE,
    SELECT_THEME,
    type SelectComputedLanguageAction,
    type SelectLanguageAction,
    type SelectThemeAction,
    SELECT_SYNC_ENABLED,
    type SelectSyncEnabledAction,
    SENSITIVITY_ANALYSIS_RESULT_FILTER,
    type SensitivityAnalysisResultFilterAction,
    SET_APP_TAB_INDEX,
    SET_CALCULATION_SELECTIONS,
    SET_COMPUTATION_STARTING,
    SET_COMPUTING_STATUS,
    SET_COMPUTING_STATUS_INFOS,
    SET_DIAGRAM_GRID_LAYOUT,
    SET_LAST_COMPLETED_COMPUTATION,
    SET_MODIFICATIONS_DRAWER_OPEN,
    SET_MODIFICATIONS_IN_PROGRESS,
    SET_MONO_ROOT_STUDY,
    SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
    SET_OPEN_MAP,
    SET_OPTIONAL_SERVICES,
    SET_PARAMS_LOADED,
    SET_RELOAD_MAP_NEEDED,
    SET_ROOT_NETWORK_INDEXATION_STATUS,
    SET_ROOT_NETWORKS,
    SET_STUDY_DISPLAY_MODE,
    SET_TOGGLE_OPTIONS,
    type SetAppTabIndexAction,
    type SetCalculationSelectionsAction,
    type SetComputationStartingAction,
    type SetComputingStatusAction,
    type SetComputingStatusParametersAction,
    type SetDiagramGridLayoutAction,
    type SetLastCompletedComputationAction,
    type SetModificationsDrawerOpenAction,
    type SetModificationsInProgressAction,
    type SetMonoRootStudyAction,
    type SetOneBusShortcircuitAnalysisDiagramAction,
    type SetOpenMapAction,
    type SetOptionalServicesAction,
    type SetParamsLoadedAction,
    type SetReloadMapNeededAction,
    type SetRootNetworkIndexationStatusAction,
    type SetRootNetworksAction,
    type SetStudyDisplayModeAction,
    type SetToggleOptionsAction,
    SHORTCIRCUIT_ANALYSIS_RESULT_FILTER,
    type ShortcircuitAnalysisResultFilterAction,
    SPREADSHEET_FILTER,
    type SpreadsheetFilterAction,
    STATEESTIMATION_RESULT_FILTER,
    type StateEstimationResultFilterAction,
    STUDY_UPDATED,
    type StudyUpdatedAction,
    TABLE_SORT,
    type TableSortAction,
    UPDATE_COLUMNS_DEFINITION,
    UPDATE_EQUIPMENTS,
    UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
    UPDATE_TABLE_COLUMNS,
    UPDATE_TABLE_DEFINITION,
    type UpdateColumnsDefinitionsAction,
    type UpdateEquipmentsAction,
    type UpdateNetworkVisualizationParametersAction,
    type UpdateTableColumnsAction,
    type UpdateTableDefinitionAction,
    USE_NAME,
    type UseNameAction,
} from './actions';
import {
    getLocalStorageComputedLanguage,
    getLocalStorageLanguage,
    getLocalStorageSyncEnabled,
    getLocalStorageTheme,
    getLocalStorageToggleOptions,
    saveLocalStorageLanguage,
    saveLocalStorageTheme,
    saveLocalStorageToggleOptions,
} from './session-storage/local-storage';
import {
    PARAM_COMPUTED_LANGUAGE,
    PARAM_DEVELOPER_MODE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_LIMIT_REDUCTION,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAMS_LOADED,
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { getAllChildren, getNetworkModificationNode } from 'components/graph/util/model-functions';
import { RunningStatus } from 'components/utils/running-status';
import {
    type IOptionalService,
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../components/utils/optional-services';
import {
    ALL_BUSES,
    DYNAMIC_SIMULATION_RESULT_SORT_STORE,
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_RESULT_SORT_STORE,
    LOADFLOW_RESULT_STORE_FIELD,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
    LOGS_STORE_FIELD,
    ONE_BUS,
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SECURITY_ANALYSIS_RESULT_SORT_STORE,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_SORT_STORE,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
    SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_SORT_STORE,
    SPREADSHEET_STORE_FIELD,
    STATEESTIMATION_QUALITY_CRITERION,
    STATEESTIMATION_QUALITY_PER_REGION,
    STATEESTIMATION_RESULT_SORT_STORE,
    STATEESTIMATION_RESULT_STORE_FIELD,
    TABLE_SORT_STORE,
    TIMELINE,
} from '../utils/store-sort-filter-fields';
import type { UUID } from 'crypto';
import type { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import type { Entries, ValueOf } from 'type-fest';
import { CopyType, StudyDisplayMode } from '../components/network-modification.type';
import {
    CurrentTreeNode,
    NetworkModificationNodeData,
    NetworkModificationNodeInfos,
    NetworkModificationNodeType,
    RootNodeData,
} from '../components/graph/tree-node.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../utils/report/report.constant';
import type GSMapEquipments from 'components/network/gs-map-equipments';
import {
    type ColumnDefinition,
    type SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    type SpreadsheetTabDefinition,
} from '../components/spreadsheet-view/types/spreadsheet.type';
import { FilterConfig, SortConfig, SortWay } from '../types/custom-aggrid-types';
import { DiagramParams, DiagramType } from '../components/diagrams/diagram.type';
import { RootNetworkMetadata } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { CalculationType } from 'components/spreadsheet-view/types/calculation.type';
import { NodeInsertModes, RootNetworkIndexationStatus, type StudyUpdateNotification } from 'types/notification-types';
import { mapSpreadsheetEquipments } from '../utils/spreadsheet-equipments-mapper';
import { Layouts } from 'react-grid-layout';
import { type DiagramConfigPosition } from '../services/explore';

// Redux state
export type StudyUpdated = {
    force: number; //IntRange<0, 1>;
} & StudyUpdateNotification;

export interface OneBusShortCircuitAnalysisDiagram {
    diagramId: string;
    nodeId: UUID;
}

export interface ComputingStatus {
    [ComputingType.LOAD_FLOW]: RunningStatus;
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus;
    [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus;
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus;
    [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.VOLTAGE_INITIALIZATION]: RunningStatus;
    [ComputingType.STATE_ESTIMATION]: RunningStatus;
}

export interface LoadFlowStatusParameters {
    withRatioTapChangers: boolean;
}

export interface ComputingStatusParameters {
    [ComputingType.LOAD_FLOW]: LoadFlowStatusParameters | null;
}

export type TableSortConfig = Record<string, SortConfig[]>;
export type TableSort = {
    [SPREADSHEET_SORT_STORE]: TableSortConfig;
    [LOADFLOW_RESULT_SORT_STORE]: TableSortConfig;
    [SECURITY_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [SENSITIVITY_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [DYNAMIC_SIMULATION_RESULT_SORT_STORE]: TableSortConfig;
    [SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [STATEESTIMATION_RESULT_SORT_STORE]: TableSortConfig;
};
export type TableSortKeysType = keyof TableSort;

export type SpreadsheetFilterState = Record<UUID, FilterConfig[]>;

export enum DiagramEventType {
    CREATE = 'create',
    REMOVE = 'remove',
}

type DiagramEventBase = {
    diagramType: DiagramType;
    eventType: DiagramEventType;
};

type RemoveDiagramEvent = DiagramEventBase & {
    eventType: DiagramEventType.REMOVE;
    diagramUuid: UUID;
};

type CreateDiagramEvent = DiagramEventBase & {
    eventType: DiagramEventType.CREATE;
};

type CreateVoltageLevelSLDDiagramEvent = CreateDiagramEvent & {
    diagramType: DiagramType.VOLTAGE_LEVEL;
    voltageLevelId: string;
};

type CreateSubstationSLDDiagramEvent = CreateDiagramEvent & {
    diagramType: DiagramType.SUBSTATION;
    substationId: string;
};

type CreateNADDiagramEvent = CreateDiagramEvent & {
    diagramType: DiagramType.NETWORK_AREA_DIAGRAM;
    nadConfigUuid: UUID | undefined;
    filterUuid: UUID | undefined;
    name: string;
    voltageLevelIds: string[];
    voltageLevelToExpandIds: string[];
    voltageLevelToOmitIds: string[];
    positions: DiagramConfigPosition[];
};

export type DiagramEvent =
    | RemoveDiagramEvent
    | CreateVoltageLevelSLDDiagramEvent
    | CreateSubstationSLDDiagramEvent
    | CreateNADDiagramEvent;

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

/**
 * Represent a node in the network modifications tree that is selected.
 */
export type NodeSelectionForCopy = {
    sourceStudyUuid: UUID | null;
    nodeId: UUID | null;
    nodeType: NetworkModificationNodeType | undefined;
    copyType: ValueOf<typeof CopyType> | null;
    allChildren: NetworkModificationNodeInfos[] | null;
};

export type Actions = AppActions | AuthenticationActions;

export interface AppConfigState {
    [PARAM_THEME]: GsTheme;
    [PARAM_LANGUAGE]: GsLang;
    [PARAM_COMPUTED_LANGUAGE]: GsLangUser;
    [PARAM_LIMIT_REDUCTION]: number;
    [PARAM_USE_NAME]: boolean;
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: UUID[];
    [PARAM_DEVELOPER_MODE]: boolean;
    [PARAMS_LOADED]: boolean;
}

export interface DiagramGridLayoutConfig {
    gridLayouts: Layouts;
    params: DiagramParams[];
}

export interface AppState extends CommonStoreState, AppConfigState {
    signInCallbackError: Error | null;
    authenticationRouterError: AuthenticationRouterErrorState | null;
    showAuthenticationRouterLogin: boolean;

    appTabIndex: number;
    attemptedLeaveParametersTabIndex: number | null;

    studyUpdated: StudyUpdated;
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
    nonEvacuatedEnergyNotif: boolean;
    recentGlobalFilters: GlobalFilter[];
    mapEquipments: GSMapEquipments | undefined;
    networkAreaDiagramDepth: number;
    studyDisplayMode: StudyDisplayMode;
    rootNetworkIndexationStatus: RootNetworkIndexationStatus;
    tableSort: TableSort;
    tables: TablesState;

    nodeSelectionForCopy: NodeSelectionForCopy;
    geoData: null;
    networkModificationTreeModel: NetworkModificationTreeModel | null;
    isNetworkModificationTreeModelUpToDate: boolean;
    mapDataLoading: boolean;
    latestDiagramEvent: DiagramEvent | undefined;
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
    globalFilterSpreadsheetState: GlobalFilterSpreadsheetState;
    networkVisualizationsParameters: NetworkVisualizationParameters;

    syncEnabled: boolean;

    [LOADFLOW_RESULT_STORE_FIELD]: {
        [LOADFLOW_CURRENT_LIMIT_VIOLATION]: FilterConfig[];
        [LOADFLOW_VOLTAGE_LIMIT_VIOLATION]: FilterConfig[];
        [LOADFLOW_RESULT]: FilterConfig[];
    };
    [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: {
        [SECURITY_ANALYSIS_RESULT_N]: FilterConfig[];
        [SECURITY_ANALYSIS_RESULT_N_K]: FilterConfig[];
    };
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: {
        [SENSITIVITY_IN_DELTA_MW_N]: FilterConfig[];
        [SENSITIVITY_IN_DELTA_MW_N_K]: FilterConfig[];
        [SENSITIVITY_IN_DELTA_A_N]: FilterConfig[];
        [SENSITIVITY_IN_DELTA_A_N_K]: FilterConfig[];
        [SENSITIVITY_AT_NODE_N]: FilterConfig[];
        [SENSITIVITY_AT_NODE_N_K]: FilterConfig[];
    };
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: {
        [ONE_BUS]: FilterConfig[];
        [ALL_BUSES]: FilterConfig[];
    };
    [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: {
        [TIMELINE]: FilterConfig[];
    };
    [STATEESTIMATION_RESULT_STORE_FIELD]: {
        [STATEESTIMATION_QUALITY_CRITERION]: FilterConfig[];
        [STATEESTIMATION_QUALITY_PER_REGION]: FilterConfig[];
    };
    [SPREADSHEET_STORE_FIELD]: SpreadsheetFilterState;

    [LOGS_STORE_FIELD]: LogsFilterState;

    calculationSelections: Record<UUID, CalculationType[]>;
    deletedOrRenamedNodes: UUID[];
    diagramGridLayout: DiagramGridLayoutConfig;
    toggleOptions: StudyDisplayMode[];
    mapOpen: boolean;
}

export type LogsFilterState = Record<string, FilterConfig[]>;
const initialLogsFilterState: LogsFilterState = {
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.LOAD_FLOW]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SECURITY_ANALYSIS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SENSITIVITY_ANALYSIS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SHORT_CIRCUIT]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SHORT_CIRCUIT_ONE_BUS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.DYNAMIC_SIMULATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.DYNAMIC_SECURITY_ANALYSIS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.VOLTAGE_INITIALIZATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.STATE_ESTIMATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NON_EVACUATED_ENERGY_ANALYSIS]: [],
};

const emptySpreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
    nodesId: [],
    equipmentsByNodeId: {},
};

export type SpreadsheetNetworkState = Record<SpreadsheetEquipmentType, SpreadsheetEquipmentsByNodes>;
const initialSpreadsheetNetworkState: SpreadsheetNetworkState = {
    [SpreadsheetEquipmentType.BATTERY]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.BRANCH]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.BUS]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.BUSBAR_SECTION]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.DANGLING_LINE]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.GENERATOR]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.HVDC_LINE]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.LCC_CONVERTER_STATION]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.LINE]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.LOAD]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.SHUNT_COMPENSATOR]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.STATIC_VAR_COMPENSATOR]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.SUBSTATION]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.THREE_WINDINGS_TRANSFORMER]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.TIE_LINE]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.VOLTAGE_LEVEL]: emptySpreadsheetEquipmentsByNodes,
    [SpreadsheetEquipmentType.VSC_CONVERTER_STATION]: emptySpreadsheetEquipmentsByNodes,
};

export type GlobalFilterSpreadsheetState = Record<UUID, GlobalFilter[]>;

interface TablesState {
    uuid: UUID | null;
    definitions: SpreadsheetTabDefinition[];
}

const initialTablesState: TablesState = {
    uuid: null,
    definitions: [],
};

const initialState: AppState = {
    syncEnabled: false,
    appTabIndex: 0,
    attemptedLeaveParametersTabIndex: null,
    studyUuid: null,
    currentTreeNode: null,
    currentRootNetworkUuid: null,
    rootNetworks: [],
    nodeSelectionForCopy: {
        sourceStudyUuid: null,
        nodeId: null,
        nodeType: undefined,
        copyType: null,
        allChildren: null,
    },
    tables: initialTablesState,
    calculationSelections: {},
    mapEquipments: undefined,
    geoData: null,
    networkModificationTreeModel: new NetworkModificationTreeModel(),
    // used when switching root network, will be set to false as long as the tree has not been updated
    isNetworkModificationTreeModelUpToDate: false,
    computedLanguage: getLocalStorageComputedLanguage(),
    user: null,
    signInCallbackError: null,
    authenticationRouterError: null,
    showAuthenticationRouterLogin: false,
    // @ts-expect-error TODO can't have empty eventData here
    studyUpdated: { force: 0, eventData: {} },
    mapDataLoading: false,
    setMapOpen: false,
    isExplorerDrawerOpen: true,
    centerOnSubstation: undefined,
    notificationIdList: [],
    isModificationsInProgress: false,
    isMonoRootStudy: true,
    studyDisplayMode: StudyDisplayMode.TREE,
    latestDiagramEvent: undefined,
    nadNodeMovements: [],
    nadTextNodeMovements: [],
    reloadMapNeeded: true,
    isEditMode: false,
    freezeMapUpdates: false,
    isMapEquipmentsInitialized: false,
    networkAreaDiagramDepth: 0,
    spreadsheetNetwork: { ...initialSpreadsheetNetworkState },
    globalFilterSpreadsheetState: {},
    diagramGridLayout: {
        gridLayouts: {},
        params: [],
    },
    toggleOptions: [StudyDisplayMode.TREE],
    computingStatus: {
        [ComputingType.LOAD_FLOW]: RunningStatus.IDLE,
        [ComputingType.SECURITY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.SHORT_CIRCUIT]: RunningStatus.IDLE,
        [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus.IDLE,
        [ComputingType.DYNAMIC_SIMULATION]: RunningStatus.IDLE,
        [ComputingType.DYNAMIC_SECURITY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.VOLTAGE_INITIALIZATION]: RunningStatus.IDLE,
        [ComputingType.STATE_ESTIMATION]: RunningStatus.IDLE,
    },
    computingStatusParameters: {
        [ComputingType.LOAD_FLOW]: null,
    },
    computationStarting: false,
    optionalServices: (Object.keys(OptionalServicesNames) as OptionalServicesNames[]).map((key) => ({
        name: key,
        status: OptionalServicesStatus.Pending,
    })),
    oneBusShortCircuitAnalysisDiagram: null,
    rootNetworkIndexationStatus: RootNetworkIndexationStatus.NOT_INDEXED,
    deletedOrRenamedNodes: [],

    // params
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LIMIT_REDUCTION]: 100,
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: [],
    [PARAM_DEVELOPER_MODE]: false,
    [PARAMS_LOADED]: false,

    recentGlobalFilters: [],
    lastCompletedComputation: null,

    // Results filters
    [LOADFLOW_RESULT_STORE_FIELD]: {
        [LOADFLOW_CURRENT_LIMIT_VIOLATION]: [],
        [LOADFLOW_VOLTAGE_LIMIT_VIOLATION]: [],
        [LOADFLOW_RESULT]: [],
    },
    [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: {
        [SECURITY_ANALYSIS_RESULT_N]: [],
        [SECURITY_ANALYSIS_RESULT_N_K]: [],
    },
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: {
        [SENSITIVITY_IN_DELTA_MW_N]: [],
        [SENSITIVITY_IN_DELTA_MW_N_K]: [],
        [SENSITIVITY_IN_DELTA_A_N]: [],
        [SENSITIVITY_IN_DELTA_A_N_K]: [],
        [SENSITIVITY_AT_NODE_N]: [],
        [SENSITIVITY_AT_NODE_N_K]: [],
    },
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: {
        [ONE_BUS]: [],
        [ALL_BUSES]: [],
    },
    [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: {
        [TIMELINE]: [],
    },
    [STATEESTIMATION_RESULT_STORE_FIELD]: {
        [STATEESTIMATION_QUALITY_CRITERION]: [],
        [STATEESTIMATION_QUALITY_PER_REGION]: [],
    },

    // Spreadsheet filters
    [SPREADSHEET_STORE_FIELD]: {},

    [LOGS_STORE_FIELD]: { ...initialLogsFilterState },

    [TABLE_SORT_STORE]: {
        [SPREADSHEET_SORT_STORE]: {},
        [LOADFLOW_RESULT_SORT_STORE]: {
            [LOADFLOW_CURRENT_LIMIT_VIOLATION]: [
                {
                    colId: 'overload',
                    sort: SortWay.DESC,
                },
            ],
            [LOADFLOW_VOLTAGE_LIMIT_VIOLATION]: [
                {
                    colId: 'subjectId',
                    sort: SortWay.DESC,
                },
            ],
            [LOADFLOW_RESULT]: [
                {
                    colId: 'connectedComponentNum',
                    sort: SortWay.DESC,
                },
            ],
        },
        [SECURITY_ANALYSIS_RESULT_SORT_STORE]: {
            [SECURITY_ANALYSIS_RESULT_N]: [{ colId: 'subjectId', sort: SortWay.ASC }],
            [SECURITY_ANALYSIS_RESULT_N_K]: [
                {
                    colId: 'contingencyId',
                    sort: SortWay.ASC,
                },
            ],
        },
        [SENSITIVITY_ANALYSIS_RESULT_SORT_STORE]: {
            [SENSITIVITY_IN_DELTA_MW_N]: [{ colId: 'value', sort: SortWay.ASC }],
            [SENSITIVITY_IN_DELTA_MW_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
            [SENSITIVITY_IN_DELTA_A_N]: [{ colId: 'value', sort: SortWay.ASC }],
            [SENSITIVITY_IN_DELTA_A_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
            [SENSITIVITY_AT_NODE_N]: [{ colId: 'value', sort: SortWay.ASC }],
            [SENSITIVITY_AT_NODE_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
        },
        [DYNAMIC_SIMULATION_RESULT_SORT_STORE]: {
            [TIMELINE]: [
                {
                    colId: 'time',
                    sort: SortWay.ASC,
                },
            ],
        },
        [SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE]: {
            [ONE_BUS]: [{ colId: 'current', sort: SortWay.DESC }],
            [ALL_BUSES]: [{ colId: 'elementId', sort: SortWay.ASC }],
        },
        [STATEESTIMATION_RESULT_SORT_STORE]: {
            [STATEESTIMATION_QUALITY_CRITERION]: [
                {
                    colId: 'type',
                    sort: SortWay.ASC,
                },
            ],
            [STATEESTIMATION_QUALITY_PER_REGION]: [
                {
                    colId: 'name',
                    sort: SortWay.ASC,
                },
            ],
        },
    },
    // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
    // defaulted to true to init load geo data with HYBRID defaulted display Mode
    // TODO REMOVE LATER
};

export const reducer = createReducer(initialState, (builder) => {
    builder.addCase(SET_APP_TAB_INDEX, (state, action: SetAppTabIndexAction) => {
        state.appTabIndex = action.tabIndex;
    });

    builder.addCase(ATTEMPT_LEAVE_PARAMETERS_TAB, (state, action: AttemptLeaveParametersTabAction) => {
        state.attemptedLeaveParametersTabIndex = action.targetTabIndex;
    });

    builder.addCase(CONFIRM_LEAVE_PARAMETERS_TAB, (state) => {
        if (state.attemptedLeaveParametersTabIndex !== null) {
            state.appTabIndex = state.attemptedLeaveParametersTabIndex;
            state.attemptedLeaveParametersTabIndex = null;
        }
    });

    builder.addCase(CANCEL_LEAVE_PARAMETERS_TAB, (state) => {
        state.attemptedLeaveParametersTabIndex = null;
    });
    builder.addCase(OPEN_STUDY, (state, action: OpenStudyAction) => {
        state.studyUuid = action.studyRef[0];
        // Load toggleOptions for this study
        state.toggleOptions = getLocalStorageToggleOptions(state.studyUuid);
        state.syncEnabled = getLocalStorageSyncEnabled(state.studyUuid);
    });

    builder.addCase(CLOSE_STUDY, (state, _action: CloseStudyAction) => {
        state.studyUuid = null;
        state.geoData = null;
        state.networkModificationTreeModel = null;
    });

    builder.addCase(MAP_EQUIPMENTS_CREATED, (state, action: MapEquipmentsCreatedAction) => {
        //if it's not initialised yet we take the empty one given in action
        const newMapEquipments = (state.mapEquipments ?? action.mapEquipments).newMapEquipmentForUpdate();
        if (action.newLines) {
            newMapEquipments.lines = action.newLines;
            newMapEquipments.completeLinesInfos([]);
        }
        if (action.newTieLines) {
            newMapEquipments.tieLines = action.newTieLines;
            newMapEquipments.completeTieLinesInfos([]);
        }
        if (action.newSubstations) {
            newMapEquipments.substations = action.newSubstations;
            newMapEquipments.completeSubstationsInfos([]);
        }
        if (action.newHvdcLines) {
            newMapEquipments.hvdcLines = action.newHvdcLines;
            newMapEquipments.completeHvdcLinesInfos([]);
        }
        state.mapEquipments = newMapEquipments;
    });

    builder.addCase(RESET_MAP_EQUIPMENTS, (state, action: ResetMapEquipmentsAction) => {
        state.mapEquipments = undefined;
        state.isMapEquipmentsInitialized = false;
    });

    builder.addCase(UPDATE_TABLE_DEFINITION, (state, action: UpdateTableDefinitionAction) => {
        const { newTableDefinition } = action;
        const existingTableDefinition = state.tables.definitions.find(
            (tabDef) => tabDef.uuid === newTableDefinition.uuid
        );
        if (existingTableDefinition) {
            Object.assign(existingTableDefinition, newTableDefinition);
        } else {
            state.tables.definitions.push(newTableDefinition as Draft<SpreadsheetTabDefinition>);
        }
    });

    builder.addCase(UPDATE_TABLE_COLUMNS, (state, action: UpdateTableColumnsAction) => {
        const { spreadsheetConfigUuid, columns } = action;
        const existingTableDefinition = state.tables.definitions.find(
            (tabDef) => tabDef.uuid === spreadsheetConfigUuid
        );
        if (existingTableDefinition) {
            existingTableDefinition.columns = columns.map((column) => {
                const existingColDef = existingTableDefinition.columns.find((tabDef) => tabDef.uuid === column.uuid);
                const colDef: ColumnDefinition = {
                    ...column,
                    visible: column.visible ?? existingColDef?.visible ?? true,
                    locked: existingColDef ? existingColDef.locked : false,
                };
                return colDef;
            });
        }
    });

    builder.addCase(RENAME_TABLE_DEFINITION, (state, action: RenameTableDefinitionAction) => {
        const tableDefinition = state.tables.definitions.find((tabDef) => tabDef.uuid === action.tabUuid);
        if (tableDefinition) {
            tableDefinition.name = action.newName;
        }
    });

    builder.addCase(INIT_TABLE_DEFINITIONS, (state, action: InitTableDefinitionsAction) => {
        state.tables.uuid = action.collectionUuid;
        state.tables.definitions = action.tableDefinitions.map((tabDef) => ({
            ...tabDef,
            columns: tabDef.columns.map((col) => ({
                ...col,
                visible: col.visible ?? true,
                locked: false,
            })),
        }));
        state[SPREADSHEET_STORE_FIELD] = Object.values(action.tableDefinitions)
            .map((tabDef) => tabDef.uuid)
            .reduce(
                (acc, tabUuid) => ({
                    ...acc,
                    [tabUuid]: action?.tablesFilters?.[tabUuid] ?? [],
                }),
                {}
            );
        state[TABLE_SORT_STORE][SPREADSHEET_SORT_STORE] = Object.values(action.tableDefinitions)
            .map((tabDef) => tabDef.uuid)
            .reduce((acc, tabUuid) => {
                acc[tabUuid] = [
                    {
                        colId: 'id',
                        sort: SortWay.ASC,
                    },
                ];
                return acc;
            }, {} as TableSortConfig);
        state.globalFilterSpreadsheetState = action?.globalFilterSpreadsheetState ?? {};
    });

    builder.addCase(REORDER_TABLE_DEFINITIONS, (state, action: ReorderTableDefinitionsAction) => {
        const reorderedTabs = action.definitions;

        // Create a map of existing tabs to preserve their references
        const existingTabsMap = new Map(state.tables.definitions.map((tab) => [tab.uuid, tab]));

        // Use the exact same object references in the new order
        state.tables.definitions = reorderedTabs.map((newTab) => existingTabsMap.get(newTab.uuid) || newTab);
    });

    builder.addCase(REMOVE_TABLE_DEFINITION, (state, action: RemoveTableDefinitionAction) => {
        const removedTable = state.tables.definitions[action.tabIndex];

        // Create a new array without the removed tab while preserving object references
        const newDefinitions = state.tables.definitions.filter((_, idx) => idx !== action.tabIndex);

        // Replace the definitions array with the new one
        state.tables.definitions = newDefinitions;

        if (state[SPREADSHEET_STORE_FIELD]) {
            delete state[SPREADSHEET_STORE_FIELD][removedTable.uuid];
        }

        if (state[TABLE_SORT_STORE][SPREADSHEET_SORT_STORE]) {
            delete state[TABLE_SORT_STORE][SPREADSHEET_SORT_STORE][removedTable.name];
        }

        delete state.calculationSelections[removedTable.uuid];
    });

    builder.addCase(
        LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
        (state, action: LoadNetworkModificationTreeSuccessAction) => {
            state.networkModificationTreeModel = action.networkModificationTreeModel;
            state.networkModificationTreeModel.setBuildingStatus();
            state.isNetworkModificationTreeModelUpToDate = true;
            state.reloadMapNeeded = true;
        }
    );

    builder.addCase(
        NETWORK_MODIFICATION_TREE_NODES_REORDER,
        (state, action: NetworkModificationTreeNodesReorderAction) => {
            if (state.networkModificationTreeModel) {
                let newModel = state.networkModificationTreeModel.newSharedForUpdate();
                if (newModel.reorderChildrenNodes(action.parentNodeId, action.nodeIds)) {
                    state.networkModificationTreeModel = newModel;
                }
            }
        }
    );

    builder.addCase(NETWORK_MODIFICATION_TREE_NODE_ADDED, (state, action: NetworkModificationTreeNodeAddedAction) => {
        if (state.networkModificationTreeModel) {
            let newModel = state.networkModificationTreeModel.newSharedForUpdate();
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode,
                action.referenceNodeId
            );
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                state.currentTreeNode?.id &&
                action.networkModificationTreeNode?.childrenIds?.includes(state.currentTreeNode?.id)
            ) {
                // Then must overwrite currentTreeNode to set new parentId
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    });

    builder.addCase(NETWORK_MODIFICATION_TREE_NODE_MOVED, (state, action: NetworkModificationTreeNodeMovedAction) => {
        if (state.networkModificationTreeModel) {
            let newModel = state.networkModificationTreeModel.newSharedForUpdate();
            newModel.removeNodes([action.networkModificationTreeNode.id]);
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode,
                action.referenceNodeId
            );
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                state.currentTreeNode?.id &&
                action.networkModificationTreeNode?.childrenIds?.includes(state.currentTreeNode?.id)
            ) {
                // Then must overwrite currentTreeNode to set new parentId
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    });

    builder.addCase(NETWORK_MODIFICATION_HANDLE_SUBTREE, (state, action: NetworkModificationHandleSubtreeAction) => {
        if (state.networkModificationTreeModel) {
            let newModel = state.networkModificationTreeModel.newSharedForUpdate();
            unravelSubTree(newModel, action.parentNodeId, action.networkModificationTreeNodes);
            state.networkModificationTreeModel = newModel;
        }
    });

    builder.addCase(
        NETWORK_MODIFICATION_TREE_NODES_REMOVED,
        (state, action: NetworkModificationTreeNodesRemovedAction) => {
            if (state.networkModificationTreeModel) {
                let newModel = state.networkModificationTreeModel.newSharedForUpdate() as NetworkModificationTreeModel;

                //we assume all the deleted nodes are contiguous, so the new parent selected will be the nearest upstream node.
                //in the future, if the deleted nodes are no longer contiguous we will need another implementation
                const nextCurrentNodeUuid = newModel.treeNodes
                    .filter((node) => action.networkModificationTreeNodes.includes(node.id))
                    .map((node) => node.parentId)
                    .find((parentId) => !action.networkModificationTreeNodes.includes(parentId as UUID));

                newModel.removeNodes(action.networkModificationTreeNodes);
                state.networkModificationTreeModel = newModel;

                // check if current node is in the nodes deleted list
                if (
                    action.networkModificationTreeNodes.includes(
                        // @ts-expect-error TODO: what to do if current node null?
                        state.currentTreeNode?.id
                    )
                ) {
                    synchCurrentTreeNode(state, nextCurrentNodeUuid as UUID);
                } // check if parent node of the current node is in the nodes deleted list
                else if (
                    action.networkModificationTreeNodes.includes(
                        // @ts-expect-error TODO: what to do if current node null?
                        state.currentTreeNode?.parentId
                    )
                ) {
                    // Then must overwrite currentTreeNode to get new parentId
                    synchCurrentTreeNode(state, state.currentTreeNode?.id);
                }
            }
        }
    );

    builder.addCase(
        NETWORK_MODIFICATION_TREE_NODES_UPDATED,
        (state, action: NetworkModificationTreeNodesUpdatedAction) => {
            if (state.networkModificationTreeModel) {
                let newModel = state.networkModificationTreeModel.newSharedForUpdate();
                newModel.updateNodes(action.networkModificationTreeNodes);
                state.networkModificationTreeModel = newModel;
                state.networkModificationTreeModel?.setBuildingStatus();
                // check if current node is in the nodes updated list
                if (action.networkModificationTreeNodes.find((node) => node.id === state.currentTreeNode?.id)) {
                    synchCurrentTreeNode(state, state.currentTreeNode?.id);
                    // current node has changed, then will need to reload Geo Data
                    state.reloadMapNeeded = true;
                }
            }
        }
    );

    builder.addCase(STUDY_UPDATED, (state, action: StudyUpdatedAction) => {
        state.studyUpdated = {
            force: 1 - state.studyUpdated.force,
            // @ts-expect-error TODO types incompatible here
            type: action.eventData.headers.updateType,
            eventData: action.eventData,
        };
    });

    builder.addCase(MAP_DATA_LOADING, (state, action: MapDataLoadingAction) => {
        state.mapDataLoading = action.mapDataLoading;
    });

    builder.addCase(SELECT_THEME, (state, action: SelectThemeAction) => {
        state[PARAM_THEME] = action[PARAM_THEME];
        saveLocalStorageTheme(state[PARAM_THEME]);
    });

    builder.addCase(SELECT_LANGUAGE, (state, action: SelectLanguageAction) => {
        state[PARAM_LANGUAGE] = action[PARAM_LANGUAGE];
        saveLocalStorageLanguage(state[PARAM_LANGUAGE]);
    });

    builder.addCase(SELECT_COMPUTED_LANGUAGE, (state, action: SelectComputedLanguageAction) => {
        state.computedLanguage = action.computedLanguage;
    });

    builder.addCase(SET_PARAMS_LOADED, (state, action: SetParamsLoadedAction) => {
        state[PARAMS_LOADED] = action[PARAMS_LOADED];
    });

    builder.addCase(
        UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
        (state, action: UpdateNetworkVisualizationParametersAction) => {
            state.networkVisualizationsParameters = action.parameters;
        }
    );

    builder.addCase(USE_NAME, (state, action: UseNameAction) => {
        state[PARAM_USE_NAME] = action[PARAM_USE_NAME];
    });

    builder.addCase(USER, (state, action: UserAction) => {
        state.user = action.user;
    });

    builder.addCase(ENABLE_DEVELOPER_MODE, (state, action: EnableDeveloperModeAction) => {
        state[PARAM_DEVELOPER_MODE] = action[PARAM_DEVELOPER_MODE];
    });

    builder.addCase(UNAUTHORIZED_USER_INFO, (state, action: UnauthorizedUserAction) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(LOGOUT_ERROR, (state, action: LogoutErrorAction) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(USER_VALIDATION_ERROR, (state, action: UserValidationErrorAction) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(RESET_AUTHENTICATION_ROUTER_ERROR, (state, _action: AuthenticationRouterErrorAction) => {
        state.authenticationRouterError = null;
    });

    builder.addCase(SHOW_AUTH_INFO_LOGIN, (state, action: ShowAuthenticationRouterLoginAction) => {
        state.showAuthenticationRouterLogin = action.showAuthenticationRouterLogin;
    });

    builder.addCase(SET_RELOAD_MAP_NEEDED, (state, action: SetReloadMapNeededAction) => {
        state.reloadMapNeeded = action.reloadMapNeeded;
    });

    builder.addCase(MAP_EQUIPMENTS_INITIALIZED, (state, action: MapEquipmentsInitializedAction) => {
        state.isMapEquipmentsInitialized = action.newValue;
    });

    builder.addCase(FAVORITE_CONTINGENCY_LISTS, (state, action: FavoriteContingencyListsAction) => {
        state[PARAM_FAVORITE_CONTINGENCY_LISTS] = action[PARAM_FAVORITE_CONTINGENCY_LISTS];
    });

    builder.addCase(CURRENT_TREE_NODE, (state, action: CurrentTreeNodeAction) => {
        state.currentTreeNode = action.currentTreeNode;
        state.reloadMapNeeded = true;
    });

    builder.addCase(CURRENT_ROOT_NETWORK_UUID, (state, action: CurrentRootNetworkUuidAction) => {
        if (state.currentRootNetworkUuid !== action.currentRootNetworkUuid) {
            state.currentRootNetworkUuid = action.currentRootNetworkUuid;
            state.isNetworkModificationTreeModelUpToDate = false;
        }
    });

    builder.addCase(SET_ROOT_NETWORKS, (state, action: SetRootNetworksAction) => {
        state.rootNetworks = action.rootNetworks;
    });

    builder.addCase(NODE_SELECTION_FOR_COPY, (state, action: NodeSelectionForCopyAction) => {
        const nodeSelectionForCopy = action.nodeSelectionForCopy;
        if (nodeSelectionForCopy.sourceStudyUuid === state.studyUuid && nodeSelectionForCopy.nodeId) {
            if (
                nodeSelectionForCopy.copyType === CopyType.SUBTREE_COPY ||
                nodeSelectionForCopy.copyType === CopyType.SUBTREE_CUT
            ) {
                nodeSelectionForCopy.allChildren = getAllChildren(
                    state.networkModificationTreeModel,
                    nodeSelectionForCopy.nodeId
                ).map((child) => ({
                    id: child.id,
                    nodeType: child.data.nodeType,
                }));
            }
            nodeSelectionForCopy.nodeType = getNetworkModificationNode(
                state.networkModificationTreeModel,
                nodeSelectionForCopy.nodeId
            )?.data.nodeType;
        }
        state.nodeSelectionForCopy = nodeSelectionForCopy;
    });

    builder.addCase(SET_MODIFICATIONS_DRAWER_OPEN, (state, _action: SetModificationsDrawerOpenAction) => {
        if (!state.toggleOptions.includes(StudyDisplayMode.MODIFICATIONS)) {
            state.toggleOptions = [...state.toggleOptions, StudyDisplayMode.MODIFICATIONS];
        }
    });

    builder.addCase(SET_TOGGLE_OPTIONS, (state, action: SetToggleOptionsAction) => {
        state.toggleOptions = action.toggleOptions;
        if (state.studyUuid) {
            saveLocalStorageToggleOptions(state.studyUuid, state.toggleOptions);
        }
    });

    builder.addCase(CENTER_ON_SUBSTATION, (state, action: CenterOnSubstationAction) => {
        state.centerOnSubstation = action.centerOnSubstation;
    });

    builder.addCase(ADD_NOTIFICATION, (state, action: AddNotificationAction) => {
        state.notificationIdList = [...state.notificationIdList, ...action.notificationIds];
    });

    builder.addCase(REMOVE_NOTIFICATION_BY_NODE, (state, action: RemoveNotificationByNodeAction) => {
        state.notificationIdList = [
            ...state.notificationIdList.filter((nodeId) => !action.notificationIds.includes(nodeId)),
        ];
    });

    builder.addCase(SET_MODIFICATIONS_IN_PROGRESS, (state, action: SetModificationsInProgressAction) => {
        state.isModificationsInProgress = action.isModificationsInProgress;
    });

    builder.addCase(SET_STUDY_DISPLAY_MODE, (state, action: SetStudyDisplayModeAction) => {
        if (Object.values(StudyDisplayMode).includes(action.studyDisplayMode)) {
            // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
            // Some actions in the TREE display mode could change this value after that
            // ex: change current Node, current Node updated ...
            if (action.studyDisplayMode === StudyDisplayMode.TREE) {
                state.freezeMapUpdates = true;
            } else {
                state.freezeMapUpdates = false;
            }

            state.studyDisplayMode = action.studyDisplayMode;
        }
    });

    builder.addCase(SET_MONO_ROOT_STUDY, (state, action: SetMonoRootStudyAction) => {
        state.isMonoRootStudy = action.isMonoRootStudy;
    });

    builder.addCase(OPEN_DIAGRAM, (state, action: OpenDiagramAction) => {
        if (action.svgType === DiagramType.SUBSTATION) {
            state.latestDiagramEvent = {
                diagramType: action.svgType,
                eventType: DiagramEventType.CREATE,
                substationId: action.id as UUID,
            };
        } else if (action.svgType === DiagramType.VOLTAGE_LEVEL) {
            state.latestDiagramEvent = {
                diagramType: action.svgType,
                eventType: DiagramEventType.CREATE,
                voltageLevelId: action.id as UUID,
            };
        } else if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            state.latestDiagramEvent = {
                diagramType: action.svgType,
                eventType: DiagramEventType.CREATE,
                name: '',
                nadConfigUuid: undefined,
                filterUuid: undefined,
                voltageLevelIds: [action.id as UUID],
                voltageLevelToExpandIds: [],
                voltageLevelToOmitIds: [],
                positions: [],
            };
        }

        // Switch to the grid layout in order to see the newly opened diagram
        if (
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE &&
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT
        ) {
            state.studyDisplayMode = StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE;
        }
    });

    builder.addCase(OPEN_NAD_LIST, (state, action: OpenNadListAction) => {
        const uniqueIds = [...new Set(action.ids)];

        state.latestDiagramEvent = {
            diagramType: DiagramType.NETWORK_AREA_DIAGRAM,
            eventType: DiagramEventType.CREATE,
            name: '',
            nadConfigUuid: undefined,
            filterUuid: undefined,
            voltageLevelIds: uniqueIds as UUID[],
            voltageLevelToExpandIds: [],
            voltageLevelToOmitIds: [],
            positions: [],
        };

        // Switch to the grid layout in order to see the newly opened diagram
        if (
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE &&
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT
        ) {
            state.studyDisplayMode = StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE;
        }
    });

    builder.addCase(LOAD_EQUIPMENTS, (state, action: LoadEquipmentsAction) => {
        (
            Object.entries(action.spreadsheetEquipmentByNodes.equipmentsByNodeId) as Entries<
                LoadEquipmentsAction['spreadsheetEquipmentByNodes']['equipmentsByNodeId']
            >
        ).forEach(([nodeId, equipments]) => {
            state.spreadsheetNetwork[action.equipmentType].equipmentsByNodeId[nodeId] = equipments;
        });
        //to remove duplicate
        state.spreadsheetNetwork[action.equipmentType].nodesId = [
            ...new Set([
                ...state.spreadsheetNetwork[action.equipmentType].nodesId,
                ...action.spreadsheetEquipmentByNodes.nodesId,
            ]),
        ];
    });

    builder.addCase(REMOVE_NODE_DATA, (state, action: RemoveNodeDataAction) => {
        state.spreadsheetNetwork = Object.entries(state.spreadsheetNetwork).reduce(
            (newRecord, [equipmentType, equipmentData]) => {
                const { nodesId, equipmentsByNodeId } = equipmentData;

                // Filter out node IDs that should be removed
                const updatedNodesId = nodesId.filter((nodeId) => !action.nodesIdToRemove.includes(nodeId));

                // Remove entries in equipmentsByNodeId where the key is in nodeIdsToRemove
                const updatedEquipmentsByNodeId = Object.fromEntries(
                    Object.entries(equipmentsByNodeId).filter(([nodeId]) => !action.nodesIdToRemove.includes(nodeId))
                );

                newRecord[equipmentType as SpreadsheetEquipmentType] = {
                    nodesId: updatedNodesId,
                    equipmentsByNodeId: updatedEquipmentsByNodeId,
                };

                return newRecord;
            },
            {} as Record<SpreadsheetEquipmentType, SpreadsheetEquipmentsByNodes>
        );
    });

    builder.addCase(REMOVE_EQUIPMENT_DATA, (state, action: RemoveEquipmentDataAction) => {
        state.spreadsheetNetwork[action.equipmentType] = {
            nodesId: [],
            equipmentsByNodeId: {},
        };
    });

    builder.addCase(UPDATE_EQUIPMENTS, (state, action: UpdateEquipmentsAction) => {
        // for now, this action receives an object containing all equipments from a substation
        // it will be modified when the notifications received after a network modification are more precise
        // equipmentType: type of equipment updated
        // equipments: list of updated equipments of type <equipmentType>
        for (const [equipmentType, equipments] of Object.entries(action.equipments) as [
            SpreadsheetEquipmentType,
            Identifiable[],
        ][]) {
            let updatedEquipments;
            if (Array.isArray(equipments)) {
                updatedEquipments = equipments;
            } else {
                updatedEquipments = [equipments];
            }

            const currentEquipment: Identifiable[] | undefined =
                state.spreadsheetNetwork[equipmentType]?.equipmentsByNodeId[action.nodeId];

            // Format the updated equipments to match the table format
            const formattedEquipments = mapSpreadsheetEquipments(equipmentType, updatedEquipments);

            // if the <equipmentType> equipments are not loaded into the store yet, we don't have to update them
            if (currentEquipment !== undefined) {
                //since substations data contains voltage level ones, they have to be treated separately
                if (equipmentType === SpreadsheetEquipmentType.SUBSTATION) {
                    const [updatedSubstations, updatedVoltageLevels] = updateSubstationsAndVoltageLevels(
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION].equipmentsByNodeId[
                            action.nodeId
                        ] as Substation[],
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL].equipmentsByNodeId[action.nodeId],
                        formattedEquipments
                    );

                    if (updatedSubstations != null) {
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION].equipmentsByNodeId[action.nodeId] =
                            updatedSubstations;
                    }
                    if (updatedVoltageLevels != null) {
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL].equipmentsByNodeId[action.nodeId] =
                            updatedVoltageLevels;
                    }
                } else {
                    state.spreadsheetNetwork[equipmentType].equipmentsByNodeId[action.nodeId] = updateEquipments(
                        currentEquipment,
                        formattedEquipments
                    );
                }
            }
        }
    });

    builder.addCase(DELETE_EQUIPMENTS, (state, action: DeleteEquipmentsAction) => {
        action.equipments.forEach(({ equipmentType: equipmentToDeleteType, equipmentId: equipmentToDeleteId }) => {
            const currentEquipments =
                state.spreadsheetNetwork[equipmentToDeleteType]?.equipmentsByNodeId[action.nodeId];
            if (currentEquipments !== undefined) {
                // in case of voltage level deletion, we need to update the linked substation which contains a list of its voltage levels
                if (equipmentToDeleteType === SpreadsheetEquipmentType.VOLTAGE_LEVEL) {
                    const currentSubstations = state.spreadsheetNetwork[SpreadsheetEquipmentType.SUBSTATION]
                        .equipmentsByNodeId[action.nodeId] as Substation[] | null;
                    if (currentSubstations != null) {
                        state.spreadsheetNetwork[SpreadsheetEquipmentType.SUBSTATION].equipmentsByNodeId[
                            action.nodeId
                        ] = updateSubstationAfterVLDeletion(currentSubstations, equipmentToDeleteId);
                    }
                }

                state.spreadsheetNetwork[equipmentToDeleteType].equipmentsByNodeId[action.nodeId] = deleteEquipment(
                    currentEquipments,
                    equipmentToDeleteId
                );
            }
        });
    });

    builder.addCase(RESET_EQUIPMENTS, (state, _action: ResetEquipmentsAction) => {
        state.spreadsheetNetwork = {
            ...initialSpreadsheetNetworkState,
        };
    });
    builder.addCase(RESET_EQUIPMENTS_BY_TYPES, (state, action: ResetEquipmentsByTypesAction) => {
        action.equipmentTypes.forEach((equipmentType) => {
            state.spreadsheetNetwork[equipmentType] = emptySpreadsheetEquipmentsByNodes;
        });
    });

    builder.addCase(RESET_EQUIPMENTS_POST_COMPUTATION, (state, _action: ResetEquipmentsPostComputationAction) => {
        state.spreadsheetNetwork = {
            ...initialSpreadsheetNetworkState,
            [EQUIPMENT_TYPES.SUBSTATION]: state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION],
            [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL],
            [EQUIPMENT_TYPES.HVDC_LINE]: state.spreadsheetNetwork[EQUIPMENT_TYPES.HVDC_LINE],
        };
    });

    builder.addCase(SET_COMPUTING_STATUS, (state, action: SetComputingStatusAction) => {
        state.computingStatus[action.computingType] = action.runningStatus;
    });

    builder.addCase(
        SET_COMPUTING_STATUS_INFOS,
        (state, action: SetComputingStatusParametersAction<ParameterizedComputingType>) => {
            state.computingStatusParameters[action.computingType] = action.computingStatusParameters;
        }
    );

    builder.addCase(SET_COMPUTATION_STARTING, (state, action: SetComputationStartingAction) => {
        state.computationStarting = action.computationStarting;
    });

    builder.addCase(SET_OPTIONAL_SERVICES, (state, action: SetOptionalServicesAction) => {
        state.optionalServices = action.optionalServices;
    });

    builder.addCase(
        SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
        (state, action: SetOneBusShortcircuitAnalysisDiagramAction) => {
            state.oneBusShortCircuitAnalysisDiagram = action.diagramId
                ? {
                      diagramId: action.diagramId,
                      nodeId: action.nodeId,
                  }
                : null;
        }
    );

    builder.addCase(SET_ROOT_NETWORK_INDEXATION_STATUS, (state, action: SetRootNetworkIndexationStatusAction) => {
        state.rootNetworkIndexationStatus = action.rootNetworkIndexationStatus;
    });

    builder.addCase(ADD_TO_RECENT_GLOBAL_FILTERS, (state, action: AddToRecentGlobalFiltersAction) => {
        let newRecentGlobalFilters = [...state.recentGlobalFilters];
        action.globalFilters.forEach((filter) => {
            if (
                !newRecentGlobalFilters.some(
                    (obj) =>
                        obj.label === filter.label &&
                        obj.filterType === filter.filterType &&
                        obj.filterSubtype === filter.filterSubtype &&
                        obj.uuid === filter.uuid
                )
            ) {
                newRecentGlobalFilters.push(filter);
            }
        });
        state.recentGlobalFilters = newRecentGlobalFilters;
    });

    builder.addCase(REMOVE_FROM_RECENT_GLOBAL_FILTERS, (state, action: RemoveFromRecentGlobalFiltersAction) => {
        state.recentGlobalFilters = [
            ...state.recentGlobalFilters.filter((recentGlobalFilter) => recentGlobalFilter.uuid !== action.uuid),
        ];
    });

    builder.addCase(SET_LAST_COMPLETED_COMPUTATION, (state, action: SetLastCompletedComputationAction) => {
        state.lastCompletedComputation = action.lastCompletedComputation;
    });

    builder.addCase(LOADFLOW_RESULT_FILTER, (state, action: LoadflowResultFilterAction) => {
        state[LOADFLOW_RESULT_STORE_FIELD][action.filterTab] = action[LOADFLOW_RESULT_STORE_FIELD];
    });

    builder.addCase(SECURITY_ANALYSIS_RESULT_FILTER, (state, action: SecurityAnalysisResultFilterAction) => {
        state[SECURITY_ANALYSIS_RESULT_STORE_FIELD][action.filterTab] = action[SECURITY_ANALYSIS_RESULT_STORE_FIELD];
    });

    builder.addCase(SENSITIVITY_ANALYSIS_RESULT_FILTER, (state, action: SensitivityAnalysisResultFilterAction) => {
        state[SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD][action.filterTab] =
            action[SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD];
    });

    builder.addCase(SHORTCIRCUIT_ANALYSIS_RESULT_FILTER, (state, action: ShortcircuitAnalysisResultFilterAction) => {
        state[SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD][action.filterTab] =
            action[SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD];
    });

    builder.addCase(DYNAMIC_SIMULATION_RESULT_FILTER, (state, action: DynamicSimulationResultFilterAction) => {
        state[DYNAMIC_SIMULATION_RESULT_STORE_FIELD][action.filterTab] = action[DYNAMIC_SIMULATION_RESULT_STORE_FIELD];
    });

    builder.addCase(STATEESTIMATION_RESULT_FILTER, (state, action: StateEstimationResultFilterAction) => {
        state[STATEESTIMATION_RESULT_STORE_FIELD][action.filterTab] = action[STATEESTIMATION_RESULT_STORE_FIELD];
    });

    builder.addCase(SPREADSHEET_FILTER, (state, action: SpreadsheetFilterAction) => {
        state[SPREADSHEET_STORE_FIELD][action.filterTab] = action[SPREADSHEET_STORE_FIELD];
    });

    builder.addCase(ADD_FILTER_FOR_NEW_SPREADSHEET, (state, action: AddFilterForNewSpreadsheetAction) => {
        const { tabUuid, value } = action.payload;
        state[SPREADSHEET_STORE_FIELD][tabUuid] = value;
    });

    builder.addCase(LOGS_FILTER, (state, action: LogsFilterAction) => {
        state[LOGS_STORE_FIELD][action.filterTab] = action[LOGS_STORE_FIELD];
    });

    builder.addCase(RESET_LOGS_FILTER, (state, _action: ResetLogsFilterAction) => {
        state[LOGS_STORE_FIELD] = {
            ...initialLogsFilterState,
        };
    });

    builder.addCase(TABLE_SORT, (state, action: TableSortAction) => {
        state.tableSort[action.table][action.tab] = action.sort;
    });

    builder.addCase(ADD_SORT_FOR_NEW_SPREADSHEET, (state, action: AddSortForNewSpreadsheetAction) => {
        const { tabUuid, value } = action.payload;
        state.tableSort[SPREADSHEET_SORT_STORE][tabUuid] = value;
    });

    builder.addCase(UPDATE_COLUMNS_DEFINITION, (state, action: UpdateColumnsDefinitionsAction) => {
        const { colData } = action;

        // Retrieve the table definition by index
        const tableDefinition = state.tables.definitions.find((tabDef) => tabDef.uuid === colData.uuid);

        if (tableDefinition) {
            const existingColumnIndex = tableDefinition.columns.findIndex((col) => col.uuid === colData.value.uuid);

            if (existingColumnIndex !== -1) {
                // Update existing column
                tableDefinition.columns[existingColumnIndex] = colData.value;
            } else {
                // Add new column if not found
                tableDefinition.columns.push(colData.value);
            }
        }
    });

    builder.addCase(REMOVE_COLUMN_DEFINITION, (state, action: RemoveColumnDefinitionAction) => {
        const { uuid, value } = action.definition;
        const tableDefinition = state.tables.definitions.find((tabDef) => tabDef.uuid === uuid);
        const tableSort = state.tableSort[SPREADSHEET_SORT_STORE];
        const tableFilter = state[SPREADSHEET_STORE_FIELD];

        if (tableDefinition) {
            tableDefinition.columns = tableDefinition.columns.filter((col) => col.id !== value);
        }
        // remove sort and filter for the removed column
        if (tableDefinition && tableSort[tableDefinition.name]) {
            tableSort[tableDefinition.name] = tableSort[tableDefinition.name].filter((sort) => sort.colId !== value);
        }
        if (tableDefinition && tableFilter[tableDefinition.uuid]) {
            tableFilter[tableDefinition.uuid] = tableFilter[tableDefinition.uuid].filter(
                (filter) => filter.column !== value
            );
        }
    });

    builder.addCase(SAVE_SPREADSHEET_GS_FILTER, (state, action: SaveSpreadSheetGlobalFilterAction) => {
        state.globalFilterSpreadsheetState[action.tabUuid] = action.filters;
    });

    builder.addCase(SET_CALCULATION_SELECTIONS, (state, action: SetCalculationSelectionsAction) => {
        state.calculationSelections = {
            ...state.calculationSelections,
            [action.tabUuid]: action.selections,
        };
    });

    builder.addCase(RESET_ALL_SPREADSHEET_GS_FILTERS, (state, _action: ResetAllSpreadsheetGlobalFiltersAction) => {
        state.globalFilterSpreadsheetState = {};
    });

    builder.addCase(DELETED_OR_RENAMED_NODES, (state, action: DeletedOrRenamedNodesAction) => {
        state.deletedOrRenamedNodes = action.deletedOrRenamedNodes;
    });

    builder.addCase(RESET_DIAGRAM_EVENT, (state, _action: ResetDiagramEventAction) => {
        state.latestDiagramEvent = undefined;
    });

    builder.addCase(SET_DIAGRAM_GRID_LAYOUT, (state, action: SetDiagramGridLayoutAction) => {
        state.diagramGridLayout = action.diagramGridLayout;
    });

    builder.addCase(SET_OPEN_MAP, (state, action: SetOpenMapAction) => {
        state.mapOpen = action.mapOpen;
    });

    builder.addCase(SELECT_SYNC_ENABLED, (state, action: SelectSyncEnabledAction) => {
        state.syncEnabled = action.syncEnabled;
    });
});

function updateSubstationAfterVLDeletion(currentSubstations: Substation[], VLToDeleteId: string): Substation[] {
    const substationToUpdateIndex = currentSubstations.findIndex((sub) =>
        sub.voltageLevels.some((vl) => vl.id === VLToDeleteId)
    );
    if (substationToUpdateIndex >= 0) {
        currentSubstations[substationToUpdateIndex].voltageLevels = currentSubstations[
            substationToUpdateIndex
        ].voltageLevels.filter((vl) => vl.id !== VLToDeleteId);
    }

    return currentSubstations;
}

function deleteEquipment(currentEquipments: Identifiable[], equipmentToDeleteId: string) {
    const equipmentToDeleteIndex = currentEquipments.findIndex((eq) => eq.id === equipmentToDeleteId);
    if (equipmentToDeleteIndex >= 0) {
        currentEquipments.splice(equipmentToDeleteIndex, 1);
    }
    return currentEquipments;
}

export type Substation = Identifiable & {
    voltageLevels: Identifiable[];
};

function updateSubstationsAndVoltageLevels(
    currentSubstations: Substation[],
    currentVoltageLevels: Identifiable[],
    newOrUpdatedSubstations: Substation[]
) {
    const updatedSubstations = updateEquipments(currentSubstations, newOrUpdatedSubstations);

    let updatedVoltageLevels = null;

    // if voltage levels are not loaded yet, we don't need to update them
    if (currentVoltageLevels != null) {
        const newOrUpdatedVoltageLevels = newOrUpdatedSubstations.reduce((acc, currentSub) => {
            return acc.concat([...currentSub.voltageLevels]);
        }, [] as Identifiable[]);

        updatedVoltageLevels = updateEquipments(currentVoltageLevels, newOrUpdatedVoltageLevels);
    }

    return [updatedSubstations, updatedVoltageLevels];
}

function updateEquipments(currentEquipments: Identifiable[], newOrUpdatedEquipments: Identifiable[]) {
    newOrUpdatedEquipments.forEach((equipment) => {
        const existingEquipmentIndex = currentEquipments.findIndex((equip) => equip.id === equipment.id);

        if (existingEquipmentIndex >= 0) {
            currentEquipments[existingEquipmentIndex] = equipment;
        } else {
            currentEquipments.push(equipment);
        }
    });

    return currentEquipments;
}

function synchCurrentTreeNode(state: Draft<AppState>, nextCurrentNodeUuid?: UUID) {
    const nextCurrentNode = state.networkModificationTreeModel?.treeNodes.find(
        (node: CurrentTreeNode) => node?.id === nextCurrentNodeUuid
    );

    //  we need to overwrite state.currentTreeNode to consider label change for example.
    if (nextCurrentNode) {
        state.currentTreeNode = { ...nextCurrentNode };
    }
}

function unravelSubTree(
    treeModel: NetworkModificationTreeModel,
    subtreeParentId: UUID,
    node: NetworkModificationNodeData | RootNodeData | null
) {
    if (node) {
        if (treeModel.treeNodes.find((el) => el.id === node.id)) {
            treeModel.removeNodes([node.id]);
        }
        treeModel.addChild(node, subtreeParentId, NodeInsertModes.NewBranch, subtreeParentId, true);

        if (node.children.length > 0) {
            node.children.forEach((child) => {
                unravelSubTree(treeModel, node.id, child);
            });
        }
    }
}
