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
import { TabularModificationType } from 'components/dialogs/network-modifications/tabular/tabular-common';
import { TabularDialog } from 'components/dialogs/network-modifications/tabular/tabular-dialog';
import TwoWindingsTransformerCreationDialog from 'components/dialogs/network-modifications/two-windings-transformer/creation/two-windings-transformer-creation-dialog';
import VoltageInitModificationDialog from 'components/dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import VoltageLevelCreationDialog from 'components/dialogs/network-modifications/voltage-level/creation/voltage-level-creation-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import VscCreationDialog from 'components/dialogs/network-modifications/hvdc-line/vsc/creation/vsc-creation-dialog';
import VscModificationDialog from 'components/dialogs/network-modifications/hvdc-line/vsc/modification/vsc-modification-dialog';
import NetworkModificationsMenu from 'components/graph/menus/network-modifications/network-modifications-menu';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    removeNotificationByNode,
    resetLogsFilter,
    resetLogsPagination,
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
    fetchExcludedNetworkModifications,
    fetchNetworkModifications,
    stashModifications,
} from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import {
    ExcludedNetworkModifications,
    MenuDefinitionSubItem,
    MenuDefinitionWithoutSubItem,
    MenuSection,
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
import CreateVoltageLevelTopologyDialog from '../../../dialogs/network-modifications/voltage-level-topology-creation/create-voltage-level-topology-dialog';
import { NodeType } from 'components/graph/tree-node.type';
import { LimitSetsModificationDialog } from '../../../dialogs/network-modifications/limit-sets/limit-sets-modification-dialog';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { useParameterState } from '../../../dialogs/parameters/use-parameters-state';
import { PARAM_DEVELOPER_MODE } from '../../../../utils/config-params';
import CreateVoltageLevelSectionDialog from '../../../dialogs/network-modifications/voltage-level/section/create-voltage-level-section-dialog';

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
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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

    function tabularDialogWithDefaultParams(Dialog: React.FC<any>, dialogMode: TabularModificationType) {
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
                dialogMode={dialogMode}
            />
        );
    }

    function equipmentDeletionDialogWithDefaultParams(equipmentType: EQUIPMENT_TYPES) {
        return (
            <EquipmentDeletionDialog
                onClose={handleCloseDialog}
                onValidated={handleValidatedDialog}
                currentNode={currentNode}
                studyUuid={studyUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
                editData={editData}
                isUpdate={isUpdate}
                editDataFetchStatus={editDataFetchStatus}
                equipmentType={equipmentType}
                defaultIdValue={null}
            />
        );
    }

    const menuDefinition: MenuSection[] = [
        {
            id: 'SubstationVoltageLevelModifications',
            items: [
                {
                    id: 'SUBSTATION',
                    label: 'SUBSTATION',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(SubstationCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(SubstationModificationDialog),
                        },
                        {
                            id: 'DELETE_SUBSTATION',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.SUBSTATION),
                        },
                    ],
                },
                {
                    id: 'VOLTAGE_LEVEL',
                    label: 'VOLTAGE_LEVEL',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(VoltageLevelCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
                            label: 'ModifyCharacteristics',
                            action: () => withDefaultParams(VoltageLevelModificationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.CREATE_VOLTAGE_LEVEL_SECTION.type,
                            label: 'CreateVoltageLevelSection',
                            action: () => withDefaultParams(CreateVoltageLevelSectionDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.CREATE_VOLTAGE_LEVEL_TOPOLOGY.type,
                            label: 'CreateVoltageLevelTopology',
                            hide: !enableDeveloperMode,
                            action: () => withDefaultParams(CreateVoltageLevelTopologyDialog),
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
                            id: 'DELETE_VOLTAGE_LEVEL',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.VOLTAGE_LEVEL),
                        },
                    ],
                },
            ],
        },
        {
            id: 'BranchModifications',
            items: [
                {
                    id: 'LINE',
                    label: 'LINE',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.LINE_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(LineCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LINE_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(LineModificationDialog),
                        },
                        {
                            id: 'DELETE_LINE',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.LINE),
                        },
                    ],
                },
                {
                    id: 'ATTACHING_LINES',
                    label: 'AttachingLines',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(LineAttachToVoltageLevelDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type,
                            label: 'LinesAttachToSplitLines',
                            action: () => withDefaultParams(LinesAttachToSplitLinesDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type,
                            label: 'DeleteContingencyList',
                            action: () => withDefaultParams(DeleteAttachingLineDialog),
                        },
                    ],
                },
                {
                    id: 'SPLITTING_LINES',
                    label: 'SplittingLines',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(LineSplitWithVoltageLevelDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type,
                            label: 'LinesAttachToSplitLines',
                            action: () => withDefaultParams(LinesAttachToSplitLinesDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type,
                            label: 'DeleteContingencyList',
                            action: () => withDefaultParams(DeleteVoltageLevelOnLineDialog),
                        },
                    ],
                },
                {
                    id: 'TWO_WINDINGS_TRANSFORMER',
                    label: 'TWO_WINDINGS_TRANSFORMER',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(TwoWindingsTransformerCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(TwoWindingsTransformerModificationDialog),
                        },
                        {
                            id: 'DELETE_TWO_WINDINGS_TRANSFORMER',
                            label: 'DeleteContingencyList',
                            action: () =>
                                equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
                        },
                    ],
                },
                {
                    id: 'VSC',
                    label: 'VSC',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.VSC_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(VscCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.VSC_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(VscModificationDialog),
                        },
                        {
                            id: 'DELETE_VSC',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.HVDC_LINE),
                        },
                    ],
                },
                {
                    id: 'LCC',
                    label: 'LCC',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.LCC_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(LccCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LCC_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(LccModificationDialog),
                        },
                        {
                            id: 'DELETE_LCC',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.HVDC_LINE),
                        },
                    ],
                },
            ],
        },
        {
            id: 'InjectionsModifications',
            items: [
                {
                    id: 'GENERATOR',
                    label: 'GENERATOR',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.GENERATOR_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(GeneratorCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(GeneratorModificationDialog),
                        },
                        {
                            id: 'DELETE_GENERATOR',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.GENERATOR),
                        },
                    ],
                },
                {
                    id: 'BATTERY',
                    label: 'BATTERY',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.BATTERY_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(BatteryCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(BatteryModificationDialog),
                        },
                        {
                            id: 'DELETE_BATTERY',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.BATTERY),
                        },
                    ],
                },
                {
                    id: 'LOAD',
                    label: 'LOAD',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.LOAD_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(LoadCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(LoadModificationDialog),
                        },
                        {
                            id: 'DELETE_LOAD',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.LOAD),
                        },
                    ],
                },
                {
                    id: 'SHUNT_COMPENSATOR',
                    label: 'SHUNT_COMPENSATOR',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(ShuntCompensatorCreationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
                            label: 'ModifyFromMenu',
                            action: () => withDefaultParams(ShuntCompensatorModificationDialog),
                        },
                        {
                            id: 'DELETE_SHUNT_COMPENSATOR',
                            label: 'DeleteContingencyList',
                            action: () => equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.SHUNT_COMPENSATOR),
                        },
                    ],
                },
                {
                    id: 'STATIC_VAR_COMPENSATOR',
                    label: 'STATIC_VAR_COMPENSATOR',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.STATIC_VAR_COMPENSATOR_CREATION.type,
                            label: 'menu.create',
                            action: () => withDefaultParams(StaticVarCompensatorCreationDialog),
                        },
                        {
                            id: 'DELETE_STATIC_VAR_COMPENSATOR',
                            label: 'DeleteContingencyList',
                            action: () =>
                                equipmentDeletionDialogWithDefaultParams(EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR),
                        },
                    ],
                },
            ],
        },
        {
            id: 'MultipleModifications',
            items: [
                {
                    id: 'MULTIPLE',
                    label: 'MultipleEquipment',
                    subItems: [
                        {
                            id: MODIFICATION_TYPES.TABULAR_CREATION.type,
                            label: 'menu.createByTable',
                            action: () =>
                                tabularDialogWithDefaultParams(TabularDialog, TabularModificationType.CREATION),
                        },
                        {
                            id: MODIFICATION_TYPES.TABULAR_MODIFICATION.type,
                            label: 'BY_TABLE',
                            action: () =>
                                tabularDialogWithDefaultParams(TabularDialog, TabularModificationType.MODIFICATION),
                        },
                        {
                            id: MODIFICATION_TYPES.MODIFICATION_BY_ASSIGNMENT.type,
                            label: 'BY_FILTER',
                            action: () => withDefaultParams(ModificationByAssignmentDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.BY_FORMULA_MODIFICATION.type,
                            label: 'BY_FORMULA',
                            action: () => withDefaultParams(ByFormulaDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.LIMIT_SETS_TABULAR_MODIFICATION.type,
                            label: 'TabularLimitSets',
                            action: () => withDefaultParams(LimitSetsModificationDialog),
                        },
                        {
                            id: MODIFICATION_TYPES.BY_FILTER_DELETION.type,
                            label: 'menu.deleteByFilter',
                            action: () => withDefaultParams(ByFilterDeletionDialog),
                        },
                    ],
                },
            ],
        },
        {
            id: 'GenerationLoad',
            items: [
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
                    hide: true,
                    action: () => withDefaultParams(VoltageInitModificationDialog),
                },
            ],
        },
    ];

    const subMenuItemsList = menuDefinition
        .flatMap((section) =>
            section.items.flatMap((menuItem) => {
                if ('subItems' in menuItem) {
                    return menuItem.subItems;
                } else {
                    return menuItem.action
                        ? [
                              {
                                  id: menuItem.id,
                                  label: menuItem.label,
                                  action: menuItem.action,
                              } as MenuDefinitionSubItem,
                          ]
                        : [];
                }
            })
        )
        .filter((item) => !('hide' in item && item.hide));

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
                dispatch(resetLogsPagination());
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

    const doStashModification = useCallback(() => {
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
            copyOrMoveModifications(studyUuid, currentNode.id, copiedModifications, copyInfos)
                .then(() => {
                    setCopyInfos(null);
                    setCopiedModifications([]);
                })
                .catch((errmsg) => {
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
        const menuItem = subMenuItemsList.find(
            (item: MenuDefinitionWithoutSubItem) => 'id' in item && item.id === editDialogOpen
        );
        return menuItem && 'action' in menuItem ? menuItem.action?.() : undefined;
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

    const isPasteButtonDisabled = useMemo(() => {
        return copiedModifications.length <= 0 || isAnyNodeBuilding || mapDataLoading || !currentNode;
    }, [copiedModifications.length, isAnyNodeBuilding, mapDataLoading, currentNode]);

    const isRestoreButtonDisabled = useMemo(() => {
        return modificationsToRestore.length === 0 || isAnyNodeBuilding || deleteInProgress;
    }, [modificationsToRestore.length, isAnyNodeBuilding, deleteInProgress]);

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Box sx={styles.filler} />
                <Tooltip title={<FormattedMessage id={'addNetworkModification'} />}>
                    <span>
                        <IconButton
                            size={'small'}
                            ref={buttonAddRef}
                            onClick={openNetworkModificationConfiguration}
                            disabled={isAnyNodeBuilding || mapDataLoading}
                        >
                            <AddIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'importFromGridExplore'} />}>
                    <span>
                        <IconButton
                            onClick={openImportModificationsDialog}
                            size={'small'}
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
                            disabled={!(selectedNetworkModifications?.length > 0) || saveInProgress === true}
                        >
                            <SaveIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'cut'} />}>
                    <span>
                        <IconButton
                            onClick={doCutModifications}
                            size={'small'}
                            disabled={
                                selectedNetworkModifications.length === 0 ||
                                isAnyNodeBuilding ||
                                mapDataLoading ||
                                !currentNode
                            }
                        >
                            <ContentCutIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'copy'} />}>
                    <span>
                        <IconButton
                            onClick={doCopyModifications}
                            size={'small'}
                            disabled={selectedNetworkModifications.length === 0 || isAnyNodeBuilding || mapDataLoading}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip
                    title={
                        <FormattedMessage
                            id={isPasteButtonDisabled ? 'paste' : 'NbModificationToPaste'}
                            values={{
                                nb: copiedModifications.length,
                                several: copiedModifications.length > 1 ? 's' : '',
                            }}
                        />
                    }
                >
                    <span>
                        <IconButton onClick={doPasteModifications} size={'small'} disabled={isPasteButtonDisabled}>
                            <ContentPasteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'delete'} />}>
                    <span>
                        <IconButton
                            onClick={doStashModification}
                            size={'small'}
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
                    </span>
                </Tooltip>
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
                                id={isRestoreButtonDisabled ? 'restore' : 'NbModificationToRestore'}
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
                                disabled={isRestoreButtonDisabled}
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
                menuSections={menuDefinition}
            />
            {editDialogOpen && renderDialog()}
        </>
    );
};

export default NetworkModificationNodeEditor;
