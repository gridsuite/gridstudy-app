/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
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
import { useSnackMessage } from '@gridsuite/commons-ui';
import { UseStateBooleanReturn } from '../../../hooks/use-states';
import { ColumnWithFormula } from './custom-columns.types';
import { ExcelFormulaTextarea } from '../../inputs/excel-forumla-textarea';

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
            <DialogContent dividers>
                <Stack direction="column" justifyContent="flex-start" alignItems="stretch" spacing={1}>
                    <TextField
                        name="custom-column-dialog-formula-name"
                        label={intl.formatMessage({ id: 'spreadsheet/custom_column/dialog_edit/name' })}
                        fullWidth
                        //Warning: MuiOutlinedInputInput contains an input of type text with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components
                        //defaultValue={baseData?.name}
                        value={name}
                        required
                        error={!nameValid}
                        onChange={handleNameChange}
                        helperText={intl.formatMessage({
                            id: nameValid
                                ? 'spreadsheet/custom_column/dialog_edit/name_description'
                                : 'spreadsheet/custom_column/dialog_edit/name_invalid',
                        })}
                    />
                    <ExcelFormulaTextarea
                        name="custom-column-dialog-formula-content"
                        placeholder={baseData?.formula}
                        value={formula}
                        debounceChangePeriod={1000}
                        onChange={handleFormulaChange}
                        //TODO width+height 100%
                    />
                </Stack>
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
