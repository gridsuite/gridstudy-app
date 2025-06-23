/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer, Draft } from '@reduxjs/toolkit';
import {
    AuthenticationActions,
    AuthenticationRouterErrorAction,
    AuthenticationRouterErrorState,
    CommonStoreState,
    ElementType,
    GsLang,
    GsLangUser,
    GsTheme,
    Identifiable,
    LOGOUT_ERROR,
    LogoutErrorAction,
    RESET_AUTHENTICATION_ROUTER_ERROR,
    SHOW_AUTH_INFO_LOGIN,
    ShowAuthenticationRouterLoginAction,
    UNAUTHORIZED_USER_INFO,
    UnauthorizedUserAction,
    USER,
    USER_VALIDATION_ERROR,
    UserAction,
    UserValidationErrorAction,
    NetworkVisualizationParameters,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    ADD_FILTER_FOR_NEW_SPREADSHEET,
    ADD_NOTIFICATION,
    ADD_SORT_FOR_NEW_SPREADSHEET,
    ADD_TO_RECENT_GLOBAL_FILTERS,
    AddFilterForNewSpreadsheetAction,
    AddNotificationAction,
    AddSortForNewSpreadsheetAction,
    AddToRecentGlobalFiltersAction,
    AppActions,
    ATTEMPT_LEAVE_PARAMETERS_TAB,
    AttemptLeaveParametersTabAction,
    CANCEL_LEAVE_PARAMETERS_TAB,
    CENTER_ON_SUBSTATION,
    CenterOnSubstationAction,
    CLOSE_STUDY,
    CloseStudyAction,
    CONFIRM_LEAVE_PARAMETERS_TAB,
    CURRENT_ROOT_NETWORK_UUID,
    CURRENT_TREE_NODE,
    CurrentRootNetworkUuidAction,
    CurrentTreeNodeAction,
    DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    DecrementNetworkAreaDiagramDepthAction,
    DELETE_EQUIPMENTS,
    DeleteEquipmentsAction,
    DYNAMIC_SIMULATION_RESULT_FILTER,
    DynamicSimulationResultFilterAction,
    ENABLE_DEVELOPER_MODE,
    EnableDeveloperModeAction,
    FAVORITE_CONTINGENCY_LISTS,
    FavoriteContingencyListsAction,
    INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    IncrementNetworkAreaDiagramDepthAction,
    INIT_TABLE_DEFINITIONS,
    InitTableDefinitionsAction,
    LOAD_EQUIPMENTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    LoadEquipmentsAction,
    LOADFLOW_RESULT_FILTER,
    LoadflowResultFilterAction,
    LoadNetworkModificationTreeSuccessAction,
    LOGS_FILTER,
    LogsFilterAction,
    MAP_DATA_LOADING,
    MAP_EQUIPMENTS_CREATED,
    MAP_EQUIPMENTS_INITIALIZED,
    MapDataLoadingAction,
    MapEquipmentsCreatedAction,
    MapEquipmentsInitializedAction,
    NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
    NETWORK_MODIFICATION_HANDLE_SUBTREE,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_REORDER,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
    NetworkAreaDiagramNbVoltageLevelsAction,
    NetworkModificationHandleSubtreeAction,
    NetworkModificationTreeNodeAddedAction,
    NetworkModificationTreeNodeMovedAction,
    NetworkModificationTreeNodesRemovedAction,
    NetworkModificationTreeNodesReorderAction,
    NetworkModificationTreeNodesUpdatedAction,
    NODE_SELECTION_FOR_COPY,
    NodeSelectionForCopyAction,
    OPEN_DIAGRAM,
    OPEN_NAD_LIST,
    OPEN_STUDY,
    OpenDiagramAction,
    OpenNadListAction,
    OpenStudyAction,
    REMOVE_COLUMN_DEFINITION,
    REMOVE_FROM_RECENT_GLOBAL_FILTERS,
    REMOVE_NODE_DATA,
    REMOVE_NOTIFICATION_BY_NODE,
    REMOVE_TABLE_DEFINITION,
    RemoveColumnDefinitionAction,
    RemoveFromRecentGlobalFiltersAction,
    RemoveNodeDataAction,
    RemoveNotificationByNodeAction,
    RemoveTableDefinitionAction,
    RENAME_TABLE_DEFINITION,
    RenameTableDefinitionAction,
    REORDER_TABLE_DEFINITIONS,
    ReorderTableDefinitionsAction,
    RESET_ALL_SPREADSHEET_GS_FILTERS,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_BY_TYPES,
    RESET_EQUIPMENTS_POST_LOADFLOW,
    RESET_LOGS_FILTER,
    RESET_MAP_EQUIPMENTS,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    ResetAllSpreadsheetGlobalFiltersAction,
    ResetEquipmentsAction,
    ResetEquipmentsByTypesAction,
    ResetEquipmentsPostLoadflowAction,
    ResetLogsFilterAction,
    ResetMapEquipmentsAction,
    ResetNetworkAreaDiagramDepthAction,
    SAVE_SPREADSHEET_GS_FILTER,
    SaveSpreadSheetGlobalFilterAction,
    SECURITY_ANALYSIS_RESULT_FILTER,
    SecurityAnalysisResultFilterAction,
    SELECT_COMPUTED_LANGUAGE,
    SELECT_LANGUAGE,
    SELECT_THEME,
    SelectComputedLanguageAction,
    SelectLanguageAction,
    SelectThemeAction,
    SENSITIVITY_ANALYSIS_RESULT_FILTER,
    SensitivityAnalysisResultFilterAction,
    SET_APP_TAB_INDEX,
    SET_CALCULATION_SELECTIONS,
    SET_COMPUTATION_STARTING,
    SET_COMPUTING_STATUS,
    SET_EVENT_SCENARIO_DRAWER_OPEN,
    SET_LAST_COMPLETED_COMPUTATION,
    SET_MODIFICATIONS_DRAWER_OPEN,
    SET_MODIFICATIONS_IN_PROGRESS,
    SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
    SET_OPTIONAL_SERVICES,
    SET_PARAMS_LOADED,
    SET_ROOT_NETWORKS,
    SET_RELOAD_MAP_NEEDED,
    SET_STUDY_DISPLAY_MODE,
    SET_ROOT_NETWORK_INDEXATION_STATUS,
    SetAppTabIndexAction,
    SetCalculationSelectionsAction,
    SetComputationStartingAction,
    SetComputingStatusAction,
    SetEventScenarioDrawerOpenAction,
    SetLastCompletedComputationAction,
    SetModificationsDrawerOpenAction,
    SetModificationsInProgressAction,
    SetOneBusShortcircuitAnalysisDiagramAction,
    SetOptionalServicesAction,
    SetParamsLoadedAction,
    SetRootNetworksAction,
    SetReloadMapNeededAction,
    SetStudyDisplayModeAction,
    SetRootNetworkIndexationStatusAction,
    SHORTCIRCUIT_ANALYSIS_RESULT_FILTER,
    ShortcircuitAnalysisResultFilterAction,
    SPREADSHEET_FILTER,
    SpreadsheetFilterAction,
    STATEESTIMATION_RESULT_FILTER,
    StateEstimationResultFilterAction,
    STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT,
    STORE_NETWORK_AREA_DIAGRAM_TEXT_NODE_MOVEMENT,
    StoreNetworkAreaDiagramNodeMovementAction,
    StoreNetworkAreaDiagramTextNodeMovementAction,
    STUDY_UPDATED,
    StudyUpdatedAction,
    TABLE_SORT,
    TableSortAction,
    UPDATE_COLUMNS_DEFINITION,
    UPDATE_EQUIPMENTS,
    UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
    UPDATE_TABLE_DEFINITION,
    UpdateColumnsDefinitionsAction,
    UpdateEquipmentsAction,
    UpdateNetworkVisualizationParametersAction,
    UpdateTableDefinitionAction,
    USE_NAME,
    UseNameAction,
    SET_EDIT_NAD_MODE,
    SetEditNadModeAction,
    DELETED_OR_RENAMED_NODES,
    DeletedOrRenamedNodesAction,
    REMOVE_EQUIPMENT_DATA,
    RemoveEquipmentDataAction,
    UPDATE_TABLE_COLUMNS,
    UpdateTableColumnsAction,
    SET_MONO_ROOT_STUDY,
    SetMonoRootStudyAction,
    RESET_DIAGRAM_EVENT,
    ResetDiagramEventAction,
} from './actions';
import {
    getLocalStorageComputedLanguage,
    getLocalStorageLanguage,
    getLocalStorageTheme,
    saveLocalStorageLanguage,
    saveLocalStorageTheme,
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
import { loadDiagramStateFromSessionStorage } from './session-storage/diagram-state';
import { getAllChildren } from 'components/graph/util/model-functions';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { IOptionalService, OptionalServicesNames, OptionalServicesStatus } from '../components/utils/optional-services';
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
import { UUID } from 'crypto';
import { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import type { ValueOf } from 'type-fest';
import { CopyType, StudyDisplayMode } from '../components/network-modification.type';
import { CurrentTreeNode, NetworkModificationNodeData, RootNodeData } from '../components/graph/tree-node.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../utils/report/report.constant';
import GSMapEquipments from 'components/network/gs-map-equipments';
import {
    ColumnDefinition,
    SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../components/spreadsheet-view/types/spreadsheet.type';
import { FilterConfig, SortConfig, SortWay } from '../types/custom-aggrid-types';
import { DiagramType, isNadType } from '../components/diagrams/diagram.type';
import { RootNetworkMetadata } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import { CalculationType } from 'components/spreadsheet-view/types/calculation.type';
import { NodeInsertModes, RootNetworkIndexationStatus, StudyUpdateNotification } from 'types/notification-types';
import { mapSpreadsheetEquipments } from '../utils/spreadsheet-equipments-mapper';

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

export type DiagramState = {
    id: UUID;
    type?: ElementType;
    svgType: DiagramType;
    name?: string;
};

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
    voltageLevelIds: string[];
};

type CreateNADFromElementDiagramEvent = CreateDiagramEvent & {
    diagramType: DiagramType.NAD_FROM_ELEMENT;
    elementUuid: UUID;
    elementType: ElementType;
    elementName: string;
};

export type DiagramEvent =
    | RemoveDiagramEvent
    | CreateVoltageLevelSLDDiagramEvent
    | CreateSubstationSLDDiagramEvent
    | CreateNADDiagramEvent
    | CreateNADFromElementDiagramEvent;

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
    copyType: ValueOf<typeof CopyType> | null;
    allChildrenIds: string[] | null;
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
    lastCompletedComputation: ComputingType | null;
    computationStarting: boolean;
    optionalServices: IOptionalService[];
    oneBusShortCircuitAnalysisDiagram: OneBusShortCircuitAnalysisDiagram | null;
    notificationIdList: UUID[];
    nonEvacuatedEnergyNotif: boolean;
    recentGlobalFilters: GlobalFilter[];
    mapEquipments: GSMapEquipments | undefined;
    networkAreaDiagramNbVoltageLevels: number;
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
    diagramStates: DiagramState[];
    latestDiagramEvent: DiagramEvent | undefined;
    nadNodeMovements: NadNodeMovement[];
    nadTextNodeMovements: NadTextMovement[];
    isExplorerDrawerOpen: boolean;
    isModificationsDrawerOpen: boolean;
    isEventScenarioDrawerOpen: boolean;
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
    [EQUIPMENT_TYPES.SUBSTATION]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.LINE]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.GENERATOR]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.LOAD]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.BATTERY]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.DANGLING_LINE]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.TIE_LINE]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.HVDC_LINE]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.LCC_CONVERTER_STATION]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.VSC_CONVERTER_STATION]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.BUS]: emptySpreadsheetEquipmentsByNodes,
    [EQUIPMENT_TYPES.BUSBAR_SECTION]: emptySpreadsheetEquipmentsByNodes,
};

