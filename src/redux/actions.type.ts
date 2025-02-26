import { Action } from 'redux';
import {
    ColumnDefinition,
    ColumnState,
    SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../components/spreadsheet/config/spreadsheet.type';
import { AuthenticationActions, GsLang, GsLangUser, GsTheme, Identifiable } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import {
    PARAM_DEVELOPER_MODE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAMS_LOADED,
} from '../utils/config-params';
import type { UnknownArray } from 'type-fest';
import { NetworkModificationNodeData, RootNodeData } from '../components/graph/tree-node.type';
import { NodeInsertModes } from '../components/graph/nodes/node-insert-modes';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_RESULT_STORE_FIELD,
    LOGS_STORE_FIELD,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
    STATEESTIMATION_RESULT_STORE_FIELD,
} from '../utils/store-sort-filter-fields';
import { FilterConfig, SortConfig } from '../types/custom-aggrid-types';
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import { NetworkVisualizationParameters } from '../components/dialogs/parameters/network-visualizations/network-visualizations.types';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { IOptionalService } from '../components/utils/optional-services';
import { ExpertFilter } from '../services/study/filter';
import { StudyDisplayMode } from '../components/network-modification.type';
import { Filter } from '../components/results/common/filter.type';
import ComputingType from '../components/computing-status/computing-type';
import RunningStatus from '../components/utils/running-status';
import {
    ADD_ADDITIONAL_EQUIPMENTS_BY_NODES_FOR_CUSTOM_COLUMNS,
    ADD_FILTER_FOR_NEW_SPREADSHEET,
    ADD_NOTIFICATION,
    ADD_SORT_FOR_NEW_SPREADSHEET,
    ADD_TO_RECENT_GLOBAL_FILTERS,
    CENTER_ON_SUBSTATION,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    CHANGE_LOCKED_COLUMNS_NAMES,
    CLOSE_DIAGRAM,
    CLOSE_DIAGRAMS,
    CLOSE_STUDY,
    CURRENT_ROOT_NETWORK,
    CURRENT_TREE_NODE,
    DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    DELETE_EQUIPMENTS,
    DYNAMIC_SIMULATION_RESULT_FILTER,
    ENABLE_DEVELOPER_MODE,
    FAVORITE_CONTINGENCY_LISTS,
    INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    LOAD_EQUIPMENTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    LOADFLOW_RESULT_FILTER,
    LOGS_FILTER,
    MAP_DATA_LOADING,
    MAP_EQUIPMENTS_CREATED,
    MAP_EQUIPMENTS_INITIALIZED,
    MINIMIZE_DIAGRAM,
    NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
    NETWORK_MODIFICATION_HANDLE_SUBTREE,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_REORDER,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
    NODE_SELECTION_FOR_COPY,
    OPEN_DIAGRAM,
    OPEN_NAD_LIST,
    OPEN_STUDY,
    REMOVE_COLUMN_DEFINITION,
    REMOVE_NODE_DATA,
    REMOVE_NOTIFICATION_BY_NODE,
    REMOVE_SELECTED_CASE,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_BY_TYPES,
    RESET_EQUIPMENTS_POST_LOADFLOW,
    RESET_LOGS_FILTER,
    RESET_MAP_EQUIPMENTS,
    RESET_MAP_RELOADED,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    SAVE_SPREADSHEET_GS_FILTER,
    SECURITY_ANALYSIS_RESULT_FILTER,
    SELECT_COMPUTED_LANGUAGE,
    SELECT_LANGUAGE,
    SELECT_THEME,
    SENSITIVITY_ANALYSIS_RESULT_FILTER,
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
    SHORTCIRCUIT_ANALYSIS_RESULT_FILTER,
    SPREADSHEET_FILTER,
    STATEESTIMATION_RESULT_FILTER,
    STOP_DIAGRAM_BLINK,
    STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT,
    STORE_NETWORK_AREA_DIAGRAM_TEXT_NODE_MOVEMENT,
    STUDY_UPDATED,
    TABLE_SORT,
    TOGGLE_PIN_DIAGRAM,
    UPDATE_COLUMNS_DEFINITION,
    UPDATE_CUSTOM_COLUMNS_NODES_ALIASES,
    UPDATE_EQUIPMENTS,
    UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
    UPDATE_TABLE_DEFINITION,
    USE_NAME,
} from './actions-fields';
import { DiagramType } from '../components/diagrams/diagram.type';
import {
    CurrentTreeNode,
    EquipmentUpdateType,
    NodeAlias,
    NodeSelectionForCopy,
    OneBusShortCircuitAnalysisDiagram,
    StudyIndexationStatus,
    StudyUpdatedEventData,
    TableSortKeysType,
} from './reducer.type';
import { AppState, IGSMapEquipments } from './app-state.type';

