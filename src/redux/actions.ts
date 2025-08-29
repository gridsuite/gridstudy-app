/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    PARAM_DEVELOPER_MODE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAMS_LOADED,
} from '../utils/config-params';
import type { Action } from 'redux';
import {
    ComputingType,
    type GsLang,
    type GsLangUser,
    type GsTheme,
    type Identifiable,
    type NetworkVisualizationParameters,
} from '@gridsuite/commons-ui';
import type { UUID } from 'crypto';
import type { UnknownArray } from 'type-fest';
import type NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import type {
    AppState,
    ComputingStatusParameters,
    DiagramGridLayoutConfig,
    GlobalFilterSpreadsheetState,
    NodeSelectionForCopy,
    OneBusShortCircuitAnalysisDiagram,
    SpreadsheetFilterState,
    TableSortKeysType,
} from './reducer';
import type { RunningStatus } from '../components/utils/running-status';
import type { IOptionalService } from '../components/utils/optional-services';
import type { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
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
import { StudyDisplayMode } from '../components/network-modification.type';
import { CurrentTreeNode, NetworkModificationNodeData, RootNodeData } from '../components/graph/tree-node.type';
import type GSMapEquipments from 'components/network/gs-map-equipments';
import {
    type ColumnDefinition,
    type SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    type SpreadsheetTabDefinition,
} from '../components/spreadsheet-view/types/spreadsheet.type';
import { FilterConfig, SortConfig } from '../types/custom-aggrid-types';
import type { DiagramType } from '../components/diagrams/diagram.type';
import type { RootNetworkMetadata } from 'components/graph/menus/network-modifications/network-modification-menu.type';
import type { NodeInsertModes, RootNetworkIndexationStatus, StudyUpdateEventData } from 'types/notification-types';

export type TableValue<TValue = unknown> = {
    uuid: UUID;
    value: TValue;
};

export type AppActions =
    | LoadEquipmentsAction
    | UpdateEquipmentsAction
    | DeleteEquipmentsAction
    | ResetEquipmentsAction
    | ResetEquipmentsByTypesAction
    | ResetEquipmentsPostComputationAction
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
    | UseNameAction
    | EnableDeveloperModeAction
    | StudyUpdatedAction
    | MapDataLoadingAction
    | MapEquipmentsInitializedAction
    | FavoriteContingencyListsAction
    | CurrentTreeNodeAction
    | NodeSelectionForCopyAction
    | SetModificationsDrawerOpenAction
    | CenterOnSubstationAction
    | AddNotificationAction
    | RemoveNotificationByNodeAction
    | SetModificationsInProgressAction
    | OpenDiagramAction
    | OpenNadListAction
    | SetComputingStatusAction
    | SetComputingStatusParametersAction<ParameterizedComputingType>
    | SetComputationStartingAction
    | SetRootNetworkIndexationStatusAction
    | SetOptionalServicesAction
    | SetOneBusShortcircuitAnalysisDiagramAction
    | AddToRecentGlobalFiltersAction
    | RemoveFromRecentGlobalFiltersAction
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
    | UpdateNetworkVisualizationParametersAction
    | StateEstimationResultFilterAction
    | SaveSpreadSheetGlobalFilterAction
    | ResetAllSpreadsheetGlobalFiltersAction
    | RemoveTableDefinitionAction
    | SetCalculationSelectionsAction
    | ReorderTableDefinitionsAction
    | RenameTableDefinitionAction
    | SetAppTabIndexAction
    | AttemptLeaveParametersTabAction
    | ConfirmLeaveParametersTabAction
    | CancelLeaveParametersTabAction
    | DeletedOrRenamedNodesAction
    | RemoveEquipmentDataAction
    | SetOpenMapAction;

export const SET_APP_TAB_INDEX = 'SET_APP_TAB_INDEX';
export type SetAppTabIndexAction = Readonly<Action<typeof SET_APP_TAB_INDEX>> & {
    tabIndex: number;
};

export function setAppTabIndex(tabIndex: number): SetAppTabIndexAction {
    return {
        type: SET_APP_TAB_INDEX,
        tabIndex,
    };
}

export const ATTEMPT_LEAVE_PARAMETERS_TAB = 'ATTEMPT_LEAVE_PARAMETERS_TAB';
export type AttemptLeaveParametersTabAction = Readonly<Action<typeof ATTEMPT_LEAVE_PARAMETERS_TAB>> & {
    targetTabIndex: number;
};

export function attemptLeaveParametersTab(targetTabIndex: number): AttemptLeaveParametersTabAction {
    return {
        type: ATTEMPT_LEAVE_PARAMETERS_TAB,
        targetTabIndex,
    };
}

export const CONFIRM_LEAVE_PARAMETERS_TAB = 'CONFIRM_LEAVE_PARAMETERS_TAB';
export type ConfirmLeaveParametersTabAction = Readonly<Action<typeof CONFIRM_LEAVE_PARAMETERS_TAB>>;

export function confirmLeaveParametersTab(): ConfirmLeaveParametersTabAction {
    return {
        type: CONFIRM_LEAVE_PARAMETERS_TAB,
    };
}

export const CANCEL_LEAVE_PARAMETERS_TAB = 'CANCEL_LEAVE_PARAMETERS_TAB';
export type CancelLeaveParametersTabAction = Readonly<Action<typeof CANCEL_LEAVE_PARAMETERS_TAB>>;

export function cancelLeaveParametersTab(): CancelLeaveParametersTabAction {
    return {
        type: CANCEL_LEAVE_PARAMETERS_TAB,
    };
}

export const LOAD_EQUIPMENTS = 'LOAD_EQUIPMENTS';
export type LoadEquipmentsAction = Readonly<Action<typeof LOAD_EQUIPMENTS>> & {
    equipmentType: SpreadsheetEquipmentType;
    spreadsheetEquipmentByNodes: SpreadsheetEquipmentsByNodes;
};

export function loadEquipments(
    equipmentType: SpreadsheetEquipmentType,
    spreadsheetEquipmentByNodes: SpreadsheetEquipmentsByNodes
): LoadEquipmentsAction {
    return {
        type: LOAD_EQUIPMENTS,
        equipmentType: equipmentType,
        spreadsheetEquipmentByNodes: spreadsheetEquipmentByNodes,
    };
}

export const REMOVE_NODE_DATA = 'REMOVE_NODE_DATA';
export type RemoveNodeDataAction = Readonly<Action<typeof REMOVE_NODE_DATA>> & {
    nodesIdToRemove: string[];
};

export function removeNodeData(nodesIdToRemove: string[]): RemoveNodeDataAction {
    return {
        type: REMOVE_NODE_DATA,
        nodesIdToRemove,
    };
}

export const REMOVE_EQUIPMENT_DATA = 'REMOVE_EQUIPMENT_DATA';
export type RemoveEquipmentDataAction = Readonly<Action<typeof REMOVE_EQUIPMENT_DATA>> & {
    equipmentType: SpreadsheetEquipmentType;
};

export function removeEquipmentData(equipmentType: SpreadsheetEquipmentType): RemoveEquipmentDataAction {
    return {
        type: REMOVE_EQUIPMENT_DATA,
        equipmentType: equipmentType,
    };
}

export const UPDATE_EQUIPMENTS = 'UPDATE_EQUIPMENTS';
export type UpdateEquipmentsAction = Readonly<Action<typeof UPDATE_EQUIPMENTS>> & {
    equipments: Partial<Record<SpreadsheetEquipmentType, Identifiable[]>>;
    nodeId: UUID;
};

export function updateEquipments(
    equipments: UpdateEquipmentsAction['equipments'],
    nodeId: UpdateEquipmentsAction['nodeId']
): UpdateEquipmentsAction {
    return {
        type: UPDATE_EQUIPMENTS,
        equipments: equipments,
        nodeId: nodeId,
    };
}

export type EquipmentToDelete = {
    equipmentType: SpreadsheetEquipmentType;
    equipmentId: string;
};
export const DELETE_EQUIPMENTS = 'DELETE_EQUIPMENTS';
export type DeleteEquipmentsAction = Readonly<Action<typeof DELETE_EQUIPMENTS>> & {
    equipments: EquipmentToDelete[];
    nodeId: UUID;
};

export function deleteEquipments(equipments: EquipmentToDelete[], nodeId: UUID): DeleteEquipmentsAction {
    return {
        type: DELETE_EQUIPMENTS,
        equipments,
        nodeId,
    };
}

export const RESET_EQUIPMENTS = 'RESET_EQUIPMENTS';
export type ResetEquipmentsAction = Readonly<Action<typeof RESET_EQUIPMENTS>>;

export function resetEquipments(): ResetEquipmentsAction {
    return {
        type: RESET_EQUIPMENTS,
    };
}

export const RESET_EQUIPMENTS_BY_TYPES = 'RESET_EQUIPMENTS_BY_TYPES';
export type ResetEquipmentsByTypesAction = Readonly<Action<typeof RESET_EQUIPMENTS_BY_TYPES>> & {
    equipmentTypes: SpreadsheetEquipmentType[];
};

export function resetEquipmentsByTypes(equipmentTypes: SpreadsheetEquipmentType[]): ResetEquipmentsByTypesAction {
    return {
        type: RESET_EQUIPMENTS_BY_TYPES,
        equipmentTypes: equipmentTypes,
    };
}

export const RESET_EQUIPMENTS_POST_COMPUTATION = 'RESET_EQUIPMENTS_POST_COMPUTATION';
export type ResetEquipmentsPostComputationAction = Readonly<Action<typeof RESET_EQUIPMENTS_POST_COMPUTATION>>;

export function resetEquipmentsPostComputation(): ResetEquipmentsPostComputationAction {
    return {
        type: RESET_EQUIPMENTS_POST_COMPUTATION,
    };
}

export const MAP_EQUIPMENTS_CREATED = 'MAP_EQUIPMENTS_CREATED';
export type MapEquipmentsCreatedAction = Readonly<Action<typeof MAP_EQUIPMENTS_CREATED>> & {
    mapEquipments: GSMapEquipments;
    newLines?: MapLine[];
    newTieLines?: MapTieLine[];
    newSubstations?: MapSubstation[];
    newHvdcLines?: MapHvdcLine[];
};

export function mapEquipmentsCreated(
    mapEquipments: GSMapEquipments,
    newLines?: MapLine[],
    newTieLines?: MapTieLine[],
    newSubstations?: MapSubstation[],
    newHvdcLines?: MapHvdcLine[]
): MapEquipmentsCreatedAction {
    return {
        type: MAP_EQUIPMENTS_CREATED,
        mapEquipments: mapEquipments,
        newLines: newLines,
        newTieLines: newTieLines,
        newSubstations: newSubstations,
        newHvdcLines: newHvdcLines,
    };
}

export const RESET_MAP_EQUIPMENTS = 'RESET_MAP_EQUIPMENTS';
export type ResetMapEquipmentsAction = Readonly<Action<typeof RESET_MAP_EQUIPMENTS>>;

export function resetMapEquipment(): ResetMapEquipmentsAction {
    return {
        type: RESET_MAP_EQUIPMENTS,
    };
}

export const SET_OPEN_MAP = 'SET_OPEN_MAP';
export type SetOpenMapAction = Readonly<Action<typeof SET_OPEN_MAP>> & {
    mapOpen: boolean;
};

export function setOpenMap(mapOpen: boolean): SetOpenMapAction {
    return {
        type: SET_OPEN_MAP,
        mapOpen,
    };
}

export const LOAD_NETWORK_MODIFICATION_TREE_SUCCESS = 'LOAD_NETWORK_MODIFICATION_TREE_SUCCESS';
export type LoadNetworkModificationTreeSuccessAction = Readonly<
    Action<typeof LOAD_NETWORK_MODIFICATION_TREE_SUCCESS>
> & {
    networkModificationTreeModel: NetworkModificationTreeModel;
};

export function loadNetworkModificationTreeSuccess(
    networkModificationTreeModel: NetworkModificationTreeModel
): LoadNetworkModificationTreeSuccessAction {
    return {
        type: LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
        networkModificationTreeModel: networkModificationTreeModel,
    };
}

export const NETWORK_MODIFICATION_TREE_NODE_ADDED = 'NETWORK_MODIFICATION_TREE_NODE_ADDED';
export type NetworkModificationTreeNodeAddedAction = Readonly<Action<typeof NETWORK_MODIFICATION_TREE_NODE_ADDED>> & {
    networkModificationTreeNode: NetworkModificationNodeData | RootNodeData;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};

export function networkModificationTreeNodeAdded(
    networkModificationTreeNode: NetworkModificationNodeData | RootNodeData,
    parentNodeId: string,
    insertMode: NodeInsertModes,
    referenceNodeId: string
): NetworkModificationTreeNodeAddedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODE_ADDED,
        networkModificationTreeNode: networkModificationTreeNode,
        parentNodeId: parentNodeId,
        insertMode: insertMode,
        referenceNodeId: referenceNodeId,
    };
}

