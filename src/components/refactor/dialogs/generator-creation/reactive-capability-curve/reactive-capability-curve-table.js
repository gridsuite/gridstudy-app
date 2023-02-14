/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { useStyles } from '../../../../dialogs/dialogUtils';
import { useFieldArray, useForm } from 'react-hook-form';
import ReactiveCapabilityCurveForm from './reactive-capability-curve-form';
import { REACTIVE_CAPABILITY_CURVE_TABLE } from '../../../utils/field-constants';

function getId(value) {
    return value?.id ? value.id : 'defaultId';
}

export const ReactiveCapabilityCurveTable = ({
    tableHeadersIds,
    disabled = false,
}) => {
    const { control } = useForm({
        name: `${REACTIVE_CAPABILITY_CURVE_TABLE}`,
        defaultValues: {
            [REACTIVE_CAPABILITY_CURVE_TABLE]: [{}, {}],
        },
    });
    const {
        fields: rows,
        insert,
        remove,
    } = useFieldArray({ control, name: `${REACTIVE_CAPABILITY_CURVE_TABLE}` });
    const classes = useStyles();

    return (
        <Grid item container spacing={2}>
            {tableHeadersIds.map((header) => (
                <Grid key={header} item xs={3}>
                    <FormattedMessage id={header} />
                </Grid>
            ))}

            {rows.map((value, index, displayedValues) => {
                const id = getId(value);
                let labelSuffix;
                if (index === 0) labelSuffix = 'min';
                else if (index === displayedValues.length - 1)
                    labelSuffix = 'max';
                else labelSuffix = index.toString();
                return (
                    <Grid key={id + index} container spacing={3} item>
                        <ReactiveCapabilityCurveForm
                            fieldId={value.id}
                            index={index}
                            labelSuffix={labelSuffix}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + index}
                                onClick={() => remove(index)}
                                disabled={
                                    disabled ||
                                    index === 0 ||
                                    index === displayedValues.length - 1
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {index === displayedValues.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    className={classes.icon}
                                    key={id + index}
                                    onClick={() => insert(rows.length - 2, {})}
                                    disabled={disabled}
                                    style={{ top: '-1em' }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );
};
