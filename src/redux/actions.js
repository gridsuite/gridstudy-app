/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LANGUAGE,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_COMPONENT_LIBRARY,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_FLUX_CONVENTION,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_DEVELOPER_MODE,
    PARAMS_LOADED,
} from '../utils/config-params';

export const NETWORK_EQUIPMENT_FETCHED = 'NETWORK_EQUIPMENT_FETCHED';

export function isNetworkEquipmentsFetched(fetched) {
    return {
        type: NETWORK_EQUIPMENT_FETCHED,
        networkEquipmentsFetched: fetched,
    };
}

export const NETWORK_CREATED = 'NETWORK_CREATED';

export function networkCreated(network) {
    return { type: NETWORK_CREATED, network: network };
}

export const MAP_EQUIPMENTS_CREATED = 'MAP_EQUIPMENTS_CREATED';

export function mapEquipmentsCreated(
    mapEquipments,
    newLines,
    newSubstations,
    newHvdcLines
) {
    return {
        type: MAP_EQUIPMENTS_CREATED,
        mapEquipments: mapEquipments,
        newLines: newLines,
        newSubstations: newSubstations,
        newHvdcLines: newHvdcLines,
    };
}

export const NETWORK_EQUIPMENT_LOADED = 'NETWORK_EQUIPMENT_LOADED';

export function networkEquipmentLoaded(equipmentsName, values) {
    return {
        type: NETWORK_EQUIPMENT_LOADED,
        equipmentsName: equipmentsName,
        values: values,
    };
}

export const LOAD_GEO_DATA_SUCCESS = 'LOAD_GEO_DATA_SUCCESS';

export function loadGeoDataSuccess(geoData) {
    return { type: LOAD_GEO_DATA_SUCCESS, geoData: geoData };
}

export const LOAD_NETWORK_MODIFICATION_TREE_SUCCESS =
    'LOAD_NETWORK_MODIFICATION_TREE_SUCCESS';

export function loadNetworkModificationTreeSuccess(
    networkModificationTreeModel
) {
    return {
        type: LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
        networkModificationTreeModel: networkModificationTreeModel,
    };
}

export const NETWORK_MODIFICATION_TREE_NODE_ADDED =
    'NETWORK_MODIFICATION_TREE_NODE_ADDED';

export function networkModificationTreeNodeAdded(
    networkModificationTreeNode,
    parentNodeId,
    insertMode
) {
    return {
        type: NETWORK_MODIFICATION_TREE_NODE_ADDED,
        networkModificationTreeNode: networkModificationTreeNode,
        parentNodeId: parentNodeId,
        insertMode: insertMode,
    };
}

export const NETWORK_MODIFICATION_TREE_NODE_MOVED =
    'NETWORK_MODIFICATION_TREE_NODE_MOVED';

export function networkModificationTreeNodeMoved(
    networkModificationTreeNode,
    parentNodeId,
    insertMode
) {
    return {
        type: NETWORK_MODIFICATION_TREE_NODE_MOVED,
        networkModificationTreeNode: networkModificationTreeNode,
        parentNodeId: parentNodeId,
        insertMode: insertMode,
    };
}

export const NETWORK_MODIFICATION_TREE_NODES_REMOVED =
    'NETWORK_MODIFICATION_TREE_NODES_REMOVED';