export const NETWORK_MODIFICATION_TREE_NODE_MOVED = 'NETWORK_MODIFICATION_TREE_NODE_MOVED';
export type NetworkModificationTreeNodeMovedAction = Readonly<Action<typeof NETWORK_MODIFICATION_TREE_NODE_MOVED>> & {
    networkModificationTreeNode: RootNodeData | NetworkModificationNodeData;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};

export function networkModificationTreeNodeMoved(
    networkModificationTreeNode: RootNodeData | NetworkModificationNodeData,
    parentNodeId: string,
    insertMode: NodeInsertModes,
    referenceNodeId: string
): NetworkModificationTreeNodeMovedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODE_MOVED,
        networkModificationTreeNode,
        parentNodeId,
        insertMode,
        referenceNodeId,
    };
}

export const NETWORK_MODIFICATION_TREE_NODES_REORDER = 'NETWORK_MODIFICATION_TREE_NODES_REORDER';
export type NetworkModificationTreeNodesReorderAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_REORDER>
> & {
    parentNodeId: string;
    nodeIds: string[];
};

export function reorderNetworkModificationTreeNodes(
    parentNodeId: string,
    nodeIds: string[]
): NetworkModificationTreeNodesReorderAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_REORDER,
        parentNodeId,
        nodeIds,
    };
}

