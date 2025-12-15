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
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { unbuildAllStudyNodes } from 'services/study';

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

    return (
        <>
            <Tooltip title={intl.formatMessage({ id: 'unbuildAllNodesTooltip' })}>
                <Button size="small" sx={styles.button} onClick={handleOpenDialog}>
                    <StopCircleOutlined sx={styles.playColor} />
                </Button>
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
