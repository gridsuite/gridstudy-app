/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CheckBoxList, mergeSx, Parameter, useSnackMessage } from '@gridsuite/commons-ui';

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
    Chip,
    Tooltip,
} from '@mui/material';

import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';
import { getCaseImportParameters } from 'services/network-conversion';
import { deleteRootNetworks, updateRootNetwork } from 'services/root-network';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import { isChecked, isPartial } from '../network-modifications/network-modification-node-editor-utils';
import RootNetworkDialog, { FormData } from 'components/dialogs/root-network/root-network-dialog';
import { customizeCurrentParameters, formatCaseImportParameters } from '../../util/case-import-parameters';

const styles = {
    checkboxListItem: (theme: Theme) => ({
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    }),
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
    rootNetworkMonoRoot: (theme: Theme) => ({
        display: 'flex',
        padding: theme.spacing(1),
        overflow: 'hidden',
        borderTop: `1px solid ${theme.palette.divider}`,
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.spacing(2),
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }),
    rootNetworkMonoRootHover: (theme: Theme) => ({
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }),
    toolbar: (theme: Theme) => ({
        '&': {
            // Necessary to overrides some @media specific styles that are defined elsewhere
            padding: 0,
            paddingLeft: theme.spacing(1),
            minHeight: 0,
        },
        border: theme.spacing(1),
        flexShrink: 0,
    }),
    toolbarIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
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

const ItemLabelSecondary = (item: RootNetworkMetadata) => {
    return <Chip size="small" label={item.tag} color="primary" />;
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
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [rootNetworkModificationDialogOpen, setRootNetworkModificationDialogOpen] = useState(false);
    const [editedRootNetwork, setEditedRootNetwork] = useState<RootNetworkMetadata | undefined>(undefined);
    const dispatch = useDispatch();

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

    useEffect(() => {
        const toKeepIdsSet = new Set(rootNetworks.map((e) => e.rootNetworkUuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.rootNetworkUuid)));
    }, [rootNetworks]);

    const renderRootNetworksList = () => {
        return (
            <CheckBoxList
                isDisabled={(_rootNetwork) => isRootNetworksProcessing}
                sx={{
                    items: () => ({
                        checkboxListItem: styles.checkboxListItem,
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
                getItemLabel={(val) => val.name}
                getItemLabelSecondary={ItemLabelSecondary}
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
    const renderRootNetworkForMonoRootStudy = () => {
        return (
            <Box
                sx={mergeSx(
                    styles.rootNetworkMonoRoot,
                    isRootNetworksProcessing ? undefined : styles.rootNetworkMonoRootHover
                )}
                onClick={handleMonoRootUpdate}
            >
                <Typography
                    noWrap
                    style={{
                        opacity: isRootNetworksProcessing ? 0.5 : 1,
                    }}
                >
                    {rootNetworks[0].name}
                </Typography>
                {isRootNetworksProcessing && (
                    <span>
                        <CircularProgress size={'1em'} sx={styles.toolbarCircularProgress} />
                    </span>
                )}
            </Box>
        );
    };
    const handleMonoRootUpdate = () => {
        if (!isRootNetworksProcessing) {
            setEditedRootNetwork(rootNetworks[0]);
            setRootNetworkModificationDialogOpen(true);
        }
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
            {!isMonoRootStudy && (
                <Toolbar sx={styles.toolbar}>
                    <Checkbox
                        disabled={isRootNetworksProcessing}
                        checked={isChecked(selectedItems.length)}
                        indeterminate={isPartial(selectedItems.length, rootNetworks?.length)}
                        disableRipple
                        onClick={toggleSelectAllRootNetworks}
                    />
                    <Box sx={styles.filler} />
                    <Tooltip title={<FormattedMessage id={'deleteNetwork'} values={{ count: selectedItems.length }} />}>
                        <span>
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
                        </span>
                    </Tooltip>
                </Toolbar>
            )}

            {rootNetworkModificationDialogOpen && renderRootNetworkModificationDialog()}
            {!isMonoRootStudy && renderRootNetworksListTitle()}

            {isMonoRootStudy ? renderRootNetworkForMonoRootStudy() : renderRootNetworksList()}
        </>
    );
};

export default RootNetworkNodeEditor;