export const NETWORK_MODIFICATION_HANDLE_SUBTREE = 'NETWORK_MODIFICATION_HANDLE_SUBTREE';
export type NetworkModificationHandleSubtreeAction = Readonly<Action<typeof NETWORK_MODIFICATION_HANDLE_SUBTREE>> & {
    networkModificationTreeNodes: NetworkModificationNodeData | RootNodeData;
    parentNodeId: UUID;
};

export function networkModificationHandleSubtree(
    networkModificationTreeNodes: NetworkModificationNodeData | RootNodeData,
    parentNodeId: UUID
): NetworkModificationHandleSubtreeAction {
    return {
        type: NETWORK_MODIFICATION_HANDLE_SUBTREE,
        networkModificationTreeNodes: networkModificationTreeNodes,
        parentNodeId: parentNodeId,
    };
}

export const NETWORK_MODIFICATION_TREE_NODES_REMOVED = 'NETWORK_MODIFICATION_TREE_NODES_REMOVED';
export type NetworkModificationTreeNodesRemovedAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_REMOVED>
> & {
    networkModificationTreeNodes: UUID[];
};

export function networkModificationTreeNodesRemoved(
    networkModificationTreeNodes: UUID[]
): NetworkModificationTreeNodesRemovedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_REMOVED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export const NETWORK_MODIFICATION_TREE_NODES_UPDATED = 'NETWORK_MODIFICATION_TREE_NODES_UPDATED';
export type NetworkModificationTreeNodesUpdatedAction = Readonly<
    Action<typeof NETWORK_MODIFICATION_TREE_NODES_UPDATED>
> & {
    networkModificationTreeNodes: CurrentTreeNode[];
};

export function networkModificationTreeNodesUpdated(
    networkModificationTreeNodes: CurrentTreeNode[]
): NetworkModificationTreeNodesUpdatedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_UPDATED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export const SELECT_THEME = 'SELECT_THEME';
export type SelectThemeAction = Readonly<Action<typeof SELECT_THEME>> & {
    [PARAM_THEME]: GsTheme;
};

export function selectTheme(theme: GsTheme): SelectThemeAction {
    return { type: SELECT_THEME, [PARAM_THEME]: theme };
}

export const SELECT_LANGUAGE = 'SELECT_LANGUAGE';
export type SelectLanguageAction = Readonly<Action<typeof SELECT_LANGUAGE>> & {
    [PARAM_LANGUAGE]: GsLang;
};

export function selectLanguage(language: GsLang): SelectLanguageAction {
    return { type: SELECT_LANGUAGE, [PARAM_LANGUAGE]: language };
}

export const SELECT_COMPUTED_LANGUAGE = 'SELECT_COMPUTED_LANGUAGE';
export type SelectComputedLanguageAction = Readonly<Action<typeof SELECT_COMPUTED_LANGUAGE>> & {
    computedLanguage: GsLangUser;
};

export function selectComputedLanguage(computedLanguage: GsLangUser): SelectComputedLanguageAction {
    return {
        type: SELECT_COMPUTED_LANGUAGE,
        computedLanguage: computedLanguage,
    };
}

export const SET_PARAMS_LOADED = 'SET_PARAMS_LOADED';
export type SetParamsLoadedAction = Readonly<Action<typeof SET_PARAMS_LOADED>> & {
    [PARAMS_LOADED]: true;
};

export function setParamsLoaded(): SetParamsLoadedAction {
    return {
        type: SET_PARAMS_LOADED,
        [PARAMS_LOADED]: true,
    };
}

export const OPEN_STUDY = 'OPEN_STUDY';
export type OpenStudyAction = Readonly<Action<typeof OPEN_STUDY>> & {
    studyRef: [UUID];
};

export function openStudy(studyUuid: UUID): OpenStudyAction {
    return { type: OPEN_STUDY, studyRef: [studyUuid] };
}

export const CLOSE_STUDY = 'CLOSE_STUDY';
export type CloseStudyAction = Readonly<Action<typeof CLOSE_STUDY>>;

export function closeStudy(): CloseStudyAction {
    return { type: CLOSE_STUDY };
}

