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
    SELECTED,
} from 'components/refactor/utils/field-constants';
import FloatInput from '../../../rhf-inputs/float-input';
import { useIntl } from 'react-intl';
import {
    AmpereAdornment,
    gridItem,
    GridSection,
} from '../../../../dialogs/dialogUtils';
import React, { useMemo } from 'react';
import DndTable from '../../../../util/dnd-table/dnd-table';
import { useFieldArray, useFormContext } from 'react-hook-form';

const LimitsPane = ({ id = LIMITS }) => {
    const intl = useIntl();

    const columnsDefinition = useMemo(() => {
        return [
            {
                label: 'TemporaryLimitName',
                dataKey: TEMPORARY_LIMIT_NAME,
                initialValue: '',
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

    const { getValues } = useFormContext();

    const useFieldArrayOutputTemporaryLimits1 = useFieldArray({
        name: `${id}.${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`,
    });

    const useFieldArrayOutputTemporaryLimits2 = useFieldArray({
        name: `${id}.${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`,
    });

    function getRowsToDelete(allRows) {
        let rowsToDelete = [];
        for (let i = 0; i < allRows.length; i++) {
            if (allRows[i][SELECTED]) {
                rowsToDelete.push(i);
            }
        }
        return rowsToDelete;
    }

    function deleteSelectedRows1() {
        const rowsToDelete = getRowsToDelete(
            getValues(`${id}.${CURRENT_LIMITS_1}.${TEMPORARY_LIMITS}`)
        );
        useFieldArrayOutputTemporaryLimits1.remove(rowsToDelete);
    }

    function deleteSelectedRows2() {
        const rowsToDelete = getRowsToDelete(
            getValues(`${id}.${CURRENT_LIMITS_2}.${TEMPORARY_LIMITS}`)
        );
        useFieldArrayOutputTemporaryLimits2.remove(rowsToDelete);
    }

    const newRowData = useMemo(() => {
        return columnsDefinition.slice(1).reduce(
            (accumulator, currentValue) => ({
                ...accumulator,
                [currentValue.dataKey]: currentValue.initialValue,
            }),
            { [SELECTED]: false }
        );
    }, [columnsDefinition]);

    function handleAddRowsButton1() {
        useFieldArrayOutputTemporaryLimits1.append(newRowData);
    }

    function handleAddRowsButton2() {
        useFieldArrayOutputTemporaryLimits2.append(newRowData);
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
                handleAddButton={handleAddRowsButton1}
                handleDeleteButton={deleteSelectedRows1}
                columnsDefinition={columnsDefinition}
                tableHeight={270}
                disabled={false}
                withLeftButtons={false}
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
                    handleAddButton={handleAddRowsButton2}
                    handleDeleteButton={deleteSelectedRows2}
                    columnsDefinition={columnsDefinition}
                    tableHeight={270}
                    disabled={false}
                    withLeftButtons={false}
                />
            </Grid>
        </>
    );
};

export default LimitsPane;
