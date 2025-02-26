import { NodeType } from '../components/graph/tree-node.type';
import { BUILD_STATUS } from '../components/network/constants';
import { Node } from '@xyflow/react';
import { UUID } from 'crypto';
import { FilterConfig, SortConfig } from '../types/custom-aggrid-types';
import { ExpertFilter } from '../services/study/filter';
import {
    DYNAMIC_SIMULATION_RESULT_SORT_STORE,
    LOADFLOW_RESULT_SORT_STORE,
    SECURITY_ANALYSIS_RESULT_SORT_STORE,
    SENSITIVITY_ANALYSIS_RESULT_SORT_STORE,
    SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
    SPREADSHEET_SORT_STORE,
    STATEESTIMATION_RESULT_SORT_STORE,
} from '../utils/store-sort-filter-fields';
import type { ValueOf } from 'type-fest';
import { CopyType } from '../components/network-modification.type';
import { DiagramType, ViewState } from '../components/diagrams/diagram.type';
import { Identifiable } from '@gridsuite/commons-ui';
import {
    ColumnState,
    SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../components/spreadsheet/config/spreadsheet.type';
import { EQUIPMENT_TYPES as NetworkViewerEquipmentType } from '@powsybl/network-viewer';
import ComputingType from '../components/computing-status/computing-type';
import RunningStatus from '../components/utils/running-status';

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
} // Redux state
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
    rootNetwork: UUID;
    rootNetworks: UUID[];
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
    equipmentType: NetworkViewerEquipmentType;
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

export interface TablesState {
    definitions: SpreadsheetTabDefinition[];
    columnsStates: ColumnState[][];
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
export type StudyUpdated = {
    force: number; //IntRange<0, 1>;
} & (StudyUpdatedUndefined | StudyUpdatedStudy);
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
    scalingFactor: number;
};
export type NadTextMovement = {
    nadIdentifier: string;
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
export type NodeAlias = {
    id: UUID;
    name: string;
    alias: string;
};
export type LogsFilterState = Record<string, FilterConfig[]>;
export type SpreadsheetNetworkState = Record<SpreadsheetEquipmentType, SpreadsheetEquipmentsByNodes>;
export type GsFilterSpreadsheetState = Record<string, ExpertFilter[]>;
export type Substation = Identifiable & {
    voltageLevels: Identifiable[];
};