export const USE_NAME = 'USE_NAME';
export type UseNameAction = Readonly<Action<typeof USE_NAME>> & {
    [PARAM_USE_NAME]: boolean;
};

export function selectUseName(useName: boolean): UseNameAction {
    return { type: USE_NAME, [PARAM_USE_NAME]: useName };
}

export const UPDATE_NETWORK_VISUALIZATION_PARAMETERS = 'UPDATE_NETWORK_VISUALIZATION_PARAMETERS';
export type UpdateNetworkVisualizationParametersAction = Readonly<
    Action<typeof UPDATE_NETWORK_VISUALIZATION_PARAMETERS>
> & {
    parameters: NetworkVisualizationParameters;
};

export function setUpdateNetworkVisualizationParameters(
    parameters: NetworkVisualizationParameters
): UpdateNetworkVisualizationParametersAction {
    return {
        type: UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
        parameters: parameters,
    };
}

export const ENABLE_DEVELOPER_MODE = 'ENABLE_DEVELOPER_MODE';
export type EnableDeveloperModeAction = Readonly<Action<typeof ENABLE_DEVELOPER_MODE>> & {
    [PARAM_DEVELOPER_MODE]: boolean;
};

export function selectEnableDeveloperMode(enableDeveloperMode: boolean): EnableDeveloperModeAction {
    return {
        type: ENABLE_DEVELOPER_MODE,
        [PARAM_DEVELOPER_MODE]: enableDeveloperMode,
    };
}

export const STUDY_UPDATED = 'STUDY_UPDATED';
export type StudyUpdatedAction = Readonly<Action<typeof STUDY_UPDATED>> & {
    eventData: StudyUpdateEventData;
};

export function studyUpdated(eventData: StudyUpdateEventData): StudyUpdatedAction {
    return { type: STUDY_UPDATED, eventData };
}

export const MAP_DATA_LOADING = 'MAP_DATA_LOADING';
export type MapDataLoadingAction = Readonly<Action<typeof MAP_DATA_LOADING>> & {
    mapDataLoading: boolean;
};

export function setMapDataLoading(mapDataLoading: boolean): MapDataLoadingAction {
    return {
        type: MAP_DATA_LOADING,
        mapDataLoading,
    };
}

export const SET_RELOAD_MAP_NEEDED = 'SET_RELOAD_MAP_NEEDED';
export type SetReloadMapNeededAction = Readonly<Action<typeof SET_RELOAD_MAP_NEEDED>> & {
    reloadMapNeeded: boolean;
};

export function setReloadMapNeeded(reloadMapNeeded: boolean): SetReloadMapNeededAction {
    return {
        type: SET_RELOAD_MAP_NEEDED,
        reloadMapNeeded,
    };
}

export const MAP_EQUIPMENTS_INITIALIZED = 'MAP_EQUIPMENTS_INITIALIZED';
export type MapEquipmentsInitializedAction = Readonly<Action<typeof MAP_EQUIPMENTS_INITIALIZED>> & {
    newValue: boolean;
};

export function setMapEquipementsInitialized(newValue: boolean): MapEquipmentsInitializedAction {
    return {
        type: MAP_EQUIPMENTS_INITIALIZED,
        newValue,
    };
}

export const FAVORITE_CONTINGENCY_LISTS = 'FAVORITE_CONTINGENCY_LISTS';
export type FavoriteContingencyListsAction = Readonly<Action<typeof FAVORITE_CONTINGENCY_LISTS>> & {
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: UUID[];
};

export function selectFavoriteContingencyLists(favoriteContingencyLists: UUID[]): FavoriteContingencyListsAction {
    return {
        type: FAVORITE_CONTINGENCY_LISTS,
        [PARAM_FAVORITE_CONTINGENCY_LISTS]: favoriteContingencyLists,
    };
}

export const CURRENT_TREE_NODE = 'CURRENT_TREE_NODE';
export type CurrentTreeNodeAction = Readonly<Action<typeof CURRENT_TREE_NODE>> & {
    currentTreeNode: CurrentTreeNode;
};

export function setCurrentTreeNode(currentTreeNode: CurrentTreeNode): CurrentTreeNodeAction {
    return {
        type: CURRENT_TREE_NODE,
        currentTreeNode: currentTreeNode,
    };
}

export const CURRENT_ROOT_NETWORK_UUID = 'CURRENT_ROOT_NETWORK_UUID';
export type CurrentRootNetworkUuidAction = Readonly<Action<typeof CURRENT_ROOT_NETWORK_UUID>> & {
    currentRootNetworkUuid: UUID;
};

export function setCurrentRootNetworkUuid(currentRootNetworkUuid: UUID): CurrentRootNetworkUuidAction {
    return {
        type: CURRENT_ROOT_NETWORK_UUID,
        currentRootNetworkUuid: currentRootNetworkUuid,
    };
}

export const SET_ROOT_NETWORKS = 'SET_ROOT_NETWORKS';
export type SetRootNetworksAction = Readonly<Action<typeof SET_ROOT_NETWORKS>> & {
    rootNetworks: RootNetworkMetadata[];
};

export function setRootNetworks(rootNetworks: RootNetworkMetadata[]): SetRootNetworksAction {
    return {
        type: SET_ROOT_NETWORKS,
        rootNetworks: rootNetworks,
    };
}

export const NODE_SELECTION_FOR_COPY = 'NODE_SELECTION_FOR_COPY';
export type NodeSelectionForCopyAction = Readonly<Action<typeof NODE_SELECTION_FOR_COPY>> & {
    nodeSelectionForCopy: NonNullable<NodeSelectionForCopy>;
};

export function setNodeSelectionForCopy(
    nodeSelectionForCopy: NonNullable<NodeSelectionForCopy>
): NodeSelectionForCopyAction {
    return {
        type: NODE_SELECTION_FOR_COPY,
        nodeSelectionForCopy: nodeSelectionForCopy,
    };
}

export const SET_MODIFICATIONS_DRAWER_OPEN = 'SET_MODIFICATIONS_DRAWER_OPEN';
export type SetModificationsDrawerOpenAction = Readonly<Action<typeof SET_MODIFICATIONS_DRAWER_OPEN>>;
export function setModificationsDrawerOpen(): SetModificationsDrawerOpenAction {
    return {
        type: SET_MODIFICATIONS_DRAWER_OPEN,
    };
}

