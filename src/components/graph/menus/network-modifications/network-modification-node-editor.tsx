/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementSaveDialog,
    ElementType,
    IElementCreationDialog,
    IElementUpdateDialog,
    MODIFICATION_TYPES,
    NetworkModificationMetadata,
    usePrevious,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Box, CircularProgress, Toolbar, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import BatteryCreationDialog from 'components/dialogs/network-modifications/battery/creation/battery-creation-dialog';
import BatteryModificationDialog from 'components/dialogs/network-modifications/battery/modification/battery-modification-dialog';
import DeleteAttachingLineDialog from 'components/dialogs/network-modifications/delete-attaching-line/delete-attaching-line-dialog';
import DeleteVoltageLevelOnLineDialog from 'components/dialogs/network-modifications/delete-voltage-level-on-line/delete-voltage-level-on-line-dialog';
import EquipmentDeletionDialog from 'components/dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
import GenerationDispatchDialog from 'components/dialogs/network-modifications/generation-dispatch/generation-dispatch-dialog';
import GeneratorScalingDialog from 'components/dialogs/network-modifications/generator-scaling/generator-scaling-dialog';
import GeneratorCreationDialog from 'components/dialogs/network-modifications/generator/creation/generator-creation-dialog';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import LineAttachToVoltageLevelDialog from 'components/dialogs/network-modifications/line-attach-to-voltage-level/line-attach-to-voltage-level-dialog';
import LineSplitWithVoltageLevelDialog from 'components/dialogs/network-modifications/line-split-with-voltage-level/line-split-with-voltage-level-dialog';
import LineCreationDialog from 'components/dialogs/network-modifications/line/creation/line-creation-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import LinesAttachToSplitLinesDialog from 'components/dialogs/network-modifications/lines-attach-to-split-lines/lines-attach-to-split-lines-dialog';
import LoadScalingDialog from 'components/dialogs/network-modifications/load-scaling/load-scaling-dialog';
import { LoadCreationDialog } from '../../../dialogs/network-modifications/load/creation/load-creation-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import ShuntCompensatorCreationDialog from 'components/dialogs/network-modifications/shunt-compensator/creation/shunt-compensator-creation-dialog';
import ShuntCompensatorModificationDialog from 'components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import SubstationCreationDialog from 'components/dialogs/network-modifications/substation/creation/substation-creation-dialog';
import SubstationModificationDialog from 'components/dialogs/network-modifications/substation/modification/substation-modification-dialog';
import TabularCreationDialog from 'components/dialogs/network-modifications/tabular-creation/tabular-creation-dialog';
import TabularModificationDialog from 'components/dialogs/network-modifications/tabular-modification/tabular-modification-dialog';
import TwoWindingsTransformerCreationDialog from 'components/dialogs/network-modifications/two-windings-transformer/creation/two-windings-transformer-creation-dialog';
import VoltageInitModificationDialog from 'components/dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import VoltageLevelCreationDialog from 'components/dialogs/network-modifications/voltage-level/creation/voltage-level-creation-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import VscCreationDialog from 'components/dialogs/network-modifications/hvdc-line/vsc/creation/vsc-creation-dialog';
import VscModificationDialog from 'components/dialogs/network-modifications/hvdc-line/vsc/modification/vsc-modification-dialog';
import NetworkModificationsMenu from 'components/graph/menus/network-modifications/network-modifications-menu';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    removeNotificationByNode,
    resetLogsFilter,
    setModificationsInProgress,
} from '../../../../redux/actions';
import TwoWindingsTransformerModificationDialog from '../../../dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';

