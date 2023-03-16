/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    changeNetworkModificationOrder,
    copyOrMoveModifications,
    deleteModifications,
    fetchNetworkModification,
    fetchNetworkModifications,
    fetchVoltageLevelsIdAndTopology,
} from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import LineAttachToVoltageLevelDialog from '../../refactor/dialogs/line-attach-to-voltage-level/line-attach-to-voltage-level-dialog';
import GeneratorModificationDialog from '../../dialogs/generator-modification-dialog';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import makeStyles from '@mui/styles/makeStyles';
import { ModificationListItem } from './modification-list-item';
import {
    Checkbox,
    CircularProgress,
    Fab,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import LoadCreationDialog from '../../refactor/dialogs/load-creation/load-creation-dialog';
import LoadModificationDialog from '../../refactor/dialogs/load-modification/load-modification-dialog';
import LineCreationDialog from 'components/refactor/dialogs/line-creation/line-creation-dialog';
import TwoWindingsTransformerCreationDialog from '../../refactor/dialogs/two-windings-transformer-creation/two-windings-transformer-creation-dialog';
import ShuntCompensatorCreationDialog from '../../refactor/dialogs/shunt-compensator-creation/shunt-compensator-creation-dialog';
import LineSplitWithVoltageLevelDialog from '../../refactor/dialogs/line-split-with-voltage-level/line-split-with-voltage-level-dialog';
import EquipmentDeletionDialog from '../../refactor/dialogs/equipment-deletion/equipment-deletion-dialog.js';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckboxList from '../../util/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useIsAnyNodeBuilding } from '../../util/is-any-node-building-hook';
import {
    addNotification,
    removeNotificationByNode,
    setModificationsInProgress,
} from '../../../redux/actions';
import { UPDATE_TYPE } from '../../network/constants';
import LoadScalingDialog from 'components/refactor/dialogs/load-scaling/load-scaling-dialog';
import VoltageLevelCreationDialog from 'components/refactor/dialogs/voltage-level-creation/voltage-level-creation-dialog';
import GeneratorCreationDialog from 'components/refactor/dialogs/generator-creation/generator-creation-dialog';
import DeleteVoltageLevelOnLineDialog from 'components/refactor/dialogs/delete-voltage-level-on-line/delete-voltage-level-on-line-dialog';
import DeleteAttachingLineDialog from 'components/refactor/dialogs/delete-attaching-line/delete-attaching-line-dialog';
import LinesAttachToSplitLinesDialog from 'components/refactor/dialogs/lines-attach-to-split-lines/lines-attach-to-split-lines-dialog';
import GeneratorScalingDialog from 'components/refactor/dialogs/generator-scaling/generator-scaling-dialog';
import SubstationCreationDialog from 'components/refactor/dialogs/substation-creation/substation-creation-dialog';

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
    addButton: {
        position: 'absolute',
        bottom: theme.spacing(-1.5),
        right: 0,
        margin: theme.spacing(3),
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
    if (s1 === 0) return false;
    return s1 !== s2;
}

export const CopyType = {
    COPY: 'COPY',
    MOVE: 'MOVE',
};

export function withVLsIdsAndTopology(studyUuid, currentTreeNodeId) {
    const voltageLevelsIdsAndTopologyPromise = fetchVoltageLevelsIdAndTopology(
        studyUuid,
        currentTreeNodeId
    );
    return voltageLevelsIdsAndTopologyPromise;
}

const NetworkModificationNodeEditor = () => {
    const network = useSelector((state) => state.network);
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const { snackInfo, snackError, snackWarning } = useSnackMessage();
    const [modifications, setModifications] = useState(undefined);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const currentNodeIdRef = useRef(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();
    const [copiedModifications, setCopiedModifications] = useState([]);
    const [copyInfos, setCopyInfos] = useState(null);

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(undefined);
    const [editData, setEditData] = useState(undefined);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);

    const cleanClipboard = () => {
        if (copiedModifications.length <= 0) return;
        setCopyInfos(null);
        setCopiedModifications([]);
        snackInfo({
            messageId: 'CopiedModificationInvalidationMessage',
        });
    };

    // TODO this is not complete.
    // We should clean Clipboard on notifications when another user edit
    // a modification on a public study which is in the clipboard.
    // We don't have precision on notifications to do this for now.
    const handleValidatedDialog = () => {
        if (editData?.uuid && copiedModifications.includes(editData?.uuid))
            cleanClipboard();
    };

    const handleCloseDialog = (e, reason) => {
        setEditDialogOpen(undefined);
        setEditData(undefined);
    };

    function withDefaultParams(Dialog, props) {
        return (
            <Dialog
                open={true}
                onClose={handleCloseDialog}
                onValidated={handleValidatedDialog}
                currentNode={currentNode}
                studyUuid={studyUuid}
                editData={editData}
                {...props}
            />
        );
    }

    function adapt(Dialog, ...augmenters) {
        const nprops = augmenters.reduce((pv, cv) => cv(pv), {});
        return withDefaultParams(Dialog, nprops);
    }

    function withVLsIdsAndTopology(p) {
        const voltageLevelsIdsAndTopologyPromise =
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNode?.id);
        return {
            ...p,
            voltageLevelsIdsAndTopologyPromise:
                voltageLevelsIdsAndTopologyPromise,
        };
    }

    const dialogs = {
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () => adapt(LoadCreationDialog),
            icon: <AddIcon />,
        },
        LOAD_MODIFICATION: {
            label: 'ModifyLoad',
            dialog: () => adapt(LoadModificationDialog),
            icon: <AddIcon />,
        },
        GENERATOR_CREATION: {
            label: 'CreateGenerator',
            dialog: () => adapt(GeneratorCreationDialog),
            icon: <AddIcon />,
        },
        GENERATOR_MODIFICATION: {
            label: 'ModifyGenerator',
            dialog: () =>
                adapt(GeneratorModificationDialog, withVLsIdsAndTopology),
            icon: <AddIcon />,
        },
        SHUNT_COMPENSATOR_CREATION: {
            label: 'CreateShuntCompensator',
            dialog: () => adapt(ShuntCompensatorCreationDialog),
            icon: <AddIcon />,
        },
        LINE_CREATION: {
            label: 'CreateLine',
            dialog: () => adapt(LineCreationDialog),
            icon: <AddIcon />,
        },
        TWO_WINDINGS_TRANSFORMER_CREATION: {
            onlyDeveloperMode: true,
            label: 'CreateTwoWindingsTransformer',
            dialog: () => adapt(TwoWindingsTransformerCreationDialog),
            icon: <AddIcon />,
        },
        SUBSTATION_CREATION: {
            label: 'CreateSubstation',
            dialog: () => adapt(SubstationCreationDialog),
            icon: <AddIcon />,
        },
        VOLTAGE_LEVEL_CREATION: {
            label: 'CreateVoltageLevel',
            dialog: () => adapt(VoltageLevelCreationDialog),
            icon: <AddIcon />,
        },
        LINE_SPLIT_WITH_VOLTAGE_LEVEL: {
            label: 'LineSplitWithVoltageLevel',
            dialog: () => adapt(LineSplitWithVoltageLevelDialog),
            icon: <AddIcon />,
        },
        LINE_ATTACH_TO_VOLTAGE_LEVEL: {
            label: 'LineAttachToVoltageLevel',
            dialog: () => adapt(LineAttachToVoltageLevelDialog),
            icon: <AddIcon />,
        },
        LINES_ATTACH_TO_SPLIT_LINES: {
            label: 'LinesAttachToSplitLines',
            dialog: () => adapt(LinesAttachToSplitLinesDialog),
            icon: <AddIcon />,
        },
        GENERATOR_SCALING: {
            label: 'GeneratorScaling',
            dialog: () => adapt(GeneratorScalingDialog),
            icon: <AddIcon />,
        },
        LOAD_SCALING: {
            label: 'LoadScaling',
            dialog: () => adapt(LoadScalingDialog),
            icon: <AddIcon />,
        },
        DELETE_VOLTAGE_LEVEL_ON_LINE: {
            label: 'DeleteVoltageLevelOnLine',
            dialog: () => adapt(DeleteVoltageLevelOnLineDialog),
            icon: <AddIcon />,
        },
        DELETE_ATTACHING_LINE: {
            label: 'DeleteAttachingLine',
            dialog: () => adapt(DeleteAttachingLineDialog),
            icon: <AddIcon />,
        },
        EQUIPMENT_DELETION: {
            label: 'DeleteEquipment',
            dialog: () => adapt(EquipmentDeletionDialog),
            icon: <DeleteIcon />,
        },
    };

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
        if (currentNode?.type !== 'NETWORK_MODIFICATION') return;
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
                currentNodeIdRef.current !==
                studyUpdatedForce.eventData.headers['parentNode']
            )
                return;

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
    ]);

    const [openNetworkModificationsDialog, setOpenNetworkModificationsDialog] =
        useState(false);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const classes = useStyles();

    const openNetworkModificationConfiguration = useCallback(() => {
        setOpenNetworkModificationsDialog(true);
    }, []);

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsDialog(false);
        setEditData(undefined);
    };

    const doDeleteModification = useCallback(() => {
        deleteModifications(
            studyUuid,
            currentNode.id,
            [...selectedItems.values()].map((item) => item.uuid)
        )
            .then()
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDeleteModificationMsg',
                });
            });
    }, [currentNode?.id, selectedItems, snackError, studyUuid]);

    const doCutModification = useCallback(() => {
        // just memorize the list of selected modifications
        setCopiedModifications(
            Array.from(selectedItems).map((item) => item.uuid)
        );
        setCopyInfos({
            copyType: CopyType.MOVE,
            originNodeUuid: currentNode.id,
        });
    }, [currentNode?.id, selectedItems]);

    const doCopyModification = useCallback(() => {
        // just memorize the list of selected modifications
        setCopiedModifications(
            Array.from(selectedItems).map((item) => item.uuid)
        );
        setCopyInfos({ copyType: CopyType.COPY });
    }, [selectedItems]);

    const doPasteModification = useCallback(() => {
        if (copyInfos.copyType === CopyType.MOVE) {
            copyOrMoveModifications(
                studyUuid,
                currentNode.id,
                copiedModifications,
                copyInfos
            )
                .then((message) => {
                    let modificationsInFailure = JSON.parse(message);
                    if (modificationsInFailure.length > 0) {
                        console.warn(
                            'Modifications not moved:',
                            modificationsInFailure
                        );
                        snackWarning({
                            messageTxt: modificationsInFailure.length,
                            headerId: 'warnCutModificationMsg',
                        });
                    }
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
            copyOrMoveModifications(
                studyUuid,
                currentNode.id,
                copiedModifications,
                copyInfos
            )
                .then((message) => {
                    let modificationsInFailure = JSON.parse(message);
                    if (modificationsInFailure.length > 0) {
                        console.warn(
                            'Modifications not pasted:',
                            modificationsInFailure
                        );
                        snackWarning({
                            messageTxt: modificationsInFailure.length,
                            headerId: 'warnDuplicateModificationMsg',
                        });
                    }
                })
                .catch((errmsg) => {
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
        snackWarning,
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

    const doEditModification = (modificationUuid) => {
        const modification = fetchNetworkModification(modificationUuid);
        modification
            .then((res) => {
                res.json().then((data) => {
                    //remove all null values to avoid showing a "null" in the forms
                    setEditData(removeNullFields(data));
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
            });
    };

    const toggleSelectAllModifications = useCallback(() => {
        setToggleSelectAll((oldVal) => !oldVal);
    }, []);

    const renderDialog = () => {
        return dialogs[editDialogOpen].dialog();
    };

    const commit = useCallback(
        ({ source, destination }) => {
            setIsDragging(false);
            if (
                !currentNode?.id ||
                destination === null ||
                source.index === destination.index
            )
                return;
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

    const renderNetworkModificationsList = (network) => {
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
                                        network={network}
                                        isOneNodeBuilding={isAnyNodeBuilding}
                                        {...props}
                                        disabled={isLoading()}
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
        if (isLoading()) return renderNetworkModificationsListTitleLoading();
        if (launchLoader) return renderNetworkModificationsListTitleUpdating();
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
                    onClick={doCutModification}
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
                    onClick={doCopyModification}
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
                            onClick={doPasteModification}
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

            {renderNetworkModificationsList(network)}
            <Fab
                className={classes.addButton}
                color="primary"
                size="medium"
                onClick={openNetworkModificationConfiguration}
                disabled={isAnyNodeBuilding}
            >
                <AddIcon />
            </Fab>

            <NetworkModificationDialog
                open={openNetworkModificationsDialog}
                onClose={closeNetworkModificationConfiguration}
                currentNodeUuid={currentNode?.id}
                onOpenDialog={setEditDialogOpen}
                dialogs={dialogs}
            />
            {editDialogOpen && renderDialog()}
        </>
    );
};

export default NetworkModificationNodeEditor;
