/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import React, { ReactNode } from 'react';
import { UseFormSearchCopy } from './use-form-search-copy';
import { FormattedMessage } from 'react-intl';
import { CancelButton, useButtonWithTooltip } from '@gridsuite/commons-ui';
import { DialogProps } from '@mui/material/Dialog/Dialog';

/**
 * Common parts for the Modification Dialog
 * @param {String} titleId id for title translation
 * @param {Object} onOpenCatalogDialog Object managing catalog
 * @param {Object} searchCopy Object managing search equipments for copy
 * @param {ReactElement} subtitle subtitle component to put inside DialogTitle
 * @param {Boolean} isDataFetching props to display loading
 * @param {ReactElement} submitButton submitButton to put in the dialog's footer
 * @param {CallbackEvent} closeAndClear callback when the dialog needs to be closed and cleared
 * @param {Array} dialogProps props that are forwarded to the MUI Dialog component
 */

export type ModificationDialogContentProps = Omit<DialogProps, 'onClose' | 'aria-labelledby'> & {
    closeAndClear: () => void;
    isDataFetching?: boolean;
    titleId: string;
    onOpenCatalogDialog?: () => void;
    searchCopy?: UseFormSearchCopy;
    submitButton: ReactNode;
    subtitle?: ReactNode;
};

export function ModificationDialogContent({
    closeAndClear,
    isDataFetching = false,
    titleId,
    onOpenCatalogDialog,
    searchCopy,
    submitButton,
    subtitle,
    ...dialogProps
}: Readonly<ModificationDialogContentProps>) {
    const catalogButton = useButtonWithTooltip({
        label: 'CatalogButtonTooltip',
        handleClick: onOpenCatalogDialog ?? (() => {}),
        icon: <AutoStoriesOutlinedIcon />,
    });
    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy?.handleOpenSearchDialog ?? (() => {}),
        icon: <FindInPageIcon />,
    });

    const handleClose = (event_: React.MouseEvent, reason: string) => {
        // don't close the dialog for outside click
        if (reason !== 'backdropClick') {
            closeAndClear();
        }
    };

    const handleCancel = () => {
        closeAndClear();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby={titleId} {...dialogProps}>
            {isDataFetching && <LinearProgress />}
            <DialogTitle>
                <Grid container spacing={2} justifyContent={'space-between'}>
                    <Grid item xs={6}>
                        <FormattedMessage id={titleId} />
                    </Grid>

                    <Grid item xs={6} container spacing={2} justifyContent={'right'}>
                        {onOpenCatalogDialog && (
                            <Grid item xs={1}>
                                {catalogButton}
                            </Grid>
                        )}
                        {searchCopy && (
                            <Grid item xs={1}>
                                {copyEquipmentButton}
                            </Grid>
                        )}
                    </Grid>
                    {subtitle && (
                        <Grid item xs={12}>
                            {subtitle}
                        </Grid>
                    )}
                </Grid>
            </DialogTitle>
            <DialogContent>{dialogProps.children}</DialogContent>
            <DialogActions>
                <CancelButton onClick={handleCancel} />
                {submitButton}
            </DialogActions>
        </Dialog>
    );
}
