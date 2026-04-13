/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { EQUIPMENT_TYPES as NetworkViewerEquipmentType } from '@powsybl/network-viewer';
import type { ComputingType } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';

export enum NotificationType {
    // Study status
    INDEXATION_STATUS = 'indexation_status_updated',
    STUDY_NETWORK_RECREATION_DONE = 'study_network_recreation_done',
    METADATA_UPDATED = 'metadata_updated',
    STUDY_ALERT = 'STUDY_ALERT',
    COMPUTATION_DEBUG_FILE_STATUS = 'computationDebugFileStatus',
    // Build
    STUDY = 'study',
    NODE_BUILD_COMPLETED = 'buildCompleted',
    NODE_BUILD_FAILED = 'buildFailed',
    // Parameters
    COMPUTATION_PARAMETERS_UPDATED = 'computationParametersUpdated',
    NETWORK_VISUALIZATION_PARAMETERS_UPDATED = 'networkVisualizationParametersUpdated',
    // Root networks
    ROOT_NETWORKS_UPDATED = 'rootNetworksUpdated',
    ROOT_NETWORKS_UPDATE_FAILED = 'rootNetworksUpdateFailed',
    ROOT_NETWORKS_DELETION_STARTED = 'rootNetworksDeletionStarted',
    // Nodes and tree
    NODE_CREATED = 'nodeCreated',
    NODES_DELETED = 'nodeDeleted',
    NODE_MOVED = 'nodeMoved',
    NODES_UPDATED = 'nodeUpdated',
    NODE_EDITED = 'nodeEdited',
    NODE_BUILD_STATUS_UPDATED = 'nodeBuildStatusUpdated',
    SUBTREE_MOVED = 'subtreeMoved',
    SUBTREE_CREATED = 'subtreeCreated',
    NODES_COLUMN_POSITION_CHANGED = 'nodesColumnPositionsChanged',
    NETWORK_EXPORT_FINISHED = 'networkExportFinished',
    // Modifications
    MODIFICATIONS_CREATION_IN_PROGRESS = 'creatingInProgress',
    MODIFICATIONS_UPDATING_IN_PROGRESS = 'updatingInProgress',
    MODIFICATIONS_STASHING_IN_PROGRESS = 'stashingInProgress',
    MODIFICATIONS_RESTORING_IN_PROGRESS = 'restoringInProgress',
    MODIFICATIONS_DELETING_IN_PROGRESS = 'deletingInProgress',
    MODIFICATIONS_UPDATE_FINISHED = 'UPDATE_FINISHED',
    MODIFICATIONS_DELETE_FINISHED = 'DELETE_FINISHED',
    // Events
    EVENT_CREATING_IN_PROGRESS = 'eventCreatingInProgress',
    EVENT_UPDATING_IN_PROGRESS = 'eventUpdatingInProgress',
    EVENT_DELETING_IN_PROGRESS = 'eventDeletingInProgress',
    EVENT_CRUD_FINISHED = 'EVENT_CRUD_FINISHED',

    // Computations filters
    UPDATE_COMPUTATION_GLOBAL_FILTER_TAB = 'computationResultGlobalFilterUpdated',
    UPDATE_COMPUTATION_COLUMN_FILTER_TAB = 'computationResultColumnFilterUpdated',