export type Actions = AppActions | AuthenticationActions;

export type AppActions =
    | LoadEquipmentsAction
    | UpdateEquipmentsAction
    | DeleteEquipmentsAction
    | ResetEquipmentsAction
    | ResetEquipmentsByTypesAction
    | ResetEquipmentsPostLoadflowAction
    | MapEquipmentsCreatedAction
    | LoadNetworkModificationTreeSuccessAction
    | NetworkModificationTreeNodeAddedAction
    | NetworkModificationTreeNodeMovedAction
    | NetworkModificationHandleSubtreeAction
    | NetworkModificationTreeNodesRemovedAction
    | NetworkModificationTreeNodesUpdatedAction
    | NetworkModificationTreeNodesReorderAction
    | SelectThemeAction
    | SelectLanguageAction
    | SelectComputedLanguageAction
    | SetParamsLoadedAction
    | OpenStudyAction
    | CloseStudyAction
    | RemoveSelectedCaseAction
    | UseNameAction
    | EnableDeveloperModeAction
    | StudyUpdatedAction
    | MapDataLoadingAction
    | ResetMapReloadedAction
    | MapEquipmentsInitializedAction
    | SetFullscreenDiagramAction
    | ChangeDisplayedColumnsNamesAction
    | ChangeLockedColumnsNamesAction
    | FavoriteContingencyListsAction
    | CurrentTreeNodeAction
    | NodeSelectionForCopyAction
    | SetModificationsDrawerOpenAction
    | SetEventScenarioDrawerOpenAction
    | CenterOnSubstationAction
    | AddNotificationAction
    | RemoveNotificationByNodeAction
    | SetModificationsInProgressAction
    | SetStudyDisplayModeAction
    | OpenDiagramAction
    | OpenNadListAction
    | MinimizeDiagramAction
    | TogglePinDiagramAction
    | CloseDiagramAction
    | CloseDiagramsAction
    | StopDiagramBlinkAction
    | ResetNetworkAreaDiagramDepthAction
    | IncrementNetworkAreaDiagramDepthAction
    | DecrementNetworkAreaDiagramDepthAction
    | NetworkAreaDiagramNbVoltageLevelsAction
    | SetComputingStatusAction
    | SetComputationStartingAction
    | SetStudyIndexationStatusAction
    | SetOptionalServicesAction
    | SetOneBusShortcircuitAnalysisDiagramAction
    | AddToRecentGlobalFiltersAction
    | SetLastCompletedComputationAction
    | LoadflowResultFilterAction
    | SecurityAnalysisResultFilterAction
    | SensitivityAnalysisResultFilterAction
    | ShortcircuitAnalysisResultFilterAction
    | DynamicSimulationResultFilterAction
    | SpreadsheetFilterAction
    | LogsFilterAction
    | UpdateColumnsDefinitionsAction
    | RemoveColumnDefinitionAction
    | UpdateCustomColumnsNodesAliasesAction
    | UpdateNetworkVisualizationParametersAction
    | StateEstimationResultFilterAction
    | SaveSpreadSheetGsFilterAction;

export type MutableUnknownArray = unknown[];
export type TableValue<TValue = unknown> = {
    index: number;
    value: TValue;
};
export type EquipmentToDelete = {
    equipmentType: SpreadsheetEquipmentType;
    equipmentId: string;
};
export type DeleteEquipmentsAction = Readonly<Action<typeof DELETE_EQUIPMENTS>> & {
    equipments: EquipmentToDelete[];
    nodeId: UUID;
};
export type ResetEquipmentsAction = Readonly<Action<typeof RESET_EQUIPMENTS>>;
export type ResetEquipmentsByTypesAction = Readonly<Action<typeof RESET_EQUIPMENTS_BY_TYPES>> & {
    equipmentTypes: SpreadsheetEquipmentType[];
};
export type ResetEquipmentsPostLoadflowAction = Readonly<Action<typeof RESET_EQUIPMENTS_POST_LOADFLOW>>;
export type MapEquipmentsCreatedAction = Readonly<Action<typeof MAP_EQUIPMENTS_CREATED>> & {
    mapEquipments: IGSMapEquipments;
    newLines?: MapLine[];
    newTieLines?: MapTieLine[];
    newSubstations?: MapSubstation[];
    newHvdcLines?: MapHvdcLine[];
};
export type ResetMapEquipmentsAction = Readonly<Action<typeof RESET_MAP_EQUIPMENTS>>;
export type LoadNetworkModificationTreeSuccessAction = Readonly<
    Action<typeof LOAD_NETWORK_MODIFICATION_TREE_SUCCESS>
