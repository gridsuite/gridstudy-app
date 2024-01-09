/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    useCallback,
    useState,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    checkValidationsAndRefreshCells,
    deepUpdateValue,
} from './equipment-table-utils';
import { LocalizedCountries } from 'components/utils/localized-countries-hook';
import RegulatingTerminalModificationDialog from 'components/dialogs/network-modifications/generator/modification/regulating-terminal-modification-dialog';

export const GeneratorRegulatingTerminalEditor = forwardRef(
    ({ gridContext, colDef, gridApi, rowData }, ref) => {
        const [openGeneratorPopup, setOpenGeneratorPopup] = useState(true);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        const {
                            regulatingTerminalConnectableId,
                            regulatingTerminalVlId,
                            regulatingTerminalConnectableType,
                        } = gridContext.dynamicValidation || {};

                        if (
                            (regulatingTerminalVlId ||
                                regulatingTerminalConnectableId) &&
                            regulatingTerminalVlId.trim() !== '' &&
                            regulatingTerminalConnectableId.trim() !== ''
                        ) {
                            return `${regulatingTerminalConnectableType} (${regulatingTerminalConnectableId})`;
                        }

                        return null;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, gridContext.dynamicValidation]
        );

        const handleSaveRegulatingTerminalPopup = (
            updatedRegulatedTerminal
        ) => {
            const {
                equipment: { type: equipmentType, id: equipmentId } = {},
                voltageLevel: { id: voltageLevelId } = {},
            } = updatedRegulatedTerminal || {};
            gridContext.dynamicValidation = deepUpdateValue(
                gridContext.dynamicValidation,
                'regulatingTerminalConnectableId',
                equipmentId
            );
            gridContext.dynamicValidation = deepUpdateValue(
                gridContext.dynamicValidation,
                'regulatingTerminalConnectableType',
                equipmentType
            );
            gridContext.dynamicValidation = deepUpdateValue(
                gridContext.dynamicValidation,
                'regulatingTerminalVlId',
                voltageLevelId
            );
            setOpenGeneratorPopup(false);
        };
        const handleCancelRegulatingTerminalPopup = () => {
            setOpenGeneratorPopup(false);
            gridApi.stopEditing();
        };

        return (
            <RegulatingTerminalModificationDialog
                open={openGeneratorPopup}
                onClose={handleCancelRegulatingTerminalPopup}
                currentNode={gridContext.currentNode}
                studyUuid={gridContext.studyUuid}
                onModifyRegulatingTerminalGenerator={(
                    updatedRegulatedTerminal
                ) => {
                    handleSaveRegulatingTerminalPopup(updatedRegulatedTerminal);
                }}
                data={rowData}
                previousData={gridContext.dataToModify}
            />
        );
    }
);

export const NumericalField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi, rowData }, ref) => {
        const error = useMemo(() => {
            return Object.keys(gridContext.editErrors).includes(colDef.field);
        }, [colDef.field, gridContext.editErrors]);

        const intl = useIntl();

        const minExpression = colDef.crossValidation?.minExpression;
        const maxExpression = colDef.crossValidation?.maxExpression;

        //minExpression and maxExpression are either a reference to a variable or a static number
        const minValue = useMemo(() => {
            if (!isNaN(minExpression)) {
                return minExpression;
            }
            return rowData[minExpression];
        }, [minExpression, rowData]);

        const maxValue = useMemo(() => {
            if (!isNaN(maxExpression)) {
                return maxExpression;
            }
            return rowData[maxExpression];
        }, [maxExpression, rowData]);

        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        const validateEvent = useCallback(
            (ev) => {
                let newVal = parseFloat(ev.target.value);
                if (isNaN(newVal)) {
                    newVal = undefined;
                }
                setValue(newVal);
                gridContext.dynamicValidation = deepUpdateValue(
                    gridContext.dynamicValidation,
                    colDef.field,
                    newVal
                );
                checkValidationsAndRefreshCells(gridApi, gridContext);
            },
            [colDef.field, gridApi, gridContext]
        );

        function renderNumericText() {
            return (
                <TextField
                    value={value}
                    onChange={validateEvent}
                    error={error}
                    type={'number'}
                    size={'small'}
                    margin={'none'}
                    autoFocus
                    inputProps={{
                        style: {
                            textAlign: 'center',
                            fontSize: 'small',
                        },
                        min: { minValue },
                        max: { maxValue },
                        step: 'any',
                        lang: 'en-US', // to have . as decimal separator
                    }}
                />
            );
        }

        function renderNumericTextWithTooltip() {
            let tooltip = '';
            if (minValue !== undefined && maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'MinMax' },
                    { min: minValue, max: maxValue }
                );
            } else if (minValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMin' },
                    { min: minValue }
                );
            } else if (maxValue !== undefined) {
                tooltip = intl.formatMessage(
                    { id: 'OnlyMax' },
                    { max: maxValue }
                );
            }
            if (tooltip !== '') {
                return <Tooltip title={tooltip}>{renderNumericText()}</Tooltip>;
            }
            return renderNumericText();
        }

        return (
            <div style={{ width: 'inherit' }}>
                {renderNumericTextWithTooltip()}
            </div>
        );
    }
);

export const BooleanListField = forwardRef(
    ({ defaultValue, gridContext, colDef, gridApi }, ref) => {
        const intl = useIntl();
        const [value, setValue] = useState(defaultValue);

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return value;
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, value]
        );

        const validateChange = useCallback(
            (ev) => {
                const val = ev.target.value;
                setValue(val);
                gridContext.dynamicValidation = deepUpdateValue(
                    gridContext.dynamicValidation,
                    colDef.field,
                    val
                );
                checkValidationsAndRefreshCells(gridApi, gridContext);
            },
            [colDef.field, gridApi, gridContext]
        );

        return (
            <Select
                value={value}
                onChange={validateChange}
                size={'medium'}
                margin={'none'}
                style={{ width: '100%' }}
                autoFocus
            >
                <MenuItem value={1} key={colDef.field + '_1'}>
                    <em>{intl.formatMessage({ id: 'true' })}</em>
                </MenuItem>
                <MenuItem value={0} key={colDef.field + '_0'}>
                    <em>{intl.formatMessage({ id: 'false' })}</em>
                </MenuItem>
            </Select>
        );
    }
);

export const SelectCountryField = forwardRef(({ gridContext, colDef }, ref) => {
    const [value, setValue] = useState(null);
    const { translate, countryCodes } = LocalizedCountries();

    useImperativeHandle(
        ref,
        () => {
            return {
                getValue: () => {
                    return value;
                },
                getField: () => {
                    return colDef.field;
                },
            };
        },
        [colDef.field, value]
    );

    return (
        <Autocomplete
            options={countryCodes}
            getOptionLabel={(countryCode) => translate(countryCode)}
            style={{ width: '100%' }}
            onChange={(event, newValue) => {
                setValue({
                    countryName: event?.target?.childNodes[0]?.data || '',
                    countryCode: newValue,
                });
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={<FormattedMessage id={'descLfAllCountries'} />}
                />
            )}
        />
    );
});
