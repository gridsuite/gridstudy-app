/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    ToggleButton,
    ToggleButtonGroup,
    Box,
    Typography,
    Tooltip,
    IconButton,
    Menu,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    List,
    ListItem,
} from '@mui/material';
import {
    Dashboard,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { type MuiStyles, OverflowableText, PopupConfirmationDialog } from '@gridsuite/commons-ui';
import { useIntl, FormattedMessage } from 'react-intl';
import { WORKSPACE_MENU_VALUE } from '../constants/workspace.constants';
import { selectWorkspaces, selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import {
    switchWorkspace,
    renameWorkspace as renameWorkspaceAction,
    clearWorkspace as clearWorkspaceAction,
} from '../../../redux/slices/workspace-slice';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
    },
    toggleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        '& .workspace-number': {
            fontSize: '0.625rem',
            fontWeight: 'bold',
            lineHeight: 1,
        },
    },
    dialog: {
        '& .MuiDialog-paper': {
            minWidth: 400,
        },
    },
    workspaceItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&:hover': {
            backgroundColor: 'action.hover',
        },
    },
    activeWorkspace: {
        backgroundColor: 'action.selected',
        borderLeft: 3,
        borderColor: 'primary.main',
    },
} as const satisfies MuiStyles;

export const WorkspaceSwitcher = memo(() => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const workspaces = useSelector(selectWorkspaces);
    const activeWorkspaceId = useSelector(selectActiveWorkspaceId);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [renameDialog, setRenameDialog] = useState<{ workspaceId: string; name: string } | null>(null);
    const [resetWorkspaceId, setResetWorkspaceId] = useState<string | null>(null);

    const handleWorkspaceChange = (_event: React.MouseEvent<HTMLElement>, workspaceId: string | null) => {
        if (workspaceId && workspaceId !== activeWorkspaceId && workspaceId !== WORKSPACE_MENU_VALUE) {
            dispatch(switchWorkspace(workspaceId));
        }
    };

    const handleSwitchWorkspace = (workspaceId: string) => {
        dispatch(switchWorkspace(workspaceId));
        setMenuAnchor(null);
    };

    const handleOpenRenameDialog = (workspaceId: string) => {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        setRenameDialog({ workspaceId, name: workspace?.name || '' });
        setMenuAnchor(null);
    };

    const handleSubmitRename = () => {
        if (renameDialog?.name.trim()) {
            dispatch(
                renameWorkspaceAction({ workspaceId: renameDialog.workspaceId, newName: renameDialog.name.trim() })
            );
            setRenameDialog(null);
        }
    };

    const handleConfirmReset = useCallback(() => {
        if (resetWorkspaceId) {
            dispatch(clearWorkspaceAction(resetWorkspaceId));
        }
        setResetWorkspaceId(null);
    }, [resetWorkspaceId, dispatch]);

    return (
        <Box sx={styles.container}>
            <Typography>
                <FormattedMessage id="workspaces" />
            </Typography>
            <ToggleButtonGroup
                value={activeWorkspaceId}
                exclusive
                size="small"
                onChange={handleWorkspaceChange}
                aria-label="workspace switcher"
            >
                {workspaces.map((workspace, index) => (
                    <Tooltip key={workspace.id} title={workspace.name || `Workspace ${index + 1}`}>
                        <ToggleButton value={workspace.id} sx={styles.toggleButton}>
                            <Dashboard fontSize="small" />
                            <Typography className="workspace-number" variant="caption" component="span">
                                {index + 1}
                            </Typography>
                        </ToggleButton>
                    </Tooltip>
                ))}
                <Tooltip title="Manage workspaces">
                    <ToggleButton
                        value={WORKSPACE_MENU_VALUE}
                        sx={styles.toggleButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuAnchor(e.currentTarget);
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>

            {/* Menu for workspace management */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <List dense sx={{ width: 300, maxHeight: 400, overflow: 'auto', p: 0 }}>
                    {workspaces.map((workspace, index) => {
                        const isActive = workspace.id === activeWorkspaceId;
                        const windowCount = Object.keys(workspace.workspace.windows).length;
                        const workspaceName = workspace.name || `Workspace ${index + 1}`;

                        return (
                            <ListItem
                                key={workspace.id}
                                button
                                onClick={() => handleSwitchWorkspace(workspace.id)}
                                sx={[styles.workspaceItem, isActive && styles.activeWorkspace]}
                            >
                                <Box sx={{ width: 180, mr: 1, overflow: 'hidden' }}>
                                    <OverflowableText
                                        text={workspaceName}
                                        sx={{ fontWeight: isActive ? 'bold' : 'normal', width: '100%' }}
                                        maxLineCount={1}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {windowCount} window{windowCount !== 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                                <Tooltip title="Rename">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenRenameDialog(workspace.id);
                                        }}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reset">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setResetWorkspaceId(workspace.id);
                                        }}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <RestartAltIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>
            </Menu>

            {/* Rename dialog */}
            {renameDialog && (
                <Dialog open onClose={() => setRenameDialog(null)} sx={styles.dialog}>
                    <DialogTitle>Rename Workspace</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Workspace Name"
                            value={renameDialog.name}
                            onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitRename()}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRenameDialog(null)}>Cancel</Button>
                        <Button onClick={handleSubmitRename} variant="contained" disabled={!renameDialog.name.trim()}>
                            Rename
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Reset confirmation dialog */}
            {resetWorkspaceId && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({ id: 'resetWorkspaceConfirmation' })}
                    openConfirmationPopup
                    setOpenConfirmationPopup={() => setResetWorkspaceId(null)}
                    handlePopupConfirmation={handleConfirmReset}
                />
            )}
        </Box>
    );
});
