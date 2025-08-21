/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { IconButton, Box, Theme, Button, Tooltip, Typography, Collapse, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { lighten, darken } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import NetworkModificationNodeDialog from './network-modification-node-dialog';

const styles = {
    header: (theme: Theme) => ({
        padding: theme.spacing(1),
        color: theme.palette.getContrastText(
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2)
        ),
        display: 'flex',
        alignItems: 'center',
    }),
    buttonTitle: {
        textTransform: 'none',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        minWidth: 0,
        maxWidth: '100%',
    },

    nodeNameText: {
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        maxWidth: '100%',
    },

    titleContainer: {
        flexGrow: 1,
        overflow: 'hidden',
    },
};

interface NodeEditorHeaderProps {
    onClose: () => void;
}

export const NodeEditorHeader = ({ onClose }: NodeEditorHeaderProps) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const label = currentTreeNode?.data?.label ?? '';
    const description = currentTreeNode?.data?.description ?? '';

    return (
        <>
            <Box sx={styles.header}>
                <Box sx={styles.titleContainer}>
                    <Tooltip title={label}>
                        <Button size="small" onClick={() => setOpenEditDialog(true)} sx={styles.buttonTitle}>
                            <Typography sx={styles.nodeNameText}>{label}</Typography>
                        </Button>
                    </Tooltip>
                </Box>

                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>

                <NetworkModificationNodeDialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    titleId="editNode"
                />
            </Box>

            {description && (
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        marginRight: 1,
                        p: 1,
                        pl: 2,
                        position: 'relative',
                        color: !expanded ? theme.palette.text.secondary : 'inherit',
                        backgroundColor:
                            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900],
                    })}
                >
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            padding: 0,
                        }}
                    >
                        <ExpandMoreIcon
                            sx={{
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                            }}
                        />
                    </IconButton>

                    <Collapse
                        in={expanded}
                        collapsedSize={30}
                        sx={{
                            '& .MuiCollapse-wrapperInner': {
                                overflowY: expanded ? 'auto' : 'hidden',
                                maxHeight: expanded ? 200 : 20,
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                whiteSpace: 'pre-wrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {description}
                        </Typography>
                    </Collapse>
                </Paper>
            )}
        </>
    );
};
