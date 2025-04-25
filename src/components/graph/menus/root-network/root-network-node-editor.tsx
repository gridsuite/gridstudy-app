/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CheckBoxList,
    Parameter,
    useNotificationsListener,
    useSnackMessage,
    RootNetworksDeletionStartedEventData,
    RootNetworksUpdatedEventData,
} from '@gridsuite/commons-ui';

import {
    Delete as DeleteIcon,
    RemoveRedEye as RemoveRedEyeIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import {
    Box,
    Checkbox,
    CircularProgress,
    Theme,
    Toolbar,
    Typography,
    Badge,
    IconButton,
    Stack,
    Chip,
} from '@mui/material';

import { SetStateAction, useCallback, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { UUID } from 'crypto';
import { AppState, NotificationType } from 'redux/reducer';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';

import { getCaseImportParameters } from 'services/network-conversion';
import { deleteRootNetworks, fetchRootNetworks, updateRootNetwork } from 'services/root-network';
import { setCurrentRootNetworkUuid, setRootNetworks } from 'redux/actions';
import { isChecked, isPartial } from '../network-modifications/network-modification-node-editor-utils';
import RootNetworkDialog, { FormData } from 'components/dialogs/root-network/root-network-dialog';
import { NOTIFICATIONS_URL_KEYS } from 'components/utils/notificationsProvider-utils';
import { customizeCurrentParameters, formatCaseImportParameters } from '../../util/case-import-parameters';

const styles = {
    checkBoxLabel: { flexGrow: '1' },
    checkboxListItem: {
        display: 'flex',
        alignItems: 'flex-start',
        paddingRight: '16px',
        '& .MuiListItemSecondaryAction-root': {
            paddingLeft: '4px',
            position: 'relative',
            top: 0,
            right: 0,
            transform: 'translateX(0px)',
        },
    },
    // TODO WHY it doesn't work with using the Theme here ?????
    // checkboxListItem: (theme: Theme) => ({
    //     display: 'flex',
    //     alignItems: 'flex-start',
    //     paddingRight: theme.spacing(4),
    //     '& .MuiListItemSecondaryAction-root': {
    //         position: 'relative',
    //         top: 0,
    //         right: 0,
    //         transform: 'translateX(0px)',
    //     },
    // }),
    checkbox: { paddingTop: '4px' },
    // checkbox: (theme: Theme) => ({ paddingTop: theme.spacing(1) }),
    checkBoxIcon: { minWidth: 0, padding: 0, marginLeft: 2 },
    checkboxButton: {
        padding: 0.5,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    rootNetworksTitle: (theme: Theme) => ({
        display: 'flex',
        padding: theme.spacing(1),
        overflow: 'hidden',
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'space-between',
    }),
    toolbar: (theme: Theme) => ({
        '&': {
            // Necessary to overrides some @media specific styles that are defined elsewhere
            padding: 0,
            minHeight: 0,
        },
        border: theme.spacing(1),
        flexShrink: 0,
    }),
    toolbarIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    toolbarCheckbox: (theme: Theme) => ({
        marginLeft: theme.spacing(1.5),
    }),
    filler: {
        flexGrow: 1,
    },
    toolbarCircularProgress: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing(1.25),
        marginRight: theme.spacing(1.25),
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
};

interface RootNetworkNodeEditorProps {
    isRootNetworksProcessing: boolean;
    setIsRootNetworksProcessing: React.Dispatch<SetStateAction<boolean>>;
}

const RootNetworkNodeEditor: React.FC<RootNetworkNodeEditorProps> = ({
    isRootNetworksProcessing,
    setIsRootNetworksProcessing,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentRootNetworkUuidRef = useRef<UUID | null>(null);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);

    const [rootNetworkModificationDialogOpen, setRootNetworkModificationDialogOpen] = useState(false);
    const [editedRootNetwork, setEditedRootNetwork] = useState<RootNetworkMetadata | undefined>(undefined);
    const dispatch = useDispatch();

    const rootNetworksRef = useRef<RootNetworkMetadata[]>([]);
    rootNetworksRef.current = rootNetworks;

    const updateSelectedItems = useCallback((rootNetworks: RootNetworkMetadata[]) => {
        const toKeepIdsSet = new Set(rootNetworks.map((e) => e.rootNetworkUuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.rootNetworkUuid)));
    }, []);

    const dofetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    updateSelectedItems(res);
                    dispatch(setRootNetworks(res));
                    // This is used to hide the loader for creation, update and deletion of the root networks.
                    // All the root networks must be fully established before the loader can be safely removed.
                    if (res.every((network) => !network.isCreating)) {
                        setIsRootNetworksProcessing(false);
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                });
        }
    }, [studyUuid, updateSelectedItems, dispatch, setIsRootNetworksProcessing, snackError]);

    const rootNetworkModifiedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATED) {
                dofetchRootNetworks();
            }
        },
        [dofetchRootNetworks]
    );
    const rootNetworksUpdateFailedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATE_FAILED) {
                dofetchRootNetworks();
                snackError({
                    messageId: 'importCaseFailure',
                    headerId: 'createRootNetworksError',
                });
            }
        },
        [dofetchRootNetworks, snackError]
    );
    const rootNetworkDeletionStartedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksDeletionStartedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_DELETION_STARTED) {
                if (!rootNetworksRef.current) {
                    return;
                }
                // If the current root network isn't going to be deleted, we don't need to do anything
                const deletedRootNetworksUuids = eventData.headers.rootNetworksUuids;
                if (
                    currentRootNetworkUuidRef.current &&
                    !deletedRootNetworksUuids.includes(currentRootNetworkUuidRef.current)
                ) {
                    return;
                }
                // Choice: if the current root network is going to be deleted, we select the first root network that won't be deleted
                const newSelectedRootNetwork = rootNetworksRef.current.find(
                    (rootNetwork) => !deletedRootNetworksUuids.includes(rootNetwork.rootNetworkUuid)
                );
                if (newSelectedRootNetwork) {
                    dispatch(setCurrentRootNetworkUuid(newSelectedRootNetwork.rootNetworkUuid));
                }
            }
        },
        [dispatch]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkModifiedNotification,
    });
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworksUpdateFailedNotification,
    });
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkDeletionStartedNotification,
    });

    const doDeleteRootNetwork = useCallback(() => {
        const selectedRootNetworksUuid = selectedItems.map((item) => item.rootNetworkUuid);

        if (studyUuid) {
            setIsRootNetworksProcessing(true);
            deleteRootNetworks(studyUuid, selectedRootNetworksUuid).catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'deleteRootNetworkError',
                });
                setIsRootNetworksProcessing(false);
            });
        }
    }, [setIsRootNetworksProcessing, selectedItems, snackError, studyUuid]);

    const toggleSelectAllRootNetworks = useCallback(() => {
        setSelectedItems((oldVal) => (oldVal.length === 0 ? rootNetworks : []));
    }, [rootNetworks]);

    const handleSecondaryAction = useCallback(
        (rootNetwork: RootNetworkMetadata) => {
            const isCurrentRootNetwork = rootNetwork.rootNetworkUuid === currentRootNetworkUuid;

            return (
                <IconButton
                    size="small"
                    onClick={() => {
                        dispatch(setCurrentRootNetworkUuid(rootNetwork.rootNetworkUuid));
                    }}
                    disabled={rootNetwork.isCreating || isRootNetworksProcessing}
                >
                    {isCurrentRootNetwork ? (
                        <Badge overlap="circular" color="primary" variant="dot">
                            <RemoveRedEyeIcon />
                        </Badge>
                    ) : (
                        <VisibilityOffIcon />
                    )}
                </IconButton>
            );
        },
        [currentRootNetworkUuid, dispatch, isRootNetworksProcessing]
    );

    const renderRootNetworksList = () => {
        return (
            <CheckBoxList
                isDisabled={(_rootNetwork) => isRootNetworksProcessing}
                sx={{
                    items: () => ({
                        label: {
                            ...styles.checkBoxLabel,
                        },
                        checkboxListItem: styles.checkboxListItem,
                        checkbox: styles.checkbox,
                        checkBoxIcon: styles.checkBoxIcon,
                        checkboxButton: styles.checkboxButton,
                    }),
                }}
                onItemClick={(rootNetwork) => {
                    setRootNetworkModificationDialogOpen(true);
                    setEditedRootNetwork(rootNetwork);
                }}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                items={rootNetworks}
                getItemId={(val) => val.rootNetworkUuid}
                getItemLabel={(val) => {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {val.name}
                            <Stack direction="row" spacing={1}>
                                <Chip size="small" label={val.tag} color="primary" />
                            </Stack>
                        </Box>
                    );
                }}
                secondaryAction={handleSecondaryAction}
            />
        );
    };

    const renderRootNetworksListTitle = () => {
        return (
            <Box sx={styles.rootNetworksTitle}>
                <Typography noWrap>
                    <FormattedMessage
                        id={'rootNetworksCount'}
                        values={{
                            count: rootNetworks.length,
                        }}
                    />
                </Typography>
                {isRootNetworksProcessing && (
                    <span>
                        <CircularProgress size={'1em'} sx={styles.toolbarCircularProgress} />
                    </span>
                )}
            </Box>
        );
    };

    const renderRootNetworkModificationDialog = () => {
        if (!editedRootNetwork) {
            return null;
        }
        return (
            <RootNetworkDialog
                editableRootNetwork={editedRootNetwork}
                open={rootNetworkModificationDialogOpen}
                onClose={() => setRootNetworkModificationDialogOpen(false)}
                onSave={doUpdateRootNetwork}
                titleId={'updateNetwork'}
            />
        );
    };

    const doUpdateRootNetwork = async ({ name, tag, caseName, caseId }: FormData) => {
        if (!studyUuid || !editedRootNetwork) {
            return;
        }
        try {
            setIsRootNetworksProcessing(true);
            const params = caseId ? await getCaseImportParameters(caseId as UUID) : null;
            const formattedParams = params ? formatCaseImportParameters(params.parameters) : null;
            const customizedParams = formattedParams
                ? customizeCurrentParameters(formattedParams as Parameter[])
                : null;

            updateRootNetwork(
                editedRootNetwork.rootNetworkUuid,
                name,
                tag,
                caseId as UUID | null,
                caseId && params ? params.formatName : null,
                studyUuid,
                caseId ? customizedParams : null
            );
        } catch (error) {
            snackError({
                headerId: 'updateRootNetworksError',
                messageTxt: error instanceof Error ? error.message : String(error),
            });
            setIsRootNetworksProcessing(false);
        }
    };

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Checkbox
                    sx={styles.toolbarCheckbox}
                    disabled={isRootNetworksProcessing}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(selectedItems.length)}
                    indeterminate={isPartial(selectedItems.length, rootNetworks?.length)}
                    disableRipple
                    onClick={toggleSelectAllRootNetworks}
                />
                <Box sx={styles.filler} />

                <IconButton
                    onClick={doDeleteRootNetwork}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={
                        selectedItems.length === 0 ||
                        !currentNode ||
                        rootNetworks.length === selectedItems.length ||
                        isRootNetworksProcessing
                    }
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            {rootNetworkModificationDialogOpen && renderRootNetworkModificationDialog()}
            {renderRootNetworksListTitle()}

            {renderRootNetworksList()}
        </>
    );
};

export default RootNetworkNodeEditor;
