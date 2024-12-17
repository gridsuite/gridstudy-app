/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CheckBoxList,
    ElementType,
    MODIFICATION_TYPES,
    Parameter,
    useModificationLabelComputer,
    useSnackMessage,
} from '@gridsuite/commons-ui';

import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Checkbox, CircularProgress, Theme, Toolbar, Tooltip, Typography } from '@mui/material';
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
import { LoadCreationDialog } from '../../dialogs/network-modifications/load/creation/load-creation-dialog';
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
import NetworkModificationsMenu from 'components/graph/menus/network-modifications-menu';
import { UPDATE_TYPE } from 'components/network/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNotification,
    removeNotificationByNode,
    resetLogsFilter,
    setModificationsInProgress,
} from '../../../redux/actions';
import TwoWindingsTransformerModificationDialog from '../../dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';

import RestoreModificationDialog from 'components/dialogs/restore-modification-dialog';
import { UUID } from 'crypto';
import { DropResult } from 'react-beautiful-dnd';
import { AppState, StudyUpdated } from 'redux/reducer';
import { createCompositeModifications } from '../../../services/explore';
import { fetchNetworkModification } from '../../../services/network-modification';
import {
    changeNetworkModificationOrder,
    fetchNetworkModifications,
    stashModifications,
} from '../../../services/study/network-modifications';
import { FetchStatus } from '../../../services/utils';
import ElementCreationDialog, {
    IElementCreationDialog,
    IElementCreationDialog1,
} from '../../dialogs/element-creation-dialog';
import {
    MenuDefinition,
    MenuDefinitionSubItem,
    MenuDefinitionWithoutSubItem,
    NetworkModificationCopyInfo,
    NetworkModificationCopyType,
    NetworkModificationData,
    NetworkModificationMetadata,
} from './network-modification-menu.type';
import { SwitchNetworkModificationActive } from './switch-network-modification-active';
import StaticVarCompensatorCreationDialog from '../../dialogs/network-modifications/static-var-compensator/creation/static-var-compensator-creation-dialog';
import ModificationByAssignmentDialog from '../../dialogs/network-modifications/by-filter/by-assignment/modification-by-assignment-dialog';
import ByFormulaDialog from '../../dialogs/network-modifications/by-filter/by-formula/by-formula-dialog';
import ByFilterDeletionDialog from '../../dialogs/network-modifications/by-filter/by-filter-deletion/by-filter-deletion-dialog';
import { LccCreationDialog } from '../../dialogs/network-modifications/hvdc-line/lcc/creation/lcc-creation-dialog';
import ImportCaseDialog from 'components/dialogs/import-case-dialog';
import CreateCaseDialog from 'components/dialogs/create-case-dialog';
import { createRootNetwork } from 'services/root-network';
import { CaseImportParameters, GetCaseImportParametersReturn, getCaseImportParameters } from 'services/network-conversion';

