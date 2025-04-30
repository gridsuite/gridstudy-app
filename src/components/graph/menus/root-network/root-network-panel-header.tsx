/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { SetStateAction, useCallback, useState } from 'react';
import { Box, IconButton, Theme, Tooltip, Typography } from '@mui/material';
import { AppState } from 'redux/reducer';
import {
    LeftPanelCloseIcon,
    LeftPanelOpenIcon,
    OverflowableText,
    Parameter,
    fetchDirectoryElementPath,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FormattedMessage, useIntl } from 'react-intl/lib';
import { FileUpload } from '@mui/icons-material';
import RootNetworkDialog, { FormData } from '../../../dialogs/root-network/root-network-dialog';
import { createRootNetwork } from 'services/root-network';
import { UUID } from 'crypto';
import { GetCaseImportParametersReturn, getCaseImportParameters } from 'services/network-conversion';
import { customizeCurrentParameters, formatCaseImportParameters } from '../../util/case-import-parameters';
import { useDispatch, useSelector } from 'react-redux';
import { SetMonoRootStudy } from 'redux/actions';
import { CustomDialog } from 'components/utils/custom-dialog';

const styles = {
    headerPanel: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    }),
    rootNameTitle: (theme: Theme) => ({
        fontWeight: 'bold',
    }),
    headerLeftContainer: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
    }),
    uploadButton: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
    }),
};
interface RootNetworkPanelHeaderProps {
    isRootNetworksProcessing: boolean;
    setIsRootNetworksProcessing: React.Dispatch<SetStateAction<boolean>>;
    isRootNetworkPanelMinimized: boolean;
    setIsRootNetworkPanelMinimized: React.Dispatch<SetStateAction<boolean>>;
}

const RootNetworkPanelHeader: React.FC<RootNetworkPanelHeaderProps> = ({
    isRootNetworksProcessing,
    setIsRootNetworksProcessing,
    isRootNetworkPanelMinimized,
    setIsRootNetworkPanelMinimized,
}) => {
    const { snackError } = useSnackMessage();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const dispatch = useDispatch();

    const intl = useIntl();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [rootNetworkCreationDialogOpen, setRootNetworkCreationDialogOpen] = useState(false);
    const [rootNetworkConfirmCreationDialogOpen, setRootNetworkConfirmCreationDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [studyName, setStudyName] = useState<string | null>(null);

    const openRootNetworkConfirmCreationDialog = useCallback(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid)
                .then((response) => {
                    const studyName = response[response.length - 1]?.elementName;
                    setStudyName(studyName);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'LoadStudyAndParentsInfoError',
                    });
                });
        }
        setRootNetworkConfirmCreationDialogOpen(true);
    }, [snackError, studyUuid]);

    const openRootNetworkCreationDialog = useCallback(() => {
        setRootNetworkCreationDialogOpen(true);
    }, []);

    const confirmRootNetworkCreation = () => {
        if (formData) {
            doCreateRootNetwork(formData);
        }
        setRootNetworkConfirmCreationDialogOpen(false);
    };

    const renderRootNetworkConfirmCreationDialog = () => {
        return (
            <>
                {rootNetworkConfirmCreationDialogOpen && (
                    <CustomDialog
                        content={renderRootNetworkConfirmationContent()}
                        onValidate={confirmRootNetworkCreation}
                        validateButtonLabel="button.continue"
                        onClose={() => setRootNetworkConfirmCreationDialogOpen(false)}
                    />
                )}
            </>
        );
    };

    const renderRootNetworkConfirmationContent = () => {
        return (
            <Typography sx={{ whiteSpace: 'pre-line' }}>
                <FormattedMessage
                    id="confirmRootNetworkCreation"
                    values={{
                        studyName,
                    }}
                />
            </Typography>
        );
    };
    const handleRootNetworkCreation = (data: FormData) => {
        setFormData(data);
        openRootNetworkConfirmCreationDialog();
        setRootNetworkCreationDialogOpen(false);
    };
    const renderRootNetworkCreationDialog = () => {
        return (
            <RootNetworkDialog
                open={rootNetworkCreationDialogOpen}
                onClose={() => setRootNetworkCreationDialogOpen(false)}
                onSave={isMonoRootStudy ? handleRootNetworkCreation : doCreateRootNetwork}
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
                createRootNetwork(caseId as UUID, params.formatName, name, tag, studyUuid, customizedCurrentParameters);
                if (isMonoRootStudy && rootNetworks.length === 1) {
                    dispatch(SetMonoRootStudy(false));
                }
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
        setIsRootNetworkPanelMinimized((prev) => !prev);
    }, [setIsRootNetworkPanelMinimized]);

    return (
        <>
            <Box sx={styles.headerPanel}>
                <Box sx={styles.headerLeftContainer}>
                    <OverflowableText sx={styles.rootNameTitle} text={intl.formatMessage({ id: 'root' })} />

                    <Tooltip title={<FormattedMessage id={'addNetwork'} />}>
                        <span>
                            <IconButton
                                onClick={openRootNetworkCreationDialog}
                                size={'small'}
                                sx={styles.uploadButton}
                                disabled={rootNetworks.length >= 3 || isRootNetworksProcessing}
                            >
                                <FileUpload />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
                <IconButton onClick={minimizeRootNetworkPanel} size={'small'}>
                    {isRootNetworkPanelMinimized ? <LeftPanelOpenIcon /> : <LeftPanelCloseIcon />}
                </IconButton>
            </Box>
            {rootNetworkCreationDialogOpen && renderRootNetworkCreationDialog()}
            {rootNetworkConfirmCreationDialogOpen && renderRootNetworkConfirmCreationDialog()}
        </>
    );
};

export default RootNetworkPanelHeader;
