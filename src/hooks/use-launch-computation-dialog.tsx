/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { DialogContentText } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer.type';
import { SelectOptionsDialog } from 'utils/dialogs';

export const useLaunchComputationDialog = () => {
    const isDirtyComputationParameters = useSelector((state: AppState) => state.isDirtyComputationParameters);
    const [isLaunchingPopupOpen, setIsLaunchingPopupOpen] = useState(false);
    const pendingComputationRef = useRef<(() => void) | null>(null);

    const handleLaunchingPopupClose = useCallback(() => {
        setIsLaunchingPopupOpen(false);
        pendingComputationRef.current = null;
    }, []);

    const handleLaunchingPopupConfirm = useCallback(() => {
        setIsLaunchingPopupOpen(false);
        pendingComputationRef.current?.();
        pendingComputationRef.current = null;
    }, []);

    const launchComputationWithConfirmation = useCallback(
        (computationCallback: () => void) => {
            if (isDirtyComputationParameters) {
                pendingComputationRef.current = computationCallback;
                setIsLaunchingPopupOpen(true);
            } else {
                computationCallback();
            }
        },
        [isDirtyComputationParameters]
    );

    const renderComputationLaunchConfirmationDialog = useCallback(() => {
        return (
            <SelectOptionsDialog
                title=""
                open={isLaunchingPopupOpen}
                onClose={handleLaunchingPopupClose}
                onClick={handleLaunchingPopupConfirm}
                child={
                    <DialogContentText>
                        <FormattedMessage id="launchComputationConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey="dialog.button.launch"
            />
        );
    }, [isLaunchingPopupOpen, handleLaunchingPopupClose, handleLaunchingPopupConfirm]);

    return {
        launchComputationWithConfirmation: launchComputationWithConfirmation,
        renderComputationLaunchConfirmationDialog: renderComputationLaunchConfirmationDialog,
    };
};
