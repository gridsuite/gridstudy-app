/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EQUIPMENT_TYPES as NetworkViewerEquipmentType } from '@powsybl/network-viewer';
import { ComputingType } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';

export enum NotificationType {
    // Study status
    INDEXATION_STATUS = 'indexation_status_updated',
    STUDY_NETWORK_RECREATION_DONE = 'study_network_recreation_done',
    METADATA_UPDATED = 'metadata_updated',
    STUDY_ALERT = 'STUDY_ALERT',
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
    ROOT_NETWORK_DELETION_STARTED = 'rootNetworkDeletionStarted',
    // Nodes and tree
    NODE_CREATED = 'nodeCreated',
    NODES_DELETED = 'nodeDeleted',
    NODE_MOVED = 'nodeMoved',
    NODES_UPDATED = 'nodeUpdated',
    NODE_RENAMED = 'nodeRenamed',
    NODE_BUILD_STATUS_UPDATED = 'nodeBuildStatusUpdated',
    SUBTREE_MOVED = 'subtreeMoved',
    SUBTREE_CREATED = 'subtreeCreated',
    NODES_COLUMN_POSITION_CHANGED = 'nodesColumnPositionsChanged',
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
    NON_EVACUATED_ENERGY_ANALYSIS_RESULT = 'nonEvacuatedEnergyResult',
    NON_EVACUATED_ENERGY_ANALYSIS_FAILED = 'nonEvacuatedEnergy_failed',
    NON_EVACUATED_ENERGY_ANALYSIS_STATUS = 'nonEvacuatedEnergy_status',
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
    VOLTAGE_INIT_RESULT = 'voltageInitResult',
    VOLTAGE_INIT_FAILED = 'voltageInit_failed',
    VOLTAGE_INIT_CANCEL_FAILED = 'voltageInit_cancel_failed',
    VOLTAGE_INIT_STATUS = 'voltageInit_status',
    STATE_ESTIMATION_RESULT = 'stateEstimationResult',
    STATE_ESTIMATION_FAILED = 'stateEstimation_failed',
    STATE_ESTIMATION_STATUS = 'stateEstimation_status',