import { FileUpload, RestoreFromTrash } from '@mui/icons-material';
import ImportModificationDialog from 'components/dialogs/import-modification-dialog';
import RestoreModificationDialog from 'components/dialogs/restore-modification-dialog';
import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { createCompositeModifications, updateCompositeModifications } from '../../../../services/explore';
import { fetchNetworkModification } from '../../../../services/network-modification';
import { copyOrMoveModifications } from '../../../../services/study';
import {
    changeNetworkModificationOrder,
    fetchNetworkModifications,
    fetchExcludedNetworkModifications,
    stashModifications,
} from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import {
    ExcludedNetworkModifications,
    MenuDefinition,
    MenuDefinitionSubItem,
    MenuDefinitionWithoutSubItem,
    NetworkModificationCopyInfo,
    NetworkModificationCopyType,
    NetworkModificationData,
} from './network-modification-menu.type';
import StaticVarCompensatorCreationDialog from '../../../dialogs/network-modifications/static-var-compensator/creation/static-var-compensator-creation-dialog';
import ModificationByAssignmentDialog from '../../../dialogs/network-modifications/by-filter/by-assignment/modification-by-assignment-dialog';
import ByFormulaDialog from '../../../dialogs/network-modifications/by-filter/by-formula/by-formula-dialog';
import ByFilterDeletionDialog from '../../../dialogs/network-modifications/by-filter/by-filter-deletion/by-filter-deletion-dialog';
import { LccCreationDialog } from '../../../dialogs/network-modifications/hvdc-line/lcc/creation/lcc-creation-dialog';
import { styles } from './network-modification-node-editor-utils';
import NetworkModificationsTable from './network-modifications-table';
import { CellClickedEvent, RowDragEndEvent, RowDragEnterEvent } from 'ag-grid-community';
import {
    isModificationsDeleteFinishedNotification,
    isModificationsUpdateFinishedNotification,
    isNodeDeletedNotification,
    isPendingModificationNotification,
    ModificationsCreationInProgressEventData,
    ModificationsDeletingInProgressEventData,
    ModificationsRestoringInProgressEventData,
    ModificationsStashingInProgressEventData,
    ModificationsUpdatingInProgressEventData,
    NotificationType,
} from 'types/notification-types';
import { LccModificationDialog } from '../../../dialogs/network-modifications/hvdc-line/lcc/modification/lcc-modification-dialog';
import VoltageLevelTopologyModificationDialog from '../../../dialogs/network-modifications/voltage-level-topology-modification/voltage-level-topology-modification-dialog';
import CreateCouplingDeviceDialog from '../../../dialogs/network-modifications/coupling-device/modification/create-coupling-device-dialog';
import { BalancesAdjustmentDialog } from '../../../dialogs/network-modifications/balances-adjustment/balances-adjustment-dialog';
import { NodeType } from 'components/graph/tree-node.type';

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
    'OPERATING_STATUS_MODIFICATION',
]);

const isEditableModification = (modif: NetworkModificationMetadata) => {
    if (!modif) {
        return false;
    }
    return !nonEditableModificationTypes.has(modif.type);
};