export const SET_TOGGLE_OPTIONS = 'SET_TOGGLE_OPTIONS';
export type SetToggleOptionsAction = Readonly<Action<typeof SET_TOGGLE_OPTIONS>> & {
    toggleOptions: StudyDisplayMode[];
};

export function setToggleOptions(toggleOptions: StudyDisplayMode[]): SetToggleOptionsAction {
    return {
        type: SET_TOGGLE_OPTIONS,
        toggleOptions: toggleOptions,
    };
}

export const SET_MONO_ROOT_STUDY = 'SET_MONO_ROOT_STUDY';
export type SetMonoRootStudyAction = Readonly<Action<typeof SET_MONO_ROOT_STUDY>> & {
    isMonoRootStudy: boolean;
};

export function setMonoRootStudy(isMonoRootStudy: boolean): SetMonoRootStudyAction {
    return {
        type: SET_MONO_ROOT_STUDY,
        isMonoRootStudy: isMonoRootStudy,
    };
}

export const CENTER_ON_SUBSTATION = 'CENTER_ON_SUBSTATION';
export type CenterOnSubstationAction = Readonly<Action<typeof CENTER_ON_SUBSTATION>> & {
    centerOnSubstation: { to: string };
};

export function centerOnSubstation(substationId: string): CenterOnSubstationAction {
    return {
        type: CENTER_ON_SUBSTATION,
        centerOnSubstation: { to: substationId },
    };
}

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export type AddNotificationAction = Readonly<Action<typeof ADD_NOTIFICATION>> & {
    notificationIds: UUID[];
};

export function addNotification(notificationIds: UUID[]): AddNotificationAction {
    return {
        type: ADD_NOTIFICATION,
        notificationIds: notificationIds,
    };
}

export const REMOVE_NOTIFICATION_BY_NODE = 'REMOVE_NOTIFICATION_BY_NODE';
export type RemoveNotificationByNodeAction = Readonly<Action<typeof REMOVE_NOTIFICATION_BY_NODE>> & {
    notificationIds: UnknownArray;
};

export function removeNotificationByNode(notificationIds: UnknownArray): RemoveNotificationByNodeAction {
    return {
        type: REMOVE_NOTIFICATION_BY_NODE,
        notificationIds: notificationIds,
    };
}

export const SET_MODIFICATIONS_IN_PROGRESS = 'SET_MODIFICATIONS_IN_PROGRESS';
export type SetModificationsInProgressAction = Readonly<Action<typeof SET_MODIFICATIONS_IN_PROGRESS>> & {
    isModificationsInProgress: boolean;
};

export function setModificationsInProgress(isModificationsInProgress: boolean): SetModificationsInProgressAction {
    return {
        type: SET_MODIFICATIONS_IN_PROGRESS,
        isModificationsInProgress: isModificationsInProgress,
    };
}

export const OPEN_DIAGRAM = 'OPEN_DIAGRAM';
export type OpenDiagramAction = Readonly<Action<typeof OPEN_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};

