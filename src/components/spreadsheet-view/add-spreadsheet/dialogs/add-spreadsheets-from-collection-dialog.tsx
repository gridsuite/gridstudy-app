/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import {
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    ModificationDialog,
    PopupConfirmationDialog,
    RadioInput,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useIntl } from 'react-intl';
import { updateStudySpreadsheetConfigCollection } from 'services/study/study-config';
import { initTableDefinitions } from 'redux/actions';
import type { UUID } from 'node:crypto';
import { dialogStyles } from '../styles/styles';
import { SpreadsheetCollectionDto } from 'components/spreadsheet-view/types/spreadsheet.type';
import {
    getSpreadsheetCollectionFormSchema,
    initialSpreadsheetCollectionForm,
    SPREADSHEET_COLLECTION,
    SPREADSHEET_COLLECTION_IMPORT_MODE,
    SpreadsheetCollectionForm,
    SpreadsheetCollectionImportMode,
} from './add-spreadsheet-form';
import { processSpreadsheetsCollectionData } from './add-spreadsheet-utils';
import type { DialogComponentProps } from '../types';
import { useNodeAliases } from '../../hooks/use-node-aliases';

/**
 * Dialog for importing a spreadsheet collection
 */
export default function AddSpreadsheetsFromCollectionDialog({ open }: Readonly<DialogComponentProps>) {
    const dispatch = useDispatch();
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const { resetNodeAliases } = useNodeAliases();

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [collectionToImport, setCollectionToImport] = useState<SpreadsheetCollectionForm>();

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const formSchema = getSpreadsheetCollectionFormSchema();

    const formMethods = useForm({
        defaultValues: initialSpreadsheetCollectionForm,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    // Reset form when the dialog opens
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
                    const { tablesFilters, tableGlobalFilters, tableDefinitions, tablesSorts } =
                        processSpreadsheetsCollectionData(collectionData);
                    resetNodeAliases(appendMode, collectionData.nodeAliases);
                    dispatch(
                        initTableDefinitions(
                            collectionData.id,
                            tableDefinitions,
                            tablesFilters,
                            tableGlobalFilters,
                            tablesSorts
                        )
                    );
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'spreadsheet/create_new_spreadsheet/error_loading_collection',
                    });
                });
            setConfirmationDialogOpen(false);
            open.setFalse();
        },
        [studyUuid, dispatch, open, snackError, resetNodeAliases]
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
                    label: 'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection_mode_replace',
                },
                {
                    id: SpreadsheetCollectionImportMode.APPEND,
                    label: 'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection_mode_append',
                },
            ]}
        />
    );

    return (
        <>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <ModificationDialog
                    titleId={'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection'}
                    open={open.value}
                    onClose={open.setFalse}
                    onSave={onSubmit}
                    onClear={() => null}
                    PaperProps={{ sx: dialogStyles.dialogContent }}
                >
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
                </ModificationDialog>
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
