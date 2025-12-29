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
    ListItemButton,
} from '@mui/material';
import {
    Dashboard,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { type MuiStyles, OverflowableText, PopupConfirmationDialog, CancelButton } from '@gridsuite/commons-ui';
import { useIntl, FormattedMessage } from 'react-intl';
import { WORKSPACE_MENU_VALUE } from '../constants/workspace.constants';
import {
    setActiveWorkspace,
    renameWorkspace as renameWorkspaceAction,
    clearWorkspace as clearWorkspaceAction,
} from '../../../redux/slices/workspace-slice';
import { selectWorkspaces, selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import { getWorkspace } from '../../../services/study/workspace';
import type { UUID } from 'node:crypto';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        marginLeft: 2,
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
    workspaceItem: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }),
    activeWorkspace: (theme) => ({
        backgroundColor: theme.palette.action.selected,
        borderLeft: 3,
        borderColor: theme.palette.primary.main,
    }),
} as const satisfies MuiStyles;

export const WorkspaceSwitcher = memo(() => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const workspaces = useSelector(selectWorkspaces);
    const activeWorkspaceId = useSelector(selectActiveWorkspaceId);
    const studyUuid = useSelector((state: any) => state.studyUuid);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [renameDialog, setRenameDialog] = useState<{ workspaceId: UUID; name: string } | null>(null);
    const [resetWorkspaceId, setResetWorkspaceId] = useState<UUID | null>(null);

    const handleWorkspaceChange = async (_event: React.MouseEvent<HTMLElement>, workspaceId: string | null) => {
        if (workspaceId && workspaceId !== activeWorkspaceId && workspaceId !== WORKSPACE_MENU_VALUE) {
            globalThis.dispatchEvent(new CustomEvent('workspace:switchWorkspace'));

            const workspace = await getWorkspace(studyUuid, workspaceId as UUID);
            dispatch(setActiveWorkspace(workspace));
        }
    };

    const handleSwitchWorkspace = async (workspaceId: UUID) => {
        globalThis.dispatchEvent(new CustomEvent('workspace:switchWorkspace'));

        const workspace = await getWorkspace(studyUuid, workspaceId);
        dispatch(setActiveWorkspace(workspace));

        setMenuAnchor(null);
    };

    const handleOpenRenameDialog = (workspaceId: UUID) => {
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
            dispatch(clearWorkspaceAction());
        }
        setResetWorkspaceId(null);
    }, [resetWorkspaceId, dispatch]);

    return (
        <Box sx={styles.container}>
            <Typography sx={{ display: { xs: 'none', lg: 'block' } }}>
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
                <Tooltip title={intl.formatMessage({ id: 'manageWorkspaces' })}>
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
                        const panelCount = workspace.panelCount;
                        const workspaceName = workspace.name || `Workspace ${index + 1}`;

                        return (
                            <ListItem
                                key={workspace.id}
                                disablePadding
                                sx={isActive ? styles.activeWorkspace : undefined}
                            >
                                <ListItemButton
                                    onClick={() => handleSwitchWorkspace(workspace.id)}
                                    sx={styles.workspaceItem}
                                >
                                    <Box sx={{ width: 180, mr: 1, overflow: 'hidden' }}>
                                        <OverflowableText
                                            text={workspaceName}
                                            sx={{ fontWeight: isActive ? 'bold' : 'normal', width: '100%' }}
                                            maxLineCount={1}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            <FormattedMessage
                                                id="panelsCount"
                                                values={{
                                                    count: panelCount,
                                                }}
                                            />
                                        </Typography>
                                    </Box>
                                    <Tooltip title={intl.formatMessage({ id: 'Rename' })}>
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
                                    <Tooltip title={intl.formatMessage({ id: 'reset' })}>
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
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Menu>

            {/* Rename dialog */}
            {renameDialog && (
                <Dialog open onClose={() => setRenameDialog(null)} maxWidth="xs" fullWidth>
                    <DialogTitle>
                        <FormattedMessage id="renameWorkspace" />
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label={intl.formatMessage({ id: 'workspaceName' })}
                            value={renameDialog.name}
                            onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && renameDialog.name.trim()) {
                                    handleSubmitRename();
                                }
                            }}
                            margin="dense"
                            variant="filled"
                        />
                    </DialogContent>
                    <DialogActions>
                        <CancelButton onClick={() => setRenameDialog(null)} />
                        <Button onClick={handleSubmitRename} variant="outlined" disabled={!renameDialog.name.trim()}>
                            <FormattedMessage id="validate" />
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
