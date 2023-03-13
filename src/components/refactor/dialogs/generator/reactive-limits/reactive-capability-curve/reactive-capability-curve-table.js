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
import ErrorInput from '../../../../rhf-inputs/error-inputs/error-input';
import {
    OLD_P,
    OLD_Q_MAX_P,
    OLD_Q_MIN_P,
    P,
    Q_MAX_P,
    Q_MIN_P,
} from 'components/refactor/utils/field-constants';
import MidFormError from 'components/refactor/rhf-inputs/error-inputs/mid-form-error';

export const ReactiveCapabilityCurveTable = ({
    id,
    tableHeadersIds,
    disabled = false,
    reactiveCapabilityCurvePoints,
    handleReactiveCapabilityCurveTableRow,
}) => {
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });
    const classes = useStyles();

    const handleInsertRow = () => {
        handleReactiveCapabilityCurveTableRow('INSERT', rows.length - 1);
        insert(rows.length - 1, {
            [P]: null,
            [Q_MIN_P]: null,
            [Q_MAX_P]: null,
            [OLD_P]: null,
            [OLD_Q_MIN_P]: null,
            [OLD_Q_MAX_P]: null,
        });
    };

    const handleRemoveRow = (index) => {
        handleReactiveCapabilityCurveTableRow('REMOVE', index);
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
                            previousValues={
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