    // Computations
    LOADFLOW_RESULT = 'loadflowResult',
    LOADFLOW_FAILED = 'loadflow_failed',
    LOADFLOW_STATUS = 'loadflow_status',
    SECURITY_ANALYSIS_RESULT = 'securityAnalysisResult',
    SECURITY_ANALYSIS_FAILED = 'securityAnalysis_failed',
    SECURITY_ANALYSIS_STATUS = 'securityAnalysis_status',
    SENSITIVITY_ANALYSIS_RESULT = 'sensitivityAnalysisResult',
    SENSITIVITY_ANALYSIS_FAILED = 'sensitivityAnalysis_failed',
    SENSITIVITY_ANALYSIS_STATUS = 'sensitivityAnalysis_status',
    SHORTCIRCUIT_ANALYSIS_RESULT = 'shortCircuitAnalysisResult',
    SHORTCIRCUIT_ANALYSIS_FAILED = 'shortCircuitAnalysis_failed',
    SHORTCIRCUIT_ANALYSIS_STATUS = 'shortCircuitAnalysis_status',
    ONE_BUS_SC_ANALYSIS_RESULT = 'oneBusShortCircuitAnalysisResult',
    ONE_BUS_SC_ANALYSIS_FAILED = 'oneBusShortCircuitAnalysis_failed',
    ONE_BUS_SC_ANALYSIS_STATUS = 'oneBusShortCircuitAnalysis_status',
    DYNAMIC_SIMULATION_RESULT = 'dynamicSimulationResult',
    DYNAMIC_SIMULATION_FAILED = 'dynamicSimulation_failed',
    DYNAMIC_SIMULATION_STATUS = 'dynamicSimulation_status',
    DYNAMIC_SECURITY_ANALYSIS_RESULT = 'dynamicSecurityAnalysisResult',
    DYNAMIC_SECURITY_ANALYSIS_FAILED = 'dynamicSecurityAnalysis_failed',
    DYNAMIC_SECURITY_ANALYSIS_STATUS = 'dynamicSecurityAnalysis_status',
    DYNAMIC_MARGIN_CALCULATION_RESULT = 'dynamicMarginCalculationResult',
    DYNAMIC_MARGIN_CALCULATION_FAILED = 'dynamicMarginCalculation_failed',
    DYNAMIC_MARGIN_CALCULATION_STATUS = 'dynamicMarginCalculation_status',
    VOLTAGE_INIT_RESULT = 'voltageInitResult',
    VOLTAGE_INIT_FAILED = 'voltageInit_failed',
    VOLTAGE_INIT_CANCEL_FAILED = 'voltageInit_cancel_failed',
    VOLTAGE_INIT_STATUS = 'voltageInit_status',
    STATE_ESTIMATION_RESULT = 'stateEstimationResult',
    STATE_ESTIMATION_FAILED = 'stateEstimation_failed',
    STATE_ESTIMATION_STATUS = 'stateEstimation_status',
    PCC_MIN_RESULT = 'pccMinResult',
    PCC_MIN_FAILED = 'pccMin_failed',
    PCC_MIN_STATUS = 'pccMin_status',

    // spreadsheets
    SPREADSHEET_NODE_ALIASES_UPDATED = 'nodeAliasesUpdated',
    SPREADSHEET_TAB_UPDATED = 'spreadsheetTabUpdated',
    SPREADSHEET_COLLECTION_UPDATED = 'spreadsheetCollectionUpdated',
    SPREADSHEET_PARAMETERS_UPDATED = 'spreadsheetParametersUpdated',

    // workspaces
    WORKSPACE_RENAMED = 'workspaceRenamed',
    WORKSPACE_PANELS_UPDATED = 'workspacePanelsUpdated',
    WORKSPACE_PANELS_DELETED = 'workspacePanelsDeleted',
    WORKSPACE_NAD_CONFIG_UPDATED = 'workspaceNadConfigUpdated',
}

export const PENDING_MODIFICATION_NOTIFICATION_TYPES = [
    NotificationType.MODIFICATIONS_CREATION_IN_PROGRESS,
    NotificationType.MODIFICATIONS_UPDATING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_STASHING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_RESTORING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_DELETING_IN_PROGRESS,
] as NotificationType[];

export const EVENT_CRUD_NOTIFICATION_TYPES = [
    NotificationType.EVENT_CREATING_IN_PROGRESS,
    NotificationType.EVENT_UPDATING_IN_PROGRESS,
    NotificationType.EVENT_DELETING_IN_PROGRESS,
] as NotificationType[];

export enum RootNetworkIndexationStatus {
    NOT_INDEXED = 'NOT_INDEXED',
    INDEXING_ONGOING = 'INDEXING_ONGOING',
    INDEXED = 'INDEXED',
}

// Headers
interface CommonStudyEventDataHeaders {
    studyUuid: UUID;
    updateType: NotificationType;
}

interface StudyEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.STUDY;
    rootNetworkUuid: UUID;
    node: UUID;
}

