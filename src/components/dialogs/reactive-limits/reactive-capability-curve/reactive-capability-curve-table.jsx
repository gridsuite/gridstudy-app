/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { useFieldArray } from 'react-hook-form';
import ReactiveCapabilityCurveRowForm from './reactive-capability-curve-row-form';
import { P, MAX_Q, MIN_Q } from 'components/utils/field-constants';
import { MidFormError, ErrorInput } from '@gridsuite/commons-ui';
import { INSERT, REMOVE } from './reactive-capability-utils';

const MIN_LENGTH = 2;
export const ReactiveCapabilityCurveTable = ({
    id,
    tableHeadersIds,
    disabled = false,
    previousValues,
    updatePreviousReactiveCapabilityCurveTable,
}) => {
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });

    const insertRow = useCallback(
        (index) => {
            if (previousValues && updatePreviousReactiveCapabilityCurveTable) {
                updatePreviousReactiveCapabilityCurveTable(INSERT, index);
            }
            insert(index, {
                [P]: null,
                [MIN_Q]: null,
                [MAX_Q]: null,
            });
        },
        [insert, updatePreviousReactiveCapabilityCurveTable, previousValues]
    );

    const handleInsertRow = () => {
        insertRow(rows.length - 1);
    };

    const handleRemoveRow = (index) => {
        if (previousValues && updatePreviousReactiveCapabilityCurveTable) {
            updatePreviousReactiveCapabilityCurveTable(REMOVE, index);
        }
        remove(index);
    };

    useEffect(() => {
        if (rows?.length < MIN_LENGTH) {
            for (let i = 0; i < MIN_LENGTH - rows.length; i++) {
                insertRow(rows.length);
            }
        }
    }, [insertRow, rows]);

    return (
        <Grid item container spacing={2}>
            <Grid container>
                <ErrorInput name={id} InputField={MidFormError} />
            </Grid>

            {tableHeadersIds.map((header) => (
                <Grid key={header} item xs={3}>
                    <FormattedMessage id={header} />
                </Grid>
            ))}

            {rows.map((value, index, displayedValues) => {
                let labelSuffix;
                if (index === 0) {
                    labelSuffix = 'min';
                } else if (index === displayedValues.length - 1) {
                    labelSuffix = 'max';
                } else {
                    labelSuffix = index - 1;
                }
                return (
                    <Grid key={value.id} container spacing={3} item>
                        <ReactiveCapabilityCurveRowForm
                            id={id}
                            fieldId={value.id}
                            index={index}
                            labelSuffix={labelSuffix}
                            previousValues={previousValues?.[index]}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                key={value.id}
                                onClick={() => handleRemoveRow(index)}
                                disabled={disabled || index === 0 || index === displayedValues.length - 1}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {index === displayedValues.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
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