export function networkModificationTreeNodesRemoved(
    networkModificationTreeNodes
) {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_REMOVED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export const NETWORK_MODIFICATION_TREE_NODES_UPDATED =
    'NETWORK_MODIFICATION_TREE_NODES_UPDATED';

export function networkModificationTreeNodesUpdated(
    networkModificationTreeNodes
) {
    return {
        type: NETWORK_MODIFICATION_TREE_NODES_UPDATED,
        networkModificationTreeNodes: networkModificationTreeNodes,
    };
}

export const SELECT_THEME = 'SELECT_THEME';

export function selectTheme(theme) {
    return { type: SELECT_THEME, [PARAM_THEME]: theme };
}

export const SELECT_LANGUAGE = 'SELECT_LANGUAGE';

export function selectLanguage(language) {
    return { type: SELECT_LANGUAGE, [PARAM_LANGUAGE]: language };
}

export const SELECT_COMPUTED_LANGUAGE = 'SELECT_COMPUTED_LANGUAGE';

export function selectComputedLanguage(computedLanguage) {
    return {
        type: SELECT_COMPUTED_LANGUAGE,
        computedLanguage: computedLanguage,
    };
}

export const SET_PARAMS_LOADED = 'SET_PARAMS_LOADED';

export function setParamsLoaded() {
    return {
        type: SET_PARAMS_LOADED,
        [PARAMS_LOADED]: true,
    };
}

export const OPEN_STUDY = 'OPEN_STUDY';

export function openStudy(studyUuid) {
    return { type: OPEN_STUDY, studyRef: [studyUuid] };
}

export const CLOSE_STUDY = 'CLOSE_STUDY';

export function closeStudy() {
    return { type: CLOSE_STUDY };
}

export const REMOVE_SELECTED_CASE = 'REMOVE_SELECTED_CASE';

export function removeSelectedCase() {
    return { type: REMOVE_SELECTED_CASE };
}

export const USE_NAME = 'USE_NAME';

export function selectUseName(useName) {
    return { type: USE_NAME, [PARAM_USE_NAME]: useName };
}

export const CENTER_LABEL = 'CENTER_LABEL';

export function selectCenterLabelState(centerLabel) {
    return { type: CENTER_LABEL, [PARAM_CENTER_LABEL]: centerLabel };
}

export const DIAGONAL_LABEL = 'DIAGONAL_LABEL';

export function selectDiagonalLabelState(diagonalLabel) {
    return { type: DIAGONAL_LABEL, [PARAM_DIAGONAL_LABEL]: diagonalLabel };
}

export const LINE_FULL_PATH = 'LINE_FULL_PATH';

export function selectLineFullPathState(lineFullPath) {
    return { type: LINE_FULL_PATH, [PARAM_LINE_FULL_PATH]: lineFullPath };
}

export const LINE_PARALLEL_PATH = 'LINE_PARALLEL_PATH';

export function selectLineParallelPathState(lineParallelPath) {
    return {
        type: LINE_PARALLEL_PATH,
        [PARAM_LINE_PARALLEL_PATH]: lineParallelPath,
    };
}

export const LINE_FLOW_MODE = 'LINE_FLOW_MODE';

export function selectLineFlowMode(lineFlowMode) {
    return { type: LINE_FLOW_MODE, [PARAM_LINE_FLOW_MODE]: lineFlowMode };
}

export const FLUX_CONVENTION = 'FLUX_CONVENTION';

export function selectFluxConvention(fluxConvention) {
    return { type: FLUX_CONVENTION, [PARAM_FLUX_CONVENTION]: fluxConvention };
}

export const ENABLE_DEVELOPER_MODE = 'ENABLE_DEVELOPER_MODE';

export function selectEnableDeveloperMode(enableDeveloperMode) {
    return {
        type: ENABLE_DEVELOPER_MODE,
        [PARAM_DEVELOPER_MODE]: enableDeveloperMode,
    };
}

export const LINE_FLOW_COLOR_MODE = 'LINE_FLOW_COLOR_MODE';

export function selectLineFlowColorMode(lineFlowColorMode) {
    return {
        type: LINE_FLOW_COLOR_MODE,
        [PARAM_LINE_FLOW_COLOR_MODE]: lineFlowColorMode,
    };
}

export const LINE_FLOW_ALERT_THRESHOLD = 'LINE_FLOW_ALERT_THRESHOLD';

export function selectLineFlowAlertThreshold(lineFlowAlertThreshold) {
    return {
        type: LINE_FLOW_ALERT_THRESHOLD,
        [PARAM_LINE_FLOW_ALERT_THRESHOLD]: lineFlowAlertThreshold,
    };
}

export const STUDY_UPDATED = 'STUDY_UPDATED';

export function studyUpdated(eventData) {
    return { type: STUDY_UPDATED, eventData };
}

export const DISPLAY_OVERLOAD_TABLE = 'DISPLAY_OVERLOAD_TABLE';

export function selectDisplayOverloadTableState(displayOverloadTable) {
    return {
        type: DISPLAY_OVERLOAD_TABLE,
        [PARAM_DISPLAY_OVERLOAD_TABLE]: displayOverloadTable,
    };
}

export const MAP_MANUAL_REFRESH = 'MAP_MANUAL_REFRESH';

export function selectMapManualRefresh(mapManualRefresh) {
    return {
        type: MAP_MANUAL_REFRESH,
        [PARAM_MAP_MANUAL_REFRESH]: mapManualRefresh,
    };
}

export const RESET_MAP_RELOADED = 'RESET_MAP_RELOADED';

export function resetMapReloaded() {
    return {
        type: RESET_MAP_RELOADED,
    };
}

export const ADD_LOADFLOW_NOTIF = 'ADD_LOADFLOW_NOTIF';

export function addLoadflowNotif() {
    return { type: ADD_LOADFLOW_NOTIF };
}

export const RESET_LOADFLOW_NOTIF = 'RESET_LOADFLOW_NOTIF';

export function resetLoadflowNotif() {
    return { type: RESET_LOADFLOW_NOTIF };
}

export const ADD_SA_NOTIF = 'ADD_SA_NOTIF';

export function addSANotif() {
    return { type: ADD_SA_NOTIF };
}

export const RESET_SA_NOTIF = 'RESET_SA_NOTIF';

export function resetSANotif() {
    return { type: RESET_SA_NOTIF };
}

export const ADD_SENSI_NOTIF = 'ADD_SENSI_NOTIF';

export function addSensiNotif() {
    return { type: ADD_SENSI_NOTIF };
}

export const RESET_SENSI_NOTIF = 'RESET_SENSI_NOTIF';

export function resetSensiNotif() {
    return { type: RESET_SENSI_NOTIF };
}

export const ADD_SHORT_CIRCUIT_NOTIF = 'ADD_SHORT_CIRCUIT_NOTIF';

export function addShortCircuitNotif() {
    return { type: ADD_SHORT_CIRCUIT_NOTIF };
}

export const RESET_SHORT_CIRCUIT_NOTIF = 'RESET_SHORT_CIRCUIT_NOTIF';

export function resetShortCircuitNotif() {
    return { type: RESET_SHORT_CIRCUIT_NOTIF };
}

// --- Dynamic simulation ACTION - BEGIN
export const ADD_DYNAMIC_SIMULATION_NOTIF = 'ADD_DYNAMIC_SIMULATION_NOTIF';

export function addDynamicSimulationNotif() {
    return { type: ADD_DYNAMIC_SIMULATION_NOTIF };
}

export const RESET_DYNAMIC_SIMULATION_NOTIF = 'RESET_DYNAMIC_SIMULATION_NOTIF';

export function resetDynamicSimulationNotif() {
    return { type: RESET_DYNAMIC_SIMULATION_NOTIF };
}
// --- Dynamic simulation ACTION - END

export const SUBSTATION_LAYOUT = 'SUBSTATION_LAYOUT';

export function selectSubstationLayout(substationLayout) {
    return {
        type: SUBSTATION_LAYOUT,
        [PARAM_SUBSTATION_LAYOUT]: substationLayout,
    };
}

export const COMPONENT_LIBRARY = 'COMPONENT_LIBRARY';

export function selectComponentLibrary(componentLibrary) {
    return {
        type: COMPONENT_LIBRARY,
        [PARAM_COMPONENT_LIBRARY]: componentLibrary,
    };
}

export const SET_FULLSCREEN_DIAGRAM = 'SET_FULLSCREEN_DIAGRAM';

export function setFullScreenDiagram(diagramIdParam, svgTypeParam = undefined) {
    return {
        type: SET_FULLSCREEN_DIAGRAM,
        diagramId: diagramIdParam,
        svgType: svgTypeParam,
    };
}

export const CHANGE_DISPLAYED_COLUMNS_NAMES = 'CHANGE_DISPLAYED_COLUMNS_NAMES';

export function changeDisplayedColumns(displayedColumnsParams) {
    return {
        type: CHANGE_DISPLAYED_COLUMNS_NAMES,
        displayedColumnsNamesParams: displayedColumnsParams,
    };
}

export const CHANGE_LOCKED_COLUMNS_NAMES = 'CHANGE_LOCKED_COLUMNS_NAMES';

export function changeLockedColumns(lockedColumnsParams) {
    return {
        type: CHANGE_LOCKED_COLUMNS_NAMES,
        lockedColumnsNamesParams: lockedColumnsParams,
    };
}

export const CHANGE_REORDERED_COLUMNS = 'CHANGE_REORDERED_COLUMNS';

export function changeReorderedColumns(reorderedColumnsParams) {
    return {
        type: CHANGE_REORDERED_COLUMNS,
        reorderedColumnsParams: reorderedColumnsParams,
    };
}

export const FAVORITE_CONTINGENCY_LISTS = 'FAVORITE_CONTINGENCY_LISTS';

export function selectFavoriteContingencyLists(favoriteContingencyLists) {
    return {
        type: FAVORITE_CONTINGENCY_LISTS,
        [PARAM_FAVORITE_CONTINGENCY_LISTS]: favoriteContingencyLists,
    };
}

export const CURRENT_TREE_NODE = 'CURRENT_NODE';

export function setCurrentTreeNode(currentTreeNode) {
    return {
        type: CURRENT_TREE_NODE,
        currentTreeNode: currentTreeNode,
    };
}

export const SELECTED_TREE_NODE_FOR_COPY = 'SELECTED_NODE_FOR_COPY';

export function setSelectedNodeForCopy(nodeForCopy) {
    return {
        type: SELECTED_TREE_NODE_FOR_COPY,
        selectedNodeForCopy: nodeForCopy,
    };
}

export const SET_MODIFICATIONS_DRAWER_OPEN = 'SET_MODIFICATIONS_DRAWER_OPEN';

export function setModificationsDrawerOpen(isModificationsDrawerOpen) {
    return {
        type: SET_MODIFICATIONS_DRAWER_OPEN,
        isModificationsDrawerOpen: isModificationsDrawerOpen,
    };
}

export const CENTER_ON_SUBSTATION = 'CENTER_ON_SUBSTATION';

export function centerOnSubstation(substationId) {
    return {
        type: CENTER_ON_SUBSTATION,
        centerOnSubstation: { to: substationId },
    };
}

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export function addNotification(notificationIds) {
    return {
        type: ADD_NOTIFICATION,
        notificationIds: notificationIds,
    };
}

export const REMOVE_NOTIFICATION_BY_NODE = 'REMOVE_NOTIFICATION_BY_NODE';

export function removeNotificationByNode(notificationIds) {
    return {
        type: REMOVE_NOTIFICATION_BY_NODE,
        notificationIds: notificationIds,
    };
}

export const SET_MODIFICATIONS_IN_PROGRESS = 'SET_MODIFICATIONS_IN_PROGRESS';

export function setModificationsInProgress(isModificationsInProgress) {
    return {
        type: SET_MODIFICATIONS_IN_PROGRESS,
        isModificationsInProgress: isModificationsInProgress,
    };
}

export const STUDY_DISPLAY_MODE = {
    MAP: 'Map',
    TREE: 'Tree',
    HYBRID: 'Hybrid',
};

export const SET_STUDY_DISPLAY_MODE = 'SET_STUDY_DISPLAY_MODE';

export function setStudyDisplayMode(studyDisplayMode) {
    return {
        type: SET_STUDY_DISPLAY_MODE,
        studyDisplayMode: studyDisplayMode,
    };
}

export const OPEN_DIAGRAM = 'OPEN_DIAGRAM';

export function openDiagram(id, svgType) {
    return {
        type: OPEN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const MINIMIZE_DIAGRAM = 'MINIMIZE_DIAGRAM';

export function minimizeDiagram(id, svgType) {
    return {
        type: MINIMIZE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const TOGGLE_PIN_DIAGRAM = 'TOGGLE_PIN_DIAGRAM';

export function togglePinDiagram(id, svgType) {
    return {
        type: TOGGLE_PIN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const CLOSE_DIAGRAM = 'CLOSE_DIAGRAM';

export function closeDiagram(id, svgType) {
    return {
        type: CLOSE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const CLOSE_DIAGRAMS = 'CLOSE_DIAGRAMS';

export function closeDiagrams(ids) {
    return {
        type: CLOSE_DIAGRAMS,
        ids: ids,
    };
}

export const STOP_DIAGRAM_BLINK = 'STOP_DIAGRAM_BLINK';

export function stopDiagramBlink() {
    return {
        type: STOP_DIAGRAM_BLINK,
    };
}

export const RESET_NETWORK_AREA_DIAGRAM_DEPTH =
    'RESET_NETWORK_AREA_DIAGRAM_DEPTH';

export function resetNetworkAreaDiagramDepth() {
    return {
        type: RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH =
    'INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH';

export function incrementNetworkAreaDiagramDepth() {
    return {
        type: INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH =
    'DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH';

export function decrementNetworkAreaDiagramDepth() {
    return {
        type: DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS =
    'NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS';

export function setNetworkAreaDiagramNbVoltageLevels(nbVoltageLevels) {
    return {
        type: NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
        nbVoltageLevels: nbVoltageLevels,
    };
}

export const SET_UPDATED_SUBSTATIONS_IDS = 'SET_UPDATED_SUBSTATIONS_IDS';

export function setUpdatedSubstationsIds(updatedSubstationsIds) {
    return {
        type: SET_UPDATED_SUBSTATIONS_IDS,
        updatedSubstationsIds: updatedSubstationsIds,
    };
}

export const SET_DELETED_EQUIPMENTS = 'SET_DELETED_EQUIPMENTS';

export function setDeletedEquipments(deletedEquipments) {
    return {
        type: SET_DELETED_EQUIPMENTS,
        deletedEquipments: deletedEquipments,
    };
}
