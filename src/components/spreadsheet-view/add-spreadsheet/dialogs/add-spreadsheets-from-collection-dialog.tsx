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
    RadioInput,
    SubmitButton,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { FormattedMessage, useIntl } from 'react-intl';
import { updateStudySpreadsheetConfigCollection } from 'services/study/study-config';
import { initTableDefinitions } from 'redux/actions';
import { UUID } from 'crypto';
import { dialogStyles } from '../styles/styles';
import { SpreadsheetCollectionDto, SpreadsheetTabDefinition } from 'components/spreadsheet-view/types/spreadsheet.type';
import { ResetNodeAliasCallback } from 'components/spreadsheet-view/hooks/use-node-aliases';
import {
    getSpreadsheetCollectionFormSchema,
    initialSpreadsheetCollectionForm,
    SPREADSHEET_COLLECTION,
    SPREADSHEET_COLLECTION_IMPORT_MODE,
    SpreadsheetCollectionForm,
    SpreadsheetCollectionImportMode,
} from './add-spreadsheet-form';
import { processSpreadsheetsCollectionData } from './add-spreadsheet-utils';

interface SpreadsheetCollectionDialogProps {
    open: UseStateBooleanReturn;
    resetTabIndex: (newTablesDefinitions: SpreadsheetTabDefinition[]) => void;
    resetNodeAliases: ResetNodeAliasCallback;
}

/**
 * Dialog for importing a spreadsheet collection
 */
export default function SpreadsheetCollectionDialog({
    open,
    resetTabIndex,
    resetNodeAliases,
}: Readonly<SpreadsheetCollectionDialogProps>) {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [collectionToImport, setCollectionToImport] = useState<SpreadsheetCollectionForm>();

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
        (formData: SpreadsheetCollectionForm | undefined) => {
            if (!studyUuid || !formData || formData.spreadsheetCollection.length === 0) {
                return;
            }
            const collectionId = formData.spreadsheetCollection[0].id as UUID;
            const appendMode = formData.spreadsheetCollectionMode === SpreadsheetCollectionImportMode.APPEND;
            updateStudySpreadsheetConfigCollection(studyUuid, collectionId, appendMode)
                .then((collectionData: SpreadsheetCollectionDto) => {
                    const { tablesFilters, tableGlobalFilters, tableDefinitions } =
                        processSpreadsheetsCollectionData(collectionData);
                    resetNodeAliases(appendMode, collectionData.nodeAliases);
                    dispatch(
                        initTableDefinitions(collectionData.id, tableDefinitions, tablesFilters, tableGlobalFilters)
                    );
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
        [studyUuid, dispatch, resetTabIndex, open, snackError, resetNodeAliases]
    );

    const onSubmit = useCallback(
        (formData: SpreadsheetCollectionForm) => {
            if (
                tablesDefinitions.length > 0 &&
                formData.spreadsheetCollectionMode === SpreadsheetCollectionImportMode.REPLACE
            ) {
                // Show confirmation dialog if tables already exist and we are about to replace them
                setCollectionToImport(formData);
                setConfirmationDialogOpen(true);
            } else {
                // Import directly if no tables exist, or in append mode
                importCollection(formData);
            }
        },
        [tablesDefinitions.length, importCollection]
    );

    const updateModeSelectionField = (
        <RadioInput
            name={SPREADSHEET_COLLECTION_IMPORT_MODE}
            options={[
                {
                    id: SpreadsheetCollectionImportMode.REPLACE,
                    label: intl.formatMessage({
                        id: 'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection_mode_replace',
                    }),
                },
                {
                    id: SpreadsheetCollectionImportMode.APPEND,
                    label: intl.formatMessage({
                        id: 'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection_mode_append',
                    }),
                },
            ]}
        />
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
                            <Grid item>{updateModeSelectionField}</Grid>
                            <Grid item xs>
                                <DirectoryItemsInput
                                    name={SPREADSHEET_COLLECTION}
                                    elementType={ElementType.SPREADSHEET_CONFIG_COLLECTION}
                                    titleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_collection"
                                    label="spreadsheet/create_new_spreadsheet/select_spreadsheet_collection"
                                    allowMultiSelect={false}
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
