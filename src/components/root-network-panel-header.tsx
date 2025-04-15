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
import {
    CaseImportParameters,
    GetCaseImportParametersReturn,
    getCaseImportParameters,
} from 'services/network-conversion';
import { setRootNetworkPanelMinimized } from 'redux/actions';

const styles = {
    headerPanel: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    }),
    toolbarIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    rootNameTitle: (theme: Theme) => ({
        flexGrow: 1,
        fontWeight: 'bold',
        marginLeft: theme.spacing(2),
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

    function formatCaseImportParameters(params: CaseImportParameters[]): CaseImportParameters[] {
        // sort possible values alphabetically to display select options sorted
        return params?.map((parameter) => ({
            ...parameter,
            possibleValues: parameter.possibleValues?.sort((a: any, b: any) => a.localeCompare(b)),
        }));
    }

    function customizeCurrentParameters(params: Parameter[]): Record<string, string> {
        return params.reduce(
            (obj, parameter) => {
                // we check if the parameter is for extensions. If so, we select all possible values by default.
                // the only way for the moment to check if the parameter is for extension, is by checking his name.
                // TODO: implement a cleaner way to determine the extensions field
                if (parameter.type === 'STRING_LIST' && parameter.name?.endsWith('extensions')) {
                    return { ...obj, [parameter.name]: parameter.possibleValues.toString() };
                }
                return obj;
            },
            {} as Record<string, string>
        );
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
    const minimizeRootNetworkPanel = useCallback(() => {
        dispatch(setRootNetworkPanelMinimized(!isPanelMinimized));
    }, [dispatch, isPanelMinimized]);

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={styles.headerPanel}>
                    <OverflowableText text={intl.formatMessage({ id: 'root' })} sx={styles.rootNameTitle} />

                    <Tooltip title={<FormattedMessage id={'addNetwork'} />}>
                        <span>
                            <IconButton
                                onClick={openRootNetworkCreationDialog}
                                size={'small'}
                                sx={{ marginLeft: 1 }}
                                disabled={rootNetworks.length >= 3 || isRootNetworksProcessing}
                            >
                                <FileUpload />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                <IconButton
                    onClick={minimizeRootNetworkPanel}
                    size={'small'}
                    sx={styles.toolbarIcon}
                    disabled={rootNetworks.length >= 3 || isRootNetworksProcessing}
                >
                    <FileUpload />
                </IconButton>
            </Box>
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
        </>
    );
};

export default RootNetworkPanelHeader;
