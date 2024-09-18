/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputProps,
    Stack,
    SxProps,
    TextField,
    Theme,
    Tooltip,
} from '@mui/material';
import { Functions as FunctionsIcon } from '@mui/icons-material';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { UseStateBooleanReturn } from '../../../hooks/use-states';
import { ColumnWithFormula } from './custom-columns.types';
import { useForm } from 'react-hook-form';
import { customColumnFormSchema, initialCustomColumnForm } from './custom-columns-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FOLDER_NAME } from 'components/utils/field-constants';
import CustomColumnTable from './custom-column-table';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

export type CustomColumnDialogProps = {
    open: UseStateBooleanReturn;
    baseData?: ColumnWithFormula;
    onSubmit: (data: ColumnWithFormula) => void;
};

const styles = {
    rightButtons: {
        textAlign: 'end',
        '& > *': {
            marginRight: 1,
        },
    },
} as const satisfies Record<string, SxProps<Theme>>;

// TODO: redo with react-hook-form
const nameValidationRegExp = /^[^\s$]+$/;

export default function CustomColumnDialog({ open, baseData, onSubmit }: Readonly<CustomColumnDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialCustomColumnForm,
        resolver: yupResolver(customColumnFormSchema),
    });

    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [name, setName] = useState<string>(baseData?.name ?? '');
    const [nameValid, setNameValid] = useState(false);
    const handleNameChange = useCallback<NonNullable<InputProps['onChange']>>(
        (event) => {
            setName(event.target.value ?? baseData?.name ?? '');
        },
        [baseData?.name]
    );
    useEffect(() => {
        setNameValid(nameValidationRegExp.test(name));
    }, [name]);

    const [formula, setFormula] = useState(baseData?.formula ?? '');
    const [formulaValid, setFormulaValid] = useState(false);
    const handleFormulaChange = useCallback(
        (value: string, event?: any) => {
            setFormula(value ?? baseData?.formula ?? '');
        },
        [baseData?.formula]
    );

    useEffect(() => {
        setFormulaValid(!!formula);
    }, [formula]);

    const onSubmitClick = useCallback(() => {
        try {
            onSubmit({ name, formula });
            open.setFalse();
        } catch (error: unknown) {
            console.error(error);
            snackError({
                messageTxt: (error as Error).message,
                headerId: 'spreadsheet/custom_column/dialog_edit/submit_error',
            });
        }
    }, [formula, name, onSubmit, open, snackError]);

    const [contentModified, setContentModified] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line eqeqeq
        setContentModified(baseData?.name != name || baseData?.formula != formula);
    }, [baseData?.formula, baseData?.name, formula, name]);

    useEffect(() => {
        if (open.value) {
            setName(baseData?.name ?? '');
            setFormula(baseData?.formula ?? '');
        }
    }, [baseData?.formula, baseData?.name, open.value]);

    return (
        <Dialog
            id="custom-column-dialog-edit"
            open={open.value}
            onClose={open.setFalse}
            aria-labelledby="custom-column-dialog-edit-title"
        >
            <DialogTitle id="custom-column-dialog-edit-title">
                <FormattedMessage
                    id={
                        baseData === undefined
                            ? 'spreadsheet/custom_column/dialog_edit/title_add'
                            : 'spreadsheet/custom_column/dialog_edit/title_edit'
                    }
                />
            </DialogTitle>
            <Box display="flex" justifyContent="end" padding="10px">
                {/* Bouton Download */}
                <Tooltip title="Download">
                    <IconButton color="primary" /* onClick={handleDownload} */>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>

                {/* Bouton Upload */}
                <Tooltip title="Upload">
                    <IconButton color="primary" /* onClick={handleUpload} */>
                        <UploadIcon />
                    </IconButton>
                </Tooltip>

                {/* Bouton Save to GridExplore */}
                <Tooltip title="Save to GridExplore">
                    <IconButton color="primary" /* onClick={handleSave} */>
                        <SaveIcon />
                    </IconButton>
                </Tooltip>

                {/* Bouton Insert from GridExplore */}
                <Tooltip title="Insert from GridExplore">
                    <IconButton color="primary" /* onClick={handleInsert} */>
                        <CreateNewFolderIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <DialogContent dividers>
                <CustomFormProvider validationSchema={customColumnFormSchema} {...formMethods}>
                    <CustomColumnTable />
                </CustomFormProvider>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={0.5}>
                    <Grid item xs="auto">
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'spreadsheet/custom_column/dialog_edit/functions_tooltip',
                            })}
                            //TODO onclick show popup help
                            // columns available + node struct
                            // https://mathjs.org/docs/reference/functions.html
                            // https://mathjs.org/docs/reference/constants.html
                            // idea: maybe show instead a side-view tree/list
                        >
                            <IconButton aria-label="functions-list-btn" onClick={undefined /*TODO*/}>
                                <FunctionsIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item xs sx={styles.rightButtons}>
                        <Button onClick={open.setFalse} variant="contained" color="secondary">
                            <FormattedMessage id="cancel" />
                        </Button>
                        <Button
                            onClick={onSubmitClick}
                            variant="contained"
                            color="primary"
                            disabled={!contentModified || !formulaValid || !nameValid}
                        >
                            <FormattedMessage id="spreadsheet/custom_column/ok" />
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}
