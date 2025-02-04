/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SyntheticEvent } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Dialog, Switch, Button, DialogActions, DialogContent, DialogTitle, Box, Theme } from '@mui/material';
import { PARAM_DEVELOPER_MODE } from '../../../../utils/config-params';
import { useParameterState } from '../parameters';
import { selectEnableDeveloperMode } from '../../../../redux/actions';

export interface UserSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

export const styles = {
    parameterName: (theme: Theme) => ({
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
        flexGrow: 1,
    }),
    parameterLine: {
        display: 'flex',
    },
};

/**
 * Dialog to display user settings
 * @param open Is the dialog open ?
 * @param onClose Event to close the dialog
 */
export default function UserSettingsDialog({ open, onClose }: Readonly<UserSettingsDialogProps>) {
    const dispatch = useDispatch();

    const [enableDeveloperMode, handleChangeEnableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const handleSwichDeveloperMode = (enabled: boolean) => {
        dispatch(selectEnableDeveloperMode(enabled));
        handleChangeEnableDeveloperMode(enabled);
    };

    const handleClose = (_: SyntheticEvent, reason?: string) => {
        if (reason === 'backdropClick') {
            return;
        }
        onClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle>
                <FormattedMessage id="UserSettings" />
            </DialogTitle>
            <DialogContent>
                <Box sx={styles.parameterLine}>
                    <Box sx={styles.parameterName}>
                        <FormattedMessage id="EnableDeveloperMode" />
                    </Box>
                    <Box>
                        <Switch
                            checked={enableDeveloperMode}
                            onChange={(_event, isChecked) => handleSwichDeveloperMode(isChecked)}
                            value={enableDeveloperMode}
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </Box>
                </Box>
                {enableDeveloperMode && (
                    <Alert severity="warning">
                        <FormattedMessage id="DeveloperModeWarningMsg" />
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                    <FormattedMessage id="Close" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
