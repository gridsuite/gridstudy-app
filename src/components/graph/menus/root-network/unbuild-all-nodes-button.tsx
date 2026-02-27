/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CancelButton, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { StopCircleOutlined } from '@mui/icons-material';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Theme,
    Tooltip,
} from '@mui/material';
import { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { unbuildAllStudyNodes } from 'services/study/study';
import { NETWORK_MODIFICATION } from '../../../../utils/report/report.constant';
import { BuildStatus } from '@gridsuite/commons-ui/components/node/constant';

const styles = {
    button: {
        minWidth: '40px',
    },
    playColor: (theme: Theme) => ({
        color: theme.palette.error.main,
    }),
};

export const UnbuildAllNodesButton = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCloseDialog = () => {
        setIsValidationDialogOpen(false);
    };

    const handleOpenDialog = () => {
        setIsValidationDialogOpen(true);
    };

    const handleUnbuildAllNodes = () => {
        if (!studyUuid) {
            return;
        }
        setIsLoading(true);
        unbuildAllStudyNodes(studyUuid)
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'unbuildAllNodesError' });
            })
            .finally(() => {
                handleCloseDialog();
                setIsLoading(false);
            });
    };

    const allNodesUnBuilt = useMemo(() => {
        if (!treeModel) {
            return false;
        }
        return treeModel.treeNodes
            .filter((treeNode) => treeNode.type === NETWORK_MODIFICATION)
            .every(
                (treeNode) =>
                    treeNode.data.globalBuildStatus === BuildStatus.NOT_BUILT ||
                    treeNode.data.globalBuildStatus === undefined
            );
    }, [treeModel]);

    return (
        <>
            <Tooltip title={intl.formatMessage({ id: 'unbuildAllNodesTooltip' })} disableInteractive>
                <span style={{ display: 'inline-block' }}>
                    <Button size="small" sx={styles.button} onClick={handleOpenDialog} disabled={allNodesUnBuilt}>
                        <StopCircleOutlined sx={allNodesUnBuilt ? undefined : styles.playColor} />
                    </Button>
                </span>
            </Tooltip>
            <Dialog open={isValidationDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle style={{ display: 'flex' }} data-testid="DialogTitle">
                    <FormattedMessage id="unbuildAllNodesDialogTitle" />
                </DialogTitle>
                <DialogContent>
                    <FormattedMessage id="unbuildAllNodesDialogContent" />
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={handleCloseDialog} disabled={isLoading} data-testid="CancelButton" />
                    <Button
                        onClick={handleUnbuildAllNodes}
                        variant="outlined"
                        disabled={isLoading}
                        data-testid="DeleteButton"
                    >
                        {(isLoading && <CircularProgress size={24} />) || <FormattedMessage id="delete" />}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
