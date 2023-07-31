/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { copyOrMoveModifications } from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import LineAttachToVoltageLevelDialog from 'components/dialogs/network-modifications/line-attach-to-voltage-level/line-attach-to-voltage-level-dialog';
import NetworkModificationsMenu from 'components/graph/menus/network-modifications-menu';
import makeStyles from '@mui/styles/makeStyles';
import { ModificationListItem } from './modification-list-item';
import {
    Checkbox,
    CircularProgress,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import LoadCreationDialog from 'components/dialogs/network-modifications/load/creation/load-creation-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import LineCreationDialog from 'components/dialogs/network-modifications/line/creation/line-creation-dialog';
import TwoWindingsTransformerCreationDialog from 'components/dialogs/network-modifications/two-windings-transformer/creation/two-windings-transformer-creation-dialog';
import ShuntCompensatorCreationDialog from 'components/dialogs/network-modifications/shunt-compensator/creation/shunt-compensator-creation-dialog';
import EquipmentDeletionDialog from 'components/dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog.js';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckboxList from '../../utils/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import {
    addNotification,
    removeNotificationByNode,
    setModificationsInProgress,
} from '../../../redux/actions';
import LoadScalingDialog from 'components/dialogs/network-modifications/load-scaling/load-scaling-dialog';
import VoltageLevelCreationDialog from 'components/dialogs/network-modifications/voltage-level/creation/voltage-level-creation-dialog';
import GeneratorCreationDialog from 'components/dialogs/network-modifications/generator/creation/generator-creation-dialog';
import DeleteVoltageLevelOnLineDialog from 'components/dialogs/network-modifications/delete-voltage-level-on-line/delete-voltage-level-on-line-dialog';
import DeleteAttachingLineDialog from 'components/dialogs/network-modifications/delete-attaching-line/delete-attaching-line-dialog';
import LinesAttachToSplitLinesDialog from 'components/dialogs/network-modifications/lines-attach-to-split-lines/lines-attach-to-split-lines-dialog';
import GeneratorScalingDialog from 'components/dialogs/network-modifications/generator-scaling/generator-scaling-dialog';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import SubstationCreationDialog from 'components/dialogs/network-modifications/substation/creation/substation-creation-dialog';
import SubstationModificationDialog from 'components/dialogs/network-modifications/substation/modification/substation-modification-dialog';
import GenerationDispatchDialog from 'components/dialogs/network-modifications/generation-dispatch/generation-dispatch-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import { UPDATE_TYPE } from 'components/network/constants';
import { FetchStatus } from 'utils/rest-api';
import LineSplitWithVoltageLevelDialog from 'components/dialogs/network-modifications/line-split-with-voltage-level/line-split-with-voltage-level-dialog';
import TwoWindingsTransformerModificationDialog from '../../dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import BatteryCreationDialog from 'components/dialogs/network-modifications/battery/creation/battery-creation-dialog';
import ShuntCompensatorModificationDialog from 'components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import { fetchNetworkModification } from '../../../services/network-modification';
import {
    changeNetworkModificationOrder,
    deleteModifications,
    fetchNetworkModifications,
} from '../../../services/study/network-modifications';

const useStyles = makeStyles((theme) => ({
    listContainer: {
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    },
    list: {
        paddingTop: theme.spacing(0),
        flexGrow: 1,
    },
    modificationsTitle: {
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    },
    toolbar: {
        padding: theme.spacing(0),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
        flexShrink: 0,
    },

    toolbarIcon: {
        marginRight: theme.spacing(1),
    },
    toolbarCheckbox: {
        marginLeft: theme.spacing(1.5),
    },
    filler: {
        flexGrow: 1,
    },
    dividerTool: {
        background: theme.palette.primary.main,
    },
    circularProgress: {
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    },
    formattedMessageProgress: {
        marginTop: theme.spacing(2),
    },
    notification: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    },
    icon: {
        width: theme.spacing(3),
    },
}));

function isChecked(s1) {
    return s1 !== 0;
}

function isPartial(s1, s2) {
    if (s1 === 0) {
        return false;
    }
    return s1 !== s2;
}

export const CopyType = {
    COPY: 'COPY',
    MOVE: 'MOVE',
};

