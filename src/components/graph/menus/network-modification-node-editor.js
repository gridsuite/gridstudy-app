/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    fetchNetworkModifications,
    deleteModifications,
    fetchNetworkModification,
    changeNetworkModificationOrder,
    fetchEquipments,
    fetchSubstations,
    fetchLines,
    fetchVoltageLevels,
    fetchVoltageLevelsEquipments,
    duplicateModifications,
} from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import LineAttachToVoltageLevelDialog from '../../dialogs/line-attach-to-voltage-level-dialog';
import LoadModificationDialog from '../../dialogs/load-modification-dialog';
import GeneratorModificationDialog from '../../dialogs/generator-modification-dialog';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import makeStyles from '@mui/styles/makeStyles';
import { equipments } from '../../network/network-equipments';
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
import LoadCreationDialog from '../../dialogs/load-creation-dialog';
import GeneratorCreationDialog from '../../dialogs/generator-creation-dialog';
import ShuntCompensatorCreationDialog from '../../dialogs/shunt-compensator-creation-dialog';
import LineCreationDialog from '../../dialogs/line-creation-dialog';
import TwoWindingsTransformerCreationDialog from '../../dialogs/two-windings-transformer/two-windings-transformer-creation-dialog';
import SubstationCreationDialog from '../../dialogs/substation-creation-dialog';
import VoltageLevelCreationDialog from '../../dialogs/voltage-level-creation-dialog';
import LineSplitWithVoltageLevelDialog from '../../dialogs/line-split-with-voltage-level-dialog';
import EquipmentDeletionDialog from '../../dialogs/equipment-deletion-dialog';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
import LinesAttachToSplitLinesDialog from '../../dialogs/lines-attach-to-split-lines-dialog';

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

