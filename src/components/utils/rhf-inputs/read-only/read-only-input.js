/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController } from 'react-hook-form';
import { TextField } from '@mui/material';
import { genHelperError } from '../../inputs/hooks-helpers';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    readOnlyTextField: {
        '& fieldset': {
            padding: '0',
        },
        '& input': {
            paddingLeft: 0,
            paddingRight: 0,
        },
    },
    readOnlyTextFieldNoBorder: {
        '& fieldset': {
            border: 'none',
        },
    },
}));

export function ReadOnlyInput({ name }) {
    const classes = useStyles();
    const {
        field: { value },
        fieldState: { error },
    } = useController({ name });

    return (
        <TextField
            InputProps={{
                readOnly: true,
                disableUnderline: true,
            }}
            multiline
            size="small"
            fullWidth
            value={value}
            className={clsx(classes.readOnlyTextField, {
                [classes.readOnlyTextFieldNoBorder]: !error,
            })}
            {...genHelperError(error?.message)}
        />
    );
}
