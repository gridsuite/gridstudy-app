/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import { useStyles } from '../../../../../dialogs/dialogUtils';
import { useFieldArray } from 'react-hook-form';
import ReactiveCapabilityCurveRowForm from './reactive-capability-curve-row-form';
import MidFormError from '../../../../rhf-inputs/error-inputs/mid-form-error';
import ErrorInput from '../../../../rhf-inputs/error-inputs/error-input';
export const ReactiveCapabilityCurveTable = ({
    id,
    tableHeadersIds,
    disabled = false,
    reactiveCapabilityCurvePoints,
}) => {
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });
    const classes = useStyles();

    const handleInsertRow = () => {
        if (reactiveCapabilityCurvePoints) {
            reactiveCapabilityCurvePoints?.splice(rows.length - 1, 0, {
                p: undefined,
                qminP: undefined,
                qmaxP: undefined,
                oldP: undefined,
                oldQminP: undefined,
                oldQmaxP: undefined,
            });
            insert(rows.length - 1, {
                p: undefined,
                qminP: undefined,
                qmaxP: undefined,
                oldP: undefined,
                oldQminP: undefined,
                oldQmaxP: undefined,
            });
        } else {
            insert(rows.length - 1, {});
        }
    };

    const handleRemoveRow = (index) => {
        if (reactiveCapabilityCurvePoints) {
            reactiveCapabilityCurvePoints?.splice(index, 1);
        }
        remove(index);
    };

    return (
        <Grid item container spacing={2}>
            <Grid item xs={12}>
                <ErrorInput name={id} InputField={MidFormError} />
            </Grid>

            {tableHeadersIds.map((header) => (
                <Grid key={header} item xs={3}>
                    <FormattedMessage id={header} />
                </Grid>
            ))}

            {rows.map((value, index, displayedValues) => {
                let labelSuffix;
                if (index === 0) labelSuffix = 'min';
                else if (index === displayedValues.length - 1)
                    labelSuffix = 'max';
                else labelSuffix = index.toString();
                return (
                    <Grid key={value.id} container spacing={3} item>
                        <ReactiveCapabilityCurveRowForm
                            id={id}
                            fieldId={value.id}
                            index={index}
                            labelSuffix={labelSuffix}
                            rowReactiveCapabilityCurvePoint={
                                reactiveCapabilityCurvePoints &&
                                reactiveCapabilityCurvePoints[index]
                            }
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={value.id}
                                onClick={() => handleRemoveRow(index)}
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
                                    key={value.id}
                                    onClick={() => handleInsertRow()}
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