interface ComputationResultTabUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType:
        | NotificationType.UPDATE_COMPUTATION_GLOBAL_FILTER_TAB
        | NotificationType.UPDATE_COMPUTATION_COLUMN_FILTER_TAB;
    computationType: ComputingType;
    computationSubtype?: string;
}

interface ComputationParametersUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.COMPUTATION_PARAMETERS_UPDATED;
    computationType: ComputingType;
}

interface NetworkVisualizationParametersUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NETWORK_VISUALIZATION_PARAMETERS_UPDATED;
}

interface RootNetworkUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.ROOT_NETWORKS_UPDATED;
    rootNetworkUuids: UUID[];
}

interface RootNetworkUpdateFailedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.ROOT_NETWORKS_UPDATE_FAILED;
    rootNetworkUuid: UUID;
    error: string;
}

interface RootNetworkDeletionStartedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.ROOT_NETWORKS_DELETION_STARTED;
    rootNetworksUuids: UUID[];
}

interface IndexationStatusEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.INDEXATION_STATUS;
    indexation_status: RootNetworkIndexationStatus;
}

interface StudyNetworkRecreationEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.STUDY_NETWORK_RECREATION_DONE;
    userId: string;
}

interface MetadataUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.METADATA_UPDATED;
}

export enum NodeInsertModes {
    After = 'AFTER',
    Before = 'BEFORE',
    NewBranch = 'CHILD',
}

export enum NodeSequenceType {
    SECURITY_SEQUENCE = 'SECURITY_SEQUENCE',
}

interface NodeCreatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_CREATED;
    parentNode: UUID;
    newNode: UUID;
    insertMode: NodeInsertModes;
    referenceNodeUuid: UUID;
}

interface NodesDeletedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODES_DELETED;
    nodes: UUID[];
    removeChildren: boolean;
}

interface NodeMovedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_MOVED;
    parentNode: UUID;
    movedNode: UUID;
    insertMode: NodeInsertModes;
    referenceNodeUuid: UUID;
}

interface NodeEditedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_EDITED;
    node: UUID;
}

interface NodesBuildStatusUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_BUILD_STATUS_UPDATED;
    nodes: UUID[];
    rootNetworkUuid: UUID;
}

interface NodeBuildCompletedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_BUILD_COMPLETED;
    node: UUID;
    rootNetworkUuid: UUID;
    substationsIds: UUID[];
}

interface SubtreeCreatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.SUBTREE_CREATED;
    newNode: UUID;
    parentNode: UUID;
}

interface ModificationProgressionEventDataHeaders extends CommonStudyEventDataHeaders {
    parentNode: UUID;
    nodes: UUID[];
    rootNetworkUuid?: UUID;
}

interface SpreadsheetParametersUpdatedDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.SPREADSHEET_PARAMETERS_UPDATED;
}

interface WorkspaceRenamedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.WORKSPACE_RENAMED;
}

interface WorkspacePanelsUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.WORKSPACE_PANELS_UPDATED;
    workspaceUuid: UUID;
    clientId?: UUID;
}

interface WorkspacePanelsDeletedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.WORKSPACE_PANELS_DELETED;
    workspaceUuid: UUID;
    clientId?: UUID;
}

interface WorkspaceNadConfigUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.WORKSPACE_NAD_CONFIG_UPDATED;
    workspaceUuid: UUID;
    panelId: UUID;
    clientId?: UUID;
}

interface ModificationsCreationInProgressEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_CREATION_IN_PROGRESS;
}

interface ModificationsUpdatingInProgressEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_UPDATING_IN_PROGRESS;
}

interface ModificationsStashingInProgressEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_STASHING_IN_PROGRESS;
}

interface ModificationsRestoringInProgressEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_RESTORING_IN_PROGRESS;
}

interface ModificationsDeletingInProgressEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_DELETING_IN_PROGRESS;
}

interface ModificationsUpdateFinishedEventDataHeaders extends ModificationProgressionEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_UPDATE_FINISHED;
}

// TODO strange should be extended from ModificationProgressionEventDataHeaders as well ?
interface ModificationsDeleteFinishedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.MODIFICATIONS_DELETE_FINISHED;
    parentNode: UUID;
    nodes: UUID[];
}

