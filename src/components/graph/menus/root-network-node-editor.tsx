/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CheckBoxList, ElementType, Parameter, useSnackMessage } from '@gridsuite/commons-ui';

import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Checkbox, CircularProgress, Theme, Toolbar, Tooltip, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { setCurrentRootNetwork } from 'redux/actions';
import RootNetworkCreationDialog, { FormData } from 'components/dialogs/root-network-creation-dialog';

export const styles = {
    listContainer: (theme: Theme) => ({
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    }),
    listItem: { paddingLeft: 0, paddingTop: 0, paddingBottom: 0 },
    checkBoxLabel: { flexGrow: '1' },
    disabledRootNetwork: { opacity: 0.4 },
    checkBoxIcon: { minWidth: 0, padding: 0 },
    checkboxButton: {
        padding: 0.5,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    rootNetworksTitle: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
    toolbar: (theme: Theme) => ({
        '&': {
            // Necessary to overrides some @media specific styles that are defined elsewhere
            padding: 0,
            minHeight: 0,
        },
        border: theme.spacing(1),
        margin: 0,
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
    notification: (theme: Theme) => ({
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    }),
    icon: (theme: Theme) => ({
        width: theme.spacing(3),
    }),
    iconEdit: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

export function isChecked(s1: number) {
    return s1 !== 0;
}

export function isPartial(s1: number, s2: number) {
    if (s1 === 0) {
        return false;
    }
    return s1 !== s2;
}

const RootNetworkNodeEditor = () => {
    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackInfo, snackError } = useSnackMessage();
    const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetwork = useSelector((state: AppState) => state.currentRootNetwork);

    const [pendingState, setPendingState] = useState(false);

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);

    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const dispatch = useDispatch();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [messageId, setMessageId] = useState('');
    const [launchLoader, setLaunchLoader] = useState(false);

    const updateSelectedItems = useCallback((rootNetworks: RootNetworkMetadata[]) => {
        const toKeepIdsSet = new Set(rootNetworks.map((e) => e.rootNetworkUuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.rootNetworkUuid)));
    }, []);

    const dofetchRootNetworks = useCallback(() => {
        setLaunchLoader(true);
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
                })
                .finally(() => {
                    setPendingState(false);
                    setLaunchLoader(false);
                });
        }
    }, [currentNode?.type, currentNode?.id, studyUuid, updateSelectedItems, snackError, dispatch]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['updateType'] === 'rootNetworksUpdated') {
                setMessageId('updateRootNetworksList'); // creatingRootNetwork to do distinct creation:deletion action on notification
                dofetchRootNetworks();
            }
        }
    }, [studyUpdatedForce, dofetchRootNetworks]);

    useEffect(() => {
        if (!currentRootNetwork) {
            setRootNetworks([]);
        }
        dofetchRootNetworks();
    }, [currentRootNetwork, dofetchRootNetworks]);

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
                        headerId: 'errDeleteModificationMsg',
                    });
                })
                .finally(() => setDeleteInProgress(false));
        }
    }, [currentNode?.id, selectedItems, snackError, studyUuid]);

    const toggleSelectAllRootNetworks = useCallback(() => {
        setSelectedItems((oldVal) => (oldVal.length === 0 ? rootNetworks : []));
    }, [rootNetworks]);

    const isLoading = useCallback(() => {
        return notificationIdList.filter((notification) => notification === currentNode?.id).length > 0;
    }, [notificationIdList, currentNode?.id]);

    const intl = useIntl();
    const getRootNetworkLabel = (rootNetwork: RootNetworkMetadata): string => {
        if (!rootNetwork) {
            return '';
        }
        return intl.formatMessage({ id: 'RootNetwork' }) + ' ' + rootNetwork.rootNetworkUuid;
    };

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
                    // dragAndDropContainer: styles.listContainer,
                }}
                onItemClick={(rootNetwork) => {
                    console.log(rootNetwork.rootNetworkUuid, 'on click');
                }}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                items={rootNetworks}
                getItemId={(val) => val.rootNetworkUuid}
                getItemLabel={getRootNetworkLabel}
                divider
                secondaryAction={(rootNetwork) => {
                    const isCurrentRootNetwork = rootNetwork.rootNetworkUuid === currentRootNetwork;

                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                            <IconButton
                                size="small"
                                disabled={isCurrentRootNetwork}
                                onClick={() => {
                                    if (rootNetwork.rootNetworkUuid !== currentRootNetwork) {
                                        // Set this root network as the current root network
                                        dispatch(setCurrentRootNetwork(rootNetwork.rootNetworkUuid));
                                    }
                                }}
                            >
                                {isCurrentRootNetwork ? <RemoveRedEyeIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                        </Box>
                    );
                }}
            />
        );
    };

    const renderRootNetworksListTitleLoading = () => {
        return (
            <Box sx={styles.rootNetworksTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={messageId} />
                </Typography>
            </Box>
        );
    };

    const renderRootNetworksListTitleUpdating = () => {
        return (
            <Box sx={styles.rootNetworksTitle}>
                <Box sx={styles.icon}>
                    <CircularProgress size={'1em'} sx={styles.circularProgress} />
                </Box>
                <Typography noWrap>
                    <FormattedMessage id={'updateRootNetworksList'} />
                </Typography>
            </Box>
        );
    };

    const renderRootNetworksListTitle = () => {
        return (
            <Box sx={styles.rootNetworksTitle}>
                <Box sx={styles.icon}>
                    {pendingState && <CircularProgress size={'1em'} sx={styles.circularProgress} />}
                </Box>
                <Typography noWrap>
                    <FormattedMessage
                        id={'rootNetworksCount'}
                        values={{
                            count: rootNetworks ? rootNetworks?.length : '',
                            hide: pendingState,
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
                type={ElementType.ROOT_NETWORK}
                titleId={'CreateRootNetwork'}
                dialogProps={undefined}
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
        setSaveInProgress(true);

        getCaseImportParameters(caseId as UUID)
            .then((params: GetCaseImportParametersReturn) => {
                // Format the parameters
                const formattedParams = formatCaseImportParameters(params.parameters);
                const customizedCurrentParameters = customizeCurrentParameters(formattedParams as Parameter[]);
                // Call createRootNetwork with formatted parameters

                return createRootNetwork(caseId as UUID, params.formatName, studyUuid, customizedCurrentParameters);
            })
            .then(() => {
                // Success handler
                snackInfo({
                    headerId: 'infoCreateRootNetworkMsg',
                    headerValues: {
                        rootNetworkName: name,
                    },
                });
            })
            .catch((error) => {
                // Error handler
                snackError({
                    messageTxt: error.message,
                    headerId: 'errCreateRootNetworksMsg',
                });
            })
            .finally(() => {
                setSaveInProgress(false);
            });
    };
    const renderPaneSubtitle = () => {
        if (isLoading() && messageId) {
            return renderRootNetworksListTitleLoading();
        }
        if (launchLoader) {
            return renderRootNetworksListTitleUpdating();
        }
        return renderRootNetworksListTitle();
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

                <Tooltip title={<FormattedMessage id={'CreateRootNetwork'} />}>
                    <span>
                        <IconButton
                            onClick={openRootNetworkCreationDialog}
                            size={'small'}
                            sx={styles.toolbarIcon}
                            disabled={false} //TODO
                        >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <IconButton
                    onClick={doDeleteRootNetwork}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={selectedItems.length === 0 || !currentNode}
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
            {renderPaneSubtitle()}

            {renderRootNetworksList()}
        </>
    );
};

export default RootNetworkNodeEditor;
