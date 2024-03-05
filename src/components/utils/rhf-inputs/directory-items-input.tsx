/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import { Grid } from '@mui/material';
import { FieldLabel } from '@gridsuite/commons-ui';
import Chip from '@mui/material/Chip';
import { OverflowableText, useSnackMessage } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DirectoryItemSelector from '../../directory-item-selector';
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { styles } from '../../dialogs/dialogUtils';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { ErrorInput } from '@gridsuite/commons-ui';
import { MidFormError } from '@gridsuite/commons-ui';
import { RawReadOnlyInput } from './read-only/raw-read-only-input';
import { NAME } from '../field-constants';
import { isFieldFromContextRequired } from '../utils';
import Tooltip from '@mui/material/Tooltip';
import { mergeSx } from '../functions';

interface DirectoryItemsInputProps {
    label: string | undefined;
    name: string;
    elementType: string;
    equipmentTypes: string[];
    itemFilter?: any;
    titleId?: string;
    hideErrorMessage?: boolean;
    onRowChanged?: (a: boolean) => void;
    disable?: boolean;
}

const DirectoryItemsInput: FunctionComponent<DirectoryItemsInputProps> = ({
    label,
    name,
    elementType, // Used to specify type of element (Filter, Contingency list, ...)
    equipmentTypes, // Mostly used for filters, it allows the user to get elements of specific equipment only
    itemFilter, // Used to further filter the results displayed according to specific requirement
    titleId, // title of directory item selector dialogue
    hideErrorMessage,
    onRowChanged,
    disable = false,
}) => {
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

    const formContext = useFormContext();
    const { getValues } = formContext;
    const {
        fieldState: { error },
    } = useController({
        name,
    });

    const addElements = useCallback(
        (values: any[]) => {
            values.forEach((value) => {
                const { icon, children, ...otherElementAttributes } = value;

                // Check if the element is already present
                if (
                    getValues(name).find(
                        (v: any) => v?.id === otherElementAttributes.id
                    ) !== undefined
                ) {
                    snackError({
                        messageTxt: '',
                        headerId: 'ElementAlreadyUsed',
                    });
                } else {
                    append(otherElementAttributes);
                    onRowChanged && onRowChanged(true);
                }
            });
            setDirectoryItemSelectorOpen(false);
        },
        [append, getValues, snackError, name, onRowChanged]
    );

    const removeElements = useCallback(
        (index: number) => {
            remove(index);
            onRowChanged && onRowChanged(true);
        },
        [onRowChanged, remove]
    );

    return (
        <>
            <FormControl
                sx={mergeSx(
                    styles.formDirectoryElements1,
                    error?.message && styles.formDirectoryElementsError
                )}
                error={!!error?.message}
            >
                {elements?.length === 0 && label && (
                    <FieldLabel
                        label={label}
                        optional={
                            !isFieldFromContextRequired(
                                name,
                                formContext,
                                getValues()
                            )
                        }
                    />
                )}
                {elements?.length > 0 && (
                    <FormControl sx={styles.formDirectoryElements2}>
                        {elements.map((item, index) => (
                            <Chip
                                key={item.id}
                                size="small"
                                onDelete={() => removeElements(index)}
                                label={
                                    <OverflowableText
                                        text={
                                            <RawReadOnlyInput
                                                name={`${name}.${index}.${NAME}`}
                                            />
                                        }
                                        sx={{ width: '100%' }}
                                    />
                                }
                            />
                        ))}
                    </FormControl>
                )}
                <Grid item xs>
                    <Grid container direction="row-reverse">
                        <Tooltip
                            title={intl.formatMessage({ id: 'chooseElement' })}
                        >
                            <span>
                                <IconButton
                                    sx={styles.addDirectoryElements}
                                    size={'small'}
                                    disabled={disable}
                                    onClick={() =>
                                        setDirectoryItemSelectorOpen(true)
                                    }
                                >
                                    <FolderIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>
            </FormControl>
            {!hideErrorMessage && (
                <ErrorInput name={name} InputField={MidFormError} />
            )}
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
