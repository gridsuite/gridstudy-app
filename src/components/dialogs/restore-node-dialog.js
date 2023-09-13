/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    DialogContentText,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import {
    fetchStashedNodes,
    restoreStashedNodes,
} from '../../services/study/tree-subtree';
import LoaderWithOverlay from '../utils/loader-with-overlay';
import FormControl from '@mui/material/FormControl';

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param anchorNodeId the anchor node id relative to which the restore will take place
 * @param studyUuid the study id
 */
const RestoreNodesDialog = ({ open, onClose, anchorNodeId, studyUuid }) => {
    const [nodes, setNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const intl = useIntl();

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            fetchStashedNodes(studyUuid).then((res) => {
                setNodes(res);
                setIsLoading(false);
            });
        } else {
            setNodes([]);
            setIsLoading(false);
        }
    }, [studyUuid, open]);

    const handleClose = () => {
        onClose();
        setSelectedNode(null);
        setIsLoading(false);
        setNodes([]);
    };

    const handleRestore = () => {
        restoreStashedNodes(studyUuid, selectedNode.id, anchorNodeId);
        handleClose();
    };

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-restore-nodes"
        >
            <DialogTitle>
                {intl.formatMessage({
                    id: 'restoreNodes',
                })}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ padding: 1 }}>
                    <DialogContentText>
                        {intl.formatMessage({
                            id: 'restoreNodesText',
                        })}
                    </DialogContentText>
                </Box>
                {isLoading && (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        isFixed={false}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                )}
                {!isLoading && nodes && (
                    <FormControl
                        sx={{ paddingLeft: '20px' }}
                        component="fieldset"
                    >
                        <RadioGroup name="nodes-to-restore-selection">
                            {nodes.map((node) => {
                                return (
                                    <FormControlLabel
                                        key={node.first.id}
                                        value={node.first.id}
                                        control={<Radio />}
                                        label={
                                            node.first.name +
                                            (node.second !== 0
                                                ? ' ( + ' + node.second + ' )'
                                                : '')
                                        }
                                        onChange={(event) =>
                                            setSelectedNode(node.first)
                                        }
                                    />
                                );
                            })}
                        </RadioGroup>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    <FormattedMessage id="close" />
                </Button>
                <Button
                    onClick={handleRestore}
                    disabled={!selectedNode || nodes.length === 0}
                >
                    <FormattedMessage id="restore" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

RestoreNodesDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorNodeId: PropTypes.any,
    studyUuid: PropTypes.any,
};

export default RestoreNodesDialog;
