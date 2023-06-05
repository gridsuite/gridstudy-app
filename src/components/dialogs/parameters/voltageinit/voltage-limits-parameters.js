/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import { Button, DialogActions, IconButton, Tooltip } from '@mui/material';
import SubmitButton from 'components/dialogs/commons/submitButton';
import DndTable from 'components/utils/dnd-table/dnd-table';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    FILTERS,
    FILTER_ID,
    FILTER_NAME,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    PRIORITY,
    SELECTED,
    VOLTAGE_LIMITS,
} from 'components/utils/field-constants';
import DirectoryItemsInput from 'components/utils/rhf-inputs/directory-items-input';
import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    getVoltageInitParameters,
    updateVoltageInitParameters,
} from 'utils/rest-api';
import InfoIcon from '@mui/icons-material/Info';
import { VoltageAdornment } from 'components/dialogs/dialogUtils';

const VoltageLimitsParameters = ({
    control,
    reset,
    emptyFormData,
    useVoltageInitParameters,
}) => {
    const intl = useIntl();

    const [voltageInitParams, setVoltageInitParams] = useVoltageInitParameters;

    const { handleSubmit } = useFormContext();

    const useFieldArrayOutput = useFieldArray({
        name: `${VOLTAGE_LIMITS}`,
        control: control,
    });

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const VoltageLevelFilterTooltip = useMemo(() => {
        return (
            <Tooltip
                title={intl.formatMessage({
                    id: 'VoltageLevelFilterTooltip',
                })}
            >
                <IconButton>
                    <InfoIcon />
                </IconButton>
            </Tooltip>
        );
    }, [intl]);

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'VoltageLevelFilter',
                dataKey: FILTERS,
                initialValue: [],
                editable: true,
                directoryItems: true,
                equipmentTypes: [EQUIPMENT_TYPES.VOLTAGE_LEVEL.type],
                elementType: elementType.FILTER,
                titleId: 'FiltersListsSelection',
                extra: VoltageLevelFilterTooltip,
            },
            {
                label: 'LowVoltageLimitAdjustment',
                dataKey: LOW_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
            {
                label: 'HighVoltageLimitAdjustment',
                dataKey: HIGH_VOLTAGE_LIMIT,
                initialValue: null,
                editable: true,
                numeric: true,
                adornment: VoltageAdornment,
                textAlign: 'right',
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [intl, VoltageLevelFilterTooltip]);

    const fromVoltageLimitsDataToFormValues = useCallback(
        (voltageLimits) => {
            reset({
                [VOLTAGE_LIMITS]: voltageLimits.map((voltageLimit) => {
                    return {
                        [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }),
                        [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT],
                        [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT],
                    };
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (voltageInitParams?.voltageLimits) {
            fromVoltageLimitsDataToFormValues(voltageInitParams.voltageLimits);
        }
    }, [fromVoltageLimitsDataToFormValues, voltageInitParams]);

    const newRowData = useMemo(() => {
        const newRowData = {};
        newRowData[SELECTED] = false;
        COLUMNS_DEFINITIONS.forEach(
            (column) => (newRowData[column.dataKey] = column.initialValue)
        );
        return newRowData;
    }, [COLUMNS_DEFINITIONS]);
    const createVoltageLimitRows = () => [newRowData];

    const formatNewParams = useCallback((voltageLimits) => {
        return {
            [VOLTAGE_LIMITS]: voltageLimits.map((voltageLimit) => {
                return {
                    [PRIORITY]: voltageLimits.indexOf(voltageLimit),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT] ?? 0,
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT] ?? 0,
                    [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                };
            }),
        };
    }, []);

    const onSubmit = useCallback(
        (newParams) => {
            console.log(formatNewParams(newParams.voltageLimits));
            updateVoltageInitParameters(
                studyUuid,
                formatNewParams(newParams.voltageLimits)
            )
                .then(() => {
                    setVoltageInitParams(
                        formatNewParams(newParams.voltageLimits)
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DeleteVoltageLevelOnLineError',
                    });
                });
        },
        [formatNewParams, setVoltageInitParams, snackError, studyUuid]
    );

    const resetVoltageInitParameters = useCallback(() => {
        updateVoltageInitParameters(studyUuid, emptyFormData)
            .then(() => {
                return getVoltageInitParameters(studyUuid)
                    .then((params) => setVoltageInitParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
    }, [studyUuid, emptyFormData, setVoltageInitParams, snackError]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetVoltageInitParameters();
    }, [emptyFormData, reset, resetVoltageInitParameters]);

    return (
        <>
            <DndTable
                arrayFormName={`${VOLTAGE_LIMITS}`}
                columnsDefinition={COLUMNS_DEFINITIONS}
                useFieldArrayOutput={useFieldArrayOutput}
                createRows={createVoltageLimitRows}
                tableHeight={270}
                withAddRowsDialog={false}
                withLeftButtons={false}
            />

            <DialogActions>
                <Button onClick={clear}>
                    <FormattedMessage id="resetToDefault" />
                </Button>
                <SubmitButton
                    onClick={handleSubmit(onSubmit, undefined)}
                    disabled={false}
                />
            </DialogActions>
        </>
    );
};

export default VoltageLimitsParameters;