    // spreadsheets
    SPREADSHEET_NODE_ALIASES_UPDATED = 'nodeAliasesUpdated',
    SPREADSHEET_TAB_UPDATED = 'spreadsheetTabUpdated',
    SPREADSHEET_COLLECTION_UPDATED = 'spreadsheetCollectionUpdated',
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

export const MODIFYING_NODES_NOTIFICATION_TYPES = [
    NotificationType.EVENT_CRUD_FINISHED,
    NotificationType.EVENT_DELETING_IN_PROGRESS,
    NotificationType.EVENT_UPDATING_IN_PROGRESS,
    NotificationType.EVENT_CREATING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_DELETE_FINISHED,
    NotificationType.MODIFICATIONS_UPDATE_FINISHED,
    NotificationType.MODIFICATIONS_DELETING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_RESTORING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_STASHING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_UPDATING_IN_PROGRESS,
    NotificationType.MODIFICATIONS_CREATION_IN_PROGRESS,
    NotificationType.NODES_UPDATED,
    NotificationType.NODES_DELETED,
    NotificationType.NODE_BUILD_STATUS_UPDATED,
] as NotificationType[];

export const MODIFYING_NODE_NOTIFICATION_TYPES = [
    NotificationType.STUDY, // contains 'node' header
    NotificationType.STUDY_ALERT,
    NotificationType.NODE_RENAMED, // TODO don not manage this one ?
    NotificationType.NODE_BUILD_COMPLETED,
    NotificationType.NODE_BUILD_FAILED,
] as NotificationType[];

export const COMPUTATION_NOTIFIACTION_TYPES = [
    NotificationType.LOADFLOW_RESULT,
    NotificationType.LOADFLOW_FAILED,
    NotificationType.LOADFLOW_STATUS,
    NotificationType.SECURITY_ANALYSIS_RESULT,
    NotificationType.SECURITY_ANALYSIS_FAILED,
    NotificationType.SECURITY_ANALYSIS_STATUS,
    NotificationType.SENSITIVITY_ANALYSIS_RESULT,
    NotificationType.SENSITIVITY_ANALYSIS_FAILED,
    NotificationType.SENSITIVITY_ANALYSIS_STATUS,
    NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_RESULT,
    NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_FAILED,
    NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_STATUS,
    NotificationType.SHORTCIRCUIT_ANALYSIS_RESULT,
    NotificationType.SHORTCIRCUIT_ANALYSIS_FAILED,
    NotificationType.SHORTCIRCUIT_ANALYSIS_STATUS,
    NotificationType.ONE_BUS_SC_ANALYSIS_RESULT,
    NotificationType.ONE_BUS_SC_ANALYSIS_FAILED,
    NotificationType.ONE_BUS_SC_ANALYSIS_STATUS,
    NotificationType.DYNAMIC_SIMULATION_RESULT,
    NotificationType.DYNAMIC_SIMULATION_FAILED,
    NotificationType.DYNAMIC_SIMULATION_STATUS,
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_RESULT,
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_FAILED,
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_STATUS,
    NotificationType.VOLTAGE_INIT_RESULT,
    NotificationType.VOLTAGE_INIT_FAILED,
    NotificationType.VOLTAGE_INIT_CANCEL_FAILED,
    NotificationType.VOLTAGE_INIT_STATUS,
    NotificationType.STATE_ESTIMATION_RESULT,
    NotificationType.STATE_ESTIMATION_FAILED,
    NotificationType.STATE_ESTIMATION_STATUS,
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
    updateType: NotificationType.ROOT_NETWORK_DELETION_STARTED;
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

interface StudyAlertEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.STUDY_ALERT;
    userId: string;
    node: UUID;
    rootNetworkUuid: UUID;
}

export enum NodeInsertModes {
    After = 'AFTER',
    Before = 'BEFORE',
    NewBranch = 'CHILD',
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

interface NodesUpdatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODES_UPDATED;
    nodes: UUID[];
}

interface NodeRenamedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_RENAMED;
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

interface NodeBuildFailedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODE_BUILD_FAILED;
    node: UUID;
    rootNetworkUuid: UUID;
    error: string;
}

interface SubtreeMovedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.SUBTREE_MOVED;
    movedNode: UUID;
    parentNode: UUID;
}

interface SubtreeCreatedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.SUBTREE_CREATED;
    newNode: UUID;
    parentNode: UUID;
}

interface NodesColumnPositionsChangedEventDataHeaders extends CommonStudyEventDataHeaders {
    updateType: NotificationType.NODES_COLUMN_POSITION_CHANGED;
    parentNode: UUID;
}

interface ModificationProgressionEventDataHeaders extends CommonStudyEventDataHeaders {
    parentNode: UUID;
    nodes: UUID[];
    rootNetworkUuid?: UUID;
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
interface ComputationStatusEventDataHeaders extends CommonStudyEventDataHeaders {
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

interface LoadflowFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.LOADFLOW_FAILED;
}

interface LoadflowStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.LOADFLOW_STATUS;
}

interface SecurityAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.SECURITY_ANALYSIS_RESULT;
}

interface SecurityAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.SECURITY_ANALYSIS_FAILED;
}

interface SecurityAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.SECURITY_ANALYSIS_STATUS;
}

interface SensitivityAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.SENSITIVITY_ANALYSIS_RESULT;
}

interface SensitivityAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.SENSITIVITY_ANALYSIS_FAILED;
}

interface SensitivityAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.SENSITIVITY_ANALYSIS_STATUS;
}

interface NonEvacuatedEnergyAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_RESULT;
}

interface NonEvacuatedEnergyAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_FAILED;
}

interface NonEvacuatedEnergyAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_STATUS;
}

interface ShortCircuitAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.SHORTCIRCUIT_ANALYSIS_RESULT;
}

interface ShortCircuitAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.SHORTCIRCUIT_ANALYSIS_FAILED;
}

interface ShortCircuitAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.SHORTCIRCUIT_ANALYSIS_STATUS;
}

interface OneBusShortCircuitAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.ONE_BUS_SC_ANALYSIS_RESULT;
}

interface OneBusShortCircuitAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.ONE_BUS_SC_ANALYSIS_FAILED;
}

