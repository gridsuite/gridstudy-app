import {
    AuthenticationRouterErrorState,
    CommonStoreState,
    GsLang,
    GsLangUser,
    GsTheme,
    UseSnackMessageReturn,
} from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import ComputingType from '../components/computing-status/computing-type';
import { IOptionalService } from '../components/utils/optional-services';
import { Filter } from '../components/results/common/filter.type';
import { StudyDisplayMode } from '../components/network-modification.type';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { DiagramType, SubstationLayout } from '../components/diagrams/diagram.type';
import { NetworkVisualizationParameters } from '../components/dialogs/parameters/network-visualizations/network-visualizations.types';
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
import {
    LineFlowColorMode,
    LineFlowMode,
    type MapHvdcLine,
    type MapLine,
    type MapSubstation,
    type MapTieLine,
} from '@powsybl/network-viewer';
import type { UnknownArray } from 'type-fest';
import {
    ALL_BUSES,
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_RESULT_STORE_FIELD,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
    LOGS_STORE_FIELD,
    ONE_BUS,
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
    STATEESTIMATION_QUALITY_CRITERION,
    STATEESTIMATION_QUALITY_PER_REGION,
    STATEESTIMATION_RESULT_STORE_FIELD,
    TIMELINE,
} from '../utils/store-sort-filter-fields';
import { FilterConfig } from '../types/custom-aggrid-types';
import {
    ComputingStatus,
    CurrentTreeNode,
    DiagramState,
    GsFilterSpreadsheetState,
    LogsFilterState,
    NadNodeMovement,
    NadTextMovement,
    NodeAlias,
    NodeSelectionForCopy,
    OneBusShortCircuitAnalysisDiagram,
    SpreadsheetFilterState,
    SpreadsheetNetworkState,
    StudyIndexationStatus,
    StudyUpdated,
    TableSort,
    TablesState,
} from './reducer.type';
import { MapEquipments } from '@powsybl/network-viewer';

export interface IGSMapEquipments extends MapEquipments {
    errHandler?: UseSnackMessageReturn['snackError'];
    initEquipments(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID): void;
    reloadImpactedSubstationsEquipments(
        studyUuid: UUID,
        currentNode: any,
        currentRootNetworkUuid: UUID,
        substationsIds: string[] | undefined
    ): {
        updatedSubstations: Promise<MapSubstation[]>;
        updatedLines: Promise<MapLine[]>;
        updatedTieLines: Promise<MapTieLine[]>;
        updatedHvdcLines: Promise<MapHvdcLine[]>;
    };
}

export interface AppState extends CommonStoreState {
    signInCallbackError: Error | null;
    authenticationRouterError: AuthenticationRouterErrorState | null;
    showAuthenticationRouterLogin: boolean;

    studyUpdated: StudyUpdated;
    studyUuid: UUID | null;
    currentTreeNode: CurrentTreeNode | null;
    currentRootNetwork: UUID | null;
    computingStatus: ComputingStatus;
    lastCompletedComputation: ComputingType | null;
    computationStarting: boolean;
    optionalServices: IOptionalService[];
    oneBusShortCircuitAnalysisDiagram: OneBusShortCircuitAnalysisDiagram | null;
    notificationIdList: UUID[];
    nonEvacuatedEnergyNotif: boolean;
    recentGlobalFilters: Filter[];
    mapEquipments: IGSMapEquipments | undefined;
    networkAreaDiagramNbVoltageLevels: number;
    networkAreaDiagramDepth: number;
    studyDisplayMode: StudyDisplayMode;
    studyIndexationStatus: StudyIndexationStatus;
    tableSort: TableSort;
    tables: TablesState;

    nodeSelectionForCopy: NodeSelectionForCopy;
    geoData: null;
    networkModificationTreeModel: NetworkModificationTreeModel | null;
    isNetworkModificationTreeModelUpToDate: boolean;
    mapDataLoading: boolean;
    diagramStates: DiagramState[];
    nadNodeMovements: NadNodeMovement[];
    nadTextNodeMovements: NadTextMovement[];
    fullScreenDiagram: null | {
        id: string;
        svgType?: DiagramType;
    };
    allLockedColumnsNames: string[];
    isExplorerDrawerOpen: boolean;
    isModificationsDrawerOpen: boolean;
    isEventScenarioDrawerOpen: boolean;
    centerOnSubstation: undefined | { to: string };
    isModificationsInProgress: boolean;
    reloadMap: boolean;
    isMapEquipmentsInitialized: boolean;
    spreadsheetNetwork: SpreadsheetNetworkState;
    gsFilterSpreadsheetState: GsFilterSpreadsheetState;
    customColumnsNodesAliases: NodeAlias[];
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