const NetworkModificationNodeEditor = () => {
    const network = useSelector((state) => state.network);
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const { snackError, snackWarning } = useSnackMessage();
    const [modifications, setModifications] = useState(undefined);
    const currentTreeNode = useSelector((state) => state.currentTreeNode);

    const currentNodeIdRef = useRef(); // initial empty to get first update
    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();
    const [copiedModifications, setCopiedModifications] = useState([]);

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(undefined);
    const [editData, setEditData] = useState(undefined);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);

    const closeDialog = () => {
        setEditDialogOpen(undefined);
        setEditData(undefined);
    };

    function withDefaultParams(Dialog, props) {
        return (
            <Dialog
                open={true}
                onClose={closeDialog}
                currentNodeUuid={currentTreeNode.id}
                editData={editData}
                {...props}
            />
        );
    }

    function adapt(Dialog, ...augmenters) {
        const nprops = augmenters.reduce((pv, cv) => cv(pv), {});
        return withDefaultParams(Dialog, nprops);
    }

    function withEquipmentModificationOptions(Dialog, resourceType, resource) {
        const equipmentOptionsPromise = fetchEquipments(
            studyUuid,
            currentTreeNode?.id,
            [],
            resourceType,
            resource,
            true
        );

        function withFetchedOptions(p) {
            return {
                ...p,
                equipmentOptionsPromise: equipmentOptionsPromise,
            };
        }

        return adapt(Dialog, withFetchedOptions);
    }

    const dialogs = {
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () =>
                adapt(
                    LoadCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    )
                ),
            icon: <AddIcon />,
        },
        LOAD_MODIFICATION: {
            label: 'ModifyLoad',
            dialog: () =>
                withEquipmentModificationOptions(
                    LoadModificationDialog,
                    'Loads',
                    equipments.loads
                ),
            icon: <AddIcon />,
        },
        GENERATOR_CREATION: {
            label: 'CreateGenerator',
            dialog: () =>
                adapt(
                    GeneratorCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    ),
                    withEquipmentModificationOptions
                ),
            icon: <AddIcon />,
        },
        GENERATOR_MODIFICATION: {
            label: 'ModifyGenerator',
            dialog: () =>
                withEquipmentModificationOptions(
                    GeneratorModificationDialog,
                    'Generator',
                    equipments.generators
                ),
            icon: <AddIcon />,
        },
        SHUNT_COMPENSATOR_CREATION: {
            label: 'CreateShuntCompensator',
            dialog: () =>
                adapt(
                    ShuntCompensatorCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    )
                ),
            icon: <AddIcon />,
        },
        LINE_CREATION: {
            label: 'CreateLine',
            dialog: () =>
                adapt(
                    LineCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    )
                ),
            icon: <AddIcon />,
        },
        TWO_WINDINGS_TRANSFORMER_CREATION: {
            label: 'CreateTwoWindingsTransformer',
            dialog: () =>
                adapt(
                    TwoWindingsTransformerCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    ),
                    withEquipmentModificationOptions(
                        'Voltage-levels-equipments',
                        equipments.voltageLevelsEquipments
                    )
                ),
            icon: <AddIcon />,
        },
        SUBSTATION_CREATION: {
            label: 'CreateSubstation',
            dialog: () =>
                adapt(
                    SubstationCreationDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    )
                ),
            icon: <AddIcon />,
        },
        VOLTAGE_LEVEL_CREATION: {
            label: 'CreateVoltageLevel',
            dialog: () =>
                adapt(
                    VoltageLevelCreationDialog,
                    withEquipmentModificationOptions(
                        'Substations',
                        equipments.substations
                    )
                ),
            icon: <AddIcon />,
        },
        LINE_SPLIT_WITH_VOLTAGE_LEVEL: {
            label: 'LineSplitWithVoltageLevel',
            dialog: () =>
                adapt(
                    LineSplitWithVoltageLevelDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    ),
                    withEquipmentModificationOptions('Lines', equipments.lines)
                ),
            icon: <AddIcon />,
        },
        LINE_ATTACH_TO_VOLTAGE_LEVEL: {
            label: 'LineAttachToVoltageLevel',
            dialog: () =>
                adapt(
                    LineAttachToVoltageLevelDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    ),
                    withEquipmentModificationOptions('Lines', equipments.lines),
                    withEquipmentModificationOptions(
                        'Substations',
                        equipments.substations
                    )
                ),
            icon: <AddIcon />,
        },
        LINES_ATTACH_TO_SPLIT_LINES: {
            label: 'LinesAttachToSplitLines',
            dialog: () =>
                adapt(
                    LinesAttachToSplitLinesDialog,
                    withEquipmentModificationOptions(
                        'Voltage-levels',
                        equipments.voltageLevels
                    ),
                    withEquipmentModificationOptions('Lines', equipments.lines),
                    withEquipmentModificationOptions(
                        'Substations',
                        equipments.substations
                    )
                ),
            icon: <AddIcon />,
        },
        EQUIPMENT_DELETION: {
            label: 'DeleteEquipment',
            dialog: () => withDefaultParams(EquipmentDeletionDialog),
            icon: <DeleteIcon />,
        },
    };

    const fillNotification = useCallback(
        (study, messageId) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            dispatch(addNotification(study.eventData.headers['parentNode']));
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
        setLaunchLoader(true);
        fetchNetworkModifications(studyUuid, currentTreeNode?.id)
            .then((res) => {
                // Check if during asynchronous request currentNode has already changed
                // otherwise accept fetch results
                if (currentTreeNode.id === currentNodeIdRef.current) {
                    setModifications(res);
                }
            })
            .catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                });
            })
            .finally(() => {
                setPendingState(false);
                setLaunchLoader(false);
                dispatch(setModificationsInProgress(false));
            });
    }, [studyUuid, currentTreeNode.id, snackError, dispatch]);

    useEffect(() => {
        setEditDialogOpen(editData?.type);
    }, [editData]);

    useEffect(() => {
        // first time then fetch modifications
        // OR next time if currentNodeId changed then fetch modifications
        if (
            !currentNodeIdRef.current ||
            currentNodeIdRef.current !== currentTreeNode.id
        ) {
            currentNodeIdRef.current = currentTreeNode.id;
            // Current node has changed then clear the modifications list
            setModifications([]);
            dofetchNetworkModifications();
        }
    }, [currentTreeNode, dofetchNetworkModifications]);

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
                    removeNotificationByNode(
                        studyUpdatedForce.eventData.headers['parentNode']
                    )
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
            currentTreeNode?.id,
            [...selectedItems.values()].map((item) => item.uuid)
        )
            .then()
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errDeleteModificationMsg',
                });
            });
    }, [currentTreeNode?.id, selectedItems, snackError, studyUuid]);

    const doCopyModification = useCallback(() => {
        // just memorize the list of selected modifications
        setCopiedModifications(
            Array.from(selectedItems).map((item) => item.uuid)
        );
    }, [selectedItems]);

    const doPasteModification = useCallback(() => {
        duplicateModifications(
            studyUuid,
            currentTreeNode.id,
            copiedModifications
        )
            .then((modificationsInFailure) => {
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
    }, [
        copiedModifications,
        currentTreeNode.id,
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
                    setEditData(removeNullFields(data[0]));
                });
            })
            .catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
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
            if (destination === null || source.index === destination.index)
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
                currentTreeNode?.id,
                item.uuid,
                before
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'errReorderModificationMsg',
                });
                setModifications(modifications); // rollback
            });
        },
        [modifications, studyUuid, currentTreeNode?.id, snackError]
    );

    const isLoading = () => {
        return (
            notificationIdList.filter(
                (notification) => notification === currentTreeNode?.id
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
                                isAnyNodeBuilding
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
                    disabled={!(selectedItems?.size > 0) || isAnyNodeBuilding}
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
                network={network}
                currentNodeUuid={currentTreeNode?.id}
                onOpenDialog={setEditDialogOpen}
                dialogs={dialogs}
            />
            {editDialogOpen && renderDialog()}
        </>
    );
};

export default NetworkModificationNodeEditor;
