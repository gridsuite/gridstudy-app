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
import { GsLang, GsLangUser, GsTheme, Identifiable } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import type { UnknownArray } from 'type-fest';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { NodeInsertModes } from '../components/graph/nodes/node-insert-modes';
import { ComputingType } from '../components/computing-status/computing-type';
import { RunningStatus } from '../components/utils/running-status';
import { IOptionalService } from '../components/utils/optional-services';
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
import { NetworkModificationNodeData, RootNodeData } from '../components/graph/tree-node.type';
import {
    ColumnDefinition,
    ColumnState,
    SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../components/spreadsheet/config/spreadsheet.type';
import { NetworkVisualizationParameters } from '../components/dialogs/parameters/network-visualizations/network-visualizations.types';
import { FilterConfig, SortConfig } from '../types/custom-aggrid-types';
import { ExpertFilter } from '../services/study/filter';
import { Filter } from '../components/results/common/filter.type';
import {
    AddEquipmentsByNodesForCustomColumnsAction,
    AddFilterForNewSpreadsheetAction,
    AdditionalNodeData,
    AddNotificationAction,
    AddSortForNewSpreadsheetAction,
    AddToRecentGlobalFiltersAction,
    CenterOnSubstationAction,
    ChangeDisplayedColumnsNamesAction,
    ChangeLockedColumnsNamesAction,
    CloseDiagramAction,
    CloseDiagramsAction,
    CloseStudyAction,
    CurrentRootNetworkAction,
    CurrentTreeNodeAction,
    DecrementNetworkAreaDiagramDepthAction,
    DeleteEquipmentsAction,
    DynamicSimulationResultFilterAction,
    EnableDeveloperModeAction,
    EquipmentToDelete,
    FavoriteContingencyListsAction,
    IncrementNetworkAreaDiagramDepthAction,
    LoadEquipmentsAction,
    LoadflowResultFilterAction,
    LoadNetworkModificationTreeSuccessAction,
    LogsFilterAction,
    MapDataLoadingAction,
    MapEquipmentsCreatedAction,
    MapEquipmentsInitializedAction,
    MinimizeDiagramAction,
    MutableUnknownArray,
    NetworkAreaDiagramNbVoltageLevelsAction,
    NetworkModificationHandleSubtreeAction,
    NetworkModificationTreeNodeAddedAction,
    NetworkModificationTreeNodeMovedAction,
    NetworkModificationTreeNodesRemovedAction,
    NetworkModificationTreeNodesReorderAction,
    NetworkModificationTreeNodesUpdatedAction,
    NodeSelectionForCopyAction,
    OpenDiagramAction,
    OpenNadListAction,
    OpenStudyAction,
    RemoveColumnDefinitionAction,
    RemoveNodeDataAction,
    RemoveNotificationByNodeAction,
    RemoveSelectedCaseAction,
    ResetEquipmentsAction,
    ResetEquipmentsByTypesAction,
    ResetEquipmentsPostLoadflowAction,
    ResetLogsFilterAction,
    ResetMapEquipmentsAction,
    ResetMapReloadedAction,
    ResetNetworkAreaDiagramDepthAction,
    SaveSpreadSheetGsFilterAction,
    SecurityAnalysisResultFilterAction,
    SelectComputedLanguageAction,
    SelectLanguageAction,
    SelectThemeAction,
    SensitivityAnalysisResultFilterAction,
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
    ShortcircuitAnalysisResultFilterAction,
    SpreadsheetFilterAction,
    StateEstimationResultFilterAction,
    StopDiagramBlinkAction,
    StoreNetworkAreaDiagramNodeMovementAction,
    StoreNetworkAreaDiagramTextNodeMovementAction,
    StudyUpdatedAction,
    TableSortAction,
    TableValue,
    TogglePinDiagramAction,
    UpdateColumnsDefinitionsAction,
    UpdateCustomColumnsNodesAliasesAction,
    UpdateEquipmentsAction,
    UpdateNetworkVisualizationParametersAction,
    UpdateTableDefinitionAction,
    UseNameAction,
} from './actions.type';
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
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import { AppState, IGSMapEquipments } from './app-state.type';

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

export function addAdditionalEquipmentsByNodesForCustomColumns(
    type: SpreadsheetEquipmentType,
    data: AdditionalNodeData[]
): AddEquipmentsByNodesForCustomColumnsAction {
    return {
        type: ADD_ADDITIONAL_EQUIPMENTS_BY_NODES_FOR_CUSTOM_COLUMNS,
        equipmentType: type,
        data,
    };
}

export function removeNodeData(nodesIdToRemove: string[]): RemoveNodeDataAction {
    return {
        type: REMOVE_NODE_DATA,
        nodesIdToRemove,
    };
}

export function updateCustomColumnsNodesAliases(nodesAliases: NodeAlias[]): UpdateCustomColumnsNodesAliasesAction {
    return {
        type: UPDATE_CUSTOM_COLUMNS_NODES_ALIASES,
        nodesAliases: nodesAliases,
    };
}

export function updateEquipments(
    equipments: Record<EquipmentUpdateType, Identifiable[]>,
    nodeId: UUID
): UpdateEquipmentsAction {
    return {
        type: UPDATE_EQUIPMENTS,
        equipments: equipments,
        nodeId: nodeId,
    };
}

export function deleteEquipments(equipments: EquipmentToDelete[], nodeId: UUID): DeleteEquipmentsAction {
    return {
        type: DELETE_EQUIPMENTS,
        equipments,
        nodeId,
    };
}

export function resetEquipments(): ResetEquipmentsAction {
    return {
        type: RESET_EQUIPMENTS,
    };
}

export function resetEquipmentsByTypes(equipmentTypes: SpreadsheetEquipmentType[]): ResetEquipmentsByTypesAction {
    return {
        type: RESET_EQUIPMENTS_BY_TYPES,
        equipmentTypes: equipmentTypes,
    };
}

export function resetEquipmentsPostLoadflow(): ResetEquipmentsPostLoadflowAction {
    return {
        type: RESET_EQUIPMENTS_POST_LOADFLOW,
    };
}

export function resetMapEquipment(): ResetMapEquipmentsAction {
    return {
        type: RESET_MAP_EQUIPMENTS,
    };
}

export function loadNetworkModificationTreeSuccess(
    networkModificationTreeModel: NetworkModificationTreeModel
): LoadNetworkModificationTreeSuccessAction {
    return {
        type: LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
        networkModificationTreeModel: networkModificationTreeModel,
    };
}

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

export function networkModificationTreeNodesRemoved(
    networkModificationTreeNodes: UUID[]
): NetworkModificationTreeNodesRemovedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_REMOVED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export function networkModificationTreeNodesUpdated(
    networkModificationTreeNodes: CurrentTreeNode[]
): NetworkModificationTreeNodesUpdatedAction {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_UPDATED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export function selectTheme(theme: GsTheme): SelectThemeAction {
    return { type: SELECT_THEME, [PARAM_THEME]: theme };
}

export function selectLanguage(language: GsLang): SelectLanguageAction {
    return { type: SELECT_LANGUAGE, [PARAM_LANGUAGE]: language };
}

export function selectComputedLanguage(computedLanguage: GsLangUser): SelectComputedLanguageAction {
    return {
        type: SELECT_COMPUTED_LANGUAGE,
        computedLanguage: computedLanguage,
    };
}

export function setParamsLoaded(): SetParamsLoadedAction {
    return {
        type: SET_PARAMS_LOADED,
        [PARAMS_LOADED]: true,
    };
}

export function openStudy(studyUuid: UUID): OpenStudyAction {
    return { type: OPEN_STUDY, studyRef: [studyUuid] };
}

export function closeStudy(): CloseStudyAction {
    return { type: CLOSE_STUDY };
}

export function removeSelectedCase(): RemoveSelectedCaseAction {
    return { type: REMOVE_SELECTED_CASE };
}

export function selectUseName(useName: boolean): UseNameAction {
    return { type: USE_NAME, [PARAM_USE_NAME]: useName };
}

export function setUpdateNetworkVisualizationParameters(
    parameters: NetworkVisualizationParameters
): UpdateNetworkVisualizationParametersAction {
    return {
        type: UPDATE_NETWORK_VISUALIZATION_PARAMETERS,
        parameters: parameters,
    };
}

export function selectEnableDeveloperMode(enableDeveloperMode: boolean): EnableDeveloperModeAction {
    return {
        type: ENABLE_DEVELOPER_MODE,
        [PARAM_DEVELOPER_MODE]: enableDeveloperMode,
    };
}

/*
export type StudyUpdated = {
    force: IntRange<0, 1>;
} & (StudyUpdatedUndefined | StudyUpdatedStudy);
 */
export function studyUpdated(eventData: StudyUpdatedEventData): StudyUpdatedAction {
    return { type: STUDY_UPDATED, eventData };
}

export function setMapDataLoading(mapDataLoading: boolean): MapDataLoadingAction {
    return {
        type: MAP_DATA_LOADING,
        mapDataLoading,
    };
}

export function resetMapReloaded(): ResetMapReloadedAction {
    return {
        type: RESET_MAP_RELOADED,
    };
}

export function setFullScreenDiagram(diagramIdParam: null): SetFullscreenDiagramAction;
export function setFullScreenDiagram(diagramIdParam: string, svgTypeParam: DiagramType): SetFullscreenDiagramAction;
export function setFullScreenDiagram(
    diagramIdParam: string | null,
    svgTypeParam?: DiagramType
): SetFullscreenDiagramAction {
    if (diagramIdParam === null) {
        return {
            type: SET_FULLSCREEN_DIAGRAM,
            diagramId: diagramIdParam,
        };
    } else {
        return {
            type: SET_FULLSCREEN_DIAGRAM,
            diagramId: diagramIdParam,
            svgType: svgTypeParam!,
        };
    }
}

export function changeDisplayedColumns(
    displayedColumnsParams: TableValue<ColumnState[]>
): ChangeDisplayedColumnsNamesAction {
    return {
        type: CHANGE_DISPLAYED_COLUMNS_NAMES,
        displayedColumnsNamesParams: displayedColumnsParams,
    };
}

export function changeLockedColumns(lockedColumnsParams: TableValue<Set<string>>): ChangeLockedColumnsNamesAction {
    return {
        type: CHANGE_LOCKED_COLUMNS_NAMES,
        lockedColumnsNamesParams: lockedColumnsParams,
    };
}

export function selectFavoriteContingencyLists(
    favoriteContingencyLists: MutableUnknownArray
): FavoriteContingencyListsAction {
    return {
        type: FAVORITE_CONTINGENCY_LISTS,
        [PARAM_FAVORITE_CONTINGENCY_LISTS]: favoriteContingencyLists,
    };
}

export function setCurrentTreeNode(currentTreeNode: CurrentTreeNode): CurrentTreeNodeAction {
    return {
        type: CURRENT_TREE_NODE,
        currentTreeNode: currentTreeNode,
    };
}

export function setCurrentRootNetwork(currentRootNetwork: UUID): CurrentRootNetworkAction {
    return {
        type: CURRENT_ROOT_NETWORK,
        currentRootNetwork: currentRootNetwork,
    };
}

export function setNodeSelectionForCopy(
    nodeSelectionForCopy: NonNullable<NodeSelectionForCopy>
): NodeSelectionForCopyAction {
    return {
        type: NODE_SELECTION_FOR_COPY,
        nodeSelectionForCopy: nodeSelectionForCopy,
    };
}

export function setModificationsDrawerOpen(isModificationsDrawerOpen: boolean): SetModificationsDrawerOpenAction {
    return {
        type: SET_MODIFICATIONS_DRAWER_OPEN,
        isModificationsDrawerOpen: isModificationsDrawerOpen,
    };
}

export function setEventScenarioDrawerOpen(isEventScenarioDrawerOpen: boolean): SetEventScenarioDrawerOpenAction {
    return {
        type: SET_EVENT_SCENARIO_DRAWER_OPEN,
        isEventScenarioDrawerOpen: isEventScenarioDrawerOpen,
    };
}

export function centerOnSubstation(substationId: string): CenterOnSubstationAction {
    return {
        type: CENTER_ON_SUBSTATION,
        centerOnSubstation: { to: substationId },
    };
}

export function addNotification(notificationIds: UUID[]): AddNotificationAction {
    return {
        type: ADD_NOTIFICATION,
        notificationIds: notificationIds,
    };
}

export function removeNotificationByNode(notificationIds: UnknownArray): RemoveNotificationByNodeAction {
    return {
        type: REMOVE_NOTIFICATION_BY_NODE,
        notificationIds: notificationIds,
    };
}

export function setModificationsInProgress(isModificationsInProgress: boolean): SetModificationsInProgressAction {
    return {
        type: SET_MODIFICATIONS_IN_PROGRESS,
        isModificationsInProgress: isModificationsInProgress,
    };
}

export function setStudyDisplayMode(studyDisplayMode: StudyDisplayMode): SetStudyDisplayModeAction {
    return {
        type: SET_STUDY_DISPLAY_MODE,
        studyDisplayMode: studyDisplayMode,
    };
}

export function openDiagram(id: string, svgType: DiagramType): OpenDiagramAction {
    return {
        type: OPEN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export function openNadList(ids: string[]): OpenNadListAction {
    return {
        type: OPEN_NAD_LIST,
        ids: ids,
    };
}

export function minimizeDiagram(id: string, svgType: DiagramType): MinimizeDiagramAction {
    return {
        type: MINIMIZE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export function togglePinDiagram(id: string, svgType: DiagramType): TogglePinDiagramAction {
    return {
        type: TOGGLE_PIN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export function closeDiagram(id: string, svgType: DiagramType): CloseDiagramAction {
    return {
        type: CLOSE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export function closeDiagrams(ids: string[]): CloseDiagramsAction {
    return {
        type: CLOSE_DIAGRAMS,
        ids: ids,
    };
}

export function stopDiagramBlink(): StopDiagramBlinkAction {
    return {
        type: STOP_DIAGRAM_BLINK,
    };
}

export function resetNetworkAreaDiagramDepth(): ResetNetworkAreaDiagramDepthAction {
    return {
        type: RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export function incrementNetworkAreaDiagramDepth(): IncrementNetworkAreaDiagramDepthAction {
    return {
        type: INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export function decrementNetworkAreaDiagramDepth(): DecrementNetworkAreaDiagramDepthAction {
    return {
        type: DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export function storeNetworkAreaDiagramNodeMovement(
    nadIdentifier: string,
    equipmentId: string,
    x: number,
    y: number,
    scalingFactor: number
): StoreNetworkAreaDiagramNodeMovementAction {
    return {
        type: STORE_NETWORK_AREA_DIAGRAM_NODE_MOVEMENT,
        nadIdentifier: nadIdentifier,
        equipmentId: equipmentId,
        x: x,
        y: y,
        scalingFactor: scalingFactor,
    };
}

export function storeNetworkAreaDiagramTextNodeMovement(
    nadIdentifier: string,
    equipmentId: string,
    shiftX: number,
    shiftY: number,
    connectionShiftX: number,
    connectionShiftY: number
): StoreNetworkAreaDiagramTextNodeMovementAction {
    return {
        type: STORE_NETWORK_AREA_DIAGRAM_TEXT_NODE_MOVEMENT,
        nadIdentifier: nadIdentifier,
        equipmentId: equipmentId,
        shiftX: shiftX,
        shiftY: shiftY,
        connectionShiftX: connectionShiftX,
        connectionShiftY: connectionShiftY,
    };
}

export function setNetworkAreaDiagramNbVoltageLevels(nbVoltageLevels: number): NetworkAreaDiagramNbVoltageLevelsAction {
    return {
        type: NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
        nbVoltageLevels: nbVoltageLevels,
    };
}

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

export function setComputationStarting(computationStarting: boolean): SetComputationStartingAction {
    return {
        type: SET_COMPUTATION_STARTING,
        computationStarting: computationStarting,
    };
}

export function setStudyIndexationStatus(studyIndexationStatus: StudyIndexationStatus): SetStudyIndexationStatusAction {
    return {
        type: SET_STUDY_INDEXATION_STATUS,
        studyIndexationStatus: studyIndexationStatus,
    };
}

export function setOptionalServices(optionalServices: IOptionalService[]): SetOptionalServicesAction {
    return {
        type: SET_OPTIONAL_SERVICES,
        optionalServices: optionalServices,
    };
}

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

export function addToRecentGlobalFilters(globalFilters: Filter[]): AddToRecentGlobalFiltersAction {
    return {
        type: ADD_TO_RECENT_GLOBAL_FILTERS,
        globalFilters: globalFilters,
    };
}

export function setLastCompletedComputation(
    lastCompletedComputation?: ComputingType
): SetLastCompletedComputationAction {
    return {
        type: SET_LAST_COMPLETED_COMPUTATION,
        lastCompletedComputation: lastCompletedComputation ?? null,
    };
}

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

export function resetLogsFilter(): ResetLogsFilterAction {
    return {
        type: RESET_LOGS_FILTER,
    };
}

export function setTableSort(table: TableSortKeysType, tab: string, sort: SortConfig[]): TableSortAction {
    return {
        type: TABLE_SORT,
        table,
        tab,
        sort,
    };
}

export function setUpdateColumnsDefinitions(colData: TableValue<ColumnDefinition>): UpdateColumnsDefinitionsAction {
    return {
        type: UPDATE_COLUMNS_DEFINITION,
        colData,
    };
}

export function setRemoveColumnDefinition(definition: TableValue<string>): RemoveColumnDefinitionAction {
    return {
        type: REMOVE_COLUMN_DEFINITION,
        definition,
    };
}

export const updateTableDefinition = (newTableDefinition: SpreadsheetTabDefinition): UpdateTableDefinitionAction => ({
    type: UPDATE_TABLE_DEFINITION,
    newTableDefinition,
});

export const addFilterForNewSpreadsheet = (
    newTabName: string,
    value: FilterConfig[]
): AddFilterForNewSpreadsheetAction => ({
    type: ADD_FILTER_FOR_NEW_SPREADSHEET,
    payload: {
        newTabName,
        value,
    },
});

export const addSortForNewSpreadsheet = (newTabName: string, value: SortConfig[]): AddSortForNewSpreadsheetAction => ({
    type: ADD_SORT_FOR_NEW_SPREADSHEET,
    payload: {
        newTabName,
        value,
    },
});

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

export function saveSpreadsheetGsFilters(
    equipmentType: SpreadsheetEquipmentType,
    filters: ExpertFilter[]
): SaveSpreadSheetGsFilterAction {
    return {
        type: SAVE_SPREADSHEET_GS_FILTER,
        equipmentType: equipmentType,
        filters: filters,
    };
}

export function mapEquipmentsCreated(
    mapEquipments: IGSMapEquipments,
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

export function setMapEquipementsInitialized(newValue: boolean): MapEquipmentsInitializedAction {
    return {
        type: MAP_EQUIPMENTS_INITIALIZED,
        newValue,
    };
}
