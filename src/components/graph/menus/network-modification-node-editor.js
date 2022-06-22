/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchNetworkModifications,
    deleteModifications,
    fetchNetworkModification,
    changeNetworkModificationOrder,
    fetchEquipments,
} from '../../../utils/rest-api';
import { useSnackMessage } from '../../../utils/messages';
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
    LinearProgress,
    Toolbar,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import LoadCreationDialog from '../../dialogs/load-creation-dialog';
import GeneratorCreationDialog from '../../dialogs/generator-creation-dialog';
import ShuntCompensatorCreationDialog from '../../dialogs/shunt-compensator-creation-dialog';
import LineCreationDialog from '../../dialogs/line-creation-dialog';
import TwoWindingsTransformerCreationDialog from '../../dialogs/two-windings-transformer-creation-dialog';
import SubstationCreationDialog from '../../dialogs/substation-creation-dialog';
import VoltageLevelCreationDialog from '../../dialogs/voltage-level-creation-dialog';
import LineSplitWithVoltageLevelDialog from '../../dialogs/line-split-with-voltage-level-dialog';
import EquipmentDeletionDialog from '../../dialogs/equipment-deletion-dialog';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckboxList from '../../util/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useIsAnyNodeBuilding } from '../../util/is-any-node-building-hook';
import {
    addNotification,
    removeNotificationByNode,
} from '../../../redux/actions';
import { UPDATE_TYPE } from '../../network/constants';

const useStyles = makeStyles((theme) => ({
    listContainer: {
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    list: {
        paddingTop: theme.spacing(0),
        // backgroundColor: 'red',
        flexGrow: 1,
    },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: theme.spacing(3),
    },
    modificationCount: {
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
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
        color: theme.palette.primary.main,
    },
    linearProgress: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2),
        color: theme.palette.primary.main,
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
}));

function isChecked(s1) {
    return s1 !== 0;
}

function isPartial(s1, s2) {
    if (s1 === 0) return false;
    return s1 !== s2;
}

