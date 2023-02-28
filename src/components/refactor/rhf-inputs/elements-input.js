import FormControl from '@mui/material/FormControl';
import clsx from 'clsx';
import { Grid, InputLabel } from '@mui/material';
import { FieldLabel } from '../../dialogs/inputs/hooks-helpers';
import Chip from '@mui/material/Chip';
import { OverflowableText } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DirectoryItemSelector from '../../directory-item-selector';
import React from 'react';
import { useStyles } from '../../dialogs/dialogUtils';
import { useState } from 'react';
import { useController, useFieldArray } from 'react-hook-form';
import {useIntl} from "react-intl";

const ElementsInput = ({ label, name, types, equipmentTypes, itemFilter, titleId }) => {
    const classes = useStyles();
    const intl = useIntl();
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] =
        useState(false);
    const {
        fields: elements,
        append,
        remove,
    } = useFieldArray({
        name: name,
    });
    const {
        fieldState: { error },
    } = useController({
        name,
    });

    return (
        <>
            <FormControl
                className={clsx(classes.formDirectoryElements1, {
                    [classes.formDirectoryElementsError]: error,
                })}
                error={!!error?.message}
            >
                {elements?.length === 0 && (
                    <FieldLabel label={label} optional={false} />
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
                                        text={item?.name}
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
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={append}
                types={types}
                equipmentTypes={equipmentTypes}
                title={intl.formatMessage({ id: titleId })}
                itemFilter={itemFilter}
            />
        </>
    );
};

export default ElementsInput;
