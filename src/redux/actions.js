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
} from '../utils/config-params';

export const NETWORK_CREATED = 'NETWORK_CREATED';

export function networkCreated(network) {
    return { type: NETWORK_CREATED, network: network };
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

export const USER = 'USER';

export function setLoggedUser(user) {
    return { type: USER, user: user };
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

export const SIGNIN_CALLBACK_ERROR = 'SIGNIN_CALLBACK_ERROR';

export function setSignInCallbackError(signInCallbackError) {
    return {
        type: SIGNIN_CALLBACK_ERROR,
        signInCallbackError: signInCallbackError,
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

export const FILTERED_NOMINAL_VOLTAGES_UPDATED =
    'FILTERED_NOMINAL_VOLTAGES_UPDATED';

export function filteredNominalVoltagesUpdated(filteredNV) {
    return {
        type: FILTERED_NOMINAL_VOLTAGES_UPDATED,
        filteredNominalVoltages: filteredNV,
    };
}

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

export const FULLSCREEN_SINGLE_LINE_DIAGRAM = 'FULLSCREEN_SINGLE_LINE_DIAGRAM';

export function fullScreenSingleLineDiagram(fullScreen) {
    return { type: FULLSCREEN_SINGLE_LINE_DIAGRAM, fullScreen: fullScreen };
}

export const FULLSCREEN_NETWORK_AREA_DIAGRAM =
    'FULLSCREEN_NETWORK_AREA_DIAGRAM';

export function fullScreenNetworkAreaDiagram(fullScreenNad) {
    return {
        type: FULLSCREEN_NETWORK_AREA_DIAGRAM,
        fullScreenNad: fullScreenNad,
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

export const FAVORITE_CONTINGENCY_LISTS = 'FAVORITE_CONTINGENCY_LISTS';

export function selectFavoriteContingencyLists(favoriteContingencyLists) {
    return {
        type: FAVORITE_CONTINGENCY_LISTS,
        [PARAM_FAVORITE_CONTINGENCY_LISTS]: favoriteContingencyLists,
    };
}

export const SELECTED_TREE_NODE = 'SELECTED_TREE_NODE';

export function selectTreeNode(selectedTreeNode) {
    return {
        type: SELECTED_TREE_NODE,
        selectedTreeNode: selectedTreeNode,
    };
}

export const WORKING_TREE_NODE = 'WORKING_TREE_NODE';

export function workingTreeNode(workingTreeNode) {
    return {
        type: WORKING_TREE_NODE,
        workingTreeNode: {
            id: workingTreeNode?.id,
            readOnly: workingTreeNode?.data?.readOnly,
            buildStatus: workingTreeNode?.data?.buildStatus,
            name: workingTreeNode?.data?.label,
        },
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

export const OPEN_NETWORK_AREA_DIAGRAM = 'OPEN_NETWORK_AREA_DIAGRAM';

export function openNetworkAreaDiagram(voltageLevelId) {
    return {
        type: OPEN_NETWORK_AREA_DIAGRAM,
        openNetworkAreaDiagram: { voltageLevelId: voltageLevelId },
    };
}
