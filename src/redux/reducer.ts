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
    CENTER_ON_SUBSTATION,
    CenterOnSubstationAction,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    CHANGE_LOCKED_COLUMNS_NAMES,
    CHANGE_REORDERED_COLUMNS,
    ChangeDisplayedColumnsNamesAction,
    ChangeLockedColumnsNamesAction,
    ChangeReorderedColumnsAction,
    CLOSE_DIAGRAM,
    CLOSE_DIAGRAMS,
    CLOSE_STUDY,
    CloseDiagramAction,
    CloseDiagramsAction,
    CloseStudyAction,
    CURRENT_TREE_NODE,
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
    LIMIT_REDUCTION,
    LIMIT_REDUCTION_MODIFIED,
    LimitReductionAction,
    LimitReductionModifiedAction,
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
    MINIMIZE_DIAGRAM,
    MinimizeDiagramAction,
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
    REMOVE_CUSTOM_COLUMNS_DEFINITION,
    REMOVE_NOTIFICATION_BY_NODE,
    RemoveCustomColumnsDefinitionsAction,
    RemoveNotificationByNodeAction,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_BY_TYPES,
    RESET_EQUIPMENTS_POST_LOADFLOW,
    RESET_LOGS_FILTER,
    RESET_MAP_RELOADED,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    ResetEquipmentsAction,
    ResetEquipmentsByTypesAction,
    ResetEquipmentsPostLoadflowAction,
    ResetLogsFilterAction,
    ResetMapReloadedAction,
    ResetNetworkAreaDiagramDepthAction,
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
    SET_COMPUTATION_STARTING,
    SET_COMPUTING_STATUS,
    SET_EVENT_SCENARIO_DRAWER_OPEN,
    SET_FULLSCREEN_DIAGRAM,
    SET_LAST_COMPLETED_COMPUTATION,
    SET_MODIFICATIONS_DRAWER_OPEN,
    SET_MODIFICATIONS_IN_PROGRESS,
    SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
    SET_OPTIONAL_SERVICES,
    SET_PARAMS_LOADED,
    SET_STUDY_DISPLAY_MODE,
    SET_STUDY_INDEXATION_STATUS,
    SetComputationStartingAction,
    SetComputingStatusAction,
    SetEventScenarioDrawerOpenAction,
    SetFullscreenDiagramAction,
    SetLastCompletedComputationAction,
    SetModificationsDrawerOpenAction,
    SetModificationsInProgressAction,
    SetOneBusShortcircuitAnalysisDiagramAction,
    SetOptionalServicesAction,
    SetParamsLoadedAction,
    SetStudyDisplayModeAction,
    SetStudyIndexationStatusAction,
    SHORTCIRCUIT_ANALYSIS_RESULT_FILTER,
    ShortcircuitAnalysisResultFilterAction,
    SPREADSHEET_FILTER,
    SpreadsheetFilterAction,
    STATEESTIMATION_RESULT_FILTER,
    StateEstimationResultFilterAction,
    STOP_DIAGRAM_BLINK,
    StopDiagramBlinkAction,
    STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT,
    StoreNetworkAreaDiagramNodeMovementAction,
    STUDY_UPDATED,
    StudyUpdatedAction,
    TABLE_SORT,
    TableSortAction,
    TOGGLE_PIN_DIAGRAM,
    TogglePinDiagramAction,
    UPDATE_CUSTOM_COLUMNS_DEFINITION,
    UPDATE_EQUIPMENTS,
    UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
    UPDATE_TABLE_DEFINITION,
    UpdateCustomColumnsDefinitionsAction,
    UpdateEquipmentsAction,
    UpdateNetworkVisualizationParametersAction,
    UpdateTableDefinitionAction,
    USE_NAME,
    UseNameAction,
} from './actions';
import {
    getLocalStorageComputedLanguage,
    getLocalStorageLanguage,
    getLocalStorageTheme,
    saveLocalStorageLanguage,
    saveLocalStorageTheme,
} from './session-storage/local-storage';
import {
    type GenericTablesColumnsNames,
    type GenericTablesColumnsNamesJson,
    type GenericTablesDefinitionIndexes,
    type GenericTablesDefinitions,
    type GenericTablesDefinitionTypes,
    type GenericTablesNames,
    type GenericTablesNamesIndexes,
    TABLES_COLUMNS_NAMES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
    type TablesDefinitionsNames,
} from '../components/spreadsheet/config/config-tables';
import {
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
    MAP_BASEMAP_MAPBOX,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_COMPUTED_LANGUAGE,
    PARAM_DEVELOPER_MODE,
    PARAM_DIAGONAL_LABEL,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_INIT_NAD_WITH_GEO_DATA,
    PARAM_LANGUAGE,
    PARAM_LIMIT_REDUCTION,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAMS_LOADED,
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { loadDiagramStateFromSessionStorage } from './session-storage/diagram-state';
import { DiagramType, SubstationLayout, ViewState } from '../components/diagrams/diagram-common';
import { getAllChildren } from 'components/graph/util/model-functions';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { NodeInsertModes } from '../components/graph/nodes/node-insert-modes';
import { IOptionalService, OptionalServicesNames, OptionalServicesStatus } from '../components/utils/optional-services';
import { formatFetchedEquipments } from 'components/spreadsheet/utils/equipment-table-utils';
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
import { Filter } from '../components/results/common/results-global-filter';
import { LineFlowColorMode, LineFlowMode } from '@powsybl/network-viewer';
import type { UnknownArray, ValueOf } from 'type-fest';
import { Node } from '@xyflow/react';
import { CopyType, StudyDisplayMode } from '../components/network-modification.type';
import { CustomEntry } from 'types/custom-columns.types';
import { NetworkModificationNodeData, NodeType, RootNodeData } from '../components/graph/tree-node.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../utils/report/report.constant';
import { BUILD_STATUS } from '../components/network/constants';
import GSMapEquipments from 'components/network/gs-map-equipments';
import { SpreadsheetEquipmentType, SpreadsheetTabDefinition } from '../components/spreadsheet/config/spreadsheet.type';
import { NetworkVisualizationParameters } from '../components/dialogs/parameters/network-visualizations/network-visualizations.types';
import { FilterConfig, SortConfig, SortWay } from '../types/custom-aggrid-types';

export enum NotificationType {
    STUDY = 'study',
    COMPUTATION_PARAMETERS_UPDATED = 'computationParametersUpdated',
    NETWORK_VISUALIZATION_PARAMETERS_UPDATED = 'networkVisualizationParametersUpdated',
}

export enum StudyIndexationStatus {
    NOT_INDEXED = 'NOT_INDEXED',
    INDEXING_ONGOING = 'INDEXING_ONGOING',
    INDEXED = 'INDEXED',
}

export interface OneBusShortCircuitAnalysisDiagram {
    diagramId: string;
    nodeId: UUID;
}

// Headers
export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    parentNode: UUID;
    timestamp: number;
    updateType?: string;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
    computationType?: ComputingType;
}

