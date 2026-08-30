/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ArrowsInputIcon,
    ComposedModificationMetadata,
    ElementSaveDialog,
    ElementType,
    EquipmentType,
    ErrorMessage,
    ExcludedNetworkModifications,
    fetchNetworkModification,
    IElementCreationDialog,
    IElementUpdateDialog,
    MAX_COMPOSITE_NESTING_DEPTH,
    MODIFICATION_TYPES,
    ModificationType,
    NetworkModificationMetadata,
    NetworkModificationsTable,
    NotificationsUrlKeys,
    ReferenceModificationInfos,
    removeNullFields,
    setModificationMetadata,
    snackWithFallback,
    useNotificationsListener,
    usePrevious,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Divider, Toolbar, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import BatteryCreationDialog from 'components/dialogs/network-modifications/battery/creation/battery-creation-dialog';
import BatteryModificationDialog from 'components/dialogs/network-modifications/battery/modification/battery-modification-dialog';
import DeleteAttachingLineDialog from 'components/dialogs/network-modifications/delete-attaching-line/delete-attaching-line-dialog';
import DeleteVoltageLevelOnLineDialog from 'components/dialogs/network-modifications/delete-voltage-level-on-line/delete-voltage-level-on-line-dialog';
import EquipmentDeletionDialog, {
    EquipmentDeletionDtoWithId,
} from 'components/dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
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
import { setHighlightModification } from '../../../../redux/actions';
import TwoWindingsTransformerModificationDialog from '../../../dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import {
    useIsBuildBlocked,
    useIsEditBlocked,
    useIsNodeUpdating,
} from 'components/node-activity/hooks/use-node-activity';

import { FileUpload, RestoreFromTrash } from '@mui/icons-material';

import ImportModificationDialog from '../../../dialogs/import-composite/import-modification-dialog';
import RestoreModificationDialog from 'components/dialogs/restore-modification-dialog';
import type { UUID } from 'node:crypto';
import { AppState } from 'redux/reducer.type';
import { createCompositeModifications, updateCompositeModifications } from '../../../../services/explore';
import { copyOrMoveModifications } from '../../../../services/study';
import {
    assembleModificationsIntoComposite,
    fetchExcludedNetworkModifications,
    fetchNetworkModifications,
    stashModifications,
} from '../../../../services/study/network-modifications';
import {
    MenuDefinitionSubItem,
    MenuDefinitionWithoutSubItem,
    MenuSection,
    ModificationMoveOrCopyInfos,
    NetworkModificationCopyInfos,
    NetworkModificationCopyType,
    NetworkModificationData,
} from './network-modification-menu.type';
import StaticVarCompensatorCreationDialog from '../../../dialogs/network-modifications/static-var-compensator/creation/static-var-compensator-creation-dialog';
import ModificationByAssignmentDialog from '../../../dialogs/network-modifications/by-filter/by-assignment/modification-by-assignment-dialog';
import ModificationByFormulaDialog from '../../../dialogs/network-modifications/by-filter/by-formula/modification-by-formula-dialog';
import ByFilterDeletionDialog from '../../../dialogs/network-modifications/by-filter/by-filter-deletion/by-filter-deletion-dialog';
import { LccCreationDialog } from '../../../dialogs/network-modifications/hvdc-line/lcc/creation/lcc-creation-dialog';
import { styles } from './network-modification-node-editor-utils';
import {
    CommonStudyEventData,
    isModificationsDeleteFinishedNotification,
    isModificationsUpdateFinishedNotification,
    isNodeDeletedNotification,
    isSharedElementUpdateNotification,
    parseEventData,
} from 'types/notification-types';
import { LccModificationDialog } from '../../../dialogs/network-modifications/hvdc-line/lcc/modification/lcc-modification-dialog';
import VoltageLevelTopologyModificationDialog from '../../../dialogs/network-modifications/voltage-level/topology-modification/voltage-level-topology-modification-dialog';
import CreateCouplingDeviceDialog from '../../../dialogs/network-modifications/coupling-device/modification/create-coupling-device-dialog';
import { BalancesAdjustmentDialog } from '../../../dialogs/network-modifications/balances-adjustment/balances-adjustment-dialog';
import CreateVoltageLevelTopologyDialog from '../../../dialogs/network-modifications/voltage-level/topology-creation/create-voltage-level-topology-dialog';
import { NodeType } from 'components/graph/tree-node.type';
import { BuildButton } from 'components/graph/nodes/build-button';
import { LimitSetsModificationDialog } from '../../../dialogs/network-modifications/limit-sets/limit-sets-modification-dialog';
import CreateVoltageLevelSectionDialog from '../../../dialogs/network-modifications/voltage-level/section/create-voltage-level-section-dialog';
import MoveVoltageLevelFeederBaysDialog from '../../../dialogs/network-modifications/voltage-level/move-feeder-bays/move-voltage-level-feeder-bays-dialog';
import { useCopiedNetworkModifications } from 'hooks/copy-paste/use-copied-network-modifications';
import { FetchStatus } from '../../../../services/utils.type';
import { createBaseColumns, createRootNetworksColumns } from './network-modification-table/createColumns';
import { ColumnDef } from '@tanstack/react-table';

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
    'OPERATING_STATUS_MODIFICATION',
    'COMPOSITE_MODIFICATION',
    'MODIFICATION_REFERENCE',
]);

