/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Alert } from '@mui/material';
import { useButtonWithTooltip } from '../../utils/inputs/input-hooks';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useSelector } from 'react-redux';
import { BUILD_STATUS } from '../../network/constants';
import { Theme } from '@mui/material/styles';
import React, { ReactNode } from 'react';
import { UseFormSearchCopy } from './use-form-search-copy';
import { FormattedMessage } from 'react-intl';
import { CancelButton } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer';
import { DialogProps } from '@mui/material/Dialog/Dialog';

const styles = {
    warningMessage: (theme: Theme) => ({
        backgroundColor: theme.formFiller.background,
    }),
};

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
    children?: ReactNode;
    closeAndClear: (event: React.MouseEvent, reason: string) => void;
    isDataFetching?: boolean;
    titleId: string;
    onOpenCatalogDialog?: () => void;
    searchCopy?: UseFormSearchCopy;
    showNodeNotBuiltWarning?: boolean;
    submitButton: ReactNode;
    subtitle?: ReactNode;
};

export function ModificationDialogContent({
    children,
    closeAndClear,
    isDataFetching = false,
    titleId,
    onOpenCatalogDialog,
    searchCopy,
    showNodeNotBuiltWarning = false,
    submitButton,
    subtitle,
    ...dialogProps
}: Readonly<ModificationDialogContentProps>) {
    const catalogButton = useButtonWithTooltip({
        label: 'CatalogButtonTooltip',
        handleClick: onOpenCatalogDialog,
        icon: <AutoStoriesOutlinedIcon />,
    });
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isNodeNotBuilt = currentNode?.data?.globalBuildStatus === BUILD_STATUS.NOT_BUILT;
    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy?.handleOpenSearchDialog,
        icon: <FindInPageIcon />,
    });

    const handleClose = (event: React.MouseEvent, reason: string) => {
        if (reason !== 'backdropClick') {
            closeAndClear(event, reason);
        }
    };

    const handleCancel = (event: React.MouseEvent) => {
        closeAndClear(event, 'cancelButtonClick');
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
                        {showNodeNotBuiltWarning && isNodeNotBuilt && (
                            <Grid item xs={10}>
                                <Alert severity={'warning'} sx={styles.warningMessage}>
                                    <FormattedMessage id="ModifyNodeNotBuiltWarningMsg" />
                                </Alert>
                            </Grid>
                        )}
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
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <CancelButton onClick={handleCancel} />
                {submitButton}
            </DialogActions>
        </Dialog>
    );
}