const NetworkModificationNodeEditor = ({ selectedNode }) => {
    const network = useSelector((state) => state.network);
    const workingNode = useSelector((state) => state.workingTreeNode);
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const { snackError } = useSnackMessage();
    const [modifications, setModifications] = useState(undefined);
    const selectedNodeRef = useRef(); // initial empty to get first update

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();

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
                selectedNodeUuid={selectedNode.id}
                workingNodeUuid={workingNode.id}
                editData={editData}
                {...props}
            />
        );
    }

    function adapt(Dialog, ...augmenters) {
        const nprops = augmenters.reduce((pv, cv) => cv(pv), {});
        return withDefaultParams(Dialog, nprops);
    }

    function withVLs(p) {
        return {
            ...p,
            voltageLevelOptions: network?.voltageLevels,
        };
    }

    function withLines(p) {
        return {
            ...p,
            lineOptions: network?.lines,
        };
    }

    function withSubstations(p) {
        return {
            ...p,
            substationOptions: network?.substations,
        };
    }

    function withEquipmentModificationOptions(
        Dialog,
        resourceType,
        resource,
        props
    ) {
        const fetchedEquipmentOptions = fetchEquipments(
            studyUuid,
            selectedNode?.id,
            [],
            resourceType,
            resource,
            true
        );

        function withFetchedOptions(p) {
            return {
                ...p,
                fetchedEquipmentOptions: fetchedEquipmentOptions,
            };
        }

        return adapt(Dialog, withVLs, withFetchedOptions);
    }

    const dialogs = {
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () => adapt(LoadCreationDialog, withVLs),
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
            dialog: () => adapt(GeneratorCreationDialog, withVLs),
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
            dialog: () => adapt(ShuntCompensatorCreationDialog, withVLs),
            icon: <AddIcon />,
        },
        LINE_CREATION: {
            label: 'CreateLine',
            dialog: () => adapt(LineCreationDialog, withVLs),
            icon: <AddIcon />,
        },
        TWO_WINDINGS_TRANSFORMER_CREATION: {
            label: 'CreateTwoWindingsTransformer',
            dialog: () => adapt(TwoWindingsTransformerCreationDialog, withVLs),
            icon: <AddIcon />,
        },
        SUBSTATION_CREATION: {
            label: 'CreateSubstation',
            dialog: () => adapt(SubstationCreationDialog, withVLs),
            icon: <AddIcon />,
        },
        VOLTAGE_LEVEL_CREATION: {
            label: 'CreateVoltageLevel',
            dialog: () => adapt(VoltageLevelCreationDialog, withSubstations),
            icon: <AddIcon />,
        },
        LINE_SPLIT_WITH_VOLTAGE_LEVEL: {
            label: 'LineSplitWithVoltageLevel',
            dialog: () =>
                adapt(
                    LineSplitWithVoltageLevelDialog,
                    withVLs,
                    withLines,
                    withSubstations
                ),
            icon: <AddIcon />,
        },
        LINE_ATTACH_TO_VOLTAGE_LEVEL: {
            label: 'LineAttachToVoltageLevel',
            dialog: () =>
                adapt(
                    LineAttachToVoltageLevelDialog,
                    withVLs,
                    withLines,
                    withSubstations
                ),
            icon: <AddIcon />,
        },
        deleteEquipment: {
            label: 'DeleteEquipment',
            dialog: () => withDefaultParams(EquipmentDeletionDialog),
            icon: <DeleteIcon />,
        },
    };

    useEffect(() => {
        setEditDialogOpen(editData?.type);
    }, [editData]);

    useEffect(() => {
        var discardResult = false;
        if (selectedNode !== selectedNodeRef.current) {
            // loader when opening a modification panel (current user only)
            setLaunchLoader(true);
            selectedNodeRef.current = selectedNode;
            if (!selectedNode.networkModification) {
                setModifications([]);
                setLaunchLoader(false);
            } else {
                fetchNetworkModifications(selectedNode.networkModification)
                    .then((res) => {
                        if (
                            selectedNodeRef.current === selectedNode &&
                            !discardResult
                        )
                            setModifications(res.status ? [] : res);
                    })
                    .catch((err) => snackError(err.message))
                    .finally(() => {
                        setLaunchLoader(false);
                    });
            }
        }
        return () => {
            discardResult = true;
        };
    }, [selectedNode, setModifications, snackError, dispatch]);

    const fillNotification = useCallback(
        (study, messageId) => {
            // (work for all users)
            // specific message id for each action type
            setMessageId(messageId);
            console.debug('SBO notif: ', messageId);
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

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            console.debug(
                'SBO studyUpdatedForce: ',
                studyUpdatedForce.eventData.headers
            );

            if (
                selectedNodeRef.current?.id !==
                studyUpdatedForce.eventData.headers['parentNode']
            )
                return;

            if (
                UPDATE_TYPE.includes(
                    studyUpdatedForce.eventData.headers['updateType']
                )
            ) {
                manageNotification(studyUpdatedForce);
            }
            // notify  finished action (success or error => we remove the loader)
            // error handling in dialog for each equipment (snackbar with specific error showed only for current user)
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'UPDATE_FINISHED'
            ) {
                dispatch(
                    removeNotificationByNode(
                        studyUpdatedForce.eventData.headers['parentNode']
                    )
                );
            }
        }
    }, [dispatch, manageNotification, studyUpdatedForce]);

    const [openNetworkModificationsDialog, setOpenNetworkModificationsDialog] =
        useState(false);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const classes = useStyles();

    const openNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsDialog(true);
    };

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsDialog(false);
        setEditData(undefined);
    };

    const doDeleteModification = () => {
        deleteModifications(
            studyUuid,
            selectedNode,
            [...selectedItems.values()].map((item) => item.uuid)
        ).then();
    };

    const doEditModification = (modificationUuid) => {
        const modification = fetchNetworkModification(modificationUuid);
        modification.then((res) => {
            res.json().then((data) => {
                //remove all null values to avoid showing a "null" in the forms
                Object.keys(data[0]).forEach((key) => {
                    if (data[0][key] === null) {
                        delete data[0][key];
                    }
                });
                setEditData(data[0]);
            });
        });
    };

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
                selectedNode.id,
                item.uuid,
                before
            ).catch((errorMessage) => {
                snackError(errorMessage, 'errReorderModificationMsg');
                setModifications(modifications); // rollback
            });
        },
        [modifications, studyUuid, selectedNode.id, snackError]
    );

    const isLoading = () => {
        if (notificationIdList.length === 0) return false;

        return (
            notificationIdList.filter(
                (notification) => notification === selectedNode?.id
            ).length > 0
        );
    };

    const renderNetworkModificationsListLoading = () => {
        return (
            <div className={classes.notification}>
                <CircularProgress className={classes.circularProgress} />
                <FormattedMessage id={messageId} />
            </div>
        );
    };

    const renderNetworkModificationsListUpdating = () => {
        return (
            <div className={classes.notification}>
                <LinearProgress className={classes.linearProgress} />
                <FormattedMessage id={'network_modifications/modifications'} />
            </div>
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

    const renderPaneContent = () => {
        if (isLoading()) {
            return renderNetworkModificationsListLoading();
        } else if (launchLoader) {
            return renderNetworkModificationsListUpdating();
        } else {
            return renderNetworkModificationsList();
        }
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
                    onClick={() => setToggleSelectAll((oldVal) => !oldVal)}
                />
                <div className={classes.filler} />
                <IconButton
                    onClick={doDeleteModification}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={!(selectedItems?.size > 0) || isAnyNodeBuilding}
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            <Typography className={classes.modificationCount}>
                <FormattedMessage
                    id={'network_modification/modificationsCount'}
                    values={{
                        count: modifications ? modifications?.length : '',
                    }}
                />
            </Typography>
            {renderPaneContent()}
            <Fab
                className={classes.addButton}
                color="primary"
                onClick={openNetworkModificationConfiguration}
                disabled={isAnyNodeBuilding}
            >
                <AddIcon />
            </Fab>

            <NetworkModificationDialog
                open={openNetworkModificationsDialog}
                onClose={closeNetworkModificationConfiguration}
                network={network}
                selectedNodeUuid={selectedNode.id}
                workingNodeUuid={workingNode?.id}
                onOpenDialog={setEditDialogOpen}
                dialogs={dialogs}
            />
            {editDialogOpen && renderDialog()}
        </>
    );
};

NetworkModificationNodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default NetworkModificationNodeEditor;
