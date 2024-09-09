/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
    MAP_BASEMAP_MAPBOX,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DEVELOPER_MODE,
    PARAM_DIAGONAL_LABEL,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_FLUX_CONVENTION,
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
import { Action } from 'redux';
import { GsLang, GsLangUser, GsTheme } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { UnknownArray } from 'type-fest';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { NodeInsertModes } from '../components/graph/nodes/node-insert-modes';
import { LineFlowColorMode, LineFlowMode, MapEquipments } from '@powsybl/diagram-viewer';
import {
    AppState,
    CurrentTreeNode,
    EquipmentUpdateType,
    OneBusShortCircuitAnalysisDiagram,
    SelectionForCopy,
    SpreadsheetEquipmentType,
    StudyIndexationStatus,
    StudyUpdatedEventData,
    TablesDefinitionsNames,
    TableSortKeysType,
} from './reducer';
import { ComputingType } from '../components/computing-status/computing-type';
import { RunningStatus } from '../components/utils/running-status';
import { IOptionalService } from '../components/utils/optional-services';
import { FluxConventions } from '../components/dialogs/parameters/network-parameters';
import { DiagramType, SubstationLayout } from '../components/diagrams/diagram-common';
import { Filter } from '../components/results/common/results-global-filter';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_RESULT_STORE_FIELD,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
} from '../utils/store-sort-filter-fields';
import { SortConfigType } from '../hooks/use-aggrid-sort';
import { StudyDisplayMode } from '../components/network-modification.type';
import { Identifiable } from '@gridsuite/commons-ui/dist/utils/EquipmentType';
import { ColumnWithFormula } from '../components/spreadsheet/custom-columns/custom-columns.types';
import { FormulaFilter } from '../components/spreadsheet/custom-columns/formula-filter.types';

type MutableUnknownArray = unknown[];

type ColumnName<TValue = unknown> = {
    index: number;
    value: TValue;
};

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
    | SelectThemeAction
    | SelectLanguageAction
    | SelectComputedLanguageAction
    | SetParamsLoadedAction
    | OpenStudyAction
    | CloseStudyAction
    | RemoveSelectedCaseAction
    | UseNameAction
    | CenterLabelAction
    | DiagonalLabelAction
    | LineFullPathAction
    | LineParallelPathAction
    | LineFlowModeAction
    | FluxConventionAction
    | EnableDeveloperModeAction
    | LineFlowColorModeAction
    | LineFlowAlertThresholdAction
    | LimitReductionAction
    | LimitReductionModifiedAction
    | StudyUpdatedAction
    | MapDataLoadingAction
    | MapManualRefreshAction
    | MapBasemapAction
    | ResetMapReloadedAction
    | MapEquipmentsInitializedAction
    | SubstationLayoutAction
    | ComponentLibraryAction
    | SetFullscreenDiagramAction
    | ChangeDisplayedColumnsNamesAction
    | ChangeLockedColumnsNamesAction
    | ChangeReorderedColumnsAction
    | FavoriteContingencyListsAction
    | CurrentTreeNodeAction
    | SelectionForCopyAction
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
    | CustomColumnsDefinitionsAction;

export const LOAD_EQUIPMENTS = 'LOAD_EQUIPMENTS';
export type LoadEquipmentsAction = Readonly<Action<typeof LOAD_EQUIPMENTS>> & {
    equipmentType: SpreadsheetEquipmentType;
    equipments: Identifiable[];
};

export function loadEquipments(
    equipmentType: SpreadsheetEquipmentType,
    equipments: Identifiable[]
): LoadEquipmentsAction {
    return {
        type: LOAD_EQUIPMENTS,
        equipmentType: equipmentType,
        equipments: equipments,
    };
}

export const UPDATE_EQUIPMENTS = 'UPDATE_EQUIPMENTS';
export type UpdateEquipmentsAction = Readonly<Action<typeof UPDATE_EQUIPMENTS>> & {
    equipments: Record<EquipmentUpdateType, Identifiable[]>;
};
export function updateEquipments(equipments: Record<EquipmentUpdateType, Identifiable[]>): UpdateEquipmentsAction {
    return {
        type: UPDATE_EQUIPMENTS,
        equipments: equipments,
    };
}

