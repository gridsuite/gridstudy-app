import { CheckCircleOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Theme } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LoadflowModifications } from './loadflow-modifications';

const styles = {
    paper: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background: theme.palette.background.paper,
    }),
    loadFlowModif: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2),
    }),
    icon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
        fontSize: theme.spacing(2.75),
    }),
};

export const LoadflowModificationAlert = () => {
    const [isModificationDialogOpen, setIsModificationDialogOpen] = useState(false);

    const handleDetailsClick = () => {
        setIsModificationDialogOpen(true);
    };

    const handleLoadflowModificationsClose = () => {
        setIsModificationDialogOpen(false);
    };

    return (
        <>
            <Alert
                sx={styles.loadFlowModif}
                icon={<CheckCircleOutlined sx={styles.icon} />}
                action={
                    <Button onClick={handleDetailsClick}>
                        <FormattedMessage id="loadFlowModificationDetails" />
                    </Button>
                }
                severity="success"
            >
                <FormattedMessage id="loadFlowModification" />
            </Alert>
            {isModificationDialogOpen && (
                <LoadflowModifications open={isModificationDialogOpen} onClose={handleLoadflowModificationsClose} />
            )}
        </>
    );
};
