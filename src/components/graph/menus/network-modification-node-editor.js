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
import { addNotification } from '../../../redux/actions';

const useStyles = makeStyles((theme) => ({
    list: {
        paddingTop: 0,
        overflowY: 'auto',
    },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: theme.spacing(3),
    },
    modificationCount: {
        margin: 0,
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    toolbar: {
        padding: theme.spacing(0),
        paddingLeft: theme.spacing(1),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
        flexShrink: 0,
    },

    toolbarIcon: {
        padding: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        minWidth: 0,
    },
    filler: {
        flexGrow: 1,
    },
    dividerTool: {
        background: theme.palette.primary.main,
    },
    circularProgress: {
        marginRight: theme.spacing(2),
    },
    linearProgress: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2),
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
    const notificationList = useSelector((state) => state.notificationList);
    const errorList = useSelector((state) => state.errorList);
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
        if (selectedNode !== selectedNodeRef.current) {
            setLaunchLoader(true);
            selectedNodeRef.current = selectedNode;
            if (!selectedNode.networkModification) {
                setModifications([]);
                setLaunchLoader(false);
            } else {
                fetchNetworkModifications(selectedNode.networkModification)
                    .then((res) => {
                        if (selectedNodeRef.current === selectedNode)
                            setModifications(res.status ? [] : res);
                    })
                    .catch((err) => snackError(err.message))
                    .finally(() => {
                        setLaunchLoader(false);
                    });
            }
        }
    }, [
        selectedNode,
        setModifications,
        selectedNodeRef,
        snackError,
        dispatch,
        errorList,
        notificationList,
    ]);

    const fillNotification = useCallback(
        (study, messageId) => {
            const notification = {
                studyUuid: study.eventData.headers['studyUuid'],
                nodeUuid: study.eventData.headers['parentNode'],
            };
            setMessageId(messageId);
            dispatch(addNotification(notification));
        },
        [dispatch]
    );

    const manageNotification = useCallback(
        (study) => {
            let messageId = '';
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'creatingInProgress'
            ) {
                messageId = 'network_modifications/creatingModification';
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'updatingInProgress'
            ) {
                messageId = 'network_modifications/updatingModification';
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'deletingInProgress'
            ) {
                messageId = 'network_modifications/deletingModification';
            }
            fillNotification(studyUpdatedForce, messageId);
        },
        [fillNotification, studyUpdatedForce]
    );

    useEffect(() => {
        const updateType = [
            'creatingInProgress',
            'updatingInProgress',
            'deletingInProgress',
        ];
        if (studyUpdatedForce.eventData.headers) {
            if (
                selectedNodeRef.current.id !==
                studyUpdatedForce.eventData.headers['parentNode']
            )
                return;

            if (
                updateType.includes(
                    studyUpdatedForce.eventData.headers['updateType']
                )
            ) {
                manageNotification(studyUpdatedForce);
            }
        }
    }, [dispatch, manageNotification, studyUpdatedForce]);

    const [openNetworkModificationsDialog, setOpenNetworkModificationsDialog] =
        useState(false);

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
            ).catch((e) => {
                snackError(e.message, 'errReorderModificationMsg');
                setModifications(modifications); // rollback
            });
        },
        [modifications, studyUuid, selectedNode.id, snackError]
    );

    const isLoading = () => {
        if (notificationList.length === 0) return false;

        let res = notificationList.filter(
            (notification) => notification?.nodeUuid === selectedNode?.id
        );
        if (res.length > 0) return true;
        return false;
    };

    return (
        <>
            <Toolbar className={classes.toolbar}>
                <Checkbox
                    className={classes.toolbarIcon}
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
                    disabled={!(selectedItems?.size > 0)}
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
            <DragDropContext
                onDragEnd={commit}
                onDragStart={() => setIsDragging(true)}
            >
                <Droppable droppableId="network-modification-list">
                    {(provided) => (
                        <div
                            className={classes.list}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {isLoading() ? (
                                <div className={classes.notification}>
                                    <CircularProgress
                                        size={18}
                                        className={classes.circularProgress}
                                    />
                                    <FormattedMessage id={messageId} />
                                </div>
                            ) : (
                                <CheckboxList
                                    onChecked={setSelectedItems}
                                    values={modifications}
                                    itemRenderer={(props) => (
                                        <ModificationListItem
                                            key={props.item.uuid}
                                            onEdit={doEditModification}
                                            isDragging={isDragging}
                                            network={network}
                                            {...props}
                                        />
                                    )}
                                    toggleSelectAll={toggleSelectAll}
                                />
                            )}
                            {provided.placeholder}
                            {launchLoader && (
                                <div className={classes.notification}>
                                    <LinearProgress
                                        className={classes.linearProgress}
                                    />
                                    <FormattedMessage
                                        id={
                                            'network_modifications/modifications'
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Fab
                className={classes.addButton}
                color="primary"
                onClick={openNetworkModificationConfiguration}
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