const NetworkModificationNodeEditor = () => {
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const { snackInfo, snackError } = useSnackMessage();
    const [modifications, setModifications] = useState(undefined);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const currentNodeIdRef = useRef(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();
    const [copiedModifications, setCopiedModifications] = useState([]);
    const [copyInfos, setCopyInfos] = useState(null);
    const copyInfosRef = useRef();
    copyInfosRef.current = copyInfos;

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(undefined);
    const [editData, setEditData] = useState(undefined);
    const [editDataFetchStatus, setEditDataFetchStatus] = useState(
        FetchStatus.IDLE
    );
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const buttonAddRef = useRef();

    const cleanClipboard = useCallback(() => {
        setCopyInfos(null);
        setCopiedModifications((oldCopiedModifications) => {
            if (oldCopiedModifications.length) {
                snackInfo({
                    messageId: 'CopiedModificationInvalidationMessage',
                });
                return [];
            }
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

    function withDefaultParams(Dialog, props) {
        return (
            <Dialog
                onClose={handleCloseDialog}
                onValidated={handleValidatedDialog}
                currentNode={currentNode}
                studyUuid={studyUuid}
                editData={editData}
                isUpdate={isUpdate}
                editDataFetchStatus={editDataFetchStatus}
                {...props}
            />
        );
    }

    function adapt(Dialog, ...augmenters) {
        const nprops = augmenters.reduce((pv, cv) => cv(pv), {});
        return withDefaultParams(Dialog, nprops);
    }

    const menuDefinition = [
        {
            id: 'CREATE',
            label: 'Create',
            subItems: [
                {
                    id: 'BATTERY_CREATION',
                    label: 'BATTERY',
                    action: () => adapt(BatteryCreationDialog),
                },
                {
                    id: 'LOAD_CREATION',
                    label: 'LOAD',
                    action: () => adapt(LoadCreationDialog),
                },
                {
                    id: 'GENERATOR_CREATION',
                    label: 'GENERATOR',
                    action: () => adapt(GeneratorCreationDialog),
                },
                {
                    id: 'SHUNT_COMPENSATOR_CREATION',
                    label: 'ShuntCompensator',
                    action: () => adapt(ShuntCompensatorCreationDialog),
                },
                {
                    id: 'LINE_CREATION',
                    label: 'LINE',
                    action: () => adapt(LineCreationDialog),
                },
                {
                    id: 'TWO_WINDINGS_TRANSFORMER_CREATION',
                    label: 'TWO_WINDINGS_TRANSFORMER',
                    action: () => adapt(TwoWindingsTransformerCreationDialog),
                },
                {
                    id: 'VOLTAGE_LEVEL_CREATION',
                    label: 'VOLTAGE_LEVEL',
                    action: () => adapt(VoltageLevelCreationDialog),
                },
                {
                    id: 'SUBSTATION_CREATION',
                    label: 'SUBSTATION',
                    action: () => adapt(SubstationCreationDialog),
                },
            ],
        },
        {
            id: 'EDIT',
            label: 'ModifyFromMenu',
            subItems: [
                {
                    id: 'LOAD_MODIFICATION',
                    label: 'LOAD',
                    action: () => adapt(LoadModificationDialog),
                },
                {
                    id: 'GENERATOR_MODIFICATION',
                    label: 'GENERATOR',
                    action: () => adapt(GeneratorModificationDialog),
                },
                {
                    id: 'SHUNT_COMPENSATOR_MODIFICATION',
                    label: 'ShuntCompensator',
                    action: () => adapt(ShuntCompensatorModificationDialog),
                },
                {
                    id: 'LINE_MODIFICATION',
                    label: 'LINE',
                    action: () => adapt(LineModificationDialog),
                },
                {
                    id: 'TWO_WINDINGS_TRANSFORMER_MODIFICATION',
                    label: 'TWO_WINDINGS_TRANSFORMER',
                    action: () =>
                        adapt(TwoWindingsTransformerModificationDialog),
                },
                {
                    id: 'VOLTAGE_LEVEL_MODIFICATION',
                    label: 'VoltageLevel',
                    action: () => adapt(VoltageLevelModificationDialog),
                },
                {
                    id: 'SUBSTATION_MODIFICATION',
                    label: 'SUBSTATION',
                    action: () => adapt(SubstationModificationDialog),
                },
            ],
        },
        {
            id: 'EQUIPMENT_DELETION',
            label: 'DeleteContingencyList',
            action: () => adapt(EquipmentDeletionDialog),
        },
        {
            id: 'ATTACHING_SPLITTING_LINES',
            label: 'AttachingAndSplittingLines',
            subItems: [
                {
                    id: 'LINE_SPLIT_WITH_VOLTAGE_LEVEL',
                    label: 'LineSplitWithVoltageLevel',
                    action: () => adapt(LineSplitWithVoltageLevelDialog),
                },
                {
                    id: 'LINE_ATTACH_TO_VOLTAGE_LEVEL',
                    label: 'LineAttachToVoltageLevel',
                    action: () => adapt(LineAttachToVoltageLevelDialog),
                },
                {
                    id: 'LINES_ATTACH_TO_SPLIT_LINES',
                    label: 'LinesAttachToSplitLines',
                    action: () => adapt(LinesAttachToSplitLinesDialog),
                },
                {
                    id: 'DELETE_VOLTAGE_LEVEL_ON_LINE',
                    label: 'DeleteVoltageLevelOnLine',
                    action: () => adapt(DeleteVoltageLevelOnLineDialog),
                },
                {
                    id: 'DELETE_ATTACHING_LINE',
                    label: 'DeleteAttachingLine',
                    action: () => adapt(DeleteAttachingLineDialog),
                },
            ],
        },
        {
            id: 'GENERATION_AND_LOAD',
            label: 'GenerationAndLoad',
            subItems: [
                {
                    id: 'GENERATOR_SCALING',
                    label: 'GeneratorScaling',
                    action: () => adapt(GeneratorScalingDialog),
                },
                {
                    id: 'LOAD_SCALING',
                    label: 'LoadScaling',
                    action: () => adapt(LoadScalingDialog),
                },
                {
                    id: 'GENERATION_DISPATCH',
                    label: 'GenerationDispatch',
                    action: () => adapt(GenerationDispatchDialog),
                },
            ],
        },
    ];

    const subMenuItemsList = menuDefinition.reduce(
        (actions, currentMenuItem) =>
            currentMenuItem.subItems === undefined
                ? [...actions, currentMenuItem]
                : [...actions, ...currentMenuItem.subItems],
        []
    );

    const fillNotification = useCallback(
        (study, messageId) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            dispatch(
                addNotification([
                    study.eventData.headers['parentNode'],
                    ...study.eventData.headers['nodes'],
                ])
            );
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (study) => {
            let messageId = '';
            if (
                study.eventData.headers['updateType'] === 'creatingInProgress'
            ) {
                messageId = 'network_modifications/creatingModification';
            } else if (
                study.eventData.headers['updateType'] === 'updatingInProgress'
            ) {
                messageId = 'network_modifications/updatingModification';
            } else if (
                study.eventData.headers['updateType'] === 'deletingInProgress'
            ) {
                messageId = 'network_modifications/deletingModification';
            }
            fillNotification(study, messageId);
        },
        [fillNotification]
    );

    const dofetchNetworkModifications = useCallback(() => {
        // Do not fetch modifications on the root node
        if (currentNode?.type !== 'NETWORK_MODIFICATION') {
            return;
        }
        setLaunchLoader(true);
        fetchNetworkModifications(studyUuid, currentNode.id)
            .then((res) => {
                // Check if during asynchronous request currentNode has already changed
                // otherwise accept fetch results
                if (currentNode.id === currentNodeIdRef.current) {
                    setModifications(res);
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
    }, [studyUuid, currentNode?.id, currentNode?.type, snackError, dispatch]);

    useEffect(() => {
        setEditDialogOpen(editData?.type);
    }, [editData]);

    useEffect(() => {
        // first time with currentNode initialized then fetch modifications
        // (because if currentNode is not initialized, dofetchNetworkModifications silently does nothing)
        // OR next time if currentNodeId changed then fetch modifications
        if (
            currentNode &&
            (!currentNodeIdRef.current ||
                currentNodeIdRef.current !== currentNode.id)
        ) {
            currentNodeIdRef.current = currentNode.id;
            // Current node has changed then clear the modifications list
            setModifications([]);
            dofetchNetworkModifications();
        }
    }, [currentNode, dofetchNetworkModifications]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeDeleted'
            ) {
                if (
                    copyInfosRef.current &&
                    studyUpdatedForce.eventData.headers['nodes'].some(
                        (nodeId) =>
                            nodeId === copyInfosRef.current.originNodeUuid
                    )
                ) {
                    // Must clean modifications clipboard if the origin Node is removed
                    cleanClipboard();
                }
            }
            if (
                currentNodeIdRef.current !==
                studyUpdatedForce.eventData.headers['parentNode']
            ) {
                return;
            }

            if (
                UPDATE_TYPE.includes(
                    studyUpdatedForce.eventData.headers['updateType']
                )
            ) {
                dispatch(setModificationsInProgress(true));
                setPendingState(true);
                manageNotification(studyUpdatedForce);
            }
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'UPDATE_FINISHED'
            ) {
                // fetch modifications because it must have changed
                // Do not clear the modifications list, because currentNode is the concerned one
                // this allow to append new modifications to the existing list.
                dofetchNetworkModifications();
                dispatch(
                    removeNotificationByNode([
                        studyUpdatedForce.eventData.headers['parentNode'],
                        ...studyUpdatedForce.eventData.headers['nodes'],
                    ])
                );
            }
        }
    }, [
        dispatch,
        dofetchNetworkModifications,
        manageNotification,
        studyUpdatedForce,
        cleanClipboard,
    ]);

    const [openNetworkModificationsMenu, setOpenNetworkModificationsMenu] =
        useState(false);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const classes = useStyles();

    const openNetworkModificationConfiguration = useCallback(() => {
        setOpenNetworkModificationsMenu(true);
    }, []);

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsMenu(false);
        setEditData(undefined);
        setEditDataFetchStatus(FetchStatus.IDLE);
    };

    const doDeleteModification = useCallback(() => {
        const selectedModificationsUuid = [...selectedItems.values()].map(
            (item) => item.uuid
        );
        deleteModifications(
            studyUuid,
            currentNode.id,
            selectedModificationsUuid
        )
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
    }, [
        currentNode?.id,
        selectedItems,
        snackError,
        studyUuid,
        cleanClipboard,
        copiedModifications,
    ]);

    const selectedModificationsIds = useCallback(() => {
        const allModificationsIds = modifications.map((m) => m.uuid);
        // sort the selected modifications in the same order as they appear in the whole modifications list
        return Array.from(selectedItems)
            .sort(
                (a, b) =>
                    allModificationsIds.indexOf(a.uuid) -
                    allModificationsIds.indexOf(b.uuid)
            )
            .map((m) => m.uuid);
    }, [modifications, selectedItems]);

    const doCutModifications = useCallback(() => {
        setCopiedModifications(selectedModificationsIds());
        setCopyInfos({
            copyType: CopyType.MOVE,
            originNodeUuid: currentNode.id,
        });
    }, [currentNode?.id, selectedModificationsIds]);

    const doCopyModifications = useCallback(() => {
        setCopiedModifications(selectedModificationsIds());
        setCopyInfos({
            copyType: CopyType.COPY,
            originNodeUuid: currentNode.id,
        });
    }, [currentNode?.id, selectedModificationsIds]);

    const doPasteModifications = useCallback(() => {
        if (copyInfos.copyType === CopyType.MOVE) {
            copyOrMoveModifications(
                studyUuid,
                currentNode.id,
                copiedModifications,
                copyInfos
            ).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCutModificationMsg',
                });
            });
        } else {
            copyOrMoveModifications(
                studyUuid,
                currentNode.id,
                copiedModifications,
                copyInfos
            ).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDuplicateModificationMsg',
                });
            });
        }
    }, [
        copiedModifications,
        currentNode?.id,
        copyInfos,
        snackError,
        studyUuid,
    ]);

    function removeNullFields(data) {
        let dataTemp = data;
        if (dataTemp) {
            Object.keys(dataTemp).forEach((key) => {
                if (
                    dataTemp[key] &&
                    dataTemp[key] !== null &&
                    typeof dataTemp[key] === 'object'
                ) {
                    dataTemp[key] = removeNullFields(dataTemp[key]);
                }

                if (dataTemp[key] === null) {
                    delete dataTemp[key];
                }
            });
        }
        return dataTemp;
    }

    const doEditModification = (modificationUuid, type) => {
        setIsUpdate(true);
        setEditDialogOpen(type);
        setEditDataFetchStatus(FetchStatus.RUNNING);
        const modification = fetchNetworkModification(modificationUuid);
        modification
            .then((res) => {
                return res.json().then((data) => {
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
    };

    const onItemClick = (id) => {
        setOpenNetworkModificationsMenu(false);
        setEditDialogOpen(id);
        setIsUpdate(false);
    };

    const toggleSelectAllModifications = useCallback(() => {
        setToggleSelectAll((oldVal) => !oldVal);
    }, []);

    const renderDialog = () => {
        return subMenuItemsList
            .find((menuItem) => menuItem.id === editDialogOpen)
            .action();
    };

    const commit = useCallback(
        ({ source, destination }) => {
            setIsDragging(false);
            if (
                !currentNode?.id ||
                destination === null ||
                source.index === destination.index
            ) {
                return;
            }
            const res = [...modifications];
            const [item] = res.splice(source.index, 1);
            const before = res[destination.index]?.uuid;
            res.splice(
                destination ? destination.index : modifications.length,
                0,
                item
            );

            /* doing the local change before update to server */
            setModifications(res);
            changeNetworkModificationOrder(
                studyUuid,
                currentNode.id,
                item.uuid,
                before
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'errReorderModificationMsg',
                });
                setModifications(modifications); // rollback
            });
        },
        [modifications, studyUuid, currentNode?.id, snackError]
    );

    const isLoading = () => {
        return (
            notificationIdList.filter(
                (notification) => notification === currentNode?.id
            ).length > 0
        );
    };

    const renderNetworkModificationsList = () => {
        return (
            <DragDropContext
                onDragEnd={commit}
                onDragStart={() => setIsDragging(true)}
            >
                <Droppable
                    droppableId="network-modification-list"
                    isDropDisabled={isLoading() || isAnyNodeBuilding}
                >
                    {(provided) => (
                        <div
                            className={classes.listContainer}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <CheckboxList
                                className={classes.list}
                                onChecked={setSelectedItems}
                                values={modifications}
                                itemComparator={(a, b) => a.uuid === b.uuid}
                                itemRenderer={(props) => (
                                    <ModificationListItem
                                        key={props.item.uuid}
                                        onEdit={doEditModification}
                                        isDragging={isDragging}
                                        isOneNodeBuilding={isAnyNodeBuilding}
                                        disabled={isLoading()}
                                        {...props}
                                    />
                                )}
                                toggleSelectAll={toggleSelectAll}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    };

    const renderNetworkModificationsListTitleLoading = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    <CircularProgress
                        size={'1em'}
                        className={classes.circularProgress}
                    />
                </div>
                <Typography noWrap>
                    <FormattedMessage id={messageId} />
                </Typography>
            </div>
        );
    };

    const renderNetworkModificationsListTitleUpdating = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    <CircularProgress
                        size={'1em'}
                        className={classes.circularProgress}
                    />
                </div>
                <Typography noWrap>
                    <FormattedMessage
                        id={'network_modifications/modifications'}
                    />
                </Typography>
            </div>
        );
    };

    const renderNetworkModificationsListTitle = () => {
        return (
            <div className={classes.modificationsTitle}>
                <div className={classes.icon}>
                    {pendingState && (
                        <CircularProgress
                            size={'1em'}
                            className={classes.circularProgress}
                        />
                    )}
                </div>
                <Typography noWrap>
                    <FormattedMessage
                        id={'network_modification/modificationsCount'}
                        values={{
                            count: modifications ? modifications?.length : '',
                            hide: pendingState,
                        }}
                    />
                </Typography>
            </div>
        );
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
            <Toolbar className={classes.toolbar}>
                <Checkbox
                    className={classes.toolbarCheckbox}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(selectedItems.size)}
                    indeterminate={isPartial(
                        selectedItems.size,
                        modifications?.length
                    )}
                    disableRipple
                    onClick={toggleSelectAllModifications}
                />
                <div className={classes.filler} />
                <IconButton
                    className={classes.toolbarIcon}
                    size={'small'}
                    ref={buttonAddRef}
                    onClick={openNetworkModificationConfiguration}
                    disabled={isAnyNodeBuilding}
                >
                    <AddIcon />
                </IconButton>
                <IconButton
                    onClick={doCutModifications}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={
                        selectedItems.size === 0 ||
                        isAnyNodeBuilding ||
                        !currentNode
                    }
                >
                    <ContentCutIcon />
                </IconButton>
                <IconButton
                    onClick={doCopyModifications}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={selectedItems.size === 0 || isAnyNodeBuilding}
                >
                    <ContentCopyIcon />
                </IconButton>
                <Tooltip
                    title={
                        <FormattedMessage
                            id={'NbModification'}
                            values={{
                                nb: copiedModifications.length,
                                several:
                                    copiedModifications.length > 1 ? 's' : '',
                            }}
                        />
                    }
                >
                    <span>
                        <IconButton
                            onClick={doPasteModifications}
                            size={'small'}
                            className={classes.toolbarIcon}
                            disabled={
                                !(copiedModifications.length > 0) ||
                                isAnyNodeBuilding ||
                                !currentNode
                            }
                        >
                            <ContentPasteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <IconButton
                    onClick={doDeleteModification}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={
                        !(selectedItems?.size > 0) ||
                        isAnyNodeBuilding ||
                        !currentNode
                    }
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            {renderPaneSubtitle()}

            {renderNetworkModificationsList()}

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
