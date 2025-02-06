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

import { Box, Checkbox, CircularProgress, Theme, Toolbar, Tooltip, Typography, Badge, IconButton } from '@mui/material';

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
import { createRootNetwork, deleteRootNetworks, fetchRootNetworks } from 'services/root-network';
import { setCurrentRootNetwork } from 'redux/actions';
import RootNetworkCreationDialog, { FormData } from 'components/dialogs/root-network/root-network-creation-dialog';
import { isChecked, isPartial } from './network-modification-node-editor';

const styles = {
    checkBoxLabel: { flexGrow: '1' },
    disabledRootNetwork: { opacity: 0.4 },
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
    circularProgress: (theme: Theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    toolbarCircularProgress: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing(1.25),
        marginRight: theme.spacing(2),
        color: theme.palette.secondary.main,
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
};

const RootNetworkNodeEditor = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetwork = useSelector((state: AppState) => state.currentRootNetwork);

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);

    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);

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
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                });
        }
    }, [studyUuid, updateSelectedItems, snackError]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers?.['updateType'] === 'rootNetworksUpdated') {
            dofetchRootNetworks();
            setDeleteInProgress(false);
        } else if (
            rootNetworksRef.current &&
            studyUpdatedForce.eventData.headers?.['updateType'] === 'rootNetworkDeletionStarted'
        ) {
            // when node are being deleted, we select 1st node that won't be deleted
            const deletingNodes = studyUpdatedForce.eventData.headers.rootNetworks;
            const newSelectedRootNetwork = rootNetworksRef.current.find(
                (rootNetwork) => !deletingNodes.includes(rootNetwork.rootNetworkUuid)
            );
            if (newSelectedRootNetwork) {
                dispatch(setCurrentRootNetwork(newSelectedRootNetwork.rootNetworkUuid));
            }
            setDeleteInProgress(true);
        }
    }, [studyUpdatedForce, dofetchRootNetworks, dispatch]);

    useEffect(() => {
        dofetchRootNetworks();
    }, [dofetchRootNetworks]);

    const openRootNetworkCreationDialog = useCallback(() => {
        setRootNetworkCreationDialogOpen(true);
    }, []);

    const doDeleteRootNetwork = useCallback(() => {
        const selectedRootNetworksUuid = selectedItems.map((item) => item.rootNetworkUuid);

        if (studyUuid) {
            deleteRootNetworks(studyUuid, selectedRootNetworksUuid)
                .then(() => {
                    setDeleteInProgress(true);
                })

                .catch((errmsg) => {
                    snackError({
                        messageTxt: errmsg,
                        headerId: 'deleteRootNetworkError',
                    });
                    setDeleteInProgress(false);
                });
        }
    }, [selectedItems, snackError, studyUuid]);

    const toggleSelectAllRootNetworks = useCallback(() => {
        setSelectedItems((oldVal) => (oldVal.length === 0 ? rootNetworks : []));
    }, [rootNetworks]);

    const handleSecondaryAction = useCallback(
        (rootNetwork: RootNetworkMetadata) => {
            const isCurrentRootNetwork = rootNetwork.rootNetworkUuid === currentRootNetwork;

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', padding: '8px 0', marginRight: '8px' }}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            if (rootNetwork.rootNetworkUuid !== currentRootNetwork) {
                                dispatch(setCurrentRootNetwork(rootNetwork.rootNetworkUuid));
                            }
                        }}
                        disabled={rootNetwork.isCreating}
                    >
                        {isCurrentRootNetwork ? (
                            <Badge overlap="circular" color="primary" variant="dot">
                                <RemoveRedEyeIcon />
                            </Badge>
                        ) : (
                            <VisibilityOffIcon />
                        )}
                    </IconButton>
                </Box>
            );
        },
        [currentRootNetwork, dispatch]
    );

    const renderRootNetworksList = () => {
        return (
            <CheckBoxList
                sx={{
                    items: (rootNetwork) => ({
                        label: {
                            ...(rootNetwork.isCreating && { ...styles.disabledRootNetwork }),
                            ...styles.checkBoxLabel,
                        },
                        checkBoxIcon: styles.checkBoxIcon,
                        checkboxButton: styles.checkboxButton,
                    }),
                }}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                items={rootNetworks}
                getItemId={(val) => val.rootNetworkUuid}
                getItemLabel={(val) => val.name}
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
            </Box>
        );
    };

    const renderRootNetworkCreationDialog = () => {
        return (
            <RootNetworkCreationDialog
                open={rootNetworkCreationDialogOpen}
                onClose={() => setRootNetworkCreationDialogOpen(false)}
                onSave={doCreateRootNetwork}
                titleId={'addNetwork'}
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

    const doCreateRootNetwork = ({ name, caseName, caseId }: FormData) => {
        if (!studyUuid) {
            return;
        }

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
                    studyUuid,
                    customizedCurrentParameters
                );
            })

            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'createRootNetworksError',
                });
            });
    };

    return (
        <>
            <Toolbar sx={styles.toolbar}>
                <Checkbox
                    sx={styles.toolbarCheckbox}
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
                            disabled={rootNetworks.length >= 3}
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
                        selectedItems.length === 0 || !currentNode || rootNetworks.length === selectedItems.length
                    }
                >
                    <DeleteIcon />
                </IconButton>
                {deleteInProgress ?? (
                    <Tooltip title={<FormattedMessage id={'deletingRootNetwork'} />}>
                        <span>
                            <CircularProgress size={'1em'} sx={styles.toolbarCircularProgress} />
                        </span>
                    </Tooltip>
                )}
            </Toolbar>
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
            {renderRootNetworksListTitle()}

            {renderRootNetworksList()}
        </>
    );
};

export default RootNetworkNodeEditor;
