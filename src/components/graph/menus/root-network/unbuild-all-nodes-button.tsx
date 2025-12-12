import { CancelButton } from '@gridsuite/commons-ui';
import { StopCircleOutlined } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import TreeControlButton from 'components/graph/util/tree-control-button';
import { R } from 'components/utils/field-constants';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { unbuildAllStudyNodes } from 'services/study';

export const UnbuildAllNodesButton = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
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
        unbuildAllStudyNodes(studyUuid).then(() => {
            setIsLoading(false);
            handleCloseDialog();
        });
    };

    return (
        <>
            <TreeControlButton titleId="DisplayTheWholeTree" onClick={handleOpenDialog}>
                <StopCircleOutlined />
            </TreeControlButton>
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
