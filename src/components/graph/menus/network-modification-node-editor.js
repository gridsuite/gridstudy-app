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
import { useSelector } from 'react-redux';
import LoadModificationDialog from '../../dialogs/load-modification-dialog';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import makeStyles from '@mui/styles/makeStyles';
import { equipments } from '../../network/network-equipments';
import { ModificationListItem } from './modification-list-item';
import { Checkbox, Fab, Toolbar, Typography } from '@mui/material';
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
import EquipmentDeletionDialog from '../../dialogs/equipment-deletion-dialog';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckboxList from '../../util/checkbox-list';
import IconButton from '@mui/material/IconButton';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

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
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const { snackError } = useSnackMessage();
    const [modifications, setModifications] = useState(undefined);
    const selectedNodeRef = useRef(); // initial empty to get first update

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();

    const [isDragging, setIsDragging] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(undefined);
    const [editData, setEditData] = useState(undefined);

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

    function withVoltageLevel(Dialog, props) {
        return withDefaultParams(Dialog, {
            ...props,
            voltageLevelOptions: network?.voltageLevels,
        });
    }

    function withSubstationOption(Dialog, props) {
        return withDefaultParams(Dialog, {
            ...props,
            substationOptions: network?.substations,
        });
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

        return withVoltageLevel(Dialog, {
            ...props,
            fetchedEquipmentOptions: fetchedEquipmentOptions,
        });
    }

    const dialogs = {
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () => withVoltageLevel(LoadCreationDialog),
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
            dialog: () => withVoltageLevel(GeneratorCreationDialog),
            icon: <AddIcon />,
        },
        SHUNT_COMPENSATOR_CREATION: {
            label: 'CreateShuntCompensator',
            dialog: () => withVoltageLevel(ShuntCompensatorCreationDialog),
            icon: <AddIcon />,
        },
        LINE_CREATION: {
            label: 'CreateLine',
            dialog: () => withVoltageLevel(LineCreationDialog),
            icon: <AddIcon />,
        },
        TWO_WINDINGS_TRANSFORMER_CREATION: {
            label: 'CreateTwoWindingsTransformer',
            dialog: () =>
                withVoltageLevel(TwoWindingsTransformerCreationDialog),
            icon: <AddIcon />,
        },
        SUBSTATION_CREATION: {
            label: 'CreateSubstation',
            dialog: () => withVoltageLevel(SubstationCreationDialog),
            icon: <AddIcon />,
        },
        VOLTAGE_LEVEL_CREATION: {
            label: 'CreateVoltageLevel',
            dialog: () => withSubstationOption(VoltageLevelCreationDialog),
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
            selectedNodeRef.current = selectedNode;
            if (!selectedNode.networkModification) setModifications([]);
            else {
                fetchNetworkModifications(selectedNode.networkModification)
                    .then((res) => {
                        if (selectedNodeRef.current === selectedNode)
                            setModifications(res.status ? [] : res);
                    })
                    .catch((err) => snackError(err.message));
            }
        }
    }, [selectedNode, setModifications, selectedNodeRef, snackError]);

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
                    values={{ count: modifications?.length }}
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
                            <CheckboxList
                                onChecked={setSelectedItems}
                                values={modifications}
                                itemRenderer={(props) => (
                                    <ModificationListItem
                                        key={props.item.uuid}
                                        onEdit={doEditModification}
                                        isDragging={isDragging}
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