> & {
    networkModificationTreeModel: NetworkModificationTreeModel;
};
export type NetworkModificationTreeNodeAddedAction = Readonly<Action<typeof NETWORK_MODIFICATION_TREE_NODE_ADDED>> & {
    networkModificationTreeNode: NetworkModificationNodeData | RootNodeData;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};
export type NetworkModificationTreeNodeMovedAction = Readonly<Action<typeof NETWORK_MODIFICATION_TREE_NODE_MOVED>> & {
    networkModificationTreeNode: RootNodeData | NetworkModificationNodeData;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};
export type NetworkModificationTreeNodesReorderAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_REORDER>
> & {
    parentNodeId: string;
    nodeIds: string[];
};
export type NetworkModificationHandleSubtreeAction = Readonly<Action<typeof NETWORK_MODIFICATION_HANDLE_SUBTREE>> & {
    networkModificationTreeNodes: NetworkModificationNodeData | RootNodeData;
    parentNodeId: UUID;
};
export type NetworkModificationTreeNodesRemovedAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_REMOVED>
> & {
    networkModificationTreeNodes: UUID[];
};
export type NetworkModificationTreeNodesUpdatedAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_UPDATED>
> & {
    networkModificationTreeNodes: CurrentTreeNode[];
};
export type SelectThemeAction = Readonly<Action<typeof SELECT_THEME>> & {
    [PARAM_THEME]: GsTheme;
};
export type SelectLanguageAction = Readonly<Action<typeof SELECT_LANGUAGE>> & {
    [PARAM_LANGUAGE]: GsLang;
};
export type SelectComputedLanguageAction = Readonly<Action<typeof SELECT_COMPUTED_LANGUAGE>> & {
    computedLanguage: GsLangUser;
};
export type SetParamsLoadedAction = Readonly<Action<typeof SET_PARAMS_LOADED>> & {
    [PARAMS_LOADED]: true;
};
export type OpenStudyAction = Readonly<Action<typeof OPEN_STUDY>> & {
    studyRef: [UUID];
};
export type CloseStudyAction = Readonly<Action<typeof CLOSE_STUDY>>;
export type RemoveSelectedCaseAction = Readonly<Action<typeof REMOVE_SELECTED_CASE>>;
export type UseNameAction = Readonly<Action<typeof USE_NAME>> & {
    [PARAM_USE_NAME]: boolean;
};
export type UpdateNetworkVisualizationParametersAction = Readonly<
    Action<typeof UPDATE_NETWORK_VISUALIZATION_PARAMETERS>
> & {
    parameters: NetworkVisualizationParameters;
};
export type EnableDeveloperModeAction = Readonly<Action<typeof ENABLE_DEVELOPER_MODE>> & {
    [PARAM_DEVELOPER_MODE]: boolean;
};
export type StudyUpdatedAction = Readonly<Action<typeof STUDY_UPDATED>> & {
    eventData: StudyUpdatedEventData;
};
export type MapDataLoadingAction = Readonly<Action<typeof MAP_DATA_LOADING>> & {
    mapDataLoading: boolean;
};
export type ResetMapReloadedAction = Readonly<Action<typeof RESET_MAP_RELOADED>>;
export type MapEquipmentsInitializedAction = Readonly<Action<typeof MAP_EQUIPMENTS_INITIALIZED>> & {
    newValue: boolean;
};
export type SetFullscreenDiagramAction = Readonly<Action<typeof SET_FULLSCREEN_DIAGRAM>> &
    (
        | { diagramId: null }
        | {
              diagramId: string;
              svgType: DiagramType;
          }
    );