interface OneBusShortCircuitAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.ONE_BUS_SC_ANALYSIS_STATUS;
}

interface DynamicSimulationResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SIMULATION_RESULT;
}

interface DynamicSimulationFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SIMULATION_FAILED;
}

interface DynamicSimulationStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SIMULATION_STATUS;
}

interface DynamicSecurityAnalysisResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SECURITY_ANALYSIS_RESULT;
}

interface DynamicSecurityAnalysisFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SECURITY_ANALYSIS_FAILED;
}

interface DynamicSecurityAnalysisStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.DYNAMIC_SECURITY_ANALYSIS_STATUS;
}

interface VoltageInitResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.VOLTAGE_INIT_RESULT;
}

interface VoltageInitFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.VOLTAGE_INIT_FAILED;
}

interface VoltageInitCancelFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.VOLTAGE_INIT_CANCEL_FAILED;
}

interface VoltageInitStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.VOLTAGE_INIT_STATUS;
}

interface StateEstimationResultEventDataHeaders extends ComputationResultEventDataHeaders {
    updateType: NotificationType.STATE_ESTIMATION_RESULT;
}

interface StateEstimationFailedEventDataHeaders extends ComputationFailedEventDataHeaders {
    updateType: NotificationType.STATE_ESTIMATION_FAILED;
}

