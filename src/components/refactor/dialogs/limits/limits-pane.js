/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/refactor/utils/field-constants';
import { useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
    AmpereAdornment,
    gridItem,
    GridSection,
} from 'components/dialogs/dialogUtils';
import DndTable from 'components/util/dnd-table/dnd-table';
import FloatInput from 'components/refactor/rhf-inputs/float-input';

const LimitsPane = ({ id = LIMITS }) => {
    const intl = useIntl();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'TemporaryLimitName',
                dataKey: TEMPORARY_LIMIT_NAME,
                initialValue: undefined,
                editable: true,
                numeric: false,
            },
            {
                label: 'TemporaryLimitDuration',
                dataKey: TEMPORARY_LIMIT_DURATION,
                initialValue: undefined,
                editable: true,
                numeric: true,
            },
            {
                label: 'TemporaryLimitValue',
                dataKey: TEMPORARY_LIMIT_VALUE,
                initialValue: undefined,
                editable: true,
                numeric: true,
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [intl]);

    const useFieldArrayOutputTemporaryLimits1 = useFieldArray({
        name: `${id}.${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`,
    });

    const useFieldArrayOutputTemporaryLimits2 = useFieldArray({
        name: `${id}.${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`,
    });

    const newRowData = useMemo(() => {
        return columnsDefinition.reduce((accumulator, currentValue) => ({
            ...accumulator,
            [currentValue.dataKey]: currentValue.initialValue,
        }));
    }, [columnsDefinition]);

    function createLimitRows(numberOfRows) {
        const newRows = [];
        newRows.push(newRowData);
        return newRows;
    }

    const permanentCurrentLimit1Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
        />
    );

    const permanentCurrentLimit2Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
        />
    );

    return (
        <>
            <GridSection title="Side1" />
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit1Field, 4)}
            </Grid>
            <GridSection title="TemporaryCurrentLimitsText" heading="4" />
            <DndTable
                arrayFormName={`${id}.${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`}
                useFieldArrayOutput={useFieldArrayOutputTemporaryLimits1}
                createRows={createLimitRows}
                columnsDefinition={columnsDefinition}
                tableHeight={270}
                withLeftButtons={false}
                withAddRowsDialog={false}
            />
            <GridSection title="Side2" />
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit2Field, 4)}
            </Grid>
            <GridSection title="TemporaryCurrentLimitsText" heading="4" />
            <Grid container spacing={2}>
                <DndTable
                    arrayFormName={`${id}.${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`}
                    useFieldArrayOutput={useFieldArrayOutputTemporaryLimits2}
                    createRows={createLimitRows}
                    columnsDefinition={columnsDefinition}
                    tableHeight={270}
                    withLeftButtons={false}
                    withAddRowsDialog={false}
                />
            </Grid>
        </>
    );
};

export default LimitsPane;
