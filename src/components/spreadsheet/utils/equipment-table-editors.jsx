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
    useEffect,
} from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    checkValidationsAndRefreshCells,
    deepUpdateValue,
} from './equipment-table-utils';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import RegulatingTerminalModificationDialog from 'components/dialogs/network-modifications/generator/modification/regulating-terminal-modification-dialog';
import { getTapChangerRegulationTerminalValue } from 'components/utils/utils';

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

export const TWTRegulatingTerminalEditor = forwardRef(
    ({ gridContext, colDef, gridApi, rowData }, ref) => {
        const [
            openTWTRegulatingTerminalPopup,
            setOpenTWTRegulatingTerminalPopup,
        ] = useState(true);

        const isRatioTapChanger =
            colDef.field === 'ratioTapChanger.ratioRegulatingTerminal';

        const tapChangerType = isRatioTapChanger
            ? 'ratioTapChanger'
            : 'phaseTapChanger';

        useImperativeHandle(
            ref,
            () => {
                return {
                    getValue: () => {
                        return getTapChangerRegulationTerminalValue(
                            gridContext.dynamicValidation?.[tapChangerType] ||
                                {}
                        );
                    },
                    getField: () => {
                        return colDef.field;
                    },
                };
            },
            [colDef.field, gridContext.dynamicValidation, tapChangerType]
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
                `${tapChangerType}.regulatingTerminalConnectableId`,
                equipmentId
            );
            gridContext.dynamicValidation = deepUpdateValue(
                gridContext.dynamicValidation,
                `${tapChangerType}.regulatingTerminalConnectableType`,
                equipmentType
            );
            gridContext.dynamicValidation = deepUpdateValue(
                gridContext.dynamicValidation,
                `${tapChangerType}.regulatingTerminalVlId`,
                voltageLevelId
            );
            setOpenTWTRegulatingTerminalPopup(false);
        };
        const handleCancelRegulatingTerminalPopup = () => {
            setOpenTWTRegulatingTerminalPopup(false);
            gridApi.stopEditing();
        };

        const getTapChangerValue = () => {
            const tapChanger = {
                ...rowData?.[tapChangerType],
                regulatingTerminalConnectableId:
                    rowData?.[tapChangerType]
                        ?.regulatingTerminalConnectableId || '',
                regulatingTerminalConnectableType:
                    rowData?.[tapChangerType]
                        ?.regulatingTerminalConnectableType || '',
                regulatingTerminalVlId:
                    rowData?.[tapChangerType]?.regulatingTerminalVlId || '',
            };
            return tapChanger;
        };

        return (
            <RegulatingTerminalModificationDialog
                open={openTWTRegulatingTerminalPopup}
                onClose={handleCancelRegulatingTerminalPopup}
                currentNode={gridContext.currentNode}
                studyUuid={gridContext.studyUuid}
                onModifyRegulatingTerminalGenerator={(
                    updatedRegulatedTerminal
                ) => {
                    handleSaveRegulatingTerminalPopup(updatedRegulatedTerminal);
                }}
                data={getTapChangerValue()}
                previousData={gridContext.dataToModify?.[tapChangerType]}
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
                    sx={{
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                            {
                                display: 'none',
                            },
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                    }}
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

// used to translate the enum values, enumOptions is of the form { id: string; label: string } [];
export const EnumListField = forwardRef(
    (
        {
            defaultValue,
            enumOptions,
            gridContext,
            colDef,
            gridApi,
            stopEditing,
        },
        ref
    ) => {
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

        /**
         * Automatically stops cell editing when the value changes to ensure the handleCellEditingStopped event is triggered. 
         * This step is crucial because ag-Grid by default only stops editing upon clicking outside of the cell. 
         * The immediate stopping of editing upon value change ensures consistent and expected behavior in the grid's editing flow.
         */
        useEffect(() => {
            if (value !== defaultValue) {
                stopEditing();
            }
        }, [value, stopEditing, defaultValue]);

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
                {enumOptions.map((enumValue) => (
                    <MenuItem
                        value={enumValue.id}
                        key={colDef.field + '_' + enumValue.id}
                    >
                        <em>{intl.formatMessage({ id: enumValue.label })}</em>
                    </MenuItem>
                ))}
            </Select>
        );
    }
);

export const SelectCountryField = forwardRef(({ gridContext, colDef }, ref) => {
    const [value, setValue] = useState(null);
    const { translate, countryCodes } = useLocalizedCountries();

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