export type ChangeDisplayedColumnsNamesAction = Readonly<Action<typeof CHANGE_DISPLAYED_COLUMNS_NAMES>> & {
    displayedColumnsNamesParams: TableValue<ColumnState[]>;
};
export type ChangeLockedColumnsNamesAction = Readonly<Action<typeof CHANGE_LOCKED_COLUMNS_NAMES>> & {
    lockedColumnsNamesParams: TableValue<Set<string>>;
};
export type FavoriteContingencyListsAction = Readonly<Action<typeof FAVORITE_CONTINGENCY_LISTS>> & {
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: MutableUnknownArray;
};
export type CurrentTreeNodeAction = Readonly<Action<typeof CURRENT_TREE_NODE>> & {
    currentTreeNode: CurrentTreeNode;
};
export type CurrentRootNetworkAction = Readonly<Action<typeof CURRENT_ROOT_NETWORK>> & {
    currentRootNetwork: UUID;
};
export type NodeSelectionForCopyAction = Readonly<Action<typeof NODE_SELECTION_FOR_COPY>> & {
    nodeSelectionForCopy: NonNullable<NodeSelectionForCopy>;
};
export type SetModificationsDrawerOpenAction = Readonly<Action<typeof SET_MODIFICATIONS_DRAWER_OPEN>> & {
    isModificationsDrawerOpen: boolean;
};
export type SetEventScenarioDrawerOpenAction = Readonly<Action<typeof SET_EVENT_SCENARIO_DRAWER_OPEN>> & {
    isEventScenarioDrawerOpen: boolean;
};
export type CenterOnSubstationAction = Readonly<Action<typeof CENTER_ON_SUBSTATION>> & {
    centerOnSubstation: { to: string };
};
export type AddNotificationAction = Readonly<Action<typeof ADD_NOTIFICATION>> & {
    notificationIds: UUID[];
};
export type RemoveNotificationByNodeAction = Readonly<Action<typeof REMOVE_NOTIFICATION_BY_NODE>> & {
    notificationIds: UnknownArray;
};
export type SetModificationsInProgressAction = Readonly<Action<typeof SET_MODIFICATIONS_IN_PROGRESS>> & {
    isModificationsInProgress: boolean;
};
export type SetStudyDisplayModeAction = Readonly<Action<typeof SET_STUDY_DISPLAY_MODE>> & {
    studyDisplayMode: StudyDisplayMode;
};
export type OpenDiagramAction = Readonly<Action<typeof OPEN_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export type OpenNadListAction = Readonly<Action<typeof OPEN_NAD_LIST>> & {
    ids: string[];
};
export type MinimizeDiagramAction = Readonly<Action<typeof MINIMIZE_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export type TogglePinDiagramAction = Readonly<Action<typeof TOGGLE_PIN_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export type CloseDiagramAction = Readonly<Action<typeof CLOSE_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export type CloseDiagramsAction = Readonly<Action<typeof CLOSE_DIAGRAMS>> & {
    ids: string[];
};
export type StopDiagramBlinkAction = Readonly<Action<typeof STOP_DIAGRAM_BLINK>>;
export type ResetNetworkAreaDiagramDepthAction = Readonly<Action<typeof RESET_NETWORK_AREA_DIAGRAM_DEPTH>>;
export type IncrementNetworkAreaDiagramDepthAction = Readonly<Action<typeof INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH>>;
export type DecrementNetworkAreaDiagramDepthAction = Readonly<Action<typeof DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH>>;
export type StoreNetworkAreaDiagramNodeMovementAction = Readonly<
    Action<typeof STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT>
> & {
    nadIdentifier: string;
    equipmentId: string;
    x: number;
    y: number;
    scalingFactor: number;
};
export type StoreNetworkAreaDiagramTextNodeMovementAction = Readonly<
    Action<typeof STORE_NETWORK_AREA_DIAGRAM_TEXT_NODE_MOVEMENT>
> & {
    nadIdentifier: string;
    equipmentId: string;
    shiftX: number;
    shiftY: number;
    connectionShiftX: number;
    connectionShiftY: number;
};
export type NetworkAreaDiagramNbVoltageLevelsAction = Readonly<
    Action<typeof NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS>
> & {
    nbVoltageLevels: number;
};
export type SetComputingStatusAction = Readonly<Action<typeof SET_COMPUTING_STATUS>> & {
    computingType: ComputingType;
    runningStatus: RunningStatus;
};
export type SetComputationStartingAction = Readonly<Action<typeof SET_COMPUTATION_STARTING>> & {
    computationStarting: boolean;
};
export type SetStudyIndexationStatusAction = Readonly<Action<typeof SET_STUDY_INDEXATION_STATUS>> & {
    studyIndexationStatus: StudyIndexationStatus;
};
export type SetOptionalServicesAction = Readonly<Action<typeof SET_OPTIONAL_SERVICES>> & {
    optionalServices: IOptionalService[];
};
export type SetOneBusShortcircuitAnalysisDiagramAction = Readonly<
    Action<typeof SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM>
> &
    (OneBusShortCircuitAnalysisDiagram | { diagramId: null });