export const styles = {
    listContainer: (theme: Theme) => ({
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    }),
    listItem: { paddingLeft: 0, paddingTop: 0, paddingBottom: 0 },
    checkBoxLabel: { flexGrow: '1' },
    disabledModification: { opacity: 0.4 },
    checkBoxIcon: { minWidth: 0, padding: 0 },
    checkboxButton: {
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    modificationsTitle: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
    toolbar: (theme: Theme) => ({
        '&': {
            // Necessary to overrides some @media specific styles that are defined elsewhere
            padding: 0,
            minHeight: 0,
        },
        border: theme.spacing(1),
        margin: 0,
        flexShrink: 0,
    }),
    toolbarIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    toolbarCheckbox: (theme: Theme) => ({
        marginLeft: theme.spacing(1.5),
    }),
    filler: {
        flexGrow: 1,
    },
    circularProgress: (theme: Theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    toolbarCircularProgress: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing(1.25),
        marginRight: theme.spacing(2),
        color: theme.palette.secondary.main,
    }),
    notification: (theme: Theme) => ({
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
    iconEdit: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

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

export function isChecked(s1: number) {
    return s1 !== 0;
}

export function isPartial(s1: number, s2: number) {
    if (s1 === 0) {
        return false;
    }
    return s1 !== s2;
}

const RootNetworkNodeEditor = () => {
    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const rootNetworkUuid = useSelector((state: AppState) => state.rootNetworkUuid);
    const { snackInfo, snackError } = useSnackMessage();
    const [modifications, setModifications] = useState<NetworkModificationMetadata[]>([]);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [modificationsToRestore, setModificationsToRestore] = useState<NetworkModificationMetadata[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const currentNodeIdRef = useRef<UUID>(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState<NetworkModificationMetadata[]>([]);
    const [copiedModifications, setCopiedModifications] = useState<UUID[]>([]);
    const [copyInfos, setCopyInfos] = useState<NetworkModificationCopyInfo | null>(null);
    const copyInfosRef = useRef<NetworkModificationCopyInfo | null>();
    copyInfosRef.current = copyInfos;

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState<string | undefined>(undefined);
    const [editData, setEditData] = useState<NetworkModificationData | undefined>(undefined);
    const [editDataFetchStatus, setEditDataFetchStatus] = useState(FetchStatus.IDLE);
    const [caseSelectionDialogOpen, setCaseSelectionDialogOpen] = useState(false);
    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const [createCompositeModificationDialogOpen, setCreateCompositeModificationDialogOpen] = useState(false);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);
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
                editData={editData}
                isUpdate={isUpdate}
                editDataFetchStatus={editDataFetchStatus}
            />
        );
    }
 

    const fillNotification = useCallback(
        (study: StudyUpdated, messageId: string) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            dispatch(addNotification([study.eventData.headers.parentNode ?? []]));
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (study: StudyUpdated) => {
            let messageId;
            switch (study.eventData.headers['updateType']) {
                case 'creatingInProgress':
                    messageId = 'network_modifications.creatingModification';
                    break;
                case 'updatingInProgress':
                    messageId = 'network_modifications.updatingModification';
                    break;
                case 'stashingInProgress':
                    messageId = 'network_modifications.stashingModification';
                    break;
                case 'restoringInProgress':
                    messageId = 'network_modifications.restoringModification';
                    break;
                default:
                    messageId = '';
            }
            fillNotification(study, messageId);
        },
        [fillNotification]
    );

    const updateSelectedItems = useCallback((modifications: NetworkModificationMetadata[]) => {
        const toKeepIdsSet = new Set(modifications.map((e) => e.uuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.uuid)));
    }, []);

    const dofetchNetworkModifications = useCallback(() => {
        console.log('fetchiiiiiiiiiiing ?????');

        // Do not fetch modifications on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION') {
            return;
        }
        setLaunchLoader(true);
        console.log('fetchiiiiiiiiiiing ?????');
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
                setLaunchLoader(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError, dispatch]);

    useEffect(() => {
        setEditDialogOpen(editData?.type);
    }, [editData]);

    useEffect(() => {
        // first time with currentNode initialized then fetch modifications
        // (because if currentNode is not initialized, dofetchNetworkModifications silently does nothing)
        // OR next time if currentNodeId changed then fetch modifications
        if (currentNode && (!currentNodeIdRef.current || currentNodeIdRef.current !== currentNode.id)) {
            currentNodeIdRef.current = currentNode.id;
            // Current node has changed then clear the modifications list
            setModifications([]);
            setModificationsToRestore([]);
            dofetchNetworkModifications();
            // reset the network modification and computing logs filter when the user changes the current node
            dispatch(resetLogsFilter());
        }
    }, [currentNode, dispatch, dofetchNetworkModifications]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['updateType'] === 'nodeDeleted') {
                if (
                    copyInfosRef.current &&
                    studyUpdatedForce.eventData.headers['nodes']?.some(
                        (nodeId) => nodeId === copyInfosRef.current?.originNodeUuid
                    )
                ) {
                    // Must clean modifications clipboard if the origin Node is removed
                    cleanClipboard();
                }
            }
            if (currentNodeIdRef.current !== studyUpdatedForce.eventData.headers['parentNode']) {
                return;
            }

            if (
                studyUpdatedForce.eventData.headers['updateType'] &&
                // @ts-expect-error TS2345: Argument of type string is not assignable to parameter of type UPDATE_TYPE (a restrained array of strings)
                UPDATE_TYPE.includes(studyUpdatedForce.eventData.headers['updateType'])
            ) {
                if (studyUpdatedForce.eventData.headers['updateType'] === 'deletingInProgress') {
                    // deleting means removing from trashcan (stashed elements) so there is no network modification
                    setDeleteInProgress(true);
                } else {
                    dispatch(setModificationsInProgress(true));
                    setPendingState(true);
                    manageNotification(studyUpdatedForce);
                }
            }
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            if (studyUpdatedForce.eventData.headers['updateType'] === 'UPDATE_FINISHED') {
                // fetch modifications because it must have changed
                // Do not clear the modifications list, because currentNode is the concerned one
                // this allows to append new modifications to the existing list.
                dofetchNetworkModifications();
                dispatch(
                    removeNotificationByNode([
                        studyUpdatedForce.eventData.headers['parentNode'],
                        ...(studyUpdatedForce.eventData.headers.nodes ?? []),
                    ])
                );
            }
            if (studyUpdatedForce.eventData.headers['updateType'] === 'DELETE_FINISHED') {
                setDeleteInProgress(false);
                dofetchNetworkModifications();
            }
        }
    }, [dispatch, dofetchNetworkModifications, manageNotification, studyUpdatedForce, cleanClipboard]);

    const [openNetworkModificationsMenu, setOpenNetworkModificationsMenu] = useState(false);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsMenu(false);
        setEditData(undefined);
        setEditDataFetchStatus(FetchStatus.IDLE);
    };

    const openRootNetworkCreationDialog = useCallback(() => {
        setRootNetworkCreationDialogOpen(true);
    }, []);

    const doDeleteModification = useCallback(() => {
        const selectedModificationsUuid = selectedItems.map((item) => item.uuid);
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
    }, [currentNode?.id, selectedItems, snackError, studyUuid, cleanClipboard, copiedModifications]);

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

    const toggleSelectAllModifications = useCallback(() => {
        setSelectedItems((oldVal) => (oldVal.length === 0 ? modifications : []));
    }, [modifications]);

 
    const commit = useCallback(
        ({ source, destination }: DropResult) => {
            setIsDragging(false);
            if (!currentNode?.id || !destination || source.index === destination.index) {
                return;
            }
            const res = [...modifications];
            const [item] = res.splice(source.index, 1);
            const before = res[destination.index]?.uuid;
            res.splice(destination ? destination.index : modifications.length, 0, item);

            /* doing the local change before update to server */
            setModifications(res);
            changeNetworkModificationOrder(studyUuid, currentNode.id, item.uuid, before).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'errReorderModificationMsg',
                });
                setModifications(modifications); // rollback
            });
        },
        [modifications, studyUuid, currentNode?.id, snackError]
    );

    const isLoading = useCallback(() => {
        return notificationIdList.filter((notification) => notification === currentNode?.id).length > 0;
    }, [notificationIdList, currentNode?.id]);

    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();
    const getModificationLabel = (modif: NetworkModificationMetadata): string => {
        if (!modif) {
            return '';
        }
        return intl.formatMessage(
            { id: 'network_modifications.' + modif.messageType },
            {
                ...modif,
                ...computeLabel(modif),
            }
        );
    };

    const handleSecondaryAction = useCallback(
        (modification: NetworkModificationMetadata, isItemHovered?: boolean) => {
            return isItemHovered && !isDragging ? (
                <SwitchNetworkModificationActive
                    modificationActivated={modification.activated}
                    modificationUuid={modification.uuid}
                    setModifications={setModifications}
                    disabled={isLoading() || isAnyNodeBuilding || mapDataLoading}
                />
            ) : null;
        },
        [isAnyNodeBuilding, isDragging, mapDataLoading, isLoading]
    );

    const isModificationClickable = useCallback(
        (modification: NetworkModificationMetadata) =>
            !isAnyNodeBuilding && !mapDataLoading && !isDragging && isEditableModification(modification),
        [isAnyNodeBuilding, mapDataLoading, isDragging]
    );

    const renderNetworkModificationsList = () => {
        return (
            <CheckBoxList
                sx={{
                    items: (modification) => ({
                        label: {
                            ...(!modification.activated && { ...styles.disabledModification }),
                            ...styles.checkBoxLabel,
                        },
                        checkBoxIcon: styles.checkBoxIcon,
                        checkboxButton: styles.checkboxButton,
                    }),
                    dragAndDropContainer: styles.listContainer,
                }}
                onItemClick={(modification) => {
                    isModificationClickable(modification) && doEditModification(modification.uuid, modification.type);
                }}
                isItemClickable={isModificationClickable}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                items={modifications}
                getItemId={(val) => val.uuid}
                getItemLabel={getModificationLabel}
                isDndDragAndDropActive
                isDragDisable={isLoading() || isAnyNodeBuilding || mapDataLoading || deleteInProgress}
                secondaryAction={handleSecondaryAction}
                onDragEnd={commit}
                onDragStart={() => setIsDragging(true)}
                divider
            />
        );
    };

    const renderNetworkModificationsListTitleLoading = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={messageId} />
                </Typography>
            </Box>
        );
    };

    const renderNetworkModificationsListTitleUpdating = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={'network_modifications.modifications'} />
                </Typography>
            </Box>
        );
    };

    const renderNetworkModificationsListTitle = () => {
        return (
            <Box sx={styles.modificationsTitle}>
                <Box sx={styles.icon}>
                    {pendingState && <CircularProgress size={'1em'} sx={styles.circularProgress} />}
                </Box>
                <Typography noWrap>
                    <FormattedMessage
                        id={'network_modifications.modificationsCount'}
                        values={{
                            count: modifications ? modifications?.length : '',
                            hide: pendingState,
                        }}
                    />
                </Typography>
            </Box>
        );
    };

    // const renderCaseSelectionDialog = () => {
    //     // return (
    //     //     <ElementCreationDialog
    //     //         open={caseSelectionDialogOpen}
    //     //         onSave={doCreateCompositeModificationsElements}
    //     //         onClose={() => setCaseSelectionDialogOpen(false)}
    //     //         type={ElementType.ROOT_NETWORK}
    //     //         titleId={'CreateRootNetwork'}
    //     //         prefixIdForGeneratedName={'GeneratedModification'}
    //     //     />
    //     // );
    //     return <ImportCaseDialog open={caseSelectionDialogOpen} onClose={() => setCaseSelectionDialogOpen(false)} />;
    // };

    const renderRootNetworkCreationDialog = () => {
        return (
            <ElementCreationDialog
                open={rootNetworkCreationDialogOpen}
                onClose={() => setRootNetworkCreationDialogOpen(false)}
                onSave={doCreateRootNetwork}
                type={ElementType.ROOT_NETWORK}
                titleId={'CreateRootNetwork'}
            />
        );

        //return <CreateCaseDialog open={rootNetworkCreationDialogOpen}  onClose={() => setRootNetworkCreationDialogOpen(false)} />;
    };

         /* Effects */
    // handle create r from existing case
    useEffect(() => {
          //  getCurrentCaseImportParams(providedExistingCase.elementUuid);
     
    }, []);
    function formatCaseImportParameters(params: CaseImportParameters[]): CaseImportParameters[] {
        // sort possible values alphabetically to display select options sorted
        return params?.map((parameter) => ({
            ...parameter,
            possibleValues: parameter.possibleValues?.sort((a: any, b: any) => a.localeCompare(b)),
        }));
    }
    const getCurrentCaseImportParams = useCallback(
        (caseUuid: UUID) => {
            getCaseImportParameters(caseUuid)
                .then((result: GetCaseImportParametersReturn) => {
                    console.log(result)
                    const formattedParams = formatCaseImportParameters(result.parameters); 
                    const caseFormat =  result.formatName ; 
                   })
                .catch(() => {

                    // setError(`root.${FieldConstants.API_CALL}`, {
                    //     type: 'parameterLoadingProblem',
                    //     message: intl.formatMessage({
                    //         id: 'parameterLoadingProblem',
                    //     }),
                    // });
                });
        },
        [intl ]
    );

     const doCreateRootNetwork = ({ name, caseName, caseId }: IElementCreationDialog1) => {
        console.log('fetcccccccccch ???? ', name, caseName, caseId);
        setSaveInProgress(true);
        // createRootNetwork(   caseId ,
        //     "XIIDM",
        //     studyUuid,
        //     importParameters)
        // createCompositeModifications(name, description, folderId, selectedModificationsUuid)
        //     .then(() => {
        //         snackInfo({
        //             headerId: 'infoCreateModificationsMsg',
        //             headerValues: {
        //                 nbModifications: String(selectedItems.length),
        //                 studyDirectory: '/' + folderName,
        //             },
        //         });
        //     })
        //     .catch((errmsg) => {
        //         snackError({
        //             messageTxt: errmsg,
        //             headerId: 'errCreateModificationsMsg',
        //         });
        //     })
        //     .finally(() => {
        //         setSaveInProgress(false);
        //     });
    };

    const renderPaneSubtitle = () => {
        if (isLoading() && messageId) {
            return renderNetworkModificationsListTitleLoading();
        }
        if (launchLoader) {
            return renderNetworkModificationsListTitleUpdating();
        }
        return renderNetworkModificationsListTitle();
    };

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Checkbox
                    sx={styles.toolbarCheckbox}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(selectedItems.length)}
                    indeterminate={isPartial(selectedItems.length, modifications?.length)}
                    disableRipple
                    onClick={toggleSelectAllModifications}
                />
                <Box sx={styles.filler} />

                <Tooltip title={<FormattedMessage id={'InsertModificationFrom'} />}>
                    <span>
                        <IconButton
                            onClick={openRootNetworkCreationDialog}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={isAnyNodeBuilding || mapDataLoading || deleteInProgress}
                        >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <IconButton
                    onClick={doDeleteModification}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={
                        selectedItems.length === 0 ||
                        isAnyNodeBuilding ||
                        mapDataLoading ||
                        deleteInProgress ||
                        !currentNode
                    }
                >
                    <DeleteIcon />
                </IconButton>
                {deleteInProgress ?? (
                    <Tooltip title={<FormattedMessage id={'network_modifications.deletingModification'} />}>
                        <span>
                            <CircularProgress size={'1em'} sx={styles.toolbarCircularProgress} />
                        </span>
                    </Tooltip>
                )}
            </Toolbar>
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
            {renderPaneSubtitle()}

            {renderNetworkModificationsList()}

  
        </>
    );
};

export default RootNetworkNodeEditor;