export function openDiagram(id: string, svgType: DiagramType): OpenDiagramAction {
    return {
        type: OPEN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const OPEN_NAD_LIST = 'OPEN_NAD_LIST';
export type OpenNadListAction = Readonly<Action<typeof OPEN_NAD_LIST>> & {
    ids: string[];
};

export function openNadList(ids: string[]): OpenNadListAction {
    return {
        type: OPEN_NAD_LIST,
        ids: ids,
    };
}

export const SET_COMPUTING_STATUS = 'SET_COMPUTING_STATUS';
export type SetComputingStatusAction = Readonly<Action<typeof SET_COMPUTING_STATUS>> & {
    computingType: ComputingType;
    runningStatus: RunningStatus;
};

export function setComputingStatus(
    computingType: ComputingType,
    runningStatus: RunningStatus
): SetComputingStatusAction {
    return {
        type: SET_COMPUTING_STATUS,
        computingType: computingType,
        runningStatus: runningStatus,
    };
}

export type ParameterizedComputingType = ComputingType.LOAD_FLOW;

export const SET_COMPUTING_STATUS_INFOS = 'SET_COMPUTING_STATUS_INFOS';
export type SetComputingStatusParametersAction<K extends ParameterizedComputingType> = Readonly<
    Action<typeof SET_COMPUTING_STATUS_INFOS>
> & {
    computingType: K;
    computingStatusParameters: ComputingStatusParameters[K];
};

export function setComputingStatusParameters<K extends ParameterizedComputingType>(
    computingType: K,
    computingStatusParameters: ComputingStatusParameters[K]
): SetComputingStatusParametersAction<K> {
    return {
        type: SET_COMPUTING_STATUS_INFOS,
        computingType: computingType,
        computingStatusParameters: computingStatusParameters,
    };
}

export const SET_COMPUTATION_STARTING = 'SET_COMPUTATION_STARTING';
export type SetComputationStartingAction = Readonly<Action<typeof SET_COMPUTATION_STARTING>> & {
    computationStarting: boolean;
};

export function setComputationStarting(computationStarting: boolean): SetComputationStartingAction {
    return {
        type: SET_COMPUTATION_STARTING,
        computationStarting: computationStarting,
    };
}

export const SET_ROOT_NETWORK_INDEXATION_STATUS = 'SET_ROOT_NETWORK_INDEXATION_STATUS';
export type SetRootNetworkIndexationStatusAction = Readonly<Action<typeof SET_ROOT_NETWORK_INDEXATION_STATUS>> & {
    rootNetworkIndexationStatus: RootNetworkIndexationStatus;
};

export function setRootNetworkIndexationStatus(
    rootNetworkIndexationStatus: RootNetworkIndexationStatus
): SetRootNetworkIndexationStatusAction {
    return {
        type: SET_ROOT_NETWORK_INDEXATION_STATUS,
        rootNetworkIndexationStatus: rootNetworkIndexationStatus,
    };
}

export const SET_OPTIONAL_SERVICES = 'SET_OPTIONAL_SERVICES';
export type SetOptionalServicesAction = Readonly<Action<typeof SET_OPTIONAL_SERVICES>> & {
    optionalServices: IOptionalService[];
};

export function setOptionalServices(optionalServices: IOptionalService[]): SetOptionalServicesAction {
    return {
        type: SET_OPTIONAL_SERVICES,
        optionalServices: optionalServices,
    };
}

export const SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM = 'SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM';
export type SetOneBusShortcircuitAnalysisDiagramAction = Readonly<
    Action<typeof SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM>
> &
    (OneBusShortCircuitAnalysisDiagram | { diagramId: null });

export function setOneBusShortcircuitAnalysisDiagram(diagramId: null): SetOneBusShortcircuitAnalysisDiagramAction;
export function setOneBusShortcircuitAnalysisDiagram(
    diagramId: OneBusShortCircuitAnalysisDiagram['diagramId'],
    nodeId: OneBusShortCircuitAnalysisDiagram['nodeId']
): SetOneBusShortcircuitAnalysisDiagramAction;
export function setOneBusShortcircuitAnalysisDiagram(
    diagramId: OneBusShortCircuitAnalysisDiagram['diagramId'] | null,
    nodeId?: OneBusShortCircuitAnalysisDiagram['nodeId']
): SetOneBusShortcircuitAnalysisDiagramAction {
    return {
        type: SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
        diagramId: diagramId,
        // @ts-expect-error: function overload protect call
        nodeId: nodeId,
    };
}

export const ADD_TO_RECENT_GLOBAL_FILTERS = 'ADD_TO_RECENT_GLOBAL_FILTERS';
export type AddToRecentGlobalFiltersAction = Readonly<Action<typeof ADD_TO_RECENT_GLOBAL_FILTERS>> & {
    globalFilters: GlobalFilter[];
};

export function addToRecentGlobalFilters(globalFilters: GlobalFilter[]): AddToRecentGlobalFiltersAction {
    return {
        type: ADD_TO_RECENT_GLOBAL_FILTERS,
        globalFilters: globalFilters,
    };
}

export const REMOVE_FROM_RECENT_GLOBAL_FILTERS = 'REMOVE_FROM_RECENT_GLOBAL_FILTERS';
export type RemoveFromRecentGlobalFiltersAction = Readonly<Action<typeof REMOVE_FROM_RECENT_GLOBAL_FILTERS>> & {
    uuid: UUID;
};

export function removeFromRecentGlobalFilters(uuid: UUID): RemoveFromRecentGlobalFiltersAction {
    return {
        type: REMOVE_FROM_RECENT_GLOBAL_FILTERS,
        uuid: uuid,
    };
}

export const SET_LAST_COMPLETED_COMPUTATION = 'SET_LAST_COMPLETED_COMPUTATION';
export type SetLastCompletedComputationAction = Readonly<Action<typeof SET_LAST_COMPLETED_COMPUTATION>> & {
    lastCompletedComputation: ComputingType | null;
};

export function setLastCompletedComputation(
    lastCompletedComputation?: ComputingType
): SetLastCompletedComputationAction {
    return {
        type: SET_LAST_COMPLETED_COMPUTATION,
        lastCompletedComputation: lastCompletedComputation ?? null,
    };
}

export const LOADFLOW_RESULT_FILTER = 'LOADFLOW_RESULT_FILTER';
export type LoadflowResultFilterAction = Readonly<Action<typeof LOADFLOW_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof LOADFLOW_RESULT_STORE_FIELD];
    [LOADFLOW_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setLoadflowResultFilter(
    filterTab: keyof AppState[typeof LOADFLOW_RESULT_STORE_FIELD],
    loadflowResultFilter: FilterConfig[]
): LoadflowResultFilterAction {
    return {
        type: LOADFLOW_RESULT_FILTER,
        filterTab: filterTab,
        [LOADFLOW_RESULT_STORE_FIELD]: loadflowResultFilter,
    };
}

export const SECURITY_ANALYSIS_RESULT_FILTER = 'SECURITY_ANALYSIS_RESULT_FILTER';
export type SecurityAnalysisResultFilterAction = Readonly<Action<typeof SECURITY_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SECURITY_ANALYSIS_RESULT_STORE_FIELD];
    [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setSecurityAnalysisResultFilter(
    filterTab: keyof AppState[typeof SECURITY_ANALYSIS_RESULT_STORE_FIELD],
    securityAnalysisResultFilter: FilterConfig[]
): SecurityAnalysisResultFilterAction {
    return {
        type: SECURITY_ANALYSIS_RESULT_FILTER,
        filterTab: filterTab,
        [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: securityAnalysisResultFilter,
    };
}

export const SENSITIVITY_ANALYSIS_RESULT_FILTER = 'SENSITIVITY_ANALYSIS_RESULT_FILTER';
export type SensitivityAnalysisResultFilterAction = Readonly<Action<typeof SENSITIVITY_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD];
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setSensitivityAnalysisResultFilter(
    filterTab: keyof AppState[typeof SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD],
    sensitivityAnalysisResultFilter: FilterConfig[]
): SensitivityAnalysisResultFilterAction {
    return {
        type: SENSITIVITY_ANALYSIS_RESULT_FILTER,
        filterTab: filterTab,
        [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: sensitivityAnalysisResultFilter,
    };
}

export const SHORTCIRCUIT_ANALYSIS_RESULT_FILTER = 'SHORTCIRCUIT_ANALYSIS_RESULT_FILTER';
export type ShortcircuitAnalysisResultFilterAction = Readonly<Action<typeof SHORTCIRCUIT_ANALYSIS_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD];
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setShortcircuitAnalysisResultFilter(
    filterTab: keyof AppState[typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD],
    shortcircuitAnalysisResultFilter: FilterConfig[]
): ShortcircuitAnalysisResultFilterAction {
    return {
        type: SHORTCIRCUIT_ANALYSIS_RESULT_FILTER,
        filterTab: filterTab,
        [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: shortcircuitAnalysisResultFilter,
    };
}

export const DYNAMIC_SIMULATION_RESULT_FILTER = 'DYNAMIC_SIMULATION_RESULT_FILTER';
export type DynamicSimulationResultFilterAction = Readonly<Action<typeof DYNAMIC_SIMULATION_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof DYNAMIC_SIMULATION_RESULT_STORE_FIELD];
    [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setDynamicSimulationResultFilter(
    filterTab: keyof AppState[typeof DYNAMIC_SIMULATION_RESULT_STORE_FIELD],
    dynamicSimulationResultFilter: FilterConfig[]
): DynamicSimulationResultFilterAction {
    return {
        type: DYNAMIC_SIMULATION_RESULT_FILTER,
        filterTab: filterTab,
        [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: dynamicSimulationResultFilter,
    };
}

export const SPREADSHEET_FILTER = 'SPREADSHEET_FILTER';
export type SpreadsheetFilterAction = Readonly<Action<typeof SPREADSHEET_FILTER>> & {
    filterTab: keyof AppState[typeof SPREADSHEET_STORE_FIELD];
    [SPREADSHEET_STORE_FIELD]: FilterConfig[];
};

export function setSpreadsheetFilter(
    filterTab: keyof AppState[typeof SPREADSHEET_STORE_FIELD],
    spreadsheetFilter: FilterConfig[]
): SpreadsheetFilterAction {
    return {
        type: SPREADSHEET_FILTER,
        filterTab: filterTab,
        [SPREADSHEET_STORE_FIELD]: spreadsheetFilter,
    };
}

export const LOGS_FILTER = 'LOGS_FILTER';
export type LogsFilterAction = Readonly<Action<typeof LOGS_FILTER>> & {
    filterTab: keyof AppState[typeof LOGS_STORE_FIELD];
    [LOGS_STORE_FIELD]: FilterConfig[];
};

export function setLogsFilter(
    filterTab: keyof AppState[typeof LOGS_STORE_FIELD],
    logsFilter: FilterConfig[]
): LogsFilterAction {
    return {
        type: LOGS_FILTER,
        filterTab: filterTab,
        [LOGS_STORE_FIELD]: logsFilter,
    };
}

export const RESET_LOGS_FILTER = 'RESET_LOGS_FILTER';
export type ResetLogsFilterAction = Readonly<Action<typeof RESET_LOGS_FILTER>>;

export function resetLogsFilter(): ResetLogsFilterAction {
    return {
        type: RESET_LOGS_FILTER,
    };
}

export const TABLE_SORT = 'TABLE_SORT';
export type TableSortAction = Readonly<Action<typeof TABLE_SORT>> & {
    table: TableSortKeysType;
    tab: string; //AppState['tableSort'][T];
    sort: SortConfig[];
};

export function setTableSort(table: TableSortKeysType, tab: string, sort: SortConfig[]): TableSortAction {
    return {
        type: TABLE_SORT,
        table,
        tab,
        sort,
    };
}

export const UPDATE_COLUMNS_DEFINITION = 'UPDATE_COLUMNS_DEFINITION';
export type UpdateColumnsDefinitionsAction = Readonly<Action<typeof UPDATE_COLUMNS_DEFINITION>> & {
    colData: TableValue<ColumnDefinition>;
};

export function setUpdateColumnsDefinitions(colData: TableValue<ColumnDefinition>): UpdateColumnsDefinitionsAction {
    return {
        type: UPDATE_COLUMNS_DEFINITION,
        colData,
    };
}

export const REMOVE_COLUMN_DEFINITION = 'REMOVE_COLUMN_DEFINITION';
export type RemoveColumnDefinitionAction = Readonly<Action<typeof REMOVE_COLUMN_DEFINITION>> & {
    definition: TableValue<string>;
};

export function setRemoveColumnDefinition(definition: TableValue<string>): RemoveColumnDefinitionAction {
    return {
        type: REMOVE_COLUMN_DEFINITION,
        definition,
    };
}

export const REMOVE_TABLE_DEFINITION = 'REMOVE_TABLE_DEFINITION';
export type RemoveTableDefinitionAction = Readonly<Action<typeof REMOVE_TABLE_DEFINITION>> & {
    tabIndex: number;
};

export function removeTableDefinition(tabIndex: number): RemoveTableDefinitionAction {
    return {
        type: REMOVE_TABLE_DEFINITION,
        tabIndex,
    };
}

export const UPDATE_TABLE_DEFINITION = 'UPDATE_TABLE_DEFINITION';

export type UpdateTableDefinitionAction = {
    type: typeof UPDATE_TABLE_DEFINITION;
    newTableDefinition: SpreadsheetTabDefinition;
};

export const updateTableDefinition = (newTableDefinition: SpreadsheetTabDefinition): UpdateTableDefinitionAction => ({
    type: UPDATE_TABLE_DEFINITION,
    newTableDefinition,
});

export const UPDATE_TABLE_COLUMNS = 'UPDATE_TABLE_COLUMNS';

export type UpdateTableColumnsAction = {
    type: typeof UPDATE_TABLE_COLUMNS;
    spreadsheetConfigUuid: UUID;
    columns: ColumnDefinition[];
};

export const updateTableColumns = (
    spreadsheetConfigUuid: UUID,
    columns: ColumnDefinition[]
): UpdateTableColumnsAction => ({
    type: UPDATE_TABLE_COLUMNS,
    spreadsheetConfigUuid,
    columns,
});

export const RENAME_TABLE_DEFINITION = 'RENAME_TABLE_DEFINITION';
export type RenameTableDefinitionAction = Readonly<Action<typeof RENAME_TABLE_DEFINITION>> & {
    tabUuid: UUID;
    newName: string;
};

export function renameTableDefinition(tabUuid: UUID, newName: string): RenameTableDefinitionAction {
    return {
        type: RENAME_TABLE_DEFINITION,
        tabUuid,
        newName,
    };
}

export const INIT_TABLE_DEFINITIONS = 'INIT_TABLE_DEFINITIONS';

export type InitTableDefinitionsAction = {
    type: typeof INIT_TABLE_DEFINITIONS;
    collectionUuid: UUID;
    tableDefinitions: SpreadsheetTabDefinition[];
    tablesFilters?: SpreadsheetFilterState;
    globalFilterSpreadsheetState?: GlobalFilterSpreadsheetState;
};

export const initTableDefinitions = (
    collectionUuid: UUID,
    tableDefinitions: SpreadsheetTabDefinition[],
    tablesFilters: SpreadsheetFilterState = {},
    globalFilterSpreadsheetState: GlobalFilterSpreadsheetState = {}
): InitTableDefinitionsAction => ({
    type: INIT_TABLE_DEFINITIONS,
    collectionUuid,
    tableDefinitions,
    tablesFilters,
    globalFilterSpreadsheetState,
});

export const REORDER_TABLE_DEFINITIONS = 'REORDER_TABLE_DEFINITIONS';
export type ReorderTableDefinitionsAction = {
    type: typeof REORDER_TABLE_DEFINITIONS;
    definitions: SpreadsheetTabDefinition[];
};

export const reorderTableDefinitions = (definitions: SpreadsheetTabDefinition[]): ReorderTableDefinitionsAction => ({
    type: REORDER_TABLE_DEFINITIONS,
    definitions,
});

export const ADD_FILTER_FOR_NEW_SPREADSHEET = 'ADD_FILTER_FOR_NEW_SPREADSHEET';

export type AddFilterForNewSpreadsheetAction = {
    type: typeof ADD_FILTER_FOR_NEW_SPREADSHEET;
    payload: { tabUuid: UUID; value: FilterConfig[] };
};

export const addFilterForNewSpreadsheet = (tabUuid: UUID, value: FilterConfig[]): AddFilterForNewSpreadsheetAction => ({
    type: ADD_FILTER_FOR_NEW_SPREADSHEET,
    payload: {
        tabUuid,
        value,
    },
});

export const ADD_SORT_FOR_NEW_SPREADSHEET = 'ADD_SORT_FOR_NEW_SPREADSHEET';

export type AddSortForNewSpreadsheetAction = {
    type: typeof ADD_SORT_FOR_NEW_SPREADSHEET;
    payload: { tabUuid: UUID; value: SortConfig[] };
};

export const addSortForNewSpreadsheet = (tabUuid: UUID, value: SortConfig[]): AddSortForNewSpreadsheetAction => ({
    type: ADD_SORT_FOR_NEW_SPREADSHEET,
    payload: {
        tabUuid,
        value,
    },
});

export const STATEESTIMATION_RESULT_FILTER = 'STATEESTIMATION_RESULT_FILTER';
export type StateEstimationResultFilterAction = Readonly<Action<typeof STATEESTIMATION_RESULT_FILTER>> & {
    filterTab: keyof AppState[typeof STATEESTIMATION_RESULT_STORE_FIELD];
    [STATEESTIMATION_RESULT_STORE_FIELD]: FilterConfig[];
};

export function setStateEstimationResultFilter(
    filterTab: keyof AppState[typeof STATEESTIMATION_RESULT_STORE_FIELD],
    stateEstimationResultFilter: FilterConfig[]
): StateEstimationResultFilterAction {
    return {
        type: STATEESTIMATION_RESULT_FILTER,
        filterTab: filterTab,
        [STATEESTIMATION_RESULT_STORE_FIELD]: stateEstimationResultFilter,
    };
}

export const SAVE_SPREADSHEET_GS_FILTER = 'SAVE_SPREADSHEET_GS_FILTER';
export type SaveSpreadSheetGlobalFilterAction = Readonly<Action<typeof SAVE_SPREADSHEET_GS_FILTER>> & {
    tabUuid: UUID;
    filters: GlobalFilter[];
};

export function saveSpreadsheetGlobalFilters(
    tabUuid: UUID,
    filters: GlobalFilter[]
): SaveSpreadSheetGlobalFilterAction {
    return {
        type: SAVE_SPREADSHEET_GS_FILTER,
        tabUuid: tabUuid,
        filters: filters,
    };
}

export const SET_CALCULATION_SELECTIONS = 'SET_CALCULATION_SELECTIONS';
export type SetCalculationSelectionsAction = Readonly<Action<typeof SET_CALCULATION_SELECTIONS>> & {
    tabUuid: UUID;
    selections: string[];
};

export function setCalculationSelections(tabUuid: UUID, selections: string[]): SetCalculationSelectionsAction {
    return {
        type: SET_CALCULATION_SELECTIONS,
        tabUuid,
        selections,
    };
}

export const RESET_ALL_SPREADSHEET_GS_FILTERS = 'RESET_ALL_SPREADSHEET_GS_FILTERS';
export type ResetAllSpreadsheetGlobalFiltersAction = Readonly<Action<typeof RESET_ALL_SPREADSHEET_GS_FILTERS>>;

export function resetAllSpreadsheetGlobalFilters(): ResetAllSpreadsheetGlobalFiltersAction {
    return {
        type: RESET_ALL_SPREADSHEET_GS_FILTERS,
    };
}

export const DELETED_OR_RENAMED_NODES = 'DELETED_OR_RENAMED_NODES';
export type DeletedOrRenamedNodesAction = Readonly<Action<typeof DELETED_OR_RENAMED_NODES>> & {
    deletedOrRenamedNodes: UUID[];
};

export function deletedOrRenamedNodes(deletedOrRenamedNodes: UUID[]): DeletedOrRenamedNodesAction {
    return {
        type: DELETED_OR_RENAMED_NODES,
        deletedOrRenamedNodes,
    };
}

export const RESET_DIAGRAM_EVENT = 'RESET_DIAGRAM_EVENT';
export type ResetDiagramEventAction = Readonly<Action<typeof RESET_DIAGRAM_EVENT>>;

export function resetDiagramEvent(): ResetDiagramEventAction {
    return {
        type: RESET_DIAGRAM_EVENT,
    };
}

export const SET_DIAGRAM_GRID_LAYOUT = 'SET_DIAGRAM_GRID_LAYOUT';
export type SetDiagramGridLayoutAction = Readonly<Action<typeof SET_DIAGRAM_GRID_LAYOUT>> & {
    diagramGridLayout: DiagramGridLayoutConfig;
};

export function setDiagramGridLayout(diagramGridLayout: DiagramGridLayoutConfig): SetDiagramGridLayoutAction {
    return {
        type: SET_DIAGRAM_GRID_LAYOUT,
        diagramGridLayout: diagramGridLayout,
    };
}
