/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import {
    CancelButton,
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    PopupConfirmationDialog,
    SubmitButton,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    SPREADSHEET_COLLECTION,
    getSpreadsheetCollectionFormSchema,
    initialSpreadsheetCollectionForm,
} from '../custom-spreadsheet-form';
import { updateStudySpreadsheetConfigCollection } from 'services/study/study-config';
import { initTableDefinitions } from 'redux/actions';
import { UUID } from 'crypto';
import { dialogStyles } from './styles';
import { SpreadsheetCollectionDto, SpreadsheetTabDefinition } from 'components/spreadsheet/config/spreadsheet.type';
import { mapColumnsDto } from '../custom-spreadsheet-utils';

interface SpreadsheetCollectionDialogProps {
    open: UseStateBooleanReturn;
    resetTabIndex: (newTablesDefinitions: SpreadsheetTabDefinition[]) => void;
}

/**
 * Dialog for importing a spreadsheet collection
 */
export default function SpreadsheetCollectionDialog({
    open,
    resetTabIndex,
}: Readonly<SpreadsheetCollectionDialogProps>) {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [collectionToImport, setCollectionToImport] = useState<any>(null);

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const formSchema = getSpreadsheetCollectionFormSchema();

    const formMethods = useForm({
        defaultValues: initialSpreadsheetCollectionForm,
        resolver: yupResolver(formSchema),
    });

    const { handleSubmit, reset } = formMethods;

    // Reset form when dialog opens
    useEffect(() => {
        reset(initialSpreadsheetCollectionForm);
    }, [open.value, reset]);

    const importCollection = useCallback(
        (collection: { id: UUID; name: string }) => {
            if (!collection?.id || !studyUuid) {
                return;
            }

            updateStudySpreadsheetConfigCollection(studyUuid, collection.id)
                .then((collectionData: SpreadsheetCollectionDto) => {
                    const tableDefinitions = collectionData.spreadsheetConfigs.map((spreadsheetConfig, index) => ({
                        uuid: spreadsheetConfig.id,
                        index: index,
                        name: spreadsheetConfig.name,
                        columns: mapColumnsDto(spreadsheetConfig.columns),
                        type: spreadsheetConfig.sheetType,
                    }));

                    dispatch(initTableDefinitions(collectionData.id, tableDefinitions || []));
                    resetTabIndex(tableDefinitions);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error,
                        headerId: 'spreadsheet/create_new_spreadsheet/error_loading_collection',
                    });
                });
            setConfirmationDialogOpen(false);
            open.setFalse();
        },
        [studyUuid, dispatch, resetTabIndex, open, snackError]
    );

    const onSubmit = useCallback(
        (formData: any) => {
            const collection = formData[SPREADSHEET_COLLECTION][0];

            if (tablesDefinitions.length > 0) {
                // Show confirmation dialog if tables already exist
                setCollectionToImport(collection);
                setConfirmationDialogOpen(true);
            } else {
                // Import directly if no tables exist
                importCollection(collection);
            }
        },
        [tablesDefinitions.length, importCollection]
    );

    return (
        <>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <Dialog
                    id="spreadsheet-collection-dialog"
                    open={open.value}
                    onClose={open.setFalse}
                    aria-labelledby="spreadsheet-collection-dialog-title"
                    PaperProps={{ sx: dialogStyles.dialogContent }}
                >
                    <DialogTitle id="spreadsheet-collection-dialog-title">
                        <FormattedMessage id="spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection" />
                    </DialogTitle>

                    <DialogContent dividers>
                        <Grid container spacing={2} direction="column">
                            <Grid item xs>
                                <DirectoryItemsInput
                                    name={SPREADSHEET_COLLECTION}
                                    elementType={ElementType.SPREADSHEET_CONFIG_COLLECTION}
                                    titleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_collection"
                                    label="spreadsheet/create_new_spreadsheet/select_spreadsheet_collection"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions>
                        <Grid container spacing={0.5}>
                            <Grid item xs>
                                <Box sx={dialogStyles.actionButtons}>
                                    <CancelButton onClick={open.setFalse} />
                                    <SubmitButton onClick={handleSubmit(onSubmit)} variant="outlined" />
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Dialog>
            </CustomFormProvider>

            {confirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({
                        id: 'spreadsheet/create_new_spreadsheet/replace_collection_confirmation',
                    })}
                    openConfirmationPopup={confirmationDialogOpen}
                    setOpenConfirmationPopup={setConfirmationDialogOpen}
                    handlePopupConfirmation={() => importCollection(collectionToImport)}
                />
            )}
        </>
    );
}
