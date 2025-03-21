/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CheckBoxList, Parameter, useSnackMessage } from '@gridsuite/commons-ui';

import {
    FileUpload,
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
    Tooltip,
    Typography,
    Badge,
    IconButton,
    Stack,
    Chip,
} from '@mui/material';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { RootNetworkMetadata } from './network-modification-menu.type';

import {
    CaseImportParameters,
    GetCaseImportParametersReturn,
    getCaseImportParameters,
} from 'services/network-conversion';
import { createRootNetwork, deleteRootNetworks, fetchRootNetworks, updateRootNetwork } from 'services/root-network';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import { isChecked, isPartial } from './network-modification-node-editor-utils';
import RootNetworkDialog, { FormData } from 'components/dialogs/root-network/root-network-dialog';

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

const RootNetworkNodeEditor = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentRootNetworkUuidRef = useRef<UUID | null>(null);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);

    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const [rootNetworkModificationDialogOpen, setRootNetworkModificationDialogOpen] = useState(false);
    const [editedRootNetwork, setEditedRootNetwork] = useState<RootNetworkMetadata | undefined>(undefined);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [isRootNetworksProcessing, setIsRootNetworksProcessing] = useState(false);

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
                    setRootNetworks(res);
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
    }, [studyUuid, updateSelectedItems, snackError]);

    useEffect(() => {
        if (studyUpdatedForce?.eventData?.headers) {
            const eventType = studyUpdatedForce.eventData.headers?.['updateType'];
            if (eventType === 'rootNetworksUpdateFailed') {
                dofetchRootNetworks();
                snackError({
                    messageId: 'importCaseFailure',
                    headerId: 'createRootNetworksError',
                });
            }
            if (eventType === 'rootNetworksUpdated' || eventType === 'rootNetworkModified') {
                dofetchRootNetworks();
            } else if (rootNetworksRef.current && eventType === 'rootNetworkDeletionStarted') {
                // If the current root network isn't going to be deleted, we don't need to do anything
                const deletedRootNetworkUuids = studyUpdatedForce.eventData.headers.rootNetworks;
                if (
                    currentRootNetworkUuidRef.current &&
                    !deletedRootNetworkUuids.includes(currentRootNetworkUuidRef.current)
                ) {
                    return;
                }
                // Choice: if the current root network is going to be deleted, we select the first root network that won't be deleted
                const newSelectedRootNetwork = rootNetworksRef.current.find(
                    (rootNetwork) => !deletedRootNetworkUuids.includes(rootNetwork.rootNetworkUuid)
                );
                if (newSelectedRootNetwork) {
                    dispatch(setCurrentRootNetworkUuid(newSelectedRootNetwork.rootNetworkUuid));
                }
            }
        }
    }, [studyUpdatedForce, dofetchRootNetworks, dispatch, snackError]);

    useEffect(() => {
        dofetchRootNetworks();
    }, [dofetchRootNetworks]);

    const openRootNetworkCreationDialog = useCallback(() => {
        setRootNetworkCreationDialogOpen(true);
    }, []);

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

    const renderRootNetworkCreationDialog = () => {
        return (
            <RootNetworkDialog
                open={rootNetworkCreationDialogOpen}
                onClose={() => setRootNetworkCreationDialogOpen(false)}
                onSave={doCreateRootNetwork}
                titleId={'addNetwork'}
            />
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

    function formatCaseImportParameters(params: CaseImportParameters[]): CaseImportParameters[] {
        // sort possible values alphabetically to display select options sorted
        return params?.map((parameter) => ({
            ...parameter,
            possibleValues: parameter.possibleValues?.sort((a: any, b: any) => a.localeCompare(b)),
        }));
    }

    function customizeCurrentParameters(params: Parameter[]): Record<string, string> {
        return params.reduce((obj, parameter) => {
            // we check if the parameter is for extensions. If so, we select all possible values by default.
            // the only way for the moment to check if the parameter is for extension, is by checking his name.
            // TODO: implement a cleaner way to determine the extensions field
            if (parameter.type === 'STRING_LIST' && parameter.name?.endsWith('extensions')) {
                return { ...obj, [parameter.name]: parameter.possibleValues.toString() };
            }
            return obj;
        }, {} as Record<string, string>);
    }

    const doCreateRootNetwork = ({ name, tag, caseName, caseId }: FormData) => {
        if (!studyUuid) {
            return;
        }
        setIsRootNetworksProcessing(true);
        getCaseImportParameters(caseId as UUID)
            .then((params: GetCaseImportParametersReturn) => {
                // Format the parameters
                const formattedParams = formatCaseImportParameters(params.parameters);
                const customizedCurrentParameters = customizeCurrentParameters(formattedParams as Parameter[]);
                // Call createRootNetwork with formatted parameters
                return createRootNetwork(
                    caseId as UUID,
                    params.formatName,
                    name,
                    tag,
                    studyUuid,
                    customizedCurrentParameters
                );
            })

            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'createRootNetworksError',
                });
                setIsRootNetworksProcessing(false);
            });
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

                <Tooltip title={<FormattedMessage id={'addNetwork'} />}>
                    <span>
                        <IconButton
                            onClick={openRootNetworkCreationDialog}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={rootNetworks.length >= 3 || isRootNetworksProcessing}
                        >
                            <FileUpload />
                        </IconButton>
                    </span>
                </Tooltip>

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
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
            {rootNetworkModificationDialogOpen && renderRootNetworkModificationDialog()}
            {renderRootNetworksListTitle()}

            {renderRootNetworksList()}
        </>
    );
};

export default RootNetworkNodeEditor;