// Payloads
export interface DeletedEquipment {
    equipmentId: string;
    equipmentType: string;
}

export interface NetworkImpactsInfos {
    impactedSubstationsIds: UUID[];
    deletedEquipments: DeletedEquipment[];
    impactedElementTypes: string[];
}
// EventData
export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: NetworkImpactsInfos;
}

interface StudyUpdatedEventDataUnknown {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

// Notification types
type StudyUpdatedStudy = {
    type: NotificationType.STUDY;
    eventData: StudyUpdatedEventData;
};

type StudyUpdatedUndefined = {
    type: undefined;
    eventData: StudyUpdatedEventDataUnknown;
};

// Redux state
export type StudyUpdated = {
    force: number; //IntRange<0, 1>;
} & (StudyUpdatedUndefined | StudyUpdatedStudy);

type NodeCommonData = {
    label: string;
    globalBuildStatus?: BUILD_STATUS;
    description?: string;
    readOnly?: boolean;
};
export type ReactFlowModificationNodeData = NodeCommonData & { localBuildStatus?: BUILD_STATUS };

export type ModificationNode = Node<ReactFlowModificationNodeData, NodeType.NETWORK_MODIFICATION> & {
    id: UUID;
};

export type ReactFlowRootNodeData = NodeCommonData & { caseName?: string };
export type RootNode = Node<ReactFlowRootNodeData, NodeType.ROOT> & { id: UUID };

export type CurrentTreeNode = ModificationNode | RootNode;

// type guard to check if the node is a Root
export function isReactFlowRootNodeData(node: CurrentTreeNode): node is RootNode {
    return node.type === NodeType.ROOT;
}

export interface ComputingStatus {
    [ComputingType.LOAD_FLOW]: RunningStatus;
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus;
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus;
    [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT]: RunningStatus;
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus;
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus;
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

export type SpreadsheetFilterState = Record<string, FilterConfig[]>;

export type DiagramState = {
    id: UUID;
    svgType: DiagramType;
    state: ViewState;
    needsToBlink?: boolean;
};

export type NadNodeMovement = {
    nadIdentifier: string;
    equipmentId: string;
    x: number;
    y: number;
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

export interface AppState extends CommonStoreState {
    signInCallbackError: Error | null;
    authenticationRouterError: AuthenticationRouterErrorState | null;
    showAuthenticationRouterLogin: boolean;

    studyUpdated: StudyUpdated;
    studyUuid: UUID | null;
    currentTreeNode: CurrentTreeNode | null;
    computingStatus: ComputingStatus;
    lastCompletedComputation: ComputingType | null;
    computationStarting: boolean;
    optionalServices: IOptionalService[];
    oneBusShortCircuitAnalysisDiagram: OneBusShortCircuitAnalysisDiagram | null;
    notificationIdList: UUID[];
    nonEvacuatedEnergyNotif: boolean;
    recentGlobalFilters: Filter[];
    mapEquipments: GSMapEquipments | null;
    networkAreaDiagramNbVoltageLevels: number;
    networkAreaDiagramDepth: number;
    studyDisplayMode: StudyDisplayMode;
    studyIndexationStatus: StudyIndexationStatus;
    tableSort: TableSort;
    tables: TablesState;

    limitReductionModified: boolean;
    nodeSelectionForCopy: NodeSelectionForCopy;
    geoData: null;
    networkModificationTreeModel: NetworkModificationTreeModel | null;
    mapDataLoading: boolean;
    diagramStates: DiagramState[];
    nadNodeMovements: NadNodeMovement[];
    fullScreenDiagram: null | {
        id: string;
        svgType?: DiagramType;
    };
    allLockedColumnsNames: string[];
    allReorderedTableDefinitionIndexes: string[];
    isExplorerDrawerOpen: boolean;
    isModificationsDrawerOpen: boolean;
    isEventScenarioDrawerOpen: boolean;
    centerOnSubstation: null | {
        to: unknown;
    };
    isModificationsInProgress: boolean;
    reloadMap: boolean;
    isMapEquipmentsInitialized: boolean;
    spreadsheetNetwork: SpreadsheetNetworkState;
    networkVisualizationsParameters: NetworkVisualizationParameters;

    [PARAM_THEME]: GsTheme;
    [PARAM_LANGUAGE]: GsLang;
    [PARAM_COMPUTED_LANGUAGE]: GsLangUser;
    [PARAM_LIMIT_REDUCTION]: number;
    [PARAM_USE_NAME]: boolean;
    [PARAM_LINE_FULL_PATH]: boolean;
    [PARAM_LINE_PARALLEL_PATH]: boolean;
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: number;
    [PARAM_MAP_MANUAL_REFRESH]: boolean;
    [PARAM_MAP_BASEMAP]: typeof MAP_BASEMAP_MAPBOX | typeof MAP_BASEMAP_CARTO | typeof MAP_BASEMAP_CARTO_NOLABEL; //TODO enum
    [PARAM_LINE_FLOW_MODE]: LineFlowMode;
    [PARAM_LINE_FLOW_COLOR_MODE]: LineFlowColorMode;
    [PARAM_CENTER_LABEL]: boolean;
    [PARAM_DIAGONAL_LABEL]: boolean;
    [PARAM_SUBSTATION_LAYOUT]: SubstationLayout;
    [PARAM_COMPONENT_LIBRARY]: unknown | null;
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: UnknownArray;
    [PARAM_DEVELOPER_MODE]: boolean;
    [PARAM_INIT_NAD_WITH_GEO_DATA]: boolean;
    [PARAMS_LOADED]: boolean;

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
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.VOLTAGE_INITIALIZATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.STATE_ESTIMATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NON_EVACUATED_ENERGY_ANALYSIS]: [],
};

export type SpreadsheetNetworkState = Record<SpreadsheetEquipmentType, Identifiable[] | null>;
const initialSpreadsheetNetworkState: SpreadsheetNetworkState = {
    [EQUIPMENT_TYPES.SUBSTATION]: null,
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: null,
    [EQUIPMENT_TYPES.LINE]: null,
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: null,
    [EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER]: null,
    [EQUIPMENT_TYPES.GENERATOR]: null,
    [EQUIPMENT_TYPES.LOAD]: null,
    [EQUIPMENT_TYPES.BATTERY]: null,
    [EQUIPMENT_TYPES.DANGLING_LINE]: null,
    [EQUIPMENT_TYPES.TIE_LINE]: null,
    [EQUIPMENT_TYPES.HVDC_LINE]: null,
    [EQUIPMENT_TYPES.LCC_CONVERTER_STATION]: null,
    [EQUIPMENT_TYPES.VSC_CONVERTER_STATION]: null,
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: null,
    [EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR]: null,
    [EQUIPMENT_TYPES.BUS]: null,
    [EQUIPMENT_TYPES.BUSBAR_SECTION]: null,
};

export type TypeOfArrayElement<T> = T extends (infer U)[] ? U : never;

interface TablesState {
    definitions: GenericTablesDefinitions;
    columnsNames: GenericTablesColumnsNames;
    columnsNamesJson: GenericTablesColumnsNamesJson;
    names: GenericTablesNames;
    namesIndexes: GenericTablesNamesIndexes;
    definitionTypes: GenericTablesDefinitionTypes;
    definitionIndexes: GenericTablesDefinitionIndexes;
    allCustomColumnsDefinitions: Record<TypeOfArrayElement<GenericTablesNames>, CustomEntry>;
}

const TableDefinitionIndexes = new Map(TABLES_DEFINITIONS.map((tabDef) => [tabDef.index, tabDef]));
const TableDefinitionTypes = new Map(TABLES_DEFINITIONS.map((tabDef) => [tabDef.type, tabDef]));
const initialTablesState: TablesState = {
    definitions: TABLES_DEFINITIONS,
    columnsNames: TABLES_COLUMNS_NAMES,
    columnsNamesJson: TABLES_COLUMNS_NAMES.map((cols) => JSON.stringify([...cols])),
    names: TABLES_NAMES,
    namesIndexes: new Map(TABLES_DEFINITIONS.map((tabDef) => [tabDef.name, tabDef.index])),
    definitionTypes: TableDefinitionTypes,
    definitionIndexes: TableDefinitionIndexes,
    allCustomColumnsDefinitions: TABLES_NAMES.reduce(
        (acc, columnName) => ({ ...acc, [columnName]: { columns: [], filter: { formula: '' } } }),
        {} as Record<TablesDefinitionsNames, CustomEntry>
    ),
};

const initialState: AppState = {
    studyUuid: null,
    currentTreeNode: null,
    nodeSelectionForCopy: {
        sourceStudyUuid: null,
        nodeId: null,
        copyType: null,
        allChildrenIds: null,
    },
    tables: initialTablesState,
    mapEquipments: null,
    geoData: null,
    networkModificationTreeModel: new NetworkModificationTreeModel(),
    computedLanguage: getLocalStorageComputedLanguage(),
    user: null,
    signInCallbackError: null,
    authenticationRouterError: null,
    showAuthenticationRouterLogin: false,
    // @ts-expect-error TODO can't have empty eventData here
    studyUpdated: { force: 0, eventData: {} },
    mapDataLoading: false,
    fullScreenDiagram: null,
    allLockedColumnsNames: [],
    allReorderedTableDefinitionIndexes: [],
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    isEventScenarioDrawerOpen: false,
    centerOnSubstation: null,
    notificationIdList: [],
    isModificationsInProgress: false,
    studyDisplayMode: StudyDisplayMode.HYBRID,
    diagramStates: [],
    nadNodeMovements: [],
    reloadMap: true,
    isMapEquipmentsInitialized: false,
    networkAreaDiagramDepth: 0,
    networkAreaDiagramNbVoltageLevels: 0,
    spreadsheetNetwork: { ...initialSpreadsheetNetworkState },
    computingStatus: {
        [ComputingType.LOAD_FLOW]: RunningStatus.IDLE,
        [ComputingType.SECURITY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus.IDLE,
        [ComputingType.SHORT_CIRCUIT]: RunningStatus.IDLE,
        [ComputingType.SHORT_CIRCUIT_ONE_BUS]: RunningStatus.IDLE,
        [ComputingType.DYNAMIC_SIMULATION]: RunningStatus.IDLE,
        [ComputingType.VOLTAGE_INITIALIZATION]: RunningStatus.IDLE,
        [ComputingType.STATE_ESTIMATION]: RunningStatus.IDLE,
    },
    computationStarting: false,
    optionalServices: (Object.keys(OptionalServicesNames) as OptionalServicesNames[]).map((key) => ({
        name: key,
        status: OptionalServicesStatus.Pending,
    })),
    oneBusShortCircuitAnalysisDiagram: null,
    studyIndexationStatus: StudyIndexationStatus.NOT_INDEXED,
    limitReductionModified: false,

    // params
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
    [PARAM_LINE_PARALLEL_PATH]: true,
    [PARAM_LIMIT_REDUCTION]: 100,
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 100,
    [PARAM_MAP_MANUAL_REFRESH]: false,
    [PARAM_MAP_BASEMAP]: MAP_BASEMAP_MAPBOX,
    [PARAM_LINE_FLOW_MODE]: 'feeders' as LineFlowMode.FEEDERS, // because jest not support enum
    [PARAM_LINE_FLOW_COLOR_MODE]: 'nominalVoltage' as LineFlowColorMode.NOMINAL_VOLTAGE, // because jest not support enum
    [PARAM_CENTER_LABEL]: false,
    [PARAM_DIAGONAL_LABEL]: false,
    [PARAM_SUBSTATION_LAYOUT]: SubstationLayout.HORIZONTAL,
    [PARAM_COMPONENT_LIBRARY]: null,
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: [],
    [PARAM_DEVELOPER_MODE]: false,
    [PARAM_INIT_NAD_WITH_GEO_DATA]: true,
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
    [SPREADSHEET_STORE_FIELD]: Object.values(initialTablesState.definitions)
        .map((tabDef) => tabDef.name)
        .reduce((acc, tabName) => ({ ...acc, [tabName]: [] }), {}),

    [LOGS_STORE_FIELD]: { ...initialLogsFilterState },

    [TABLE_SORT_STORE]: {
        [SPREADSHEET_SORT_STORE]: Object.values(initialTablesState.definitions)
            .map((tabDef) => tabDef.name)
            .reduce((acc, tabName) => {
                acc[tabName] = [
                    {
                        colId: 'id',
                        sort: SortWay.ASC,
                    },
                ];
                return acc;
            }, {} as TableSortConfig),
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
        let newMapEquipments;
        //if it's not initialised yet we take the empty one given in action
        if (!state.mapEquipments) {
            newMapEquipments = action.mapEquipments.newMapEquipmentForUpdate() as GSMapEquipments;
        } else {
            newMapEquipments = state.mapEquipments.newMapEquipmentForUpdate() as GSMapEquipments;
        }
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

    builder.addCase(UPDATE_TABLE_DEFINITION, (state, action: UpdateTableDefinitionAction) => {
        const { newTableDefinition, customColumns } = action.payload;
        const updatedDefinitions = [...state.tables.definitions];
        updatedDefinitions.push(newTableDefinition as Draft<SpreadsheetTabDefinition>);
        const updatedColumnsNames = updatedDefinitions
            .map((tabDef) => tabDef.columns)
            .map((cols) => new Set(cols.map((c) => c.id)));
        const updatedColumnsNamesJson = updatedColumnsNames.map((cols) => JSON.stringify([...cols]));
        const updatedNames = updatedDefinitions.map((tabDef) => tabDef.name);
        const updatedNamesIndexes = new Map(updatedDefinitions.map((tabDef) => [tabDef.name, tabDef.index]));
        const updatedDefinitionTypes = new Map(updatedDefinitions.map((tabDef) => [tabDef.type, tabDef]));
        const updatedDefinitionIndexes = new Map(updatedDefinitions.map((tabDef) => [tabDef.index, tabDef]));
        const updatedAllCustomColumnsDefinitions = {
            ...state.tables.allCustomColumnsDefinitions,
            [newTableDefinition.name]: {
                columns: customColumns,
                filter: {
                    formula: '',
                },
            },
        };
        state.tables = {
            definitions: updatedDefinitions,
            columnsNames: updatedColumnsNames,
            columnsNamesJson: updatedColumnsNamesJson,
            names: updatedNames,
            namesIndexes: updatedNamesIndexes,
            definitionTypes: updatedDefinitionTypes,
            definitionIndexes: updatedDefinitionIndexes,
            allCustomColumnsDefinitions: updatedAllCustomColumnsDefinitions,
        };
    });

    builder.addCase(
        LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
        (state, action: LoadNetworkModificationTreeSuccessAction) => {
            state.networkModificationTreeModel = action.networkModificationTreeModel;
            state.networkModificationTreeModel.setBuildingStatus();
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
                    state.reloadMap = true;
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

    builder.addCase(LIMIT_REDUCTION, (state, action: LimitReductionAction) => {
        state[PARAM_LIMIT_REDUCTION] = action[PARAM_LIMIT_REDUCTION];
    });

    builder.addCase(LIMIT_REDUCTION_MODIFIED, (state, action: LimitReductionModifiedAction) => {
        state.limitReductionModified = action.limitReductionModified;
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

    builder.addCase(RESET_MAP_RELOADED, (state, _action: ResetMapReloadedAction) => {
        state.reloadMap = false;
    });

    builder.addCase(MAP_EQUIPMENTS_INITIALIZED, (state, action: MapEquipmentsInitializedAction) => {
        state.isMapEquipmentsInitialized = action.newValue;
    });

    builder.addCase(SET_FULLSCREEN_DIAGRAM, (state, action: SetFullscreenDiagramAction) => {
        state.fullScreenDiagram = action.diagramId
            ? {
                  id: action.diagramId,
                  svgType: action.svgType,
              }
            : null;
    });

    builder.addCase(CHANGE_DISPLAYED_COLUMNS_NAMES, (state, action: ChangeDisplayedColumnsNamesAction) => {
        const newDisplayedColumnsNames = [...state.tables.columnsNamesJson];
        action.displayedColumnsNamesParams.forEach((param) => {
            if (param) {
                newDisplayedColumnsNames[param.index] = param.value;
            }
        });
        state.tables.columnsNamesJson = newDisplayedColumnsNames;
    });

    builder.addCase(CHANGE_LOCKED_COLUMNS_NAMES, (state, action: ChangeLockedColumnsNamesAction) => {
        let newLockedColumnsNames = [...state.allLockedColumnsNames];
        action.lockedColumnsNamesParams.forEach((param) => {
            if (param) {
                newLockedColumnsNames[param.index] = param.value;
            }
        });
        state.allLockedColumnsNames = newLockedColumnsNames;
    });

    builder.addCase(CHANGE_REORDERED_COLUMNS, (state, action: ChangeReorderedColumnsAction) => {
        let newReorderedColumns = [...state.allReorderedTableDefinitionIndexes];
        action.reorderedColumnsParams.forEach((param) => {
            if (param) {
                newReorderedColumns[param.index] = param.value;
            }
        });
        state.allReorderedTableDefinitionIndexes = newReorderedColumns;
    });

    builder.addCase(FAVORITE_CONTINGENCY_LISTS, (state, action: FavoriteContingencyListsAction) => {
        state[PARAM_FAVORITE_CONTINGENCY_LISTS] = action[PARAM_FAVORITE_CONTINGENCY_LISTS];
    });

    builder.addCase(CURRENT_TREE_NODE, (state, action: CurrentTreeNodeAction) => {
        state.currentTreeNode = action.currentTreeNode;
        state.reloadMap = true;
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
                state.reloadMap = false;
            }

            state.studyDisplayMode = action.studyDisplayMode;
        }
    });

    /*
     * The following functions' goal are to update state.diagramStates with nodes of the following type :
     * { id: 'diagramID', svgType: 'SvgType of the diagram', state: 'ViewState of the diagram' }
     *
     * Depending on the diagram's svgType, the state.diagramStates is different.
     * For Network Area Diagrams (SvgType.NETWORK_AREA_DIAGRAM), all the states should be the same.
     * As an example, if one is PINNED, then all of them should be.
     * For Single Line Diagrams (SvgType.VOLTAGE_LEVEL or SvgType.SUBSTATION), each diagram has its own state.
     */
    builder.addCase(OPEN_DIAGRAM, (state, action: OpenDiagramAction) => {
        const diagramStates = state.diagramStates;
        const diagramToOpenIndex = diagramStates.findIndex(
            (diagram) => diagram.id === action.id && diagram.svgType === action.svgType
        );

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // First, we check if there is already a Network Area Diagram in the diagramStates.
            const firstNadIndex = diagramStates.findIndex(
                (diagram) => diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM
            );
            if (firstNadIndex < 0) {
                // If there is no NAD, then we add the new one.
                diagramStates.push({
                    id: action.id as UUID,
                    svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    state: ViewState.OPENED,
                });

                // If there is already a diagram in fullscreen mode, the new opened NAD will take its place.
                if (state.fullScreenDiagram?.id) {
                    state.fullScreenDiagram = {
                        id: action.id,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    };
                }
            } else {
                // If there is already at least one NAD, and if it is minimized, then we change all of them to opened.
                if (diagramStates[firstNadIndex].state === ViewState.MINIMIZED) {
                    diagramStates.forEach((diagram) => {
                        if (diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                            diagram.state = ViewState.OPENED;
                        }
                    });
                }
                // If the NAD to open is not already in the diagramStates, we add it.
                if (diagramToOpenIndex < 0) {
                    diagramStates.push({
                        id: action.id as UUID,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                        state: diagramStates[firstNadIndex].state,
                    });
                }

                // If there is a SLD in fullscreen, we have to display in fullscreen the new NAD.
                // Because it is the first NAD displayed that counts for the fullscreen status, we put the fist nad's id there.
                if (
                    state.fullScreenDiagram?.svgType &&
                    state.fullScreenDiagram?.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
                ) {
                    state.fullScreenDiagram = {
                        id: diagramStates[firstNadIndex].id,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    };
                }
            }
        } else {
            // We check if the SLD to open is already in the diagramStates.
            if (diagramToOpenIndex >= 0) {
                // If the SLD to open is already in the diagramStates and it is minimized, then we change it to opened.
                if (diagramStates[diagramToOpenIndex].state === ViewState.MINIMIZED) {
                    // We minimize all the other OPENED SLD.
                    diagramStates.forEach((diagram) => {
                        if (
                            diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagram.state === ViewState.OPENED
                        ) {
                            diagram.state = ViewState.MINIMIZED;
                        }
                    });
                    const diagramToOpen = diagramStates[diagramToOpenIndex];

                    // We open and push the SLD to the last position in the array, so it is displayed at the right of the others
                    diagramToOpen.state = ViewState.OPENED;
                    diagramStates.splice(diagramToOpenIndex, 1);
                    diagramStates.push(diagramToOpen);
                } else {
                    console.info(
                        'Diagram already opened : ' +
                            diagramStates[diagramToOpenIndex].id +
                            ' (' +
                            diagramStates[diagramToOpenIndex].svgType +
                            ')'
                    );
                    diagramStates[diagramToOpenIndex].needsToBlink = true;
                }
            } else {
                // We minimize all the other OPENED SLD.
                diagramStates.forEach((diagram) => {
                    if (diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM && diagram.state === ViewState.OPENED) {
                        diagram.state = ViewState.MINIMIZED;
                    }
                });
                // And we add the new one.
                diagramStates.push({
                    id: action.id as UUID,
                    svgType: action.svgType,
                    state: ViewState.OPENED,
                });
            }

            // If there is already a diagram in fullscreen mode, the new opened SLD will take its place.
            if (state.fullScreenDiagram?.id) {
                state.fullScreenDiagram = {
                    id: action.id,
                    svgType: action.svgType,
                };
            }
        }
        state.diagramStates = diagramStates;
    });

    builder.addCase(OPEN_NAD_LIST, (state, action: OpenNadListAction) => {
        const diagramStates = state.diagramStates;
        const uniqueIds = [...new Set(action.ids)];
        // remove all existing NAD from store, we replace them with lists passed as param
        const diagramStatesWithoutNad = diagramStates.filter(
            (diagram) => diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
        );

        state.diagramStates = diagramStatesWithoutNad.concat(
            uniqueIds.map((id) => ({
                id: id as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            }))
        );
    });

    builder.addCase(MINIMIZE_DIAGRAM, (state, action: MinimizeDiagramAction) => {
        const diagramStates = state.diagramStates;

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // For network area diagrams, the ID is irrelevant, we will minimize all the NAD in the state.diagramStates.
            diagramStates.forEach((diagram) => {
                if (diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                    diagram.state = ViewState.MINIMIZED;
                }
            });
        } else {
            // For single line diagram, we will update the corresponding diagram.
            const diagramToMinimizeIndex = diagramStates.findIndex(
                (diagram) => diagram.id === action.id && diagram.svgType === action.svgType
            );
            if (diagramToMinimizeIndex >= 0) {
                diagramStates[diagramToMinimizeIndex].state = ViewState.MINIMIZED;
            }
        }
        state.diagramStates = diagramStates;
    });

    builder.addCase(TOGGLE_PIN_DIAGRAM, (state, action: TogglePinDiagramAction) => {
        const diagramStates = state.diagramStates;

        // search targeted diagram among the diagramStates
        const diagramToPinToggleIndex = diagramStates.findIndex(
            (diagram) => diagram.id === action.id && diagram.svgType === action.svgType
        );
        if (diagramToPinToggleIndex >= 0) {
            if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                // If the current NAD is PINNED, we set all NAD to OPENED. Otherwise, we set them to PINNED.
                const newStateForNads =
                    diagramStates[diagramToPinToggleIndex].state === ViewState.PINNED
                        ? ViewState.OPENED
                        : ViewState.PINNED;
                diagramStates.forEach((diagram) => {
                    if (diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                        diagram.state = newStateForNads;
                    }
                });
            } else {
                if (diagramStates[diagramToPinToggleIndex].state !== ViewState.PINNED) {
                    // If the current SLD is minimized or opened, we pin it.
                    diagramStates[diagramToPinToggleIndex].state = ViewState.PINNED;
                } else {
                    // If the current SLD is pinned, we check if there is already another SLD opened (there can only be one
                    // SLD opened -not pinned- at a time). If there is, then we minimize the current SLD. If none, we open it.
                    const currentlyOpenedDiagramIndex = diagramStates.findIndex(
                        (diagram) =>
                            diagram.state === ViewState.OPENED &&
                            (diagram.svgType === DiagramType.SUBSTATION ||
                                diagram.svgType === DiagramType.VOLTAGE_LEVEL)
                    );
                    if (currentlyOpenedDiagramIndex >= 0) {
                        diagramStates[diagramToPinToggleIndex].state = ViewState.MINIMIZED;
                    } else {
                        diagramStates[diagramToPinToggleIndex].state = ViewState.OPENED;
                    }
                }
            }
        }

        state.diagramStates = diagramStates;
    });

    builder.addCase(CLOSE_DIAGRAM, (state, action: CloseDiagramAction) => {
        let diagramStates = state.diagramStates;

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // If we close a NAD, we close all of them.
            diagramStates = diagramStates.filter((diagram) => diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM);
        } else {
            // If we close a SLD, we only remove one.
            const diagramToCloseIndex = diagramStates.findIndex(
                (diagram) => diagram.id === action.id && diagram.svgType === action.svgType
            );
            if (diagramToCloseIndex >= 0) {
                diagramStates.splice(diagramToCloseIndex, 1);
            }
        }

        state.diagramStates = diagramStates;
    });

    builder.addCase(CLOSE_DIAGRAMS, (state, action: CloseDiagramsAction) => {
        const idsToClose = new Set(action.ids);
        state.diagramStates = state.diagramStates.filter((diagram) => !idsToClose.has(diagram.id));
    });

    builder.addCase(STOP_DIAGRAM_BLINK, (state, _action: StopDiagramBlinkAction) => {
        state.diagramStates.forEach((diagram) => {
            if (diagram.needsToBlink) {
                diagram.needsToBlink = undefined;
            }
        });
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
                (movement) =>
                    movement.nadIdentifier === action.nadIdentifier && movement.equipmentId === action.equipmentId
            );
            if (correspondingMovement.length === 0) {
                state.nadNodeMovements.push({
                    nadIdentifier: action.nadIdentifier,
                    equipmentId: action.equipmentId,
                    x: action.x,
                    y: action.y,
                });
            } else {
                correspondingMovement[0].x = action.x;
                correspondingMovement[0].y = action.y;
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
        state.spreadsheetNetwork[action.equipmentType] = action.equipments;
    });

    builder.addCase(UPDATE_EQUIPMENTS, (state, action: UpdateEquipmentsAction) => {
        // for now, this action receives an object containing all equipments from a substation
        // it will be modified when the notifications received after a network modification will be more precise
        const updatedEquipments = action.equipments;

        // equipmentType : type of equipment updated
        // equipments : list of updated equipments of type <equipmentType>
        for (const [updateType, equipments] of Object.entries(updatedEquipments) as [
            EquipmentUpdateType,
            Identifiable[]
        ][]) {
            const equipmentType = getEquipmentTypeFromUpdateType(updateType);
            const currentEquipment: Identifiable[] | null =
                // @ts-expect-error TODO manage undefined value case
                state.spreadsheetNetwork[equipmentType];

            // Format the updated equipments to match the table format
            const formattedEquipments = formatFetchedEquipments(
                // @ts-expect-error TODO manage undefined value case
                equipmentType,
                equipments
            );

            // if the <equipmentType> equipments are not loaded into the store yet, we don't have to update them
            if (currentEquipment != null) {
                //since substations data contains voltage level ones, they have to be treated separately
                if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
                    const [updatedSubstations, updatedVoltageLevels] = updateSubstationsAndVoltageLevels(
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] as Substation[],
                        // @ts-expect-error TODO manage null value case
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL],
                        formattedEquipments
                    );

                    state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] = updatedSubstations;
                    state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL] = updatedVoltageLevels;
                } else {
                    // @ts-expect-error TODO manage undefined value case
                    state.spreadsheetNetwork[equipmentType] = updateEquipments(currentEquipment, formattedEquipments);
                }
            }
        }
    });

    builder.addCase(DELETE_EQUIPMENTS, (state, action: DeleteEquipmentsAction) => {
        action.equipments.forEach(({ equipmentType: equipmentToDeleteType, equipmentId: equipmentToDeleteId }) => {
            const currentEquipments = state.spreadsheetNetwork[equipmentToDeleteType];
            if (currentEquipments != null) {
                // in case of voltage level deletion, we need to update the linked substation which contains a list of its voltage levels
                if (equipmentToDeleteType === EQUIPMENT_TYPES.VOLTAGE_LEVEL) {
                    const currentSubstations = state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] as
                        | Substation[]
                        | null;
                    if (currentSubstations != null) {
                        state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] = updateSubstationAfterVLDeletion(
                            currentSubstations,
                            equipmentToDeleteId
                        );
                    }
                }

                state.spreadsheetNetwork[equipmentToDeleteType] = deleteEquipment(
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
            state.spreadsheetNetwork[equipmentType] = null;
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

    builder.addCase(SET_STUDY_INDEXATION_STATUS, (state, action: SetStudyIndexationStatusAction) => {
        state.studyIndexationStatus = action.studyIndexationStatus;
    });

    builder.addCase(ADD_TO_RECENT_GLOBAL_FILTERS, (state, action: AddToRecentGlobalFiltersAction) => {
        let newRecentGlobalFilters = [...state.recentGlobalFilters];
        action.globalFilters.forEach((filter) => {
            if (!newRecentGlobalFilters.some((obj) => obj.label === filter.label && obj.type === filter.type)) {
                newRecentGlobalFilters.push(filter);
            }
        });
        state.recentGlobalFilters = newRecentGlobalFilters;
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
        const { newTabName, value } = action.payload;
        state[SPREADSHEET_STORE_FIELD][newTabName] = value;
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
        const { newTabName, value } = action.payload;
        state.tableSort[SPREADSHEET_SORT_STORE][newTabName] = value;
    });

    builder.addCase(UPDATE_CUSTOM_COLUMNS_DEFINITION, (state, action: UpdateCustomColumnsDefinitionsAction) => {
        state.tables.allCustomColumnsDefinitions[action.table].columns = state.tables.allCustomColumnsDefinitions[
            action.table
        ].columns.some((column) => column.id === action.definition.id)
            ? state.tables.allCustomColumnsDefinitions[action.table].columns.map((column) =>
                  column.id === action.definition.id ? action.definition : column
              )
            : [...state.tables.allCustomColumnsDefinitions[action.table].columns, action.definition];
    });

    builder.addCase(REMOVE_CUSTOM_COLUMNS_DEFINITION, (state, action: RemoveCustomColumnsDefinitionsAction) => {
        state.tables.allCustomColumnsDefinitions[action.table].columns = state.tables.allCustomColumnsDefinitions[
            action.table
        ].columns.filter((column) => column.id !== action.definitionId);
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

export function getUpdateTypeFromEquipmentType(equipmentType: EQUIPMENT_TYPES): EquipmentUpdateType | undefined {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.LINE:
            return EquipmentUpdateType.LINES;
        case EQUIPMENT_TYPES.TIE_LINE:
            return EquipmentUpdateType.TIE_LINES;
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return EquipmentUpdateType.TWO_WINDINGS_TRANSFORMERS;
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
            return EquipmentUpdateType.THREE_WINDINGS_TRANSFORMERS;
        case EQUIPMENT_TYPES.GENERATOR:
            return EquipmentUpdateType.GENERATORS;
        case EQUIPMENT_TYPES.LOAD:
            return EquipmentUpdateType.LOADS;
        case EQUIPMENT_TYPES.BATTERY:
            return EquipmentUpdateType.BATTERIES;
        case EQUIPMENT_TYPES.DANGLING_LINE:
            return EquipmentUpdateType.DANGLING_LINES;
        case EQUIPMENT_TYPES.HVDC_LINE:
            return EquipmentUpdateType.HVDC_LINES;
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
            return EquipmentUpdateType.LCC_CONVERTER_STATIONS;
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
            return EquipmentUpdateType.VSC_CONVERTER_STATIONS;
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return EquipmentUpdateType.SHUNT_COMPENSATORS;
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
            return EquipmentUpdateType.STATIC_VAR_COMPENSATORS;
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            return EquipmentUpdateType.VOLTAGE_LEVELS;
        case EQUIPMENT_TYPES.SUBSTATION:
            return EquipmentUpdateType.SUBSTATIONS;
        case EQUIPMENT_TYPES.BUS:
            return EquipmentUpdateType.BUSES;
        case EQUIPMENT_TYPES.BUSBAR_SECTION:
            return EquipmentUpdateType.BUSBAR_SECTIONS;
        default:
            return;
    }
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
        (node) => node?.id === nextCurrentNodeUuid
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