interface EventCreatingInProgressEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.EVENT_CREATING_IN_PROGRESS;
    parentNode: UUID;
    nodes: UUID[];
}

interface EventUpdatingInProgressEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.EVENT_UPDATING_IN_PROGRESS;
    parentNode: UUID;
    nodes: UUID[];
}

interface EventDeletingInProgressEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.EVENT_DELETING_IN_PROGRESS;
    parentNode: UUID;
    nodes: UUID[];
}

interface EventCrudFinishedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.EVENT_CRUD_FINISHED;
    parentNode: UUID;
    nodes: UUID[];
}

// Computations

interface ComputationResultEventDataHeaders extends CommonStudyEventDataHeaders {
    node: UUID;
    rootNetworkUuid: UUID;
}

interface ComputationFailedEventDataHeaders extends CommonStudyEventDataHeaders {
    node: UUID;
    rootNetworkUuid: UUID;
    error: string;
    userId: string;
}

interface LoadflowResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.LOADFLOW_RESULT;
}

interface ShortCircuitAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.SHORTCIRCUIT_ANALYSIS_RESULT;
}

interface OneBusShortCircuitAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.ONE_BUS_SC_ANALYSIS_RESULT;
}

interface OneBusShortCircuitAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.ONE_BUS_SC_ANALYSIS_FAILED;
}

interface StateEstimationResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.STATE_ESTIMATION_RESULT;
}

interface ExportNetworkEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NETWORK_EXPORT_FINISHED;
    userId: string;
    exportUuid: UUID;
    exportToGridExplore?: boolean;
    fileName: string;
    error: string | null;
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

export enum AlertLevel {
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    INFO = 'INFO',
}

// EventData
export interface CommonStudyEventData {
    headers: CommonStudyEventDataHeaders;
    payload: string | undefined;
}

export interface StudyEventData extends CommonStudyEventData {
    headers: StudyEventDataHeaders;
    /** @see NetworkImpactsInfos */
    payload: string;
}

export interface ComputationResultTabUpdatedEventData extends CommonStudyEventData {
    headers: ComputationResultTabUpdatedEventDataHeaders;
    payload: undefined;
}