interface StateEstimationStatusEventDataHeaders extends ComputationStatusEventDataHeaders {
    updateType: NotificationType.STATE_ESTIMATION_STATUS;
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

export interface StudyAlert {
    alertLevel: AlertLevel;
    messageId: string;
    attributes: Record<string, string>;
}

// EventData
interface CommonStudyEventData {
    headers: CommonStudyEventDataHeaders;
    payload: undefined;
}

export interface StudyEventData {
    headers: StudyEventDataHeaders;
    payload: NetworkImpactsInfos;
}

export interface ComputationParametersUpdatedEventData {
    headers: ComputationParametersUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NetworkVisualizationParametersUpdatedEventData {
    headers: NetworkVisualizationParametersUpdatedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkUpdatedEventData {
    headers: RootNetworkUpdatedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkUpdateFailedEventData {
    headers: RootNetworkUpdateFailedEventDataHeaders;
    payload: undefined;
}

export interface RootNetworkDeletionStartedEventData {
    headers: RootNetworkDeletionStartedEventDataHeaders;
    payload: undefined;
}

export interface IndexationStatusEventData {
    headers: IndexationStatusEventDataHeaders;
    payload: undefined;
}

export interface StudyNetworkRecreationEventData {
    headers: StudyNetworkRecreationEventDataHeaders;
    payload: undefined;
}

export interface MetadataUpdatedEventData {
    headers: MetadataUpdatedEventDataHeaders;
    payload: undefined;
}

export interface StudyAlertEventData {
    headers: StudyAlertEventDataHeaders;
    payload: StudyAlert;
}

export interface NodeCreatedEventData {
    headers: NodeCreatedEventDataHeaders;
    payload: undefined;
}

export interface NodesDeletedEventData {
    headers: NodesDeletedEventDataHeaders;
    payload: undefined;
}

export interface NodeMovedEventData {
    headers: NodeMovedEventDataHeaders;
    payload: undefined;
}

export interface NodesUpdatedEventData {
    headers: NodesUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NodeRenamedEventData {
    headers: NodeRenamedEventDataHeaders;
    payload: undefined;
}

export interface NodesBuildStatusUpdatedEventData {
    headers: NodesBuildStatusUpdatedEventDataHeaders;
    payload: undefined;
}

export interface NodeBuildCompletedEventData {
    headers: NodeBuildCompletedEventDataHeaders;
    payload: undefined;
}

export interface NodeBuildFailedEventData {
    headers: NodeBuildFailedEventDataHeaders;
    payload: undefined;
}

export interface SubtreeMovedEventData {
    headers: SubtreeMovedEventDataHeaders;
    payload: undefined;
}

export interface SubtreeCreatedEventData {
    headers: SubtreeCreatedEventDataHeaders;
    payload: undefined;
}

export interface NodesColumnPositionsChangedEventData {
    headers: NodesColumnPositionsChangedEventDataHeaders;
    payload: UUID[];
}

export interface ModificationsCreationInProgressEventData extends CommonStudyEventData {
    headers: ModificationsCreationInProgressEventDataHeaders;
}

export interface ModificationsUpdatingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsUpdatingInProgressEventDataHeaders;
}

export interface ModificationsStashingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsStashingInProgressEventDataHeaders;
}

export interface ModificationsRestoringInProgressEventData extends CommonStudyEventData {
    headers: ModificationsRestoringInProgressEventDataHeaders;
}

export interface ModificationsDeletingInProgressEventData extends CommonStudyEventData {
    headers: ModificationsDeletingInProgressEventDataHeaders;
}

export interface ModificationsUpdateFinishedEventData {
    headers: ModificationsUpdateFinishedEventDataHeaders;
    payload: undefined;
}

export interface ModificationsDeleteFinishedEventData {
    headers: ModificationsDeleteFinishedEventDataHeaders;
    payload: undefined;
}

export interface EventCreatingInProgressEventData extends CommonStudyEventData {
    headers: EventCreatingInProgressEventDataHeaders;
}

export interface EventUpdatingInProgressEventData extends CommonStudyEventData {
    headers: EventUpdatingInProgressEventDataHeaders;
}

export interface EventDeletingInProgressEventData extends CommonStudyEventData {
    headers: EventDeletingInProgressEventDataHeaders;
}

export interface EventCrudFinishedEventData {
    headers: EventCrudFinishedEventDataHeaders;
    payload: undefined;
}

export interface LoadflowResultEventData {
    headers: LoadflowResultEventDataHeaders;
    payload: undefined;
}

export interface LoadflowFailedEventData {
    headers: LoadflowFailedEventDataHeaders;
    payload: undefined;
}

export interface LoadflowStatusEventData {
    headers: LoadflowStatusEventDataHeaders;
    payload: undefined;
}

export interface SecurityAnalysisResultEventData {
    headers: SecurityAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface SecurityAnalysisFailedEventData {
    headers: SecurityAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface SecurityAnalysisStatusEventData {
    headers: SecurityAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface SensitivityAnalysisResultEventData {
    headers: SensitivityAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface SensitivityAnalysisFailedEventData {
    headers: SensitivityAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface SensitivityAnalysisStatusEventData {
    headers: SensitivityAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface NonEvacuatedEnergyAnalysisResultEventData {
    headers: NonEvacuatedEnergyAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface NonEvacuatedEnergyAnalysisFailedEventData {
    headers: NonEvacuatedEnergyAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface NonEvacuatedEnergyAnalysisStatusEventData {
    headers: NonEvacuatedEnergyAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface ShortCircuitAnalysisResultEventData {
    headers: ShortCircuitAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface ShortCircuitAnalysisFailedEventData {
    headers: ShortCircuitAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface ShortCircuitAnalysisStatusEventData {
    headers: ShortCircuitAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface OneBusShortCircuitAnalysisResultEventData {
    headers: OneBusShortCircuitAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface OneBusShortCircuitAnalysisFailedEventData {
    headers: OneBusShortCircuitAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface OneBusShortCircuitAnalysisStatusEventData {
    headers: OneBusShortCircuitAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface DynamicSimulationResultEventData {
    headers: DynamicSimulationResultEventDataHeaders;
    payload: undefined;
}

export interface DynamicSimulationFailedEventData {
    headers: DynamicSimulationFailedEventDataHeaders;
    payload: undefined;
}

export interface DynamicSimulationStatusEventData {
    headers: DynamicSimulationStatusEventDataHeaders;
    payload: undefined;
}

export interface DynamicSecurityAnalysisResultEventData {
    headers: DynamicSecurityAnalysisResultEventDataHeaders;
    payload: undefined;
}

export interface DynamicSecurityAnalysisFailedEventData {
    headers: DynamicSecurityAnalysisFailedEventDataHeaders;
    payload: undefined;
}

export interface DynamicSecurityAnalysisStatusEventData {
    headers: DynamicSecurityAnalysisStatusEventDataHeaders;
    payload: undefined;
}

export interface VoltageInitResultEventData {
    headers: VoltageInitResultEventDataHeaders;
    payload: undefined;
}

export interface VoltageInitFailedEventData {
    headers: VoltageInitFailedEventDataHeaders;
    payload: undefined;
}

export interface VoltageInitCancelFailedEventData {
    headers: VoltageInitCancelFailedEventDataHeaders;
    payload: undefined;
}

export interface VoltageInitStatusEventData {
    headers: VoltageInitStatusEventDataHeaders;
    payload: undefined;
}

export interface StateEstimationResultEventData {
    headers: StateEstimationResultEventDataHeaders;
    payload: undefined;
}

export interface StateEstimationFailedEventData {
    headers: StateEstimationFailedEventDataHeaders;
    payload: undefined;
}

export interface StateEstimationStatusEventData {
    headers: StateEstimationStatusEventDataHeaders;
    payload: undefined;
}

export function isComputationParametersUpdatedNotification(
    notif: unknown
): notif is ComputationParametersUpdatedEventData {
    return (
        (notif as ComputationParametersUpdatedEventData).headers?.updateType ===
        NotificationType.COMPUTATION_PARAMETERS_UPDATED
    );
}

export function isStudyNotification(notif: unknown): notif is StudyEventData {
    return (notif as StudyEventData).headers?.updateType === NotificationType.STUDY;
}

export function isLoadflowResultNotification(notif: unknown): notif is LoadflowResultEventData {
    return (notif as LoadflowResultEventData).headers?.updateType === NotificationType.LOADFLOW_RESULT;
}

export function isRootNetworkDeletionStartedNotification(notif: unknown): notif is RootNetworkDeletionStartedEventData {
    return (
        (notif as RootNetworkDeletionStartedEventData).headers?.updateType ===
        NotificationType.ROOT_NETWORK_DELETION_STARTED
    );
}

export function isRootNetworksUpdatedNotification(notif: unknown): notif is RootNetworkUpdatedEventData {
    return (notif as RootNetworkUpdatedEventData).headers?.updateType === NotificationType.ROOT_NETWORKS_UPDATED;
}

export function isRootNetworkUpdateFailedNotification(notif: unknown): notif is RootNetworkUpdateFailedEventData {
    return (
        (notif as RootNetworkUpdateFailedEventData).headers?.updateType === NotificationType.ROOT_NETWORKS_UPDATE_FAILED
    );
}

export function isNodeBuildCompletedNotification(notif: unknown): notif is NodeBuildCompletedEventData {
    return (notif as NodeBuildCompletedEventData).headers?.updateType === NotificationType.NODE_BUILD_COMPLETED;
}

export function isNodeBuildStatusUpdatedNotification(notif: unknown): notif is NodesBuildStatusUpdatedEventData {
    return (
        (notif as NodesBuildStatusUpdatedEventData).headers?.updateType === NotificationType.NODE_BUILD_STATUS_UPDATED
    );
}

export function isOneBusShortCircuitResultNotification(
    notif: unknown
): notif is OneBusShortCircuitAnalysisResultEventData {
    return (
        (notif as OneBusShortCircuitAnalysisResultEventData).headers?.updateType ===
        NotificationType.ONE_BUS_SC_ANALYSIS_RESULT
    );
}

export function isOneBusShortCircuitFailedNotification(
    notif: unknown
): notif is OneBusShortCircuitAnalysisFailedEventData {
    return (
        (notif as OneBusShortCircuitAnalysisFailedEventData).headers?.updateType ===
        NotificationType.ONE_BUS_SC_ANALYSIS_FAILED
    );
}

export function isNetworkVisualizationParametersUpdatedNotification(
    notif: unknown
): notif is NetworkVisualizationParametersUpdatedEventData {
    return (
        (notif as NetworkVisualizationParametersUpdatedEventData).headers?.updateType ===
        NotificationType.NETWORK_VISUALIZATION_PARAMETERS_UPDATED
    );
}

export function isEventNotification(
    notif: unknown
): notif is EventCreatingInProgressEventData | EventUpdatingInProgressEventData | EventDeletingInProgressEventData {
    return EVENT_CRUD_NOTIFICATION_TYPES.includes((notif as CommonStudyEventData).headers?.updateType);
}

export function isEventCrudFinishedNotification(notif: unknown): notif is EventCrudFinishedEventData {
    return (notif as EventCrudFinishedEventData).headers?.updateType === NotificationType.EVENT_CRUD_FINISHED;
}

export function isNodeDeletedNotification(notif: unknown): notif is NodesDeletedEventData {
    return (notif as NodesDeletedEventData).headers?.updateType === NotificationType.NODES_DELETED;
}

export function isContainingNodesInformationNotification(notif: unknown): notif is
    | EventCrudFinishedEventData // contains 'nodes' header
    | EventDeletingInProgressEventData
    | EventUpdatingInProgressEventData
    | EventCreatingInProgressEventData
    | ModificationsDeleteFinishedEventData
    | ModificationsUpdateFinishedEventData
    | ModificationsDeletingInProgressEventData
    | ModificationsRestoringInProgressEventData
    | ModificationsStashingInProgressEventData
    | ModificationsUpdatingInProgressEventData
    | ModificationsCreationInProgressEventData
    | NodesUpdatedEventData
    | NodesDeletedEventData
    | NodesBuildStatusUpdatedEventData {
    return MODIFYING_NODES_NOTIFICATION_TYPES.includes((notif as CommonStudyEventData).headers?.updateType);
}

export function isContainingNodeInformationNotification(notif: unknown): notif is
    | StudyEventData // contains 'node' header
    | StudyAlertEventData
    | NodeRenamedEventData // TODO don not manage this one ?
    | NodeBuildCompletedEventData
    | NodeBuildFailedEventData {
    return MODIFYING_NODE_NOTIFICATION_TYPES.includes((notif as CommonStudyEventData).headers?.updateType);
}

export function isPendingModificationNotification(
    notif: unknown
): notif is
    | ModificationsCreationInProgressEventData
    | ModificationsUpdatingInProgressEventData
    | ModificationsStashingInProgressEventData
    | ModificationsRestoringInProgressEventData
    | ModificationsDeletingInProgressEventData {
    return PENDING_MODIFICATION_NOTIFICATION_TYPES.includes((notif as CommonStudyEventData).headers?.updateType);
}

export function isModificationsUpdateFinishedNotification(
    notif: unknown
): notif is ModificationsUpdateFinishedEventData {
    return (
        (notif as ModificationsUpdateFinishedEventData).headers?.updateType ===
        NotificationType.MODIFICATIONS_UPDATE_FINISHED
    );
}

export function isModificationsDeleteFinishedNotification(
    notif: unknown
): notif is ModificationsDeleteFinishedEventData {
    return (
        (notif as ModificationsDeleteFinishedEventData).headers?.updateType ===
        NotificationType.MODIFICATIONS_DELETE_FINISHED
    );
}

export type ComputationEventData =
    | LoadflowResultEventData
    | LoadflowFailedEventData
    | LoadflowStatusEventData
    | SecurityAnalysisResultEventData
    | SecurityAnalysisFailedEventData
    | SecurityAnalysisStatusEventData
    | SensitivityAnalysisResultEventData
    | SensitivityAnalysisFailedEventData
    | SensitivityAnalysisStatusEventData
    | NonEvacuatedEnergyAnalysisResultEventData
    | NonEvacuatedEnergyAnalysisFailedEventData
    | NonEvacuatedEnergyAnalysisStatusEventData
    | ShortCircuitAnalysisResultEventData
    | ShortCircuitAnalysisFailedEventData
    | ShortCircuitAnalysisStatusEventData
    | OneBusShortCircuitAnalysisResultEventData
    | OneBusShortCircuitAnalysisFailedEventData
    | OneBusShortCircuitAnalysisStatusEventData
    | DynamicSimulationResultEventData
    | DynamicSimulationFailedEventData
    | DynamicSimulationStatusEventData
    | DynamicSecurityAnalysisResultEventData
    | DynamicSecurityAnalysisFailedEventData
    | DynamicSecurityAnalysisStatusEventData
    | VoltageInitResultEventData
    | VoltageInitFailedEventData
    | VoltageInitCancelFailedEventData
    | VoltageInitStatusEventData
    | StateEstimationResultEventData
    | StateEstimationFailedEventData
    | StateEstimationStatusEventData;

export function isComputationNotification(notif: unknown): notif is ComputationEventData {
    return COMPUTATION_NOTIFIACTION_TYPES.includes((notif as CommonStudyEventData).headers?.updateType);
}

export function isIndexationStatusNotification(notif: unknown): notif is IndexationStatusEventData {
    return (notif as CommonStudyEventData).headers?.updateType === NotificationType.INDEXATION_STATUS;
}

export function isStudyNetworkRecreationNotification(notif: unknown): notif is StudyNetworkRecreationEventData {
    return (notif as CommonStudyEventData).headers?.updateType === NotificationType.STUDY_NETWORK_RECREATION_DONE;
}

export function isMetadataUpdatedNotification(notif: unknown): notif is MetadataUpdatedEventData {
    return (notif as CommonStudyEventData).headers?.updateType === NotificationType.METADATA_UPDATED;
}

export function isSpreadsheetNodeAliasesUpdatedNotification(notif: unknown): notif is CommonStudyEventData {
    return (notif as CommonStudyEventData).headers?.updateType === NotificationType.SPREADSHEET_NODE_ALIASES_UPDATED;
}

// Notification types
export type StudyUpdateEventData =
    | StudyEventData
    | ComputationParametersUpdatedEventData
    | RootNetworkUpdatedEventData
    | RootNetworkUpdateFailedEventData
    | RootNetworkDeletionStartedEventData
    | IndexationStatusEventData
    | StudyNetworkRecreationEventData
    | MetadataUpdatedEventData
    | StudyAlertEventData
    | NodeCreatedEventData
    | NodesDeletedEventData
    | NodeMovedEventData
    | NodesUpdatedEventData
    | NodeRenamedEventData
    | NodesBuildStatusUpdatedEventData
    | NodeBuildCompletedEventData
    | NodeBuildFailedEventData
    | SubtreeMovedEventData
    | SubtreeCreatedEventData
    | NodesColumnPositionsChangedEventData
    | ModificationsCreationInProgressEventData
    | ModificationsUpdatingInProgressEventData
    | ModificationsStashingInProgressEventData
    | ModificationsRestoringInProgressEventData
    | ModificationsDeletingInProgressEventData
    | ModificationsUpdateFinishedEventData
    | ModificationsDeleteFinishedEventData
    | EventCreatingInProgressEventData
    | EventUpdatingInProgressEventData
    | EventDeletingInProgressEventData
    | EventCrudFinishedEventData
    | LoadflowResultEventData
    | LoadflowFailedEventData
    | LoadflowStatusEventData
    | SecurityAnalysisResultEventData
    | SecurityAnalysisFailedEventData
    | SecurityAnalysisStatusEventData
    | SensitivityAnalysisResultEventData
    | SensitivityAnalysisFailedEventData
    | SensitivityAnalysisStatusEventData
    | NonEvacuatedEnergyAnalysisResultEventData
    | NonEvacuatedEnergyAnalysisFailedEventData
    | NonEvacuatedEnergyAnalysisStatusEventData
    | ShortCircuitAnalysisResultEventData
    | ShortCircuitAnalysisFailedEventData
    | ShortCircuitAnalysisStatusEventData
    | OneBusShortCircuitAnalysisResultEventData
    | OneBusShortCircuitAnalysisFailedEventData
    | OneBusShortCircuitAnalysisStatusEventData
    | DynamicSimulationResultEventData
    | DynamicSimulationFailedEventData
    | DynamicSimulationStatusEventData
    | DynamicSecurityAnalysisResultEventData
    | DynamicSecurityAnalysisFailedEventData
    | DynamicSecurityAnalysisStatusEventData
    | VoltageInitResultEventData
    | VoltageInitFailedEventData
    | VoltageInitCancelFailedEventData
    | VoltageInitStatusEventData
    | StateEstimationResultEventData
    | StateEstimationFailedEventData
    | StateEstimationStatusEventData;

export type StudyUpdateNotification = {
    eventData: StudyUpdateEventData;
};

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
    payload: NetworkImpactsInfos;
}
/******************* TO REMOVE LATER ****************/