const NetworkModificationNodeEditor = () => {
    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const createdRootNetworks = rootNetworks.filter((rn) => !rn.isCreating);
    // modifications need to reload once root network is fully created (not in "isCreating" state) in order to fetch its applicability
    const createdRootNetworksLength = createdRootNetworks.length;
    const createdRootNetworksPreviousLength = usePrevious(createdRootNetworks.length);
    const { snackInfo, snackError } = useSnackMessage();
    const [modifications, setModifications] = useState<NetworkModificationMetadata[]>([]);
    const [modificationsToExclude, setModificationsToExclude] = useState<ExcludedNetworkModifications[]>([]);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [modificationsToRestore, setModificationsToRestore] = useState<NetworkModificationMetadata[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const currentNodeIdRef = useRef<UUID>(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedNetworkModifications, setSelectedNetworkModifications] = useState<NetworkModificationMetadata[]>([]);

    const [copiedModifications, setCopiedModifications] = useState<UUID[]>([]);
    const [copyInfos, setCopyInfos] = useState<NetworkModificationCopyInfo | null>(null);
    const copyInfosRef = useRef<NetworkModificationCopyInfo | null>();
    copyInfosRef.current = copyInfos;

    const [isDragging, setIsDragging] = useState(false);
    const [initialPosition, setInitialPosition] = useState<number | undefined>(undefined);

    const [editDialogOpen, setEditDialogOpen] = useState<string | undefined>(undefined);
    const [editData, setEditData] = useState<NetworkModificationData | undefined>(undefined);
    const [editDataFetchStatus, setEditDataFetchStatus] = useState(FetchStatus.IDLE);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [createCompositeModificationDialogOpen, setCreateCompositeModificationDialogOpen] = useState(false);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [notificationMessageId, setNotificationMessageId] = useState('');
    const [isFetchingModifications, setIsFetchingModifications] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const buttonAddRef = useRef<HTMLButtonElement>(null);

    const cleanClipboard = useCallback(() => {
        setCopyInfos(null);
        setCopiedModifications((oldCopiedModifications) => {
            if (oldCopiedModifications.length) {
                snackInfo({
                    messageId: 'CopiedModificationInvalidationMessage',
                });
            }
            return [];
        });
    }, [snackInfo]);

    // TODO this is not complete.
    // We should clean Clipboard on notifications when another user edit
    // a modification on a public study which is in the clipboard.
    // We don't have precision on notifications to do this for now.
    const handleValidatedDialog = () => {
        if (editData?.uuid && copiedModifications.includes(editData?.uuid)) {
            cleanClipboard();
        }
    };

    const handleCloseDialog = () => {
        setEditDialogOpen(undefined);
        setEditData(undefined);
    };

    function withDefaultParams(Dialog: React.FC<any>) {
        return (
            <Dialog
                onClose={handleCloseDialog}
                onValidated={handleValidatedDialog}
                currentNode={currentNode}
                studyUuid={studyUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
                editData={editData}
                isUpdate={isUpdate}
                editDataFetchStatus={editDataFetchStatus}
            />
        );
    }

    const menuDefinition: MenuDefinition[] = [
        {
            id: 'CREATE',
            label: 'menu.create',
            subItems: [
                {
                    id: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
                    label: 'SUBSTATION',
                    action: () => withDefaultParams(SubstationCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    label: 'VOLTAGE_LEVEL',
                    action: () => withDefaultParams(VoltageLevelCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LINE_CREATION.type,
                    label: 'LINE',
                    action: () => withDefaultParams(LineCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_CREATION.type,
                    label: 'TWO_WINDINGS_TRANSFORMER',
                    action: () => withDefaultParams(TwoWindingsTransformerCreationDialog),
                },
                {
                    id: 'GENERATOR_CREATION',
                    label: 'GENERATOR',
                    action: () => withDefaultParams(GeneratorCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LOAD_CREATION.type,
                    label: 'LOAD',
                    action: () => withDefaultParams(LoadCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.BATTERY_CREATION.type,
                    label: 'BATTERY',
                    action: () => withDefaultParams(BatteryCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
                    label: 'ShuntCompensator',
                    action: () => withDefaultParams(ShuntCompensatorCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.STATIC_VAR_COMPENSATOR_CREATION.type,
                    label: 'StaticVarCompensator',
                    action: () => withDefaultParams(StaticVarCompensatorCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.VSC_CREATION.type,
                    label: 'VSC',
                    action: () => withDefaultParams(VscCreationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LCC_CREATION.type,
                    label: 'LCC',
                    action: () => withDefaultParams(LccCreationDialog),
                },
            ],
        },
        {
            id: 'TABULAR_CREATION',
            label: 'menu.createMultiple',
            action: () => withDefaultParams(TabularCreationDialog),
        },
        {
            id: 'EDIT',
            label: 'ModifyFromMenu',
            subItems: [
                {
                    id: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
                    label: 'SUBSTATION',
                    action: () => withDefaultParams(SubstationModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
                    label: 'VOLTAGE_LEVEL',
                    action: () => withDefaultParams(VoltageLevelModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.CREATE_COUPLING_DEVICE.type,
                    label: 'CREATE_COUPLING_DEVICE',
                    action: () => withDefaultParams(CreateCouplingDeviceDialog),
                },
                {
                    id: MODIFICATION_TYPES.VOLTAGE_LEVEL_TOPOLOGY_MODIFICATION.type,
                    label: 'VOLTAGE_LEVEL_TOPOLOGY',
                    action: () => withDefaultParams(VoltageLevelTopologyModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LINE_MODIFICATION.type,
                    label: 'LINE',
                    action: () => withDefaultParams(LineModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
                    label: 'TWO_WINDINGS_TRANSFORMER',
                    action: () => withDefaultParams(TwoWindingsTransformerModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
                    label: 'GENERATOR',
                    action: () => withDefaultParams(GeneratorModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
                    label: 'LOAD',
                    action: () => withDefaultParams(LoadModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
                    label: 'BATTERY',
                    action: () => withDefaultParams(BatteryModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
                    label: 'ShuntCompensator',
                    action: () => withDefaultParams(ShuntCompensatorModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.VSC_MODIFICATION.type,
                    label: 'VSC',
                    action: () => withDefaultParams(VscModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.LCC_MODIFICATION.type,
                    label: 'LCC',
                    action: () => withDefaultParams(LccModificationDialog),
                },
            ],
        },
        {
            id: 'EDIT_MULTIPLE',
            label: 'menu.modifyMultiple',
            subItems: [
                {
                    id: MODIFICATION_TYPES.TABULAR_MODIFICATION.type,
                    label: 'BY_TABLE',
                    action: () => withDefaultParams(TabularModificationDialog),
                },
                {
                    id: MODIFICATION_TYPES.BY_FORMULA_MODIFICATION.type,
                    label: 'BY_FORMULA',
                    action: () => withDefaultParams(ByFormulaDialog),
                },
                {
                    id: MODIFICATION_TYPES.MODIFICATION_BY_ASSIGNMENT.type,
                    label: 'BY_FILTER',
                    action: () => withDefaultParams(ModificationByAssignmentDialog),
                },
            ],
        },
        {
            id: 'EQUIPMENT_DELETION',
            label: 'DeleteContingencyList',
            subItems: [
                {
                    id: MODIFICATION_TYPES.EQUIPMENT_DELETION.type,
                    label: 'SingleEquipment',
                    action: () => withDefaultParams(EquipmentDeletionDialog),
                },
                {
                    id: MODIFICATION_TYPES.BY_FILTER_DELETION.type,
                    label: 'MultipleEquipment',
                    action: () => withDefaultParams(ByFilterDeletionDialog),
                },
            ],
        },
        {
            id: 'ATTACHING_SPLITTING_LINES',
            label: 'AttachingAndSplittingLines',
            subItems: [
                {
                    id: MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type,
                    label: 'LineSplitWithVoltageLevel',
                    action: () => withDefaultParams(LineSplitWithVoltageLevelDialog),
                },
                {
                    id: MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type,
                    label: 'LineAttachToVoltageLevel',
                    action: () => withDefaultParams(LineAttachToVoltageLevelDialog),
                },
                {
                    id: MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type,
                    label: 'LinesAttachToSplitLines',
                    action: () => withDefaultParams(LinesAttachToSplitLinesDialog),
                },
                {
                    id: MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type,
                    label: 'DeleteVoltageLevelOnLine',
                    action: () => withDefaultParams(DeleteVoltageLevelOnLineDialog),
                },
                {
                    id: MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type,
                    label: 'DeleteAttachingLine',
                    action: () => withDefaultParams(DeleteAttachingLineDialog),
                },
            ],
        },
        {
            id: 'GENERATION_AND_LOAD',
            label: 'GenerationAndLoad',
            subItems: [
                {
                    id: MODIFICATION_TYPES.GENERATOR_SCALING.type,
                    label: 'GeneratorScaling',
                    action: () => withDefaultParams(GeneratorScalingDialog),
                },
                {
                    id: MODIFICATION_TYPES.LOAD_SCALING.type,
                    label: 'LoadScaling',
                    action: () => withDefaultParams(LoadScalingDialog),
                },
                {
                    id: MODIFICATION_TYPES.GENERATION_DISPATCH.type,
                    label: 'GenerationDispatch',
                    action: () => withDefaultParams(GenerationDispatchDialog),
                },
                {
                    id: MODIFICATION_TYPES.BALANCES_ADJUSTMENT.type,
                    label: 'BalancesAdjustment',
                    action: () => withDefaultParams(BalancesAdjustmentDialog),
                },
            ],
        },
        {
            id: 'VOLTAGE_INIT_MODIFICATION',
            label: 'VoltageInitModification',
            hide: true, // this modification is not visible in the menu
            action: () => withDefaultParams(VoltageInitModificationDialog),
        },
    ];

    const subMenuItemsList = menuDefinition.reduce<(MenuDefinitionWithoutSubItem | MenuDefinitionSubItem)[]>(
        (actions, currentMenuItem) =>
            !('subItems' in currentMenuItem)
                ? [...actions, currentMenuItem]
                : [...actions, ...currentMenuItem.subItems],
        []
    );

    const fillNotification = useCallback(
        (
            eventData:
                | ModificationsCreationInProgressEventData
                | ModificationsUpdatingInProgressEventData
                | ModificationsStashingInProgressEventData
                | ModificationsRestoringInProgressEventData
                | ModificationsDeletingInProgressEventData,
            messageId: string
        ) => {
            // (work for all users)
            // specific message id for each action type

            setNotificationMessageId(messageId);
            dispatch(addNotification([eventData.headers.parentNode ?? []]));
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (
            eventData:
                | ModificationsCreationInProgressEventData
                | ModificationsUpdatingInProgressEventData
                | ModificationsStashingInProgressEventData
                | ModificationsRestoringInProgressEventData
                | ModificationsDeletingInProgressEventData
        ) => {
            let messageId;
            switch (eventData.headers.updateType) {
                case NotificationType.MODIFICATIONS_CREATION_IN_PROGRESS:
                    messageId = 'network_modifications.creatingModification';
                    break;
                case NotificationType.MODIFICATIONS_UPDATING_IN_PROGRESS:
                    messageId = 'network_modifications.updatingModification';
                    break;
                case NotificationType.MODIFICATIONS_STASHING_IN_PROGRESS:
                    messageId = 'network_modifications.stashingModification';
                    break;
                case NotificationType.MODIFICATIONS_RESTORING_IN_PROGRESS:
                    messageId = 'network_modifications.restoringModification';
                    break;
                default:
                    messageId = '';
            }
            fillNotification(eventData, messageId);
        },
        [fillNotification]
    );

    const dofetchNetworkModificationsToRestore = useCallback(() => {
        if (currentNode?.type !== NodeType.NETWORK_MODIFICATION) {
            return;
        }
        setIsFetchingModifications(true);
        fetchNetworkModifications(studyUuid, currentNode.id, true)
            .then((res) => {
                if (currentNode.id === currentNodeIdRef.current) {
                    setModificationsToRestore(res);
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
            })
            .finally(() => {
                setPendingState(false);
                setIsFetchingModifications(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [studyUuid, currentNode?.id, currentNode?.type, snackError, dispatch]);

    const updateSelectedItems = useCallback((modifications: NetworkModificationMetadata[]) => {
        const toKeepIdsSet = new Set(modifications.map((e) => e.uuid));
        setSelectedNetworkModifications((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.uuid)));
    }, []);

    const dofetchNetworkModifications = useCallback(() => {
        // Do not fetch modifications on the root node
        if (currentNode?.type !== NodeType.NETWORK_MODIFICATION) {
            return;
        }
        setIsFetchingModifications(true);
        fetchNetworkModifications(studyUuid, currentNode.id, false)
            .then((res: NetworkModificationMetadata[]) => {
                // Check if during asynchronous request currentNode has already changed
                // otherwise accept fetch results
                if (currentNode.id === currentNodeIdRef.current) {
                    const liveModifications = res.filter(
                        (networkModification) => networkModification.stashed === false
                    );
                    updateSelectedItems(liveModifications);
                    setModifications(liveModifications);
                    setModificationsToRestore(
                        res.filter((networkModification) => networkModification.stashed === true)
                    );
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
            })
            .finally(() => {
                setPendingState(false);
                setIsFetchingModifications(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError, dispatch]);

    const dofetchExcludedNetworkModifications = useCallback(() => {
        // Do not fetch modifications status on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION') {
            return;
        }
        setIsFetchingModifications(true);
        fetchExcludedNetworkModifications(studyUuid, currentNode.id)
            .then((res: ExcludedNetworkModifications[]) => {
                setModificationsToExclude(res);
            })
            .catch((error: Error) => {
                snackError({
                    messageTxt: error.message,
                });
            })
            .finally(() => {
                setPendingState(false);
                setIsFetchingModifications(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, snackError, dispatch]);

    useEffect(() => {
        if (!currentNode) {
            return;
        }
        // first time with currentNode initialized then fetch modifications
        // (because if currentNode is not initialized, dofetchNetworkModifications silently does nothing)
        // OR next time if currentNodeId changed then fetch modifications
        // OR when number of root networks has changed to fetch new applicabilities
        const hasNodeChanged = !currentNodeIdRef.current || currentNodeIdRef.current !== currentNode.id;
        if (
            hasNodeChanged ||
            (createdRootNetworksPreviousLength && createdRootNetworksLength > createdRootNetworksPreviousLength)
        ) {
            currentNodeIdRef.current = currentNode.id;
            // Current node has changed then clear the modifications list
            setModifications([]);
            setModificationsToExclude([]);
            setModificationsToRestore([]);
            dofetchNetworkModifications();
            dofetchExcludedNetworkModifications();
            // reset the network modification and computing logs filter when the user changes the current node
            if (hasNodeChanged) {
                dispatch(resetLogsFilter());
            }
        }
    }, [
        createdRootNetworksLength,
        createdRootNetworksPreviousLength,
        currentNode,
        dispatch,
        dofetchNetworkModifications,
        dofetchExcludedNetworkModifications,
        modifications,
        modificationsToExclude,
    ]);

    useEffect(() => {
        if (isNodeDeletedNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce.eventData;

            if (
                copyInfosRef.current &&
                studyUpdatedEventData.headers.nodes.some((nodeId) => nodeId === copyInfosRef.current?.originNodeUuid)
            ) {
                // Must clean modifications clipboard if the origin Node is removed
                cleanClipboard();
            }
        }

        if (isPendingModificationNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce.eventData;
            if (currentNodeIdRef.current !== studyUpdatedEventData.headers.parentNode) {
                return;
            }
            if (studyUpdatedEventData.headers.updateType === NotificationType.MODIFICATIONS_DELETING_IN_PROGRESS) {
                // deleting means removing from trashcan (stashed elements) so there is no network modification
                setDeleteInProgress(true);
            } else {
                dispatch(setModificationsInProgress(true));
                setPendingState(true);
                manageNotification(studyUpdatedEventData);
            }
        }
        // notify  finished action (success or error => we remove the loader)
        // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
        if (isModificationsUpdateFinishedNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce.eventData;
            if (currentNodeIdRef.current !== studyUpdatedEventData.headers.parentNode) {
                return;
            }
            // fetch modifications because it must have changed
            // Do not clear the modifications list, because currentNode is the concerned one
            // this allows to append new modifications to the existing list.
            dofetchNetworkModifications();
            dofetchExcludedNetworkModifications();
            dispatch(
                removeNotificationByNode([
                    studyUpdatedEventData.headers.parentNode,
                    ...(studyUpdatedEventData.headers.nodes ?? []),
                ])
            );
        }
        if (isModificationsDeleteFinishedNotification(studyUpdatedForce.eventData)) {
            const studyUpdatedEventData = studyUpdatedForce.eventData;
            if (currentNodeIdRef.current !== studyUpdatedEventData.headers.parentNode) {
                return;
            }
            setDeleteInProgress(false);
            dofetchNetworkModifications();
        }
    }, [
        dispatch,
        dofetchNetworkModifications,
        manageNotification,
        studyUpdatedForce,
        cleanClipboard,
        dofetchExcludedNetworkModifications,
    ]);

    const [openNetworkModificationsMenu, setOpenNetworkModificationsMenu] = useState(false);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const openNetworkModificationConfiguration = useCallback(() => {
        setOpenNetworkModificationsMenu(true);
    }, []);

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsMenu(false);
        setEditData(undefined);
        setEditDataFetchStatus(FetchStatus.IDLE);
    };

    const openRestoreModificationDialog = useCallback(() => {
        dofetchNetworkModificationsToRestore();
        setRestoreDialogOpen(true);
    }, [dofetchNetworkModificationsToRestore]);

    const openImportModificationsDialog = useCallback(() => {
        setImportDialogOpen(true);
    }, []);

    const openCreateCompositeModificationDialog = useCallback(() => {
        setCreateCompositeModificationDialogOpen(true);
    }, []);

    const doDeleteModification = useCallback(() => {
        const selectedModificationsUuid = selectedNetworkModifications.map((item) => item.uuid);
        stashModifications(studyUuid, currentNode?.id, selectedModificationsUuid)
            .then(() => {
                //if one of the deleted element was in the clipboard we invalidate the clipboard
                if (
                    copiedModifications.some((aCopiedModification) =>
                        selectedModificationsUuid.includes(aCopiedModification)
                    )
                ) {
                    cleanClipboard();
                }
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDeleteModificationMsg',
                });
            });
    }, [currentNode?.id, selectedNetworkModifications, snackError, studyUuid, cleanClipboard, copiedModifications]);

    const doCreateCompositeModificationsElements = ({
        name,
        description,
        folderName,
        folderId,
    }: IElementCreationDialog) => {
        const selectedModificationsUuid = selectedNetworkModifications.map((item) => item.uuid);

        setSaveInProgress(true);
        createCompositeModifications(name, description, folderId, selectedModificationsUuid)
            .then(() => {
                snackInfo({
                    headerId: 'infoCreateModificationsMsg',
                    headerValues: {
                        nbModifications: String(selectedNetworkModifications.length),
                        directory: folderName,
                    },
                });
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCreateModificationsMsg',
                });
            })
            .finally(() => {
                setSaveInProgress(false);
            });
    };

    const doUpdateCompositeModificationsElements = ({
        id,
        name,
        description,
        elementFullPath,
    }: IElementUpdateDialog) => {
        const selectedModificationsUuid = selectedNetworkModifications.map((item) => item.uuid);

        setSaveInProgress(true);
        updateCompositeModifications(id, name, description, selectedModificationsUuid)
            .then(() => {
                snackInfo({
                    headerId: 'infoUpdateModificationsMsg',
                    headerValues: {
                        nbModifications: String(selectedNetworkModifications.length),
                        item: elementFullPath,
                    },
                });
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errUpdateModificationsMsg',
                    headerValues: {
                        item: elementFullPath,
                    },
                });
            })
            .finally(() => {
                setSaveInProgress(false);
            });
    };

    const selectedModificationsIds = useCallback(() => {
        const allModificationsIds = modifications.map((m) => m.uuid);
        // sort the selected modifications in the same order as they appear in the whole modifications list
        return selectedNetworkModifications
            .sort((a, b) => allModificationsIds.indexOf(a.uuid) - allModificationsIds.indexOf(b.uuid))
            .map((m) => m.uuid);
    }, [modifications, selectedNetworkModifications]);

    const doCutModifications = useCallback(() => {
        setCopiedModifications(selectedModificationsIds());
        setCopyInfos({
            copyType: NetworkModificationCopyType.MOVE,
            originNodeUuid: currentNode?.id,
        });
    }, [currentNode?.id, selectedModificationsIds]);

    const doCopyModifications = useCallback(() => {
        setCopiedModifications(selectedModificationsIds());
        setCopyInfos({
            copyType: NetworkModificationCopyType.COPY,
            originNodeUuid: currentNode?.id,
        });
    }, [currentNode?.id, selectedModificationsIds]);

    const doPasteModifications = useCallback(() => {
        if (!copyInfos || !studyUuid || !currentNode?.id) {
            return;
        }
        if (copyInfos.copyType === NetworkModificationCopyType.MOVE) {
            copyOrMoveModifications(studyUuid, currentNode.id, copiedModifications, copyInfos).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCutModificationMsg',
                });
            });
        } else {
            copyOrMoveModifications(studyUuid, currentNode.id, copiedModifications, copyInfos).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDuplicateModificationMsg',
                });
            });
        }
    }, [copiedModifications, currentNode?.id, copyInfos, snackError, studyUuid]);

    const removeNullFields = useCallback((data: NetworkModificationData) => {
        let dataTemp = data;
        if (dataTemp) {
            Object.keys(dataTemp).forEach((key) => {
                if (dataTemp[key] && dataTemp[key] !== null && typeof dataTemp[key] === 'object') {
                    dataTemp[key] = removeNullFields(dataTemp[key]);
                }

                if (dataTemp[key] === null) {
                    delete dataTemp[key];
                }
            });
        }
        return dataTemp;
    }, []);

    const doEditModification = useCallback(
        (modificationUuid: UUID, type: string) => {
            setIsUpdate(true);
            setEditDialogOpen(type);
            setEditDataFetchStatus(FetchStatus.RUNNING);
            const modification = fetchNetworkModification(modificationUuid);
            modification
                .then((res) => {
                    return res.json().then((data: NetworkModificationData) => {
                        //remove all null values to avoid showing a "null" in the forms
                        setEditData(removeNullFields(data));
                        setEditDataFetchStatus(FetchStatus.SUCCEED);
                    });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                    setEditDataFetchStatus(FetchStatus.FAILED);
                });
        },
        [removeNullFields, snackError]
    );

    const onItemClick = (id: string) => {
        setOpenNetworkModificationsMenu(false);
        setEditDialogOpen(id);
        setIsUpdate(false);
    };
    const handleRowSelected = (event: any) => {
        const selectedRows = event.api.getSelectedRows(); // Get selected rows
        setSelectedNetworkModifications(selectedRows);
    };

    const renderDialog = () => {
        return subMenuItemsList.find((menuItem) => menuItem.id === editDialogOpen)?.action?.();
    };

    const isImpactedByNotification = useCallback(() => {
        return notificationIdList.filter((notification) => notification === currentNode?.id).length > 0;
    }, [notificationIdList, currentNode?.id]);

    const isModificationClickable = useCallback(
        (modification: NetworkModificationMetadata) =>
            !isAnyNodeBuilding && !mapDataLoading && !isDragging && isEditableModification(modification),
        [isAnyNodeBuilding, mapDataLoading, isDragging]
    );

    const renderNetworkModificationsTable = () => {
        return (
            <NetworkModificationsTable
                handleCellClick={handleCellClick}
                modifications={modifications}
                setModifications={setModifications}
                onRowDragStart={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                onRowSelected={handleRowSelected}
                isDragging
                isRowDragDisabled={isImpactedByNotification() || isAnyNodeBuilding || mapDataLoading}
                isImpactedByNotification={isImpactedByNotification}
                notificationMessageId={notificationMessageId}
                isFetchingModifications={isFetchingModifications}
                pendingState={pendingState}
                modificationsToExclude={modificationsToExclude}
                setModificationsToExclude={setModificationsToExclude}
            />
        );
    };
    const renderNetworkModificationsToRestoreDialog = () => {
        return (
            <RestoreModificationDialog
                open={restoreDialogOpen}
                modifToRestore={modificationsToRestore}
                onClose={() => setRestoreDialogOpen(false)}
            />
        );
    };
    const renderImportNetworkModificationsDialog = () => {
        return <ImportModificationDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />;
    };
    const renderCreateCompositeNetworkModificationsDialog = () => {
        return (
            studyUuid && (
                <ElementSaveDialog
                    open={createCompositeModificationDialogOpen}
                    onSave={doCreateCompositeModificationsElements}
                    OnUpdate={doUpdateCompositeModificationsElements}
                    onClose={() => setCreateCompositeModificationDialogOpen(false)}
                    type={ElementType.MODIFICATION}
                    titleId="CreateCompositeModification"
                    prefixIdForGeneratedName="GeneratedModification"
                    studyUuid={studyUuid}
                    selectorTitleId="SelectCompositeModificationTitle"
                    createLabelId="CreateCompositeModificationLabel"
                    updateLabelId="UpdateCompositeModificationLabel"
                />
            )
        );
    };

    const handleCellClick = useCallback(
        (event: CellClickedEvent) => {
            const { colDef, data } = event;
            if (colDef.colId === 'modificationName' && isModificationClickable(data)) {
                // Check if the clicked column is the 'modificationName' column
                doEditModification(data.uuid, data.type);
            }
        },
        [doEditModification, isModificationClickable]
    );

    const onRowDragStart = (event: RowDragEnterEvent<NetworkModificationMetadata>) => {
        setIsDragging(true);
        setInitialPosition(event.overIndex);
    };
    const onRowDragEnd = (event: RowDragEndEvent<NetworkModificationMetadata>) => {
        let newPosition = event.overIndex;
        const oldPosition = initialPosition;
        if (!currentNode?.id || newPosition === undefined || oldPosition === undefined || newPosition === oldPosition) {
            setIsDragging(false);
            return;
        }
        if (newPosition === -1) {
            newPosition = modifications.length;
        }

        const previousModifications = [...modifications];
        const updatedModifications = [...modifications];

        const [movedItem] = updatedModifications.splice(oldPosition, 1);

        updatedModifications.splice(newPosition, 0, movedItem);

        setModifications(updatedModifications);

        const before = updatedModifications[newPosition + 1]?.uuid || null;

        changeNetworkModificationOrder(studyUuid, currentNode?.id, movedItem.uuid, before)
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'errReorderModificationMsg',
                });
                setModifications(previousModifications);
            })
            .finally(() => setIsDragging(false));
    };

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Box sx={styles.filler} />
                <IconButton
                    sx={styles.toolbarIcon}
                    size={'small'}
                    ref={buttonAddRef}
                    onClick={openNetworkModificationConfiguration}
                    disabled={isAnyNodeBuilding || mapDataLoading}
                >
                    <AddIcon />
                </IconButton>
                <Tooltip title={<FormattedMessage id={'InsertModificationFrom'} />}>
                    <span>
                        <IconButton
                            onClick={openImportModificationsDialog}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={isAnyNodeBuilding || mapDataLoading}
                        >
                            <FileUpload />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'SaveToGridexplore'} />}>
                    <span>
                        <IconButton
                            onClick={openCreateCompositeModificationDialog}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={!(selectedNetworkModifications?.length > 0) || saveInProgress === true}
                        >
                            <SaveIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <IconButton
                    onClick={doCutModifications}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={
                        selectedNetworkModifications.length === 0 || isAnyNodeBuilding || mapDataLoading || !currentNode
                    }
                >
                    <ContentCutIcon />
                </IconButton>
                <IconButton
                    onClick={doCopyModifications}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={selectedNetworkModifications.length === 0 || isAnyNodeBuilding || mapDataLoading}
                >
                    <ContentCopyIcon />
                </IconButton>
                <Tooltip
                    title={
                        <FormattedMessage
                            id={'NbModification'}
                            values={{
                                nb: copiedModifications.length,
                                several: copiedModifications.length > 1 ? 's' : '',
                            }}
                        />
                    }
                >
                    <span>
                        <IconButton
                            onClick={doPasteModifications}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={
                                !(copiedModifications.length > 0) || isAnyNodeBuilding || mapDataLoading || !currentNode
                            }
                        >
                            <ContentPasteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <IconButton
                    onClick={doDeleteModification}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={
                        selectedNetworkModifications.length === 0 ||
                        isAnyNodeBuilding ||
                        mapDataLoading ||
                        deleteInProgress ||
                        !currentNode
                    }
                >
                    <DeleteIcon />
                </IconButton>
                {deleteInProgress ? (
                    <Tooltip title={<FormattedMessage id={'network_modifications.deletingModification'} />}>
                        <span>
                            <CircularProgress size={'1em'} sx={styles.toolbarCircularProgress} />
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip
                        title={
                            <FormattedMessage
                                id={'NbModificationToRestore'}
                                values={{
                                    nb: modificationsToRestore.length,
                                    several: modificationsToRestore.length > 1 ? 's' : '',
                                }}
                            />
                        }
                    >
                        <span>
                            <IconButton
                                onClick={openRestoreModificationDialog}
                                size={'small'}
                                sx={styles.toolbarIcon}
                                disabled={modificationsToRestore.length === 0 || isAnyNodeBuilding || deleteInProgress}
                            >
                                <RestoreFromTrash />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Toolbar>
            {restoreDialogOpen && renderNetworkModificationsToRestoreDialog()}
            {importDialogOpen && renderImportNetworkModificationsDialog()}
            {createCompositeModificationDialogOpen && renderCreateCompositeNetworkModificationsDialog()}

            {renderNetworkModificationsTable()}

            <NetworkModificationsMenu
                open={openNetworkModificationsMenu}
                onClose={closeNetworkModificationConfiguration}
                onItemClick={onItemClick}
                anchorEl={buttonAddRef.current}
                menuDefinition={menuDefinition}
            />
            {editDialogOpen && renderDialog()}
        </>
    );
};

export default NetworkModificationNodeEditor;
