/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import clsx from 'clsx';
import { Grid } from '@mui/material';
import { FieldLabel } from '../inputs/hooks-helpers';
import Chip from '@mui/material/Chip';
import { OverflowableText, useSnackMessage } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DirectoryItemSelector from '../../directory-item-selector';
import React, { useCallback, useMemo, useState } from 'react';
import { useStyles } from '../../dialogs/dialogUtils';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import ErrorInput from './error-inputs/error-input';
import MidFormError from './error-inputs/mid-form-error';
import { RawReadOnlyInput } from './read-only/raw-read-only-input';
import { NAME } from '../field-constants';
import { isFieldRequired } from '../utils';

const DirectoryItemsInput = ({
    label,
    name,
    elementType, // Used to specify type of element (Filter, Contingency list, ...)
    equipmentTypes, // Mostly used for filters, it allows the user to get elements of specific equipment only
    itemFilter, // Used to further filter the results displayed according to specific requirement
    titleId, // title of directory item selector dialogue
}) => {
    const classes = useStyles();
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const types = useMemo(() => [elementType], [elementType]);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] =
        useState(false);
    const {
        fields: elements,
        append,
        remove,
    } = useFieldArray({
        name,
    });

    const { validationSchema, getValues } = useFormContext();
    const {
        fieldState: { error },
    } = useController({
        name,
    });

    const addElements = useCallback(
        (values) => {
            values.forEach((value) => {
                const { icon, children, ...otherElementAttributes } = value;
                // check if element is already present
                if (
                    getValues(name).find(
                        (v) =>
                            v?.specificMetadata?.id ===
                            otherElementAttributes.id
                    ) !== undefined
                ) {
                    snackError({
                        messageTxt: '',
                        headerId: 'ElementAlreadyUsed',
                    });
                } else {
                    append(otherElementAttributes);
                }
            });
            setDirectoryItemSelectorOpen(false);
        },
        [append, getValues, snackError, name]
    );

    return (
        <>
            <FormControl
                className={clsx(classes.formDirectoryElements1, {
                    [classes.formDirectoryElementsError]: error?.message,
                })}
                error={!!error?.message}
            >
                {elements?.length === 0 && (
                    <FieldLabel
                        label={label}
                        optional={
                            !isFieldRequired(
                                name,
                                validationSchema,
                                getValues()
                            )
                        }
                    />
                )}
                {elements?.length > 0 && (
                    <FormControl className={classes.formDirectoryElements2}>
                        {elements.map((item, index) => (
                            <Chip
                                key={item.id}
                                size="small"
                                onDelete={() => remove(index)}
                                label={
                                    <OverflowableText
                                        text={
                                            <RawReadOnlyInput
                                                name={`${name}.${index}.${NAME}`}
                                            />
                                        }
                                        style={{ width: '100%' }}
                                    />
                                }
                            />
                        ))}
                    </FormControl>
                )}
                <Grid item xs>
                    <Grid container direction="row-reverse">
                        <IconButton
                            className={classes.addDirectoryElements}
                            size={'small'}
                            onClick={() => setDirectoryItemSelectorOpen(true)}
                        >
                            <FolderIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </FormControl>
            <ErrorInput name={name} InputField={MidFormError} />
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addElements}
                types={types}
                equipmentTypes={equipmentTypes}
                title={intl.formatMessage({ id: titleId })}
                itemFilter={itemFilter}
            />
        </>
    );
};

export default DirectoryItemsInput;
