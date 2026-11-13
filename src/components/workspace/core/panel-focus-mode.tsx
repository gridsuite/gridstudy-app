/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, DialogContentText, Portal } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import type { UUID } from 'node:crypto';
import { CancelButton, type MuiStyles } from '@gridsuite/commons-ui';
import { SelectOptionsDialog } from 'utils/dialogs';
import { useWorkspacePanelActions } from '../hooks/use-workspace-panel-actions';

const styles = {
    // Covers the whole app, but stays below the panel in focus mode and the dialogs
    backdrop: (theme) => ({
        zIndex: theme.zIndex.modal - 2,
    }),
    validationActions: (theme) => ({
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1,
        padding: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
    }),
} as const satisfies MuiStyles;

interface PanelFocusModeProps {
    panelId: UUID;
    /** While the changes are being sent, they can neither be discarded nor validated again */
    isValidating: boolean;
    canValidate: boolean;
    onValidate: () => void;
    onDiscard: () => void;
}

/**
 * Focus mode of a panel with changes to validate, rendered at the bottom of its content:
 * the rest of the app is blacked out, and clicking on it discards the changes after a confirmation.
 */
export const PanelFocusMode = ({ panelId, isValidating, canValidate, onValidate, onDiscard }: PanelFocusModeProps) => {
    const { setPanelFocusMode } = useWorkspacePanelActions();
    const [isLeaveConfirmationOpen, setIsLeaveConfirmationOpen] = useState(false);

    useEffect(() => {
        setPanelFocusMode({ panelId, focusMode: true });
        return () => setPanelFocusMode({ panelId, focusMode: false });
    }, [panelId, setPanelFocusMode]);

    return (
        <>
            <Portal>
                <Backdrop
                    open
                    sx={styles.backdrop}
                    onClick={isValidating ? undefined : () => setIsLeaveConfirmationOpen(true)}
                />
            </Portal>
            <SelectOptionsDialog
                title=""
                open={isLeaveConfirmationOpen}
                onClose={() => setIsLeaveConfirmationOpen(false)}
                onClick={onDiscard}
                child={
                    <DialogContentText>
                        <FormattedMessage id="genericConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey="dialog.button.leave"
            />
            <Box sx={styles.validationActions}>
                <CancelButton size="small" disabled={isValidating} onClick={onDiscard} />
                <Button size="small" variant="contained" disabled={isValidating || !canValidate} onClick={onValidate}>
                    <FormattedMessage id="validate" />
                </Button>
            </Box>
        </>
    );
};