export interface ComputationParametersUpdatedEventData extends CommonStudyEventData {
    headers: ComputationParametersUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NetworkVisualizationParametersUpdatedEventData extends CommonStudyEventData {
    headers: NetworkVisualizationParametersUpdatedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkUpdatedEventData extends CommonStudyEventData {
    headers: RootNetworkUpdatedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkUpdateFailedEventData extends CommonStudyEventData {
    headers: RootNetworkUpdateFailedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkDeletionStartedEventData extends CommonStudyEventData {
    headers: RootNetworkDeletionStartedEventDataHeaders;
    payload: undefined;
}

export interface IndexationStatusEventData extends CommonStudyEventData {
    headers: IndexationStatusEventDataHeaders;
    payload: undefined;
}

export interface StudyNetworkRecreationEventData extends CommonStudyEventData {
    headers: StudyNetworkRecreationEventDataHeaders;
    payload: undefined;
}

export interface MetadataUpdatedEventData extends CommonStudyEventData {
    headers: MetadataUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NodeCreatedEventData extends CommonStudyEventData {
    headers: NodeCreatedEventDataHeaders;
    payload: undefined;
}

export interface NodesDeletedEventData extends CommonStudyEventData {
    headers: NodesDeletedEventDataHeaders;
    payload: undefined;
}

export interface NodeMovedEventData extends CommonStudyEventData {
    headers: NodeMovedEventDataHeaders;
    payload: undefined;
}

export interface NodeEditedEventData extends CommonStudyEventData {
    headers: NodeEditedEventDataHeaders;
    payload: undefined;
}

export interface NodesBuildStatusUpdatedEventData extends CommonStudyEventData {
    headers: NodesBuildStatusUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NodeBuildCompletedEventData extends CommonStudyEventData {
    headers: NodeBuildCompletedEventDataHeaders;
    payload: undefined;
}

export interface SubtreeCreatedEventData extends CommonStudyEventData {
    headers: SubtreeCreatedEventDataHeaders;
    payload: undefined;
}

export interface ModificationsCreationInProgressEventData extends CommonStudyEventData {
    headers: ModificationsCreationInProgressEventDataHeaders;
    payload: undefined;
}

export interface ModificationsUpdatingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsUpdatingInProgressEventDataHeaders;
    payload: undefined;
}

export interface ModificationsStashingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsStashingInProgressEventDataHeaders;
    payload: undefined;
}

export interface ModificationsRestoringInProgressEventData extends CommonStudyEventData {
    headers: ModificationsRestoringInProgressEventDataHeaders;
    payload: undefined;
}

export interface ModificationsDeletingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsDeletingInProgressEventDataHeaders;
    payload: undefined;
}

export interface ModificationsUpdateFinishedEventData extends CommonStudyEventData {
    headers: ModificationsUpdateFinishedEventDataHeaders;
    payload: undefined;
}

export interface ModificationsDeleteFinishedEventData extends CommonStudyEventData {
    headers: ModificationsDeleteFinishedEventDataHeaders;
    payload: undefined;
}

export interface EventCreatingInProgressEventData extends CommonStudyEventData {
    headers: EventCreatingInProgressEventDataHeaders;
    payload: undefined;
}

export interface EventUpdatingInProgressEventData extends CommonStudyEventData {
    headers: EventUpdatingInProgressEventDataHeaders;
    payload: undefined;
}

export interface EventDeletingInProgressEventData extends CommonStudyEventData {
    headers: EventDeletingInProgressEventDataHeaders;
    payload: undefined;
}

export interface EventCrudFinishedEventData extends CommonStudyEventData {
    headers: EventCrudFinishedEventDataHeaders;
    payload: undefined;
}

export interface LoadflowResultEventData extends CommonStudyEventData {
    headers: LoadflowResultEventDataHeaders;
    payload: undefined;
}

export interface ShortCircuitAnalysisResultEventData extends CommonStudyEventData {
    headers: ShortCircuitAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface OneBusShortCircuitAnalysisResultEventData extends CommonStudyEventData {
    headers: OneBusShortCircuitAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface OneBusShortCircuitAnalysisFailedEventData extends CommonStudyEventData {
    headers: OneBusShortCircuitAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface StateEstimationResultEventData extends CommonStudyEventData {
    headers: StateEstimationResultEventDataHeaders;
    payload: undefined;
}

export interface ExportNetworkEventData extends CommonStudyEventData {
    headers: ExportNetworkEventDataHeaders;
    payload: undefined;
}

export interface SpreadsheetParametersUpdatedEventData extends CommonStudyEventData {
    headers: SpreadsheetParametersUpdatedDataHeaders;
    /**
     * stringified of <code>PartialDeep<SpreadsheetOptionalLoadingParameters></code>
     * @see SpreadsheetOptionalLoadingParameters
     */
    payload: string;
}

export interface WorkspaceRenamedEventData extends CommonStudyEventData {
    headers: WorkspaceRenamedEventDataHeaders;
    payload: string; // workspace ID
}

export interface WorkspacePanelsUpdatedEventData extends CommonStudyEventData {
    headers: WorkspacePanelsUpdatedEventDataHeaders;
    payload: string; // panel IDs (JSON array)
}

export interface WorkspacePanelsDeletedEventData extends CommonStudyEventData {
    headers: WorkspacePanelsDeletedEventDataHeaders;
    payload: string; // panel IDs (JSON array)
}

export interface WorkspaceNadConfigUpdatedEventData extends CommonStudyEventData {
    headers: WorkspaceNadConfigUpdatedEventDataHeaders;
    payload: string; // config UUID
}

export function isComputationResultColumnFilterUpdatedNotification(
    notif: CommonStudyEventData
): notif is ComputationResultTabUpdatedEventData {
    return notif.headers?.updateType === NotificationType.UPDATE_COMPUTATION_COLUMN_FILTER_TAB;
}

export function isComputationResultGlobalFilterUpdatedNotification(
    notif: CommonStudyEventData
): notif is ComputationResultTabUpdatedEventData {
    return notif.headers?.updateType === NotificationType.UPDATE_COMPUTATION_GLOBAL_FILTER_TAB;
}

export function isComputationParametersUpdatedNotification(
    notif: CommonStudyEventData
): notif is ComputationParametersUpdatedEventData {
    return notif.headers?.updateType === NotificationType.COMPUTATION_PARAMETERS_UPDATED;
}

export function isStudyNotification(notif: CommonStudyEventData): notif is StudyEventData {
    return notif.headers?.updateType === NotificationType.STUDY;
}

export function isLoadflowResultNotification(notif: CommonStudyEventData): notif is LoadflowResultEventData {
    return notif.headers?.updateType === NotificationType.LOADFLOW_RESULT;
}

export function isStateEstimationResultNotification(
    notif: CommonStudyEventData
): notif is StateEstimationResultEventData {
    return notif.headers?.updateType === NotificationType.STATE_ESTIMATION_RESULT;
}

export function isRootNetworkDeletionStartedNotification(
    notif: CommonStudyEventData
): notif is RootNetworkDeletionStartedEventData {
    return notif.headers?.updateType === NotificationType.ROOT_NETWORKS_DELETION_STARTED;
}

export function isRootNetworksUpdatedNotification(notif: CommonStudyEventData): notif is RootNetworkUpdatedEventData {
    return notif.headers?.updateType === NotificationType.ROOT_NETWORKS_UPDATED;
}

export function isRootNetworkUpdateFailedNotification(
    notif: CommonStudyEventData
): notif is RootNetworkUpdateFailedEventData {
    return notif.headers?.updateType === NotificationType.ROOT_NETWORKS_UPDATE_FAILED;
}

export function isNodeBuildCompletedNotification(notif: CommonStudyEventData): notif is NodeBuildCompletedEventData {
    return notif.headers?.updateType === NotificationType.NODE_BUILD_COMPLETED;
}

export function isNodeBuildStatusUpdatedNotification(
    notif: CommonStudyEventData
): notif is NodesBuildStatusUpdatedEventData {
    return notif.headers?.updateType === NotificationType.NODE_BUILD_STATUS_UPDATED;
}

export function isShortCircuitResultNotification(
    notif: CommonStudyEventData
): notif is ShortCircuitAnalysisResultEventData {
    return notif.headers?.updateType === NotificationType.SHORTCIRCUIT_ANALYSIS_RESULT;
}

export function isOneBusShortCircuitResultNotification(
    notif: CommonStudyEventData
): notif is OneBusShortCircuitAnalysisResultEventData {
    return notif.headers?.updateType === NotificationType.ONE_BUS_SC_ANALYSIS_RESULT;
}

export function isOneBusShortCircuitFailedNotification(
    notif: CommonStudyEventData
): notif is OneBusShortCircuitAnalysisFailedEventData {
    return notif.headers?.updateType === NotificationType.ONE_BUS_SC_ANALYSIS_FAILED;
}

export function isNetworkVisualizationParametersUpdatedNotification(
    notif: CommonStudyEventData
): notif is NetworkVisualizationParametersUpdatedEventData {
    return notif.headers?.updateType === NotificationType.NETWORK_VISUALIZATION_PARAMETERS_UPDATED;
}

export function isEventNotification(
    notif: CommonStudyEventData
): notif is EventCreatingInProgressEventData | EventUpdatingInProgressEventData | EventDeletingInProgressEventData {
    return EVENT_CRUD_NOTIFICATION_TYPES.includes(notif.headers?.updateType);
}

export function isEventCrudFinishedNotification(notif: CommonStudyEventData): notif is EventCrudFinishedEventData {
    return notif.headers?.updateType === NotificationType.EVENT_CRUD_FINISHED;
}

export function isNodeDeletedNotification(notif: CommonStudyEventData): notif is NodesDeletedEventData {
    return notif.headers?.updateType === NotificationType.NODES_DELETED;
}
export function isNodeCreatedNotification(notif: CommonStudyEventData): notif is NodeCreatedEventData {
    return notif.headers?.updateType === NotificationType.NODE_CREATED;
}

export function isNodeEditedNotification(notif: CommonStudyEventData): notif is NodeEditedEventData {
    return notif.headers?.updateType === NotificationType.NODE_EDITED;
}
export function isNodeSubTreeCreatedNotification(notif: CommonStudyEventData): notif is SubtreeCreatedEventData {
    return notif.headers?.updateType === NotificationType.SUBTREE_CREATED;
}

export function isExportNetworkNotification(notif: CommonStudyEventData): notif is ExportNetworkEventData {
    return notif.headers?.updateType === NotificationType.NETWORK_EXPORT_FINISHED;
}

export function isPendingModificationNotification(
    notif: CommonStudyEventData
): notif is
    | ModificationsCreationInProgressEventData
    | ModificationsUpdatingInProgressEventData
    | ModificationsStashingInProgressEventData
    | ModificationsRestoringInProgressEventData
    | ModificationsDeletingInProgressEventData {
    return PENDING_MODIFICATION_NOTIFICATION_TYPES.includes(notif.headers?.updateType);
}

export function isModificationsUpdateFinishedNotification(
    notif: CommonStudyEventData
): notif is ModificationsUpdateFinishedEventData {
    return notif.headers?.updateType === NotificationType.MODIFICATIONS_UPDATE_FINISHED;
}

export function isModificationsDeleteFinishedNotification(
    notif: CommonStudyEventData
): notif is ModificationsDeleteFinishedEventData {
    return notif.headers?.updateType === NotificationType.MODIFICATIONS_DELETE_FINISHED;
}

export function isIndexationStatusNotification(notif: CommonStudyEventData): notif is IndexationStatusEventData {
    return notif.headers?.updateType === NotificationType.INDEXATION_STATUS;
}

export function isStudyNetworkRecreationNotification(
    notif: CommonStudyEventData
): notif is StudyNetworkRecreationEventData {
    return notif.headers?.updateType === NotificationType.STUDY_NETWORK_RECREATION_DONE;
}

export function isMetadataUpdatedNotification(notif: CommonStudyEventData): notif is MetadataUpdatedEventData {
    return notif.headers?.updateType === NotificationType.METADATA_UPDATED;
}

export function isSpreadsheetNodeAliasesUpdatedNotification(notif: CommonStudyEventData): boolean {
    return notif.headers?.updateType === NotificationType.SPREADSHEET_NODE_ALIASES_UPDATED;
}

export function isSpreadsheetParametersUpdatedNotification(
    notif: CommonStudyEventData
): notif is SpreadsheetParametersUpdatedEventData {
    return notif.headers?.updateType === NotificationType.SPREADSHEET_PARAMETERS_UPDATED;
}

export function isWorkspaceRenamedNotification(notif: CommonStudyEventData): notif is WorkspaceRenamedEventData {
    return notif.headers?.updateType === NotificationType.WORKSPACE_RENAMED;
}

export function isWorkspacePanelsUpdatedNotification(
    notif: CommonStudyEventData
): notif is WorkspacePanelsUpdatedEventData {
    return notif.headers?.updateType === NotificationType.WORKSPACE_PANELS_UPDATED;
}

export function isWorkspacePanelsDeletedNotification(
    notif: CommonStudyEventData
): notif is WorkspacePanelsDeletedEventData {
    return notif.headers?.updateType === NotificationType.WORKSPACE_PANELS_DELETED;
}

export function isWorkspaceNadConfigUpdatedNotification(
    notif: CommonStudyEventData
): notif is WorkspaceNadConfigUpdatedEventData {
    return notif.headers?.updateType === NotificationType.WORKSPACE_NAD_CONFIG_UPDATED;
}

export function parseEventData<T>(event: MessageEvent | null): T | null {
    try {
        return JSON.parse(event?.data);
    } catch {
        return null;
    }
}

/******************* TO REMOVE LATER ****************/
// Headers
/**
 * @deprecated The type should not be used
 * @note TODO Remove later after useNodeData and useComputationStatus refactorization
 */
export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    updateType: string;
    parentNode: UUID;
    rootNetworkUuid: UUID;
    timestamp: number;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
    computationType?: ComputingType;
}
// EventData
/**
 * @deprecated The type should not be used
 * @note TODO Remove later after useNodeData and useComputationStatus refactorization
 */
export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    /** @see NetworkImpactsInfos */
    payload: string;
}
/******************* TO REMOVE LATER ****************/