export type AddToRecentGlobalFiltersAction = Readonly<Action<typeof ADD_TO_RECENT_GLOBAL_FILTERS>> & {
    globalFilters: Filter[];
};
export type SetLastCompletedComputationAction = Readonly<Action<typeof SET_LAST_COMPLETED_COMPUTATION>> & {
    lastCompletedComputation: ComputingType | null;
};
export type LoadflowResultFilterAction = Readonly<Action<typeof LOADFLOW_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof LOADFLOW_RESULT_STORE_FIELD];
    [LOADFLOW_RESULT_STORE_FIELD]: FilterConfig[];
};
export type SecurityAnalysisResultFilterAction = Readonly<Action<typeof SECURITY_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SECURITY_ANALYSIS_RESULT_STORE_FIELD];
    [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};
export type SensitivityAnalysisResultFilterAction = Readonly<Action<typeof SENSITIVITY_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD];
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};
export type ShortcircuitAnalysisResultFilterAction = Readonly<Action<typeof SHORTCIRCUIT_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD];
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};
export type DynamicSimulationResultFilterAction = Readonly<Action<typeof DYNAMIC_SIMULATION_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof DYNAMIC_SIMULATION_RESULT_STORE_FIELD];
    [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: FilterConfig[];
};
export type SpreadsheetFilterAction = Readonly<Action<typeof SPREADSHEET_FILTER>> & {
    filterTab: keyof AppState[typeof SPREADSHEET_STORE_FIELD];
    [SPREADSHEET_STORE_FIELD]: FilterConfig[];
};
export type LogsFilterAction = Readonly<Action<typeof LOGS_FILTER>> & {
    filterTab: keyof AppState[typeof LOGS_STORE_FIELD];
    [LOGS_STORE_FIELD]: FilterConfig[];
};
export type ResetLogsFilterAction = Readonly<Action<typeof RESET_LOGS_FILTER>>;
export type TableSortAction = Readonly<Action<typeof TABLE_SORT>> & {
    table: TableSortKeysType;
    tab: string; //AppState['tableSort'][T];
    sort: SortConfig[];
};
export type UpdateColumnsDefinitionsAction = Readonly<Action<typeof UPDATE_COLUMNS_DEFINITION>> & {
    colData: TableValue<ColumnDefinition>;
};
export type RemoveColumnDefinitionAction = Readonly<Action<typeof REMOVE_COLUMN_DEFINITION>> & {
    definition: TableValue<string>;
};
export type UpdateTableDefinitionAction = {
    type: typeof UPDATE_TABLE_DEFINITION;
    newTableDefinition: SpreadsheetTabDefinition;
};
export type AddFilterForNewSpreadsheetAction = {
    type: typeof ADD_FILTER_FOR_NEW_SPREADSHEET;
    payload: { newTabName: string; value: FilterConfig[] };
};
export type AddSortForNewSpreadsheetAction = {
    type: typeof ADD_SORT_FOR_NEW_SPREADSHEET;
    payload: { newTabName: string; value: SortConfig[] };
};
export type StateEstimationResultFilterAction = Readonly<Action<typeof STATEESTIMATION_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof STATEESTIMATION_RESULT_STORE_FIELD];
    [STATEESTIMATION_RESULT_STORE_FIELD]: FilterConfig[];
};
export type SaveSpreadSheetGsFilterAction = Readonly<Action<typeof SAVE_SPREADSHEET_GS_FILTER>> & {
    equipmentType: SpreadsheetEquipmentType;
    filters: ExpertFilter[];
};
export type LoadEquipmentsAction = Readonly<Action<typeof LOAD_EQUIPMENTS>> & {
    equipmentType: SpreadsheetEquipmentType;
    spreadsheetEquipmentByNodes: SpreadsheetEquipmentsByNodes;
};
export type AdditionalNodeData = {
    alias: string;
    identifiables: Identifiable[];
};
export type AddEquipmentsByNodesForCustomColumnsAction = Readonly<
    Action<typeof ADD_ADDITIONAL_EQUIPMENTS_BY_NODES_FOR_CUSTOM_COLUMNS>
> & {
    equipmentType: SpreadsheetEquipmentType;
    data: AdditionalNodeData[];
};
export type RemoveNodeDataAction = Readonly<Action<typeof REMOVE_NODE_DATA>> & {
    nodesIdToRemove: string[];
};
export type UpdateCustomColumnsNodesAliasesAction = Readonly<Action<typeof UPDATE_CUSTOM_COLUMNS_NODES_ALIASES>> & {
    nodesAliases: NodeAlias[];
};
export type UpdateEquipmentsAction = Readonly<Action<typeof UPDATE_EQUIPMENTS>> & {
    equipments: Record<EquipmentUpdateType, Identifiable[]>;
    nodeId: UUID;
};
