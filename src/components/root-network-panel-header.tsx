/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { SetStateAction, useCallback, useState } from 'react';
import { Box, IconButton, Theme, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { OverflowableText, Parameter, useSnackMessage } from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { FileUpload } from '@mui/icons-material';
import RootNetworkDialog, { FormData } from './dialogs/root-network/root-network-dialog';
import { createRootNetwork } from 'services/root-network';
import { UUID } from 'crypto';
import { GetCaseImportParametersReturn, getCaseImportParameters } from 'services/network-conversion';
import { setRootNetworkPanelMinimized } from 'redux/actions';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { customizeCurrentParameters, formatCaseImportParameters } from './graph/util/case-import-parameters';

const styles = {
    headerPanel: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    }),
    rootNameTitle: (theme: Theme) => ({
        flexGrow: 1,
        fontWeight: 'bold',
        marginLeft: theme.spacing(2),
    }),
    uploadButton: (theme: Theme) => ({
        marginRight: theme.spacing(14),
    }),
};
interface RootNetworkPanelHeaderProps {
    isRootNetworksProcessing: boolean;
    setIsRootNetworksProcessing: React.Dispatch<SetStateAction<boolean>>;
}

const RootNetworkPanelHeader: React.FC<RootNetworkPanelHeaderProps> = ({
    isRootNetworksProcessing,
    setIsRootNetworksProcessing,
}) => {
    const { snackError } = useSnackMessage();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const intl = useIntl();
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const isPanelMinimized = useSelector((state: AppState) => state.isRootNetworkPanelMinimized);
    const openRootNetworkCreationDialog = useCallback(() => {
        setRootNetworkCreationDialogOpen(true);
    }, []);
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
    const minimizeRootNetworkPanel = useCallback(() => {
        dispatch(setRootNetworkPanelMinimized(!isPanelMinimized));
    }, [dispatch, isPanelMinimized]);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={styles.headerPanel}>
                    <OverflowableText text={intl.formatMessage({ id: 'root' })} sx={styles.rootNameTitle} />

                    <Tooltip title={<FormattedMessage id={'addNetwork'} />}>
                        <span>
                            <IconButton
                                onClick={openRootNetworkCreationDialog}
                                size={'small'}
                                sx={isPanelMinimized ? undefined : styles.uploadButton}
                                disabled={rootNetworks.length >= 3 || isRootNetworksProcessing}
                            >
                                <FileUpload />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <IconButton onClick={minimizeRootNetworkPanel} size={'small'}>
                        {isPanelMinimized ? <PanelLeftOpen /> : <PanelRightOpen />}
                    </IconButton>
                </Box>
            </Box>
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
        </>
    );
};

export default RootNetworkPanelHeader;
