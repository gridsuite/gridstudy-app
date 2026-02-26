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
    Save as SaveIcon,
    Upload,
} from '@mui/icons-material';
import {
    type MuiStyles,
    OverflowableText,
    PopupConfirmationDialog,
    CancelButton,
    ElementSaveDialog,
    ElementType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    useSnackMessage,
    snackWithFallback,
    DirectoryItemSelector,
    type TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { useIntl, FormattedMessage } from 'react-intl';
import { WORKSPACE_MENU_VALUE } from '../constants/workspace.constants';
import {
    setActiveWorkspace,
    renameWorkspace as renameWorkspaceAction,
    clearWorkspace as clearWorkspaceAction,
} from '../../../redux/slices/workspace-slice';
import { selectWorkspaces, selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import { getWorkspace, renameWorkspace, deletePanels, replaceWorkspace } from '../../../services/study/workspace';
import { saveWorkspaceConfig, updateWorkspaceConfig } from '../../../services/explore';
import type { UUID } from 'node:crypto';
import { RootState } from 'redux/store';

enum WorkspaceAction {
    RENAME = 'rename',
    SAVE = 'save',
    REPLACE = 'replace',
    RESET = 'reset',
}

type WorkspaceActionState =
    | { action: WorkspaceAction.RENAME; workspaceId: UUID; name: string }
    | { action: WorkspaceAction.SAVE | WorkspaceAction.REPLACE | WorkspaceAction.RESET; workspaceId: UUID }
    | null;

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
    workspaceMenu: {
        width: 300,
        maxHeight: 400,
        overflow: 'auto',
        p: 0,
    },
    workspaceNameBox: {
        width: 180,
        mr: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        flexShrink: 0,
    },
} as const satisfies MuiStyles;

export const WorkspaceSwitcher = memo(() => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const workspaces = useSelector(selectWorkspaces);
    const activeWorkspaceId = useSelector(selectActiveWorkspaceId);
    const studyUuid = useSelector((state: RootState) => state.studyUuid);

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [workspaceAction, setWorkspaceAction] = useState<WorkspaceActionState>(null);
    const { snackInfo, snackError } = useSnackMessage();

    const switchToWorkspace = async (workspaceId: UUID) => {
        if (!studyUuid) return;

        globalThis.dispatchEvent(new CustomEvent('workspace:switchWorkspace'));
        const workspace = await getWorkspace(studyUuid, workspaceId);
        dispatch(setActiveWorkspace(workspace));
    };

    const handleWorkspaceChange = async (_event: React.MouseEvent<HTMLElement>, workspaceId: string | null) => {
        if (workspaceId && workspaceId !== activeWorkspaceId && workspaceId !== WORKSPACE_MENU_VALUE) {
            await switchToWorkspace(workspaceId as UUID);
        }
    };

    const handleSwitchWorkspace = async (workspaceId: UUID) => {
        await switchToWorkspace(workspaceId);
        setMenuAnchor(null);
    };

    const handleOpenRenameDialog = (workspaceId: UUID) => {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        setWorkspaceAction({ action: WorkspaceAction.RENAME, workspaceId, name: workspace?.name || '' });
        setMenuAnchor(null);
    };

    const handleSubmitRename = () => {
        if (workspaceAction?.action === WorkspaceAction.RENAME && workspaceAction.name.trim() && studyUuid) {
            renameWorkspace(studyUuid, workspaceAction.workspaceId, workspaceAction.name.trim())
                .then(() => {
                    dispatch(
                        renameWorkspaceAction({
                            workspaceId: workspaceAction.workspaceId,
                            newName: workspaceAction.name.trim(),
                        })
                    );
                    setWorkspaceAction(null);
                })
                .catch((error) => console.error('Failed to rename workspace:', error));
        }
    };

    const handleConfirmReset = useCallback(() => {
        if (workspaceAction?.action === WorkspaceAction.RESET && studyUuid) {
            deletePanels(studyUuid, workspaceAction.workspaceId)
                .then(() => dispatch(clearWorkspaceAction()))
                .catch((error) => console.error('Failed to reset workspace:', error));
        }
        setWorkspaceAction(null);
    }, [workspaceAction, studyUuid, dispatch]);

    const handleSaveWorkspace = useCallback(
        ({ name, description, folderId }: IElementCreationDialog) => {
            if (workspaceAction?.action !== WorkspaceAction.SAVE || !studyUuid) return;

            saveWorkspaceConfig(name, description, folderId, workspaceAction.workspaceId)
                .then(() => {
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'workspaceSaveSuccess' }, { name }),
                    });
                    setWorkspaceAction(null);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'workspaceSaveError',
                        headerValues: { name },
                    });
                });
        },
        [workspaceAction, studyUuid, snackInfo, snackError, intl]
    );

    const handleUpdateWorkspace = useCallback(
        ({ id, name, description, elementFullPath }: IElementUpdateDialog) => {
            if (workspaceAction?.action !== WorkspaceAction.SAVE || !studyUuid) return;

            updateWorkspaceConfig(id, name, description, workspaceAction.workspaceId)
                .then(() => {
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'workspaceUpdateSuccess' }, { item: elementFullPath }),
                    });
                    setWorkspaceAction(null);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'workspaceUpdateError',
                        headerValues: { item: elementFullPath },
                    });
                });
        },
        [workspaceAction, studyUuid, snackInfo, snackError, intl]
    );

    const handleSelectWorkspaceConfig = useCallback(
        (selectedElements: TreeViewFinderNodeProps[]) => {
            if (
                !selectedElements ||
                selectedElements.length === 0 ||
                workspaceAction?.action !== WorkspaceAction.REPLACE ||
                !studyUuid
            ) {
                setWorkspaceAction(null);
                return;
            }
            const sourceWorkspaceConfigId = selectedElements[0].id;

            replaceWorkspace(workspaceAction.workspaceId, sourceWorkspaceConfigId)
                .then(async () => {
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'workspaceReplaceSuccess' }),
                    });

                    // Reload the workspace if it's the active one
                    if (workspaceAction.workspaceId === activeWorkspaceId) {
                        const workspace = await getWorkspace(studyUuid, workspaceAction.workspaceId);
                        dispatch(setActiveWorkspace(workspace));
                    }

                    setWorkspaceAction(null);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'workspaceReplaceError',
                    });
                });
        },
        [workspaceAction, studyUuid, snackInfo, snackError, intl, activeWorkspaceId, dispatch]
    );

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
                <List dense sx={styles.workspaceMenu}>
                    {workspaces.map((workspace, index) => {
                        const isActive = workspace.id === activeWorkspaceId;
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
                                    <Box sx={styles.workspaceNameBox}>
                                        <OverflowableText
                                            text={workspaceName}
                                            sx={{ fontWeight: isActive ? 'bold' : 'normal', width: '100%' }}
                                            maxLineCount={1}
                                        />
                                    </Box>
                                    <Tooltip title={intl.formatMessage({ id: 'Rename' })}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenRenameDialog(workspace.id);
                                            }}
                                            sx={styles.actionButton}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={intl.formatMessage({ id: 'save' })}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWorkspaceAction({
                                                    action: WorkspaceAction.SAVE,
                                                    workspaceId: workspace.id,
                                                });
                                                setMenuAnchor(null);
                                            }}
                                            sx={{ flexShrink: 0 }}
                                        >
                                            <SaveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={intl.formatMessage({ id: 'replace' })}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWorkspaceAction({
                                                    action: WorkspaceAction.REPLACE,
                                                    workspaceId: workspace.id,
                                                });
                                                setMenuAnchor(null);
                                            }}
                                            sx={{ flexShrink: 0 }}
                                        >
                                            <Upload fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={intl.formatMessage({ id: 'reset' })}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWorkspaceAction({
                                                    action: WorkspaceAction.RESET,
                                                    workspaceId: workspace.id,
                                                });
                                            }}
                                            sx={styles.actionButton}
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
            {workspaceAction?.action === WorkspaceAction.RENAME && (
                <Dialog open onClose={() => setWorkspaceAction(null)} maxWidth="xs" fullWidth>
                    <DialogTitle>
                        <FormattedMessage id="renameWorkspace" />
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label={intl.formatMessage({ id: 'workspaceName' })}
                            value={workspaceAction.name}
                            onChange={(e) => setWorkspaceAction({ ...workspaceAction, name: e.target.value })}
                            margin="dense"
                            variant="filled"
                        />
                    </DialogContent>
                    <DialogActions>
                        <CancelButton onClick={() => setWorkspaceAction(null)} />
                        <Button onClick={handleSubmitRename} variant="outlined" disabled={!workspaceAction.name.trim()}>
                            <FormattedMessage id="validate" />
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Reset confirmation dialog */}
            {workspaceAction?.action === WorkspaceAction.RESET && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({ id: 'resetWorkspaceConfirmation' })}
                    openConfirmationPopup
                    setOpenConfirmationPopup={() => setWorkspaceAction(null)}
                    handlePopupConfirmation={handleConfirmReset}
                />
            )}

            {/* Replace workspace dialog */}
            {workspaceAction?.action === WorkspaceAction.REPLACE && (
                <DirectoryItemSelector
                    open
                    onClose={handleSelectWorkspaceConfig}
                    types={[ElementType.WORKSPACE]}
                    title={intl.formatMessage({ id: 'selectWorkspaceToImport' })}
                    validationButtonText={intl.formatMessage({ id: 'validate' })}
                    multiSelect={false}
                />
            )}

            {/* Save workspace dialog */}
            {workspaceAction?.action === WorkspaceAction.SAVE && studyUuid && (
                <ElementSaveDialog
                    open
                    onSave={handleSaveWorkspace}
                    OnUpdate={handleUpdateWorkspace}
                    onClose={() => setWorkspaceAction(null)}
                    type={ElementType.WORKSPACE}
                    titleId="saveWorkspace"
                    studyUuid={studyUuid}
                    selectorTitleId="workspace"
                    createLabelId="createWorkspaceLabel"
                    updateLabelId="replaceWorkspaceLabel"
                />
            )}
        </Box>
    );
});