export type GlobalFilterSpreadsheetState = Record<UUID, GlobalFilter[]>;
const initialGlobalFilterSpreadsheet: GlobalFilterSpreadsheetState = {};

interface TablesState {
    uuid: UUID | null;
    definitions: SpreadsheetTabDefinition[];
}

const initialTablesState: TablesState = {
    uuid: null,
    definitions: [],
};

const initialState: AppState = {
    appTabIndex: 0,
    attemptedLeaveParametersTabIndex: null,
    studyUuid: null,
    currentTreeNode: null,
    currentRootNetworkUuid: null,
    rootNetworks: [],
    nodeSelectionForCopy: {
        sourceStudyUuid: null,
        nodeId: null,
        copyType: null,
        allChildrenIds: null,
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
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    isEventScenarioDrawerOpen: false,
    centerOnSubstation: undefined,
    notificationIdList: [],
    isModificationsInProgress: false,
    isMonoRootStudy: true,
    studyDisplayMode: StudyDisplayMode.HYBRID,
    diagramStates: [],
    latestDiagramEvent: undefined,
    nadNodeMovements: [],
    nadTextNodeMovements: [],
    reloadMapNeeded: true,
    isEditMode: false,
    freezeMapUpdates: false,
    isMapEquipmentsInitialized: false,
    networkAreaDiagramDepth: 0,
    networkAreaDiagramNbVoltageLevels: 0,
    spreadsheetNetwork: { ...initialSpreadsheetNetworkState },
    globalFilterSpreadsheetState: initialGlobalFilterSpreadsheet,
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

        if (action.studyRef[0] != null) {
            state.diagramStates = loadDiagramStateFromSessionStorage(action.studyRef[0]);
        }
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

    builder.addCase(SET_EDIT_NAD_MODE, (state, action: SetEditNadModeAction) => {
        state.isEditMode = action.isEditMode;
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
        if (
            nodeSelectionForCopy.sourceStudyUuid === state.studyUuid &&
            nodeSelectionForCopy.nodeId &&
            (nodeSelectionForCopy.copyType === CopyType.SUBTREE_COPY ||
                nodeSelectionForCopy.copyType === CopyType.SUBTREE_CUT)
        ) {
            nodeSelectionForCopy.allChildrenIds = getAllChildren(
                state.networkModificationTreeModel,
                nodeSelectionForCopy.nodeId
            ).map((child) => child.id);
        }
        state.nodeSelectionForCopy = nodeSelectionForCopy;
    });

    builder.addCase(SET_MODIFICATIONS_DRAWER_OPEN, (state, action: SetModificationsDrawerOpenAction) => {
        state.isModificationsDrawerOpen = action.isModificationsDrawerOpen;

        // exclusively open between two components
        if (action.isModificationsDrawerOpen && state.isEventScenarioDrawerOpen) {
            state.isEventScenarioDrawerOpen = !state.isEventScenarioDrawerOpen;
        }
    });

    builder.addCase(SET_EVENT_SCENARIO_DRAWER_OPEN, (state, action: SetEventScenarioDrawerOpenAction) => {
        state.isEventScenarioDrawerOpen = action.isEventScenarioDrawerOpen;

        // exclusively open between two components
        if (action.isEventScenarioDrawerOpen && state.isModificationsDrawerOpen) {
            state.isModificationsDrawerOpen = !state.isModificationsDrawerOpen;
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
        let diagramStates = state.diagramStates;
        const diagramToOpenIndex = diagramStates.findIndex(
            (diagram) => diagram.id === action.id && diagram.svgType === action.svgType
        );

        // We check if the diagram to open is already in the diagramStates.
        if (diagramToOpenIndex >= 0) {
            console.info(
                'Diagram already opened : ' +
                    diagramStates[diagramToOpenIndex].id +
                    ' (' +
                    diagramStates[diagramToOpenIndex].svgType +
                    ')'
            );
        } else {
            diagramStates.push({
                id: action.id as UUID,
                svgType: action.svgType,
            });
        }

        state.diagramStates = diagramStates;

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
                voltageLevelIds: [action.id as UUID],
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
        const diagramStates = state.diagramStates;
        const uniqueIds = [...new Set(action.ids)];
        // remove all existing NAD from store, we replace them with lists passed as param
        const diagramStatesWithoutNad = diagramStates.filter((diagram) => !isNadType(diagram.svgType));

        state.diagramStates = diagramStatesWithoutNad.concat(
            uniqueIds.map((id) => ({
                id: id as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            }))
        );
        state.latestDiagramEvent = {
            diagramType: DiagramType.NETWORK_AREA_DIAGRAM,
            eventType: DiagramEventType.CREATE,
            voltageLevelIds: uniqueIds as UUID[],
        };

        // Switch to the grid layout in order to see the newly opened diagram
        if (
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE &&
            state.studyDisplayMode !== StudyDisplayMode.DIAGRAM_GRID_LAYOUT
        ) {
            state.studyDisplayMode = StudyDisplayMode.DIAGRAM_GRID_LAYOUT_AND_TREE;
        }
    });

    builder.addCase(RESET_NETWORK_AREA_DIAGRAM_DEPTH, (state, _action: ResetNetworkAreaDiagramDepthAction) => {
        state.networkAreaDiagramDepth = 0;
    });

    builder.addCase(INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH, (state, _action: IncrementNetworkAreaDiagramDepthAction) => {
        state.networkAreaDiagramDepth = state.networkAreaDiagramDepth + 1;
    });

    builder.addCase(DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH, (state, _action: DecrementNetworkAreaDiagramDepthAction) => {
        if (state.networkAreaDiagramDepth > 0) {
            state.networkAreaDiagramDepth = state.networkAreaDiagramDepth - 1;
        }
    });

    builder.addCase(
        STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT,
        (state, action: StoreNetworkAreaDiagramNodeMovementAction) => {
            const correspondingMovement: NadNodeMovement[] = state.nadNodeMovements.filter(
                (movement) => movement.diagramId === action.diagramId && movement.equipmentId === action.equipmentId
            );
            if (correspondingMovement.length === 0) {
                state.nadNodeMovements.push({
                    diagramId: action.diagramId,
                    equipmentId: action.equipmentId,
                    x: action.x,
                    y: action.y,
                    scalingFactor: action.scalingFactor,
                });
            } else {
                correspondingMovement[0].x = action.x;
                correspondingMovement[0].y = action.y;
                correspondingMovement[0].scalingFactor = action.scalingFactor;
            }
        }
    );

    builder.addCase(
        STORE_NETWORK_AREA_DIAGRAM_TEXT_NODE_MOVEMENT,
        (state, action: StoreNetworkAreaDiagramTextNodeMovementAction) => {
            const correspondingMovement: NadTextMovement[] = state.nadTextNodeMovements.filter(
                (movement) => movement.diagramId === action.diagramId && movement.equipmentId === action.equipmentId
            );
            if (correspondingMovement.length === 0) {
                state.nadTextNodeMovements.push({
                    diagramId: action.diagramId,
                    equipmentId: action.equipmentId,
                    shiftX: action.shiftX,
                    shiftY: action.shiftY,
                    connectionShiftX: action.connectionShiftX,
                    connectionShiftY: action.connectionShiftY,
                });
            } else {
                correspondingMovement[0].shiftX = action.shiftX;
                correspondingMovement[0].shiftY = action.shiftY;
                correspondingMovement[0].connectionShiftX = action.connectionShiftX;
                correspondingMovement[0].connectionShiftY = action.connectionShiftY;
            }
        }
    );

    builder.addCase(
        NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
        (state, action: NetworkAreaDiagramNbVoltageLevelsAction) => {
            state.networkAreaDiagramNbVoltageLevels = action.nbVoltageLevels;
        }
    );

    builder.addCase(LOAD_EQUIPMENTS, (state, action: LoadEquipmentsAction) => {
        Object.entries(action.spreadsheetEquipmentByNodes.equipmentsByNodeId).forEach(([nodeId, equipments]) => {
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
        // it will be modified when the notifications received after a network modification will be more precise
        const updatedEquipments = action.equipments;

        // equipmentType : type of equipment updated
        // equipments : list of updated equipments of type <equipmentType>
        for (const [updateType, equipments] of Object.entries(updatedEquipments) as [
            EquipmentUpdateType,
            Identifiable[],
        ][]) {
            const equipmentType = getEquipmentTypeFromUpdateType(updateType);
            const currentEquipment: Identifiable[] | undefined =
                // @ts-expect-error TODO manage undefined value case
                state.spreadsheetNetwork[equipmentType]?.equipmentsByNodeId[action.nodeId];

            // Format the updated equipments to match the table format
            const formattedEquipments = mapSpreadsheetEquipments(
                // @ts-expect-error TODO manage undefined value case
                equipmentType,
                equipments
            );

            // if the <equipmentType> equipments are not loaded into the store yet, we don't have to update them
            if (currentEquipment != null) {
                //since substations data contains voltage level ones, they have to be treated separately
                if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
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
                    // @ts-expect-error TODO manage undefined value case
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
                if (equipmentToDeleteType === EQUIPMENT_TYPES.VOLTAGE_LEVEL) {
                    const currentSubstations = state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION].equipmentsByNodeId[
                        action.nodeId
                    ] as Substation[] | null;
                    if (currentSubstations != null) {
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION].equipmentsByNodeId[action.nodeId] =
                            updateSubstationAfterVLDeletion(currentSubstations, equipmentToDeleteId);
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

    builder.addCase(RESET_EQUIPMENTS_POST_LOADFLOW, (state, _action: ResetEquipmentsPostLoadflowAction) => {
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
}

function getEquipmentTypeFromUpdateType(updateType: EquipmentUpdateType): EQUIPMENT_TYPES | undefined {
    switch (updateType) {
        case 'lines':
            return EQUIPMENT_TYPES.LINE;
        case 'tieLines':
            return EQUIPMENT_TYPES.TIE_LINE;
        case 'twoWindingsTransformers':
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
        case 'threeWindingsTransformers':
            return EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER;
        case 'generators':
            return EQUIPMENT_TYPES.GENERATOR;
        case 'loads':
            return EQUIPMENT_TYPES.LOAD;
        case 'batteries':
            return EQUIPMENT_TYPES.BATTERY;
        case 'danglingLines':
            return EQUIPMENT_TYPES.DANGLING_LINE;
        case 'hvdcLines':
            return EQUIPMENT_TYPES.HVDC_LINE;
        case 'lccConverterStations':
            return EQUIPMENT_TYPES.LCC_CONVERTER_STATION;
        case 'vscConverterStations':
            return EQUIPMENT_TYPES.VSC_CONVERTER_STATION;
        case 'shuntCompensators':
            return EQUIPMENT_TYPES.SHUNT_COMPENSATOR;
        case 'staticVarCompensators':
            return EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR;
        case 'voltageLevels':
            return EQUIPMENT_TYPES.VOLTAGE_LEVEL;
        case 'substations':
            return EQUIPMENT_TYPES.SUBSTATION;
        case 'buses':
            return EQUIPMENT_TYPES.BUS;
        case 'busbarSections':
            return EQUIPMENT_TYPES.BUSBAR_SECTION;
        default:
            return;
    }
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