const isEditableModification = (modif: NetworkModificationMetadata) => {
    if (!modif) {
        return false;
    }
    return !nonEditableModificationTypes.has(modif.type);
};

const NetworkModificationNodeEditor = () => {
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
    const [modificationsToRestore, setModificationsToRestore] = useState<NetworkModificationMetadata[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isRootNode = currentNode?.type === NodeType.ROOT;
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);

    const currentNodeIdRef = useRef<UUID>(null); // initial empty to get first update

    const [selectedNetworkModifications, setSelectedNetworkModifications] = useState<ComposedModificationMetadata[]>(
        []
    );

    // TODO : this is temporary, until merge/delete is done for the shared modification
    const selectionContainsShared: boolean = useMemo(() => {
        return selectedNetworkModifications.some(
            (modification: ComposedModificationMetadata) =>
                modification.type === ModificationType.MODIFICATION_REFERENCE
        );
    }, [selectedNetworkModifications]);

    const [isDragging, setIsDragging] = useState(false);
    const [isAssemblyDepthExceeded, setIsAssemblyDepthExceeded] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState<string | undefined>(undefined);
    const [editData, setEditData] = useState<NetworkModificationData | undefined>(undefined);
    const [editDataFetchStatus, setEditDataFetchStatus] = useState<FetchStatus>(FetchStatus.IDLE);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [createCompositeModificationDialogOpen, setCreateCompositeModificationDialogOpen] = useState(false);
    const dispatch = useDispatch();
    const [isFetchingModifications, setIsFetchingModifications] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const buttonAddRef = useRef<HTMLButtonElement>(null);
    const [modificationUuidsToReset, setModificationUuidsToReset] = useState<UUID[]>([]);
    const [modificationToEditLabel, setModificationToEditLabel] = useState<UUID | null>(null);
    const highlightedModificationUuid = useSelector((state: AppState) => state.highlightedModificationUuid);

    const {
        networkModificationsToCopy,
        copyInfos,
        copyNetworkModifications,
        cutNetworkModifications,
        cleanClipboard,
        cleanOtherTabsClipboard,
    } = useCopiedNetworkModifications();

    const copyInfosRef = useRef<NetworkModificationCopyInfos | null>(null);
    copyInfosRef.current = copyInfos;

    useEffect(() => {
        //If the tab is closed we want to invalidate the copy on all tabs because we won't able to track the node modification
        window.addEventListener('beforeunload', () => {
            cleanOtherTabsClipboard('copiedModificationsInvalidationMsgFromStudyClosure');
        });
    }, [cleanOtherTabsClipboard]);

    // TODO this is not complete.
    // We should clean Clipboard on notifications when another user edit
    // a modification on a public study which is in the clipboard.
    // We don't have precision on notifications to do this for now.
    const handleValidatedDialog = () => {
        if (editData?.uuid && networkModificationsToCopy.some((m) => m.uuid === editData?.uuid)) {
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
                exportCsvResetKey={`${studyUuid}-${currentNode?.id}-${currentRootNetworkUuid}`}
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

    function equipmentDeletionDialogWithDefaultParams(equipmentType: EquipmentType) {
        if (currentNode && studyUuid && currentRootNetworkUuid) {
            return (
                <EquipmentDeletionDialog
                    onClose={handleCloseDialog}
                    onValidated={handleValidatedDialog}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    editData={editData as EquipmentDeletionDtoWithId}
                    isUpdate={isUpdate}
                    editDataFetchStatus={editDataFetchStatus}
                    equipmentType={equipmentType}
                />
            );
        } else {
            return <></>;
        }
    }

    const equipmentDeletionSubItems = (equipmentType: EquipmentType) => {
        return {
            // We have a single deletion modification type, but we have a deletion menu item ID per equipment type
            // (because we want to preset the equipment type in creation case)
            id: equipmentType + '_DELETION_MENU_ITEM',
            label: 'DeleteFromMenu',
            action: () => equipmentDeletionDialogWithDefaultParams(equipmentType),
        };
    };

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
                        equipmentDeletionSubItems(EquipmentType.SUBSTATION),
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
                            id: MODIFICATION_TYPES.MOVE_VOLTAGE_LEVEL_FEEDER_BAYS.type,
                            label: 'MOVE_VOLTAGE_LEVEL_FEEDER_BAYS',
                            action: () => withDefaultParams(MoveVoltageLevelFeederBaysDialog),
                        },
                        equipmentDeletionSubItems(EquipmentType.VOLTAGE_LEVEL),
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
                        equipmentDeletionSubItems(EquipmentType.LINE),
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
                        equipmentDeletionSubItems(EquipmentType.TWO_WINDINGS_TRANSFORMER),
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
                        equipmentDeletionSubItems(EquipmentType.HVDC_LINE),
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
                        equipmentDeletionSubItems(EquipmentType.HVDC_LINE),
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
                        equipmentDeletionSubItems(EquipmentType.GENERATOR),
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
                        equipmentDeletionSubItems(EquipmentType.BATTERY),
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
                        equipmentDeletionSubItems(EquipmentType.LOAD),
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
                        equipmentDeletionSubItems(EquipmentType.SHUNT_COMPENSATOR),
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
                        equipmentDeletionSubItems(EquipmentType.STATIC_VAR_COMPENSATOR),
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
                            action: () => withDefaultParams(ModificationByFormulaDialog),
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
                snackWithFallback(snackError, error);
            })
            .finally(() => {
                setIsFetchingModifications(false);
            });
    }, [studyUuid, currentNode?.id, currentNode?.type, snackError]);

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
                    const liveModifications = res.filter((networkModification) => !networkModification.stashed);
                    updateSelectedItems(liveModifications);
                    setModifications(liveModifications);
                    setModificationsToRestore(res.filter((networkModification) => networkModification.stashed));
                }
            })
            .catch((error) => {
                snackWithFallback(snackError, error);
            })
            .finally(() => {
                setIsFetchingModifications(false);
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError]);

    const dofetchExcludedNetworkModifications = useCallback(() => {
        // Do not fetch modifications status on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION') {
            return;
        }
        setIsFetchingModifications(true);
        fetchExcludedNetworkModifications(studyUuid, currentNode.id)
            .then((res: ExcludedNetworkModifications[]) => {
                // Check if during asynchronous request currentNode has already changed
                // otherwise accept fetch results
                if (currentNode.id === currentNodeIdRef.current) {
                    setModificationsToExclude(res);
                }
            })
            .catch((error: Error) => {
                snackWithFallback(snackError, error);
            })
            .finally(() => {
                setIsFetchingModifications(false);
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, snackError]);

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

    const handleNameChange = useCallback(
        (modification: ComposedModificationMetadata, newName: string) =>
            setModificationMetadata(studyUuid, currentNode?.id, modification.uuid, {
                name: newName,
                type: modification.type,
            }),
        [studyUuid, currentNode?.id]
    );

    const handleEvent = useCallback(
        (event: MessageEvent) => {
            const eventData = parseEventData<CommonStudyEventData>(event);
            if (!eventData) {
                return;
            }
            if (isNodeDeletedNotification(eventData)) {
                if (
                    copyInfosRef.current &&
                    eventData.headers.nodes.some((nodeId) => nodeId === copyInfosRef.current?.originNodeUuid)
                ) {
                    // Must clean modifications clipboard if the origin Node is removed
                    cleanClipboard();
                }
            }

            // success or error, the modifications may have changed
            if (isModificationsUpdateFinishedNotification(eventData)) {
                if (currentNodeIdRef.current !== eventData.headers.parentNode) {
                    return;
                }
                dofetchNetworkModifications();
                dofetchExcludedNetworkModifications();
            }
            if (isModificationsDeleteFinishedNotification(eventData)) {
                if (currentNodeIdRef.current !== eventData.headers.parentNode) {
                    return;
                }
                dofetchNetworkModifications();
            }

            // a shared (referenced) composite modification pointed at by this node was edited
            // elsewhere. Re-fetching the group hands NetworkModificationsTable a fresh
            // `modifications` identity, which makes it force-refresh the resolved content of every
            // expanded composite / reference row (fetchSubModificationsForExpandedRows(..., force));
            // a collapsed reference reloads its content the next time it is expanded.
            if (isSharedElementUpdateNotification(eventData)) {
                console.log("EVENT ??????????")
                if (currentNodeIdRef.current !== eventData.headers.parentNode) {
                    return;
                }
                dofetchNetworkModifications();
                dofetchExcludedNetworkModifications();
            }
        },
        [dofetchNetworkModifications, cleanClipboard, dofetchExcludedNetworkModifications]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleEvent,
    });

    const [openNetworkModificationsMenu, setOpenNetworkModificationsMenu] = useState(false);

    const isEditBlocked = useIsEditBlocked(currentNode?.id);
    const isBuildBlocked = useIsBuildBlocked(currentNode?.id, currentNode?.data);
    const isNodeUpdating = useIsNodeUpdating(currentNode?.id);

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
                    networkModificationsToCopy.some((aCopiedModification) =>
                        selectedModificationsUuid.includes(aCopiedModification.uuid)
                    )
                ) {
                    cleanClipboard();
                }
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'errDeleteModificationMsg' });
            });
    }, [
        currentNode?.id,
        selectedNetworkModifications,
        snackError,
        studyUuid,
        cleanClipboard,
        networkModificationsToCopy,
    ]);

    const doAssembleModificationsIntoComposite = useCallback(() => {
        const selectedModUuids: UUID[] = selectedNetworkModifications.map((item) => item.uuid);
        setSaveInProgress(true);
        assembleModificationsIntoComposite(studyUuid, currentNode?.id, selectedModUuids)
            .then((compositeUuid: UUID) => {
                dispatch(setHighlightModification(compositeUuid));
                setModificationUuidsToReset(selectedModUuids);
                setModificationToEditLabel(compositeUuid);
            })
            .catch((error: ErrorMessage) => {
                snackWithFallback(snackError, error, { headerId: 'AssembleIntoCompositeError' });
            })
            .finally(() => {
                setSaveInProgress(false);
            });
    }, [currentNode?.id, dispatch, selectedNetworkModifications, snackError, studyUuid]);

    const doCreateCompositeModificationsElements = ({
        name,
        description,
        folderName,
        folderId,
    }: IElementCreationDialog) => {
        setSaveInProgress(true);

        Promise.all(
            selectedNetworkModifications.map((item) =>
                item.type === MODIFICATION_TYPES.MODIFICATION_REFERENCE.type
                    ? fetchNetworkModification(item.uuid as UUID)
                          .then((res) => res.json())
                          .then((detail: ReferenceModificationInfos) => {
                              if (detail.referenceId == null) {
                                  throw new Error(`Missing referenceId for modification reference ${item.uuid}`);
                              }
                              return detail.referenceId;
                          })
                    : Promise.resolve(item.uuid)
            )
        )
            .then((selectedModificationsUuid) =>
                createCompositeModifications(name, description, folderId, selectedModificationsUuid)
            )
            .then(() => {
                snackInfo({
                    headerId: 'infoCreateModificationsMsg',
                    headerValues: {
                        nbModifications: String(selectedNetworkModifications.length),
                        directory: folderName,
                    },
                });
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'errCreateModificationsMsg' });
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
            .catch((error) => {
                snackWithFallback(snackError, error, {
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

    const doCutModifications = useCallback(() => {
        cutNetworkModifications({
            networkModifications: selectedNetworkModifications,
            copyInfos: {
                copyType: NetworkModificationCopyType.MOVE,
                originStudyUuid: studyUuid ?? undefined,
                originNodeUuid: currentNode?.id,
            },
        });
    }, [cutNetworkModifications, currentNode?.id, selectedNetworkModifications, studyUuid]);

    const doCopyModifications = useCallback(() => {
        copyNetworkModifications({
            networkModifications: selectedNetworkModifications,
            copyInfos: {
                copyType: NetworkModificationCopyType.COPY,
                originStudyUuid: studyUuid ?? undefined,
                originNodeUuid: currentNode?.id,
            },
        });
    }, [copyNetworkModifications, currentNode?.id, selectedNetworkModifications, studyUuid]);

    const doPasteModifications = useCallback(() => {
        if (!copyInfos || !studyUuid || !currentNode?.id) {
            return;
        }
        // no source hint: study-server now looks up each modification's real container itself
        // (network-modification-server owns that data), instead of this having to guess it from
        // whatever the table's selection happens to expose
        const modificationsToMoveOrCopy: ModificationMoveOrCopyInfos[] = networkModificationsToCopy.map(
            (modification) => ({
                modificationUuid: modification.uuid,
            })
        );

        if (copyInfos.copyType === NetworkModificationCopyType.MOVE) {
            copyOrMoveModifications(studyUuid, currentNode.id, modificationsToMoveOrCopy, copyInfos)
                .then(() => {
                    cleanClipboard(false);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'errCutModificationMsg',
                    });
                });
        } else {
            copyOrMoveModifications(studyUuid, currentNode.id, modificationsToMoveOrCopy, copyInfos).catch((error) => {
                snackWithFallback(snackError, error, {
                    headerId: 'errDuplicateModificationMsg',
                });
            });
        }
    }, [copyInfos, studyUuid, currentNode?.id, networkModificationsToCopy, cleanClipboard, snackError]);

    const doEditModification = useCallback(
        (modificationUuid: UUID, modificationType: ModificationType) => {
            setIsUpdate(true);
            // setting this state will trigger dialog rendering
            setEditDialogOpen(modificationType);
            // with fetching status, waiting for the edit data to be fetched
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
                    snackWithFallback(snackError, error);
                    setEditDataFetchStatus(FetchStatus.FAILED);
                });
        },
        [snackError]
    );

    const onItemClick = (id: string) => {
        setOpenNetworkModificationsMenu(false);
        setEditDialogOpen(id);
        setIsUpdate(false);
    };
    const handleRowSelected = useCallback(
        (selectedRows: ComposedModificationMetadata[], isAssemblyDepthExceeded: boolean) => {
            setSelectedNetworkModifications(selectedRows);
            setIsAssemblyDepthExceeded(isAssemblyDepthExceeded);
        },
        [setSelectedNetworkModifications, setIsAssemblyDepthExceeded]
    );

    const renderDialog = () => {
        const menuItem = subMenuItemsList.find(
            (item: MenuDefinitionWithoutSubItem) => 'id' in item && item.id === editDialogOpen
        );
        if (menuItem && 'action' in menuItem && menuItem.action) {
            return menuItem.action();
        } else if (editDialogOpen === ModificationType.EQUIPMENT_DELETION) {
            // deletion modification edition is generic and is not associated to a menu item
            return withDefaultParams(EquipmentDeletionDialog);
        }
        console.warn('No dialog action found in menu items for: ', editDialogOpen);
        return undefined;
    };

    const isModificationClickable = useCallback(
        (modification: ComposedModificationMetadata) =>
            !isEditBlocked && !mapDataLoading && !isDragging && isEditableModification(modification),
        [isEditBlocked, mapDataLoading, isDragging]
    );

    const columns = useMemo<ColumnDef<ComposedModificationMetadata>[]>(
        () => [
            ...createBaseColumns(handleNameChange),
            ...(isMonoRootStudy ? [] : createRootNetworksColumns(rootNetworks)),
        ],
        [handleNameChange, isMonoRootStudy, rootNetworks]
    );

    // If only one modification is selected and it is of type composite, saving it in gridexplore would make it take its name by default
    const defaultSaveModificationName =
        selectedNetworkModifications.length === 1
            ? (JSON.parse(selectedNetworkModifications[0]?.messageValues)?.name ?? null)
            : null;

    const renderNetworkModificationsTable = () => {
        if (isRootNode) {
            return (
                <Box sx={styles.rootNodeWarning}>
                    <Alert severity="warning">
                        <FormattedMessage id="modificationsForbiddenOnRootNode" />
                    </Alert>
                </Box>
            );
        }

        return (
            <NetworkModificationsTable
                handleCellClick={handleCellClick}
                modifications={modifications}
                onRowDragStart={onRowDragStart}
                onRowDragEnd={onRowDragEnd}
                onSelectedRowsChange={handleRowSelected}
                isRowDragDisabled={isEditBlocked || mapDataLoading}
                // the node activity spinner replaced it, but commons-ui still requires the prop
                isImpactedByNotification={() => false}
                isFetchingModifications={isFetchingModifications}
                pendingState={isNodeUpdating}
                columns={columns}
                highlightedModificationUuid={highlightedModificationUuid}
                modificationUuidsToReset={modificationUuidsToReset}
                modificationToEditLabel={modificationToEditLabel}
                studyUuid={studyUuid}
                currentNodeId={currentNode?.id}
                currentRootNetworkUuid={currentRootNetworkUuid ?? undefined}
                rootNetworks={isMonoRootStudy ? undefined : rootNetworks}
                modificationsToExclude={modificationsToExclude}
                setModificationsToExclude={setModificationsToExclude}
                isDisabled={isEditBlocked || mapDataLoading}
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
                    defaultName={defaultSaveModificationName}
                    studyUuid={studyUuid}
                    selectorTitleId="SelectCompositeModificationTitle"
                    createLabelId="CreateCompositeModificationLabel"
                    updateLabelId="UpdateCompositeModificationLabel"
                />
            )
        );
    };

    const handleCellClick = useCallback(
        (modification: ComposedModificationMetadata) => {
            if (isModificationClickable(modification)) {
                // Check if the clicked column is the 'modificationName' column
                doEditModification(modification.uuid, modification.type);
            }
        },
        [doEditModification, isModificationClickable]
    );

    const onRowDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const onRowDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const isPasteButtonDisabled = useMemo(() => {
        return networkModificationsToCopy.length <= 0 || isEditBlocked || mapDataLoading || !currentNode;
    }, [networkModificationsToCopy.length, isEditBlocked, mapDataLoading, currentNode]);

    const isRestoreButtonDisabled = useMemo(() => {
        return modificationsToRestore.length === 0 || isEditBlocked;
    }, [modificationsToRestore.length, isEditBlocked]);

    const isCompositeNestingLimitReached = useMemo(
        () => selectedNetworkModifications.some((row) => (row.maxDepth ?? 0) >= MAX_COMPOSITE_NESTING_DEPTH),
        [selectedNetworkModifications]
    );

    const disabledCompositeCreation: boolean = useMemo(() => {
        return (
            selectedNetworkModifications?.length === 0 ||
            saveInProgress ||
            isRootNode ||
            isAssemblyDepthExceeded ||
            isEditBlocked ||
            selectionContainsShared
        );
    }, [
        selectedNetworkModifications?.length,
        saveInProgress,
        isRootNode,
        isAssemblyDepthExceeded,
        isEditBlocked,
        selectionContainsShared,
    ]);

    const disabledCompositeExport: boolean = useMemo(() => {
        return (
            selectedNetworkModifications?.length === 0 || saveInProgress || isRootNode || isCompositeNestingLimitReached
        );
    }, [selectedNetworkModifications, saveInProgress, isRootNode, isCompositeNestingLimitReached]);

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Box sx={styles.filler} />
                {currentNode?.type === NodeType.NETWORK_MODIFICATION && (
                    <>
                        <BuildButton
                            buildStatus={currentNode.data.localBuildStatus}
                            studyUuid={studyUuid}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            nodeUuid={currentNode.id}
                            disabled={isBuildBlocked}
                        />
                        <Divider orientation="vertical" flexItem sx={{ marginX: 0.5 }} />
                    </>
                )}
                <Tooltip title={<FormattedMessage id={'addNetworkModification'} />}>
                    <span>
                        <IconButton
                            size={'small'}
                            ref={buttonAddRef}
                            onClick={openNetworkModificationConfiguration}
                            disabled={isEditBlocked || mapDataLoading || isRootNode}
                            data-testid="AddModification"
                        >
                            <AddIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip
                    title={
                        isAssemblyDepthExceeded ? (
                            <FormattedMessage
                                id={'CompositeAssemblyDepthExceeded'}
                                values={{ limit: MAX_COMPOSITE_NESTING_DEPTH }}
                            />
                        ) : (
                            <FormattedMessage id={'AssembleIntoComposite'} />
                        )
                    }
                >
                    <span>
                        <IconButton
                            onClick={doAssembleModificationsIntoComposite}
                            size={'small'}
                            disabled={disabledCompositeCreation}
                            data-testid="CreateComposite"
                        >
                            <ArrowsInputIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'importFromGridExplore'} />}>
                    <span>
                        <IconButton
                            onClick={openImportModificationsDialog}
                            size={'small'}
                            disabled={isEditBlocked || mapDataLoading || isRootNode}
                            data-testid="ImportModification"
                        >
                            <FileUpload />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip
                    title={
                        isCompositeNestingLimitReached ? (
                            <FormattedMessage
                                id={'CompositeNestingLimitReached'}
                                values={{ limit: MAX_COMPOSITE_NESTING_DEPTH }}
                            />
                        ) : (
                            <FormattedMessage id={'SaveToGridexplore'} />
                        )
                    }
                >
                    <span>
                        <IconButton
                            onClick={openCreateCompositeModificationDialog}
                            size={'small'}
                            disabled={disabledCompositeExport}
                            data-testid="SaveModification"
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
                                isEditBlocked ||
                                mapDataLoading ||
                                !currentNode ||
                                isRootNode
                            }
                            data-testid="CutModification"
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
                            disabled={
                                selectedNetworkModifications.length === 0 ||
                                isEditBlocked ||
                                mapDataLoading ||
                                isRootNode
                            }
                            data-testid="CopyModification"
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
                                nb: networkModificationsToCopy.length,
                                several: networkModificationsToCopy.length > 1 ? 's' : '',
                            }}
                        />
                    }
                >
                    <span>
                        <IconButton
                            onClick={doPasteModifications}
                            size={'small'}
                            disabled={isPasteButtonDisabled || isRootNode}
                            data-testid="PasteModification"
                        >
                            <ContentPasteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={<FormattedMessage id={'moveToTrash'} />}>
                    <span>
                        <IconButton
                            onClick={doStashModification}
                            size={'small'}
                            disabled={
                                selectedNetworkModifications.length === 0 ||
                                isEditBlocked ||
                                mapDataLoading ||
                                !currentNode ||
                                isRootNode
                            }
                            data-testid="DeleteModification"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
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
                            disabled={isRestoreButtonDisabled || isRootNode}
                            data-testid="RestoreModification"
                        >
                            <RestoreFromTrash />
                        </IconButton>
                    </span>
                </Tooltip>
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
