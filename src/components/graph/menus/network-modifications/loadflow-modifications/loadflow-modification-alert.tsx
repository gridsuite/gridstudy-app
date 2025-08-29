/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CheckCircleOutlined } from '@mui/icons-material';
import { Alert, Button, Theme } from '@mui/material';
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
