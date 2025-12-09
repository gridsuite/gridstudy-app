/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@mui/material';
import { useFieldArray } from 'react-hook-form';
import { MAX_Q, MIN_Q, P } from 'components/utils/field-constants';
import { ErrorInput, MidFormError } from '@gridsuite/commons-ui';
import { INSERT, REMOVE } from './reactive-capability-utils';
import { ReactiveCapabilityCurvePoints } from '../reactive-limits.type';
import { ReactiveCapabilityCurveRowForm } from './reactive-capability-curve-row-form';
import { IconButton } from '@design-system-rte/react';

const MIN_LENGTH = 2;

interface ReactiveCapabilityCurveTableFormProps {
    id: string;
    tableHeadersIds: string[];
    previousValues?: ReactiveCapabilityCurvePoints[] | null;
    updatePreviousReactiveCapabilityCurveTable?: (action: string, index: number) => void;
    disabled?: boolean;
}

export function ReactiveCapabilityCurveTableForm({
    id,
    tableHeadersIds,
    previousValues,
    updatePreviousReactiveCapabilityCurveTable,
    disabled = false,
}: Readonly<ReactiveCapabilityCurveTableFormProps>) {
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });

    const insertRow = useCallback(
        (index: number) => {
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

    const handleRemoveRow = (index: number) => {
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
                    <Grid key={value.id} direction="row" alignItems="flex-end" container spacing={3} item>
                        <ReactiveCapabilityCurveRowForm id={id} index={index} labelSuffix={labelSuffix} />
                        <Grid item xs={1}>
                            <IconButton
                                key={value.id}
                                name="delete"
                                size="m"
                                onClick={() => handleRemoveRow(index)}
                                appearance="filled"
                                variant="transparent"
                            />
                        </Grid>
                        {index === displayedValues.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    key={value.id}
                                    name="add-circle"
                                    size="m"
                                    onClick={() => handleInsertRow()}
                                    appearance="outlined"
                                    variant="transparent"
                                />
                            </Grid>
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );
}
