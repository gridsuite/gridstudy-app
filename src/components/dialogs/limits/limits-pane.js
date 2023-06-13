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
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import makeStyles from '@mui/styles/makeStyles';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import {
    AmpereAdornment,
    gridItem,
    GridSection,
} from 'components/dialogs/dialogUtils';
import DndTable from 'components/utils/dnd-table/dnd-table';
import { isNodeBuilt } from '../../graph/util/model-functions';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginTop: 0,
    },
}));

const LimitsPane = ({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    modifiedEquipment,
    clearableFields,
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const { getValues } = useFormContext();

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
                initialValue: null,
                editable: true,
                numeric: true,
            },
            {
                label: 'TemporaryLimitValue',
                dataKey: TEMPORARY_LIMIT_VALUE,
                initialValue: null,
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
        const newRowData = {};
        columnsDefinition.forEach(
            (column) => (newRowData[column.dataKey] = column.initialValue)
        );
        return newRowData;
    }, [columnsDefinition]);
    const createLimitRows = () => [newRowData];

    const temporaryLimitHasPreviousValue = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits
                ?.map(({ name }) => name)
                .includes(getValues(arrayFormName)[rowIndex]?.name);
        },
        [getValues]
    );

    const findTemporaryLimit = useCallback(
        (rowIndex, arrayFormName, temporaryLimits) => {
            return temporaryLimits?.find(
                (e) => e.name === getValues(arrayFormName)[rowIndex]?.name
            );
        },
        [getValues]
    );

    const disableTableCell = useCallback(
        (
            rowIndex,
            column,
            arrayFormName,
            temporaryLimits,
            modifiedTemporaryLimits
        ) => {
            // If the temporary limit is added, all fields are editable
            // otherwise, only the value field is editable
            return modifiedTemporaryLimits &&
                findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    modifiedTemporaryLimits
                )?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
                ? false
                : temporaryLimitHasPreviousValue(
                      rowIndex,
                      arrayFormName,
                      temporaryLimits
                  ) && column.dataKey !== TEMPORARY_LIMIT_VALUE;
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const shouldReturnPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            return (
                (temporaryLimitHasPreviousValue(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                ) &&
                    column.dataKey === TEMPORARY_LIMIT_VALUE) ||
                findTemporaryLimit(rowIndex, arrayFormName, modifiedValues)
                    ?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
            );
        },
        [findTemporaryLimit, temporaryLimitHasPreviousValue]
    );

    const getTemporaryLimitPreviousValue = useCallback(
        (rowIndex, column, arrayFormName, temporaryLimits, modifiedValues) => {
            if (
                shouldReturnPreviousValue(
                    rowIndex,
                    column,
                    arrayFormName,
                    temporaryLimits,
                    modifiedValues
                )
            ) {
                const temporaryLimit = findTemporaryLimit(
                    rowIndex,
                    arrayFormName,
                    temporaryLimits
                );
                if (temporaryLimit === undefined) {
                    return undefined;
                }
                if (column.dataKey === TEMPORARY_LIMIT_VALUE) {
                    return temporaryLimit?.value ?? Number.MAX_VALUE;
                } else if (column.dataKey === TEMPORARY_LIMIT_DURATION) {
                    return (
                        temporaryLimit?.acceptableDuration ?? Number.MAX_VALUE
                    );
                }
            } else {
                return undefined;
            }
        },
        [findTemporaryLimit, shouldReturnPreviousValue]
    );

    const isTemporaryLimitModified = useCallback(
        (rowIndex, arrayFormName, modifiedValues) => {
            const temporaryLimit = findTemporaryLimit(
                rowIndex,
                arrayFormName,
                modifiedValues
            );
            if (
                temporaryLimit?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                !isNodeBuilt(currentNode)
            ) {
                return false;
            } else {
                return temporaryLimit?.modificationType !== undefined;
            }
        },
        [currentNode, findTemporaryLimit]
    );

    const permanentCurrentLimit1Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
            previousValue={equipmentToModify?.currentLimits1?.permanentLimit}
            clearable={clearableFields}
        />
    );

    const permanentCurrentLimit2Field = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`}
            label="PermanentCurrentLimitText"
            adornment={AmpereAdornment}
            previousValue={equipmentToModify?.currentLimits2?.permanentLimit}
            clearable={clearableFields}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3 className={classes.h3}>
                        <FormattedMessage id={'Side1'} />
                    </h3>
                </Grid>
            </Grid>
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
                previousValues={
                    equipmentToModify?.currentLimits1?.temporaryLimits
                }
                modifiedValues={
                    modifiedEquipment?.currentLimits1?.temporaryLimits
                }
                disableTableCell={disableTableCell}
                getPreviousValue={getTemporaryLimitPreviousValue}
                isValueModified={isTemporaryLimitModified}
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
                    previousValues={
                        equipmentToModify?.currentLimits2?.temporaryLimits
                    }
                    modifiedValues={
                        modifiedEquipment?.currentLimits2?.temporaryLimits
                    }
                    disableTableCell={disableTableCell}
                    getPreviousValue={getTemporaryLimitPreviousValue}
                    isValueModified={isTemporaryLimitModified}
                />
            </Grid>
        </>
    );
};

export default LimitsPane;