type EquipmentToDelete = {
    equipmentType: SpreadsheetEquipmentType;
    equipmentId: string;
};
export const DELETE_EQUIPMENTS = 'DELETE_EQUIPMENTS';
export type DeleteEquipmentsAction = Readonly<Action<typeof DELETE_EQUIPMENTS>> & {
    equipments: EquipmentToDelete[];
};
export function deleteEquipments(equipments: EquipmentToDelete[]): DeleteEquipmentsAction {
    return {
        type: DELETE_EQUIPMENTS,
        equipments,
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

export const RESET_EQUIPMENTS_POST_LOADFLOW = 'RESET_EQUIPMENTS_POST_LOADFLOW';
export type ResetEquipmentsPostLoadflowAction = Readonly<Action<typeof RESET_EQUIPMENTS_POST_LOADFLOW>>;
export function resetEquipmentsPostLoadflow(): ResetEquipmentsPostLoadflowAction {
    return {
        type: RESET_EQUIPMENTS_POST_LOADFLOW,
    };
}

export const MAP_EQUIPMENTS_CREATED = 'MAP_EQUIPMENTS_CREATED';
export type MapEquipmentsCreatedAction = Readonly<Action<typeof MAP_EQUIPMENTS_CREATED>> & {
    mapEquipments: MapEquipments;
    newLines?: MutableUnknownArray;
    newTieLines?: MutableUnknownArray;
    newSubstations?: MutableUnknownArray;
    newHvdcLines?: MutableUnknownArray;
};
export function mapEquipmentsCreated(
    mapEquipments: MapEquipments,
    newLines?: MutableUnknownArray,
    newTieLines?: MutableUnknownArray,
    newSubstations?: MutableUnknownArray,
    newHvdcLines?: MutableUnknownArray
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
    networkModificationTreeNode: CurrentTreeNode;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};
export function networkModificationTreeNodeAdded(
    networkModificationTreeNode: CurrentTreeNode,
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
    networkModificationTreeNode: CurrentTreeNode;
    parentNodeId: string;
    insertMode: NodeInsertModes;
    referenceNodeId: string;
};
export function networkModificationTreeNodeMoved(
    networkModificationTreeNode: CurrentTreeNode,
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

export const NETWORK_MODIFICATION_HANDLE_SUBTREE = 'NETWORK_MODIFICATION_HANDLE_SUBTREE';
export type NetworkModificationHandleSubtreeAction = Readonly<Action<typeof NETWORK_MODIFICATION_HANDLE_SUBTREE>> & {
    networkModificationTreeNodes: CurrentTreeNode[];
    parentNodeId: string;
};
export function networkModificationHandleSubtree(
    networkModificationTreeNodes: CurrentTreeNode[],
    parentNodeId: string
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
    networkModificationTreeNodes: CurrentTreeNode[];
};
export function networkModificationTreeNodesRemoved(
    networkModificationTreeNodes: CurrentTreeNode[]
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

export const REMOVE_SELECTED_CASE = 'REMOVE_SELECTED_CASE';
export type RemoveSelectedCaseAction = Readonly<Action<typeof REMOVE_SELECTED_CASE>>;
export function removeSelectedCase(): RemoveSelectedCaseAction {
    return { type: REMOVE_SELECTED_CASE };
}

export const USE_NAME = 'USE_NAME';
export type UseNameAction = Readonly<Action<typeof USE_NAME>> & {
    [PARAM_USE_NAME]: boolean;
};
export function selectUseName(useName: boolean): UseNameAction {
    return { type: USE_NAME, [PARAM_USE_NAME]: useName };
}

export const CENTER_LABEL = 'CENTER_LABEL';
export type CenterLabelAction = Readonly<Action<typeof CENTER_LABEL>> & {
    [PARAM_CENTER_LABEL]: boolean;
};
export function selectCenterLabelState(centerLabel: boolean): CenterLabelAction {
    return { type: CENTER_LABEL, [PARAM_CENTER_LABEL]: centerLabel };
}

export const DIAGONAL_LABEL = 'DIAGONAL_LABEL';
export type DiagonalLabelAction = Readonly<Action<typeof DIAGONAL_LABEL>> & {
    [PARAM_DIAGONAL_LABEL]: boolean;
};
export function selectDiagonalLabelState(diagonalLabel: boolean): DiagonalLabelAction {
    return { type: DIAGONAL_LABEL, [PARAM_DIAGONAL_LABEL]: diagonalLabel };
}

export const LINE_FULL_PATH = 'LINE_FULL_PATH';
export type LineFullPathAction = Readonly<Action<typeof LINE_FULL_PATH>> & {
    [PARAM_LINE_FULL_PATH]: boolean;
};
export function selectLineFullPathState(lineFullPath: boolean): LineFullPathAction {
    return { type: LINE_FULL_PATH, [PARAM_LINE_FULL_PATH]: lineFullPath };
}

export const LINE_PARALLEL_PATH = 'LINE_PARALLEL_PATH';
export type LineParallelPathAction = Readonly<Action<typeof LINE_PARALLEL_PATH>> & {
    [PARAM_LINE_PARALLEL_PATH]: boolean;
};
export function selectLineParallelPathState(lineParallelPath: boolean): LineParallelPathAction {
    return {
        type: LINE_PARALLEL_PATH,
        [PARAM_LINE_PARALLEL_PATH]: lineParallelPath,
    };
}

export const LINE_FLOW_MODE = 'LINE_FLOW_MODE';
export type LineFlowModeAction = Readonly<Action<typeof LINE_FLOW_MODE>> & {
    [PARAM_LINE_FLOW_MODE]: LineFlowMode;
};
export function selectLineFlowMode(lineFlowMode: LineFlowMode): LineFlowModeAction {
    return { type: LINE_FLOW_MODE, [PARAM_LINE_FLOW_MODE]: lineFlowMode };
}

export const FLUX_CONVENTION = 'FLUX_CONVENTION';
export type FluxConventionAction = Readonly<Action<typeof FLUX_CONVENTION>> & {
    [PARAM_FLUX_CONVENTION]: FluxConventions;
};
export function selectFluxConvention(fluxConvention: FluxConventions): FluxConventionAction {
    return { type: FLUX_CONVENTION, [PARAM_FLUX_CONVENTION]: fluxConvention };
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

export const INIT_NAD_WITH_GEO_DATA = 'INIT_NAD_GEO_WITH_DATA';
export type InitNadWithGeoDataAction = Readonly<Action<typeof INIT_NAD_WITH_GEO_DATA>> & {
    [PARAM_INIT_NAD_WITH_GEO_DATA]: boolean;
};
export function selectInitNadWithGeoData(initNadWithGeoData: boolean): InitNadWithGeoDataAction {
    return {
        type: INIT_NAD_WITH_GEO_DATA,
        [PARAM_INIT_NAD_WITH_GEO_DATA]: initNadWithGeoData,
    };
}

export const LINE_FLOW_COLOR_MODE = 'LINE_FLOW_COLOR_MODE';
export type LineFlowColorModeAction = Readonly<Action<typeof LINE_FLOW_COLOR_MODE>> & {
    [PARAM_LINE_FLOW_COLOR_MODE]: LineFlowColorMode;
};
export function selectLineFlowColorMode(lineFlowColorMode: LineFlowColorMode): LineFlowColorModeAction {
    return {
        type: LINE_FLOW_COLOR_MODE,
        [PARAM_LINE_FLOW_COLOR_MODE]: lineFlowColorMode,
    };
}

export const LINE_FLOW_ALERT_THRESHOLD = 'LINE_FLOW_ALERT_THRESHOLD';
export type LineFlowAlertThresholdAction = Readonly<Action<typeof LINE_FLOW_ALERT_THRESHOLD>> & {
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: number;
};
export function selectLineFlowAlertThreshold(lineFlowAlertThreshold: number): LineFlowAlertThresholdAction {
    return {
        type: LINE_FLOW_ALERT_THRESHOLD,
        [PARAM_LINE_FLOW_ALERT_THRESHOLD]: lineFlowAlertThreshold,
    };
}

export const LIMIT_REDUCTION = 'LIMIT_REDUCTION';
export type LimitReductionAction = Readonly<Action<typeof LIMIT_REDUCTION>> & {
    [PARAM_LIMIT_REDUCTION]: number;
};
export function selectLimitReduction(limitReduction: number): LimitReductionAction {
    return {
        type: LIMIT_REDUCTION,
        [PARAM_LIMIT_REDUCTION]: limitReduction,
    };
}

export const LIMIT_REDUCTION_MODIFIED = 'LIMIT_REDUCTION_MODIFIED';
export type LimitReductionModifiedAction = Readonly<Action<typeof LIMIT_REDUCTION_MODIFIED>> & {
    limitReductionModified: boolean;
};
export function limitReductionModified(limitReductionModified: boolean): LimitReductionModifiedAction {
    return {
        type: LIMIT_REDUCTION_MODIFIED,
        limitReductionModified: limitReductionModified,
    };
}

export const STUDY_UPDATED = 'STUDY_UPDATED';
export type StudyUpdatedAction = Readonly<Action<typeof STUDY_UPDATED>> & {
    eventData: StudyUpdatedEventData;
};
/*
export type StudyUpdated = {
    force: IntRange<0, 1>;
} & (StudyUpdatedUndefined | StudyUpdatedStudy);
 */
export function studyUpdated(eventData: StudyUpdatedEventData): StudyUpdatedAction {
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

export const MAP_MANUAL_REFRESH = 'MAP_MANUAL_REFRESH';
export type MapManualRefreshAction = Readonly<Action<typeof MAP_MANUAL_REFRESH>> & {
    [PARAM_MAP_MANUAL_REFRESH]: boolean;
};
export function selectMapManualRefresh(mapManualRefresh: boolean): MapManualRefreshAction {
    return {
        type: MAP_MANUAL_REFRESH,
        [PARAM_MAP_MANUAL_REFRESH]: mapManualRefresh,
    };
}

export const MAP_BASEMAP = 'MAP_BASEMAP';
export type MapBasemapAction = Readonly<Action<typeof MAP_BASEMAP>> & {
    [PARAM_MAP_BASEMAP]: typeof MAP_BASEMAP_MAPBOX | typeof MAP_BASEMAP_CARTO | typeof MAP_BASEMAP_CARTO_NOLABEL;
};
export function selectMapBaseMap(
    mapBaseMap: typeof MAP_BASEMAP_MAPBOX | typeof MAP_BASEMAP_CARTO | typeof MAP_BASEMAP_CARTO_NOLABEL
): MapBasemapAction {
    return {
        type: MAP_BASEMAP,
        [PARAM_MAP_BASEMAP]: mapBaseMap,
    };
}

export const RESET_MAP_RELOADED = 'RESET_MAP_RELOADED';
export type ResetMapReloadedAction = Readonly<Action<typeof RESET_MAP_RELOADED>>;
export function resetMapReloaded(): ResetMapReloadedAction {
    return {
        type: RESET_MAP_RELOADED,
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

export const SUBSTATION_LAYOUT = 'SUBSTATION_LAYOUT';
export type SubstationLayoutAction = Readonly<Action<typeof SUBSTATION_LAYOUT>> & {
    [PARAM_SUBSTATION_LAYOUT]: SubstationLayout;
};
export function selectSubstationLayout(substationLayout: SubstationLayout): SubstationLayoutAction {
    return {
        type: SUBSTATION_LAYOUT,
        [PARAM_SUBSTATION_LAYOUT]: substationLayout,
    };
}

export const COMPONENT_LIBRARY = 'COMPONENT_LIBRARY';
export type ComponentLibraryAction = Readonly<Action<typeof COMPONENT_LIBRARY>> & {
    [PARAM_COMPONENT_LIBRARY]: unknown;
};
export function selectComponentLibrary(componentLibrary: unknown): ComponentLibraryAction {
    return {
        type: COMPONENT_LIBRARY,
        [PARAM_COMPONENT_LIBRARY]: componentLibrary,
    };
}

export const SET_FULLSCREEN_DIAGRAM = 'SET_FULLSCREEN_DIAGRAM';
export type SetFullscreenDiagramAction = Readonly<Action<typeof SET_FULLSCREEN_DIAGRAM>> &
    (
        | { diagramId: null }
        | {
              diagramId: string;
              svgType: DiagramType;
          }
    );
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

export const CHANGE_DISPLAYED_COLUMNS_NAMES = 'CHANGE_DISPLAYED_COLUMNS_NAMES';
export type ChangeDisplayedColumnsNamesAction = Readonly<Action<typeof CHANGE_DISPLAYED_COLUMNS_NAMES>> & {
    displayedColumnsNamesParams: ColumnName[];
};
export function changeDisplayedColumns(displayedColumnsParams: ColumnName[]): ChangeDisplayedColumnsNamesAction {
    return {
        type: CHANGE_DISPLAYED_COLUMNS_NAMES,
        displayedColumnsNamesParams: displayedColumnsParams,
    };
}

export const CHANGE_LOCKED_COLUMNS_NAMES = 'CHANGE_LOCKED_COLUMNS_NAMES';
export type ChangeLockedColumnsNamesAction = Readonly<Action<typeof CHANGE_LOCKED_COLUMNS_NAMES>> & {
    lockedColumnsNamesParams: ColumnName[];
};
export function changeLockedColumns(lockedColumnsParams: ColumnName[]): ChangeLockedColumnsNamesAction {
    return {
        type: CHANGE_LOCKED_COLUMNS_NAMES,
        lockedColumnsNamesParams: lockedColumnsParams,
    };
}

export const CHANGE_REORDERED_COLUMNS = 'CHANGE_REORDERED_COLUMNS';
export type ChangeReorderedColumnsAction = Readonly<Action<typeof CHANGE_REORDERED_COLUMNS>> & {
    reorderedColumnsParams: ColumnName[];
};
export function changeReorderedColumns(reorderedColumnsParams: ColumnName[]): ChangeReorderedColumnsAction {
    return {
        type: CHANGE_REORDERED_COLUMNS,
        reorderedColumnsParams: reorderedColumnsParams,
    };
}

export const FAVORITE_CONTINGENCY_LISTS = 'FAVORITE_CONTINGENCY_LISTS';
export type FavoriteContingencyListsAction = Readonly<Action<typeof FAVORITE_CONTINGENCY_LISTS>> & {
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: MutableUnknownArray;
};
export function selectFavoriteContingencyLists(
    favoriteContingencyLists: MutableUnknownArray
): FavoriteContingencyListsAction {
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

export const SELECTION_FOR_COPY = 'SELECTION_FOR_COPY';
export type SelectionForCopyAction = Readonly<Action<typeof SELECTION_FOR_COPY>> & {
    selectionForCopy: NonNullable<SelectionForCopy>;
};
export function setSelectionForCopy(selectionForCopy: NonNullable<SelectionForCopy>): SelectionForCopyAction {
    return {
        type: SELECTION_FOR_COPY,
        selectionForCopy: selectionForCopy,
    };
}

export const SET_MODIFICATIONS_DRAWER_OPEN = 'SET_MODIFICATIONS_DRAWER_OPEN';
export type SetModificationsDrawerOpenAction = Readonly<Action<typeof SET_MODIFICATIONS_DRAWER_OPEN>> & {
    isModificationsDrawerOpen: boolean;
};
export function setModificationsDrawerOpen(isModificationsDrawerOpen: boolean): SetModificationsDrawerOpenAction {
    return {
        type: SET_MODIFICATIONS_DRAWER_OPEN,
        isModificationsDrawerOpen: isModificationsDrawerOpen,
    };
}

export const SET_EVENT_SCENARIO_DRAWER_OPEN = 'SET_EVENT_SCENARIO_DRAWER_OPEN';
export type SetEventScenarioDrawerOpenAction = Readonly<Action<typeof SET_EVENT_SCENARIO_DRAWER_OPEN>> & {
    isEventScenarioDrawerOpen: boolean;
};
export function setEventScenarioDrawerOpen(isEventScenarioDrawerOpen: boolean): SetEventScenarioDrawerOpenAction {
    return {
        type: SET_EVENT_SCENARIO_DRAWER_OPEN,
        isEventScenarioDrawerOpen: isEventScenarioDrawerOpen,
    };
}

export const CENTER_ON_SUBSTATION = 'CENTER_ON_SUBSTATION';
export type CenterOnSubstationAction = Readonly<Action<typeof CENTER_ON_SUBSTATION>> & {
    centerOnSubstation: { to: unknown };
};
export function centerOnSubstation(substationId: unknown): CenterOnSubstationAction {
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

export const SET_STUDY_DISPLAY_MODE = 'SET_STUDY_DISPLAY_MODE';
export type SetStudyDisplayModeAction = Readonly<Action<typeof SET_STUDY_DISPLAY_MODE>> & {
    studyDisplayMode: StudyDisplayMode;
};
export function setStudyDisplayMode(studyDisplayMode: StudyDisplayMode): SetStudyDisplayModeAction {
    return {
        type: SET_STUDY_DISPLAY_MODE,
        studyDisplayMode: studyDisplayMode,
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

export const MINIMIZE_DIAGRAM = 'MINIMIZE_DIAGRAM';
export type MinimizeDiagramAction = Readonly<Action<typeof MINIMIZE_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export function minimizeDiagram(id: string, svgType: DiagramType): MinimizeDiagramAction {
    return {
        type: MINIMIZE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const TOGGLE_PIN_DIAGRAM = 'TOGGLE_PIN_DIAGRAM';
export type TogglePinDiagramAction = Readonly<Action<typeof TOGGLE_PIN_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export function togglePinDiagram(id: string, svgType: DiagramType): TogglePinDiagramAction {
    return {
        type: TOGGLE_PIN_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const CLOSE_DIAGRAM = 'CLOSE_DIAGRAM';
export type CloseDiagramAction = Readonly<Action<typeof CLOSE_DIAGRAM>> & {
    id: string;
    svgType: DiagramType;
};
export function closeDiagram(id: string, svgType: DiagramType): CloseDiagramAction {
    return {
        type: CLOSE_DIAGRAM,
        id: id,
        svgType: svgType,
    };
}

export const CLOSE_DIAGRAMS = 'CLOSE_DIAGRAMS';
export type CloseDiagramsAction = Readonly<Action<typeof CLOSE_DIAGRAMS>> & {
    ids: string[];
};
export function closeDiagrams(ids: string[]): CloseDiagramsAction {
    return {
        type: CLOSE_DIAGRAMS,
        ids: ids,
    };
}

export const STOP_DIAGRAM_BLINK = 'STOP_DIAGRAM_BLINK';
export type StopDiagramBlinkAction = Readonly<Action<typeof STOP_DIAGRAM_BLINK>>;
export function stopDiagramBlink(): StopDiagramBlinkAction {
    return {
        type: STOP_DIAGRAM_BLINK,
    };
}

export const RESET_NETWORK_AREA_DIAGRAM_DEPTH = 'RESET_NETWORK_AREA_DIAGRAM_DEPTH';
export type ResetNetworkAreaDiagramDepthAction = Readonly<Action<typeof RESET_NETWORK_AREA_DIAGRAM_DEPTH>>;
export function resetNetworkAreaDiagramDepth(): ResetNetworkAreaDiagramDepthAction {
    return {
        type: RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH = 'INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH';
export type IncrementNetworkAreaDiagramDepthAction = Readonly<Action<typeof INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH>>;
export function incrementNetworkAreaDiagramDepth(): IncrementNetworkAreaDiagramDepthAction {
    return {
        type: INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH = 'DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH';
export type DecrementNetworkAreaDiagramDepthAction = Readonly<Action<typeof DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH>>;
export function decrementNetworkAreaDiagramDepth(): DecrementNetworkAreaDiagramDepthAction {
    return {
        type: DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    };
}

export const NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS = 'NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS';
export type NetworkAreaDiagramNbVoltageLevelsAction = Readonly<
    Action<typeof NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS>
> & {
    nbVoltageLevels: number;
};
export function setNetworkAreaDiagramNbVoltageLevels(nbVoltageLevels: number): NetworkAreaDiagramNbVoltageLevelsAction {
    return {
        type: NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
        nbVoltageLevels: nbVoltageLevels,
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

export const SET_STUDY_INDEXATION_STATUS = 'SET_STUDY_INDEXATION_STATUS';
export type SetStudyIndexationStatusAction = Readonly<Action<typeof SET_STUDY_INDEXATION_STATUS>> & {
    studyIndexationStatus: StudyIndexationStatus;
};
export function setStudyIndexationStatus(studyIndexationStatus: StudyIndexationStatus): SetStudyIndexationStatusAction {
    return {
        type: SET_STUDY_INDEXATION_STATUS,
        studyIndexationStatus: studyIndexationStatus,
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
    globalFilters: Filter[];
};
export function addToRecentGlobalFilters(globalFilters: Filter[]): AddToRecentGlobalFiltersAction {
    return {
        type: ADD_TO_RECENT_GLOBAL_FILTERS,
        globalFilters: globalFilters,
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
    [LOADFLOW_RESULT_STORE_FIELD]: MutableUnknownArray;
};
export function setLoadflowResultFilter(
    filterTab: keyof AppState[typeof LOADFLOW_RESULT_STORE_FIELD],
    loadflowResultFilter: MutableUnknownArray
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
    [SECURITY_ANALYSIS_RESULT_STORE_FIELD]: MutableUnknownArray;
};
export function setSecurityAnalysisResultFilter(
    filterTab: keyof AppState[typeof SECURITY_ANALYSIS_RESULT_STORE_FIELD],
    securityAnalysisResultFilter: MutableUnknownArray
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
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD]: MutableUnknownArray;
};
export function setSensitivityAnalysisResultFilter(
    filterTab: keyof AppState[typeof SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD],
    sensitivityAnalysisResultFilter: MutableUnknownArray
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
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD]: MutableUnknownArray;
};
export function setShortcircuitAnalysisResultFilter(
    filterTab: keyof AppState[typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD],
    shortcircuitAnalysisResultFilter: MutableUnknownArray
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
    [DYNAMIC_SIMULATION_RESULT_STORE_FIELD]: MutableUnknownArray;
};
export function setDynamicSimulationResultFilter(
    filterTab: keyof AppState[typeof DYNAMIC_SIMULATION_RESULT_STORE_FIELD],
    dynamicSimulationResultFilter: MutableUnknownArray
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
    [SPREADSHEET_STORE_FIELD]: MutableUnknownArray;
};
export function setSpreadsheetFilter(
    filterTab: keyof AppState[typeof SPREADSHEET_STORE_FIELD],
    spreadsheetFilter: MutableUnknownArray
): SpreadsheetFilterAction {
    return {
        type: SPREADSHEET_FILTER,
        filterTab: filterTab,
        [SPREADSHEET_STORE_FIELD]: spreadsheetFilter,
    };
}

export const TABLE_SORT = 'TABLE_SORT';
export type TableSortAction = Readonly<Action<typeof TABLE_SORT>> & {
    table: TableSortKeysType;
    tab: string; //AppState['tableSort'][T];
    sort: SortConfigType[];
};
export function setTableSort(table: TableSortKeysType, tab: string, sort: SortConfigType[]): TableSortAction {
    return {
        type: TABLE_SORT,
        table,
        tab,
        sort,
    };
}

export const CUSTOM_COLUMNS_DEFINITIONS = 'CUSTOM_COLUMNS_DEFINITIONS';
export type CustomColumnsDefinitionsAction = Readonly<Action<typeof CUSTOM_COLUMNS_DEFINITIONS>> & {
    table: TablesDefinitionsNames;
    definitions: ColumnWithFormula[];
    filter: FormulaFilter;
};
export function setCustomColumDefinitions(
    table: TablesDefinitionsNames,
    customColumNS: ColumnWithFormula[],
    filter: FormulaFilter
): CustomColumnsDefinitionsAction {
    return {
        type: CUSTOM_COLUMNS_DEFINITIONS,
        table,
        definitions: customColumNS,
        filter: filter,
    };
}
