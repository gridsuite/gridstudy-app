/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchNetworkModifications,
    deleteModifications,
    fetchNetworkModification,
} from '../../../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { ModificationListItem } from './modification-list-item';
import { Checkbox, Fab, Toolbar, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
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
import DeleteIcon from '@material-ui/icons/Delete';
import CheckboxList from '../../util/checkbox-list';
import IconButton from '@material-ui/core/IconButton';

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
        color: 'white',
    },
    toolbar: {
        padding: theme.spacing(0),
        paddingLeft: theme.spacing(1),
        border: theme.spacing(1),
        minHeight: 0,
        flexShrink: 0,
        margin: 0,
    },

    toolbarIcon: {
        padding: theme.spacing(1),
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

    const [modifications, setModifications] = useState(undefined);
    const { enqueueSnackbar } = useSnackbar();
    const selectedNodeRef = useRef(); // initial empty to get first update

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();

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

    const dialogs = {
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () => withVoltageLevel(LoadCreationDialog),
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
                    .catch((err) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: err.message,
                            enqueueSnackbar,
                        })
                    );
            }
        }
    }, [selectedNode, setModifications, enqueueSnackbar, selectedNodeRef]);

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
        );
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

    return (
        <>
            <Toolbar className={classes.toolbar} variant={'dense'}>
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
            <CheckboxList
                onChecked={setSelectedItems}
                className={classes.list}
                values={modifications}
                setChecked={setSelectedItems}
                itemRenderer={(props) => (
                    <ModificationListItem
                        key={props.item.uuid}
                        onEdit={doEditModification}
                        {...props}
                    />
                )}
                toggleSelectAll={toggleSelectAll}
            />

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
