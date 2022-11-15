/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import { Autocomplete, Popper, TextField } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { validateField } from '../util/validation-functions';
import { genHelperError } from './inputs/hooks-helpers';

// Factory used to create a filter method that is used to change the default
// option filter behaviour of the Autocomplete component
const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
}));

export function makeRefreshRegulatingTerminalSectionsCallback() {
    return (voltageLevel, putter) => {
        if (voltageLevel?.equipments) {
            putter(voltageLevel.equipments);
        } else {
            putter([]);
        }
    };
}

const RegulatingTerminalEdition = ({
    validation,
    inputForm,
    voltageLevelOptions,
    regulatingTerminalValue,
    voltageLevelsEquipments,
    onChangeVoltageLevel,
    onChangeEquipmentSection,
    direction,
    disabled = false,
    voltageLevelEquipmentsCallback,
    equipmentSectionTypeDefaultValue,
}) => {
    const classes = useStyles();

    const intl = useIntl();

    const [equipmentsOptions, setEquipmentsOptions] = useState([]);

    const [currentEquipment, setCurrentEquipment] = useState(null);

    // Specific Popper component to be used with Autocomplete
    // This allows the popper to fit its content, which is not the case by default
    const FittingPopper = (props) => {
        return (
            <Popper
                {...props}
                style={classes.popper.style}
                placement="bottom-start"
            />
        );
    };

    const [voltageLevelId, setVoltageLevelId] = useState(
        regulatingTerminalValue?.voltageLevel?.id
    );

    const handleChangeVoltageLevel = useCallback(
        (event, value, reason) => {
            if (reason === 'selectOption') {
                onChangeVoltageLevel(value);
                setVoltageLevelId(value.id);
                onChangeEquipmentSection(null);
                inputForm.setHasChanged(true);
            } else if (reason === 'clear') {
                onChangeVoltageLevel(null);
                setVoltageLevelId(null);
                onChangeEquipmentSection(null);
                setEquipmentsOptions([]);
                inputForm.setHasChanged(true);
            }
        },
        [
            onChangeEquipmentSection,
            onChangeVoltageLevel,
            setVoltageLevelId,
            inputForm,
        ]
    );

    const handleChangeEquipment = (event, value, reason) => {
        onChangeEquipmentSection(value);
        inputForm.setHasChanged(true);
    };

    const [errorForVL, setErrorForVL] = useState();

    useEffect(() => {
        function validate() {
            const res = validateField(voltageLevelId, validation);
            setErrorForVL(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation('regulating-voltage-level', validate);
    }, [validation, inputForm, voltageLevelId, errorForVL]);

    const [errorForTerminal, setErrorForTerminal] = useState();

    useEffect(() => {
        function validate() {
            const res = validateField(currentEquipment, validation);
            setErrorForTerminal(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation('regulating-equipment', validate);
    }, [validation, inputForm, currentEquipment, errorForTerminal]);

    useEffect(() => {
        if (voltageLevelEquipmentsCallback) {
            voltageLevelEquipmentsCallback(
                voltageLevelsEquipments.find(
                    (vlEquipment) =>
                        vlEquipment?.voltageLevel?.id ===
                        regulatingTerminalValue?.voltageLevel?.id
                ),
                setEquipmentsOptions
            );
        }
    }, [
        regulatingTerminalValue?.voltageLevel?.id,
        setEquipmentsOptions,
        voltageLevelEquipmentsCallback,
        voltageLevelsEquipments,
    ]);

    useEffect(() => {
        let selectedExistingEquipment;
        if (regulatingTerminalValue?.equipmentSection) {
            selectedExistingEquipment = equipmentsOptions.find(
                (value) =>
                    value.id === regulatingTerminalValue.equipmentSection.id
            );
        }
        //To refactor in order to simplify it :
        //If the user select an existing equipement from the list it is set as the current value
        //Otherwise if nothing have been typed in Equipment field the value is an empty string
        //If something has been typed but it does not match with an existing equipment, it is allowed in order to specify the equipment currently being created, the value will be the combination of what the user typed and default type passed as prop
        setCurrentEquipment(
            regulatingTerminalValue?.equipmentSection &&
                selectedExistingEquipment
                ? selectedExistingEquipment
                : regulatingTerminalValue?.equipmentSection === null
                ? ''
                : {
                      id: regulatingTerminalValue.equipmentSection.id,
                      type: equipmentSectionTypeDefaultValue,
                  }
        );
    }, [
        equipmentSectionTypeDefaultValue,
        equipmentsOptions,
        regulatingTerminalValue,
        regulatingTerminalValue.equipmentSection,
    ]);

    return (
        <>
            <Grid container direction={direction || 'row'} spacing={2}>
                <Grid
                    item
                    xs={
                        direction &&
                        (direction === 'column' ||
                            direction === 'column-reverse')
                            ? 12
                            : 6
                    }
                    align="start"
                >
                    {/* TODO: autoComplete prop is not working properly with material-ui v4,
                            it clears the field when blur event is raised, which actually forces the user to validate free input
                            with enter key for it to be validated.
                            check if autoComplete prop is fixed in v5 */}
                    <Autocomplete
                        size="small"
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        disabled={disabled}
                        id="voltage-level"
                        options={voltageLevelOptions}
                        getOptionLabel={(vl) => (vl?.id ? vl.id : '')}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                           is created in the options list with a value equal to the input value
                        */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (
                                params.inputValue !== '' &&
                                !options.find(
                                    (opt) => opt.id === params.inputValue
                                )
                            ) {
                                filtered.push({
                                    inputValue: params.inputValue,
                                    id: params.inputValue,
                                });
                            }
                            return filtered;
                        }}
                        value={
                            regulatingTerminalValue?.voltageLevel
                                ? regulatingTerminalValue.voltageLevel
                                : ''
                        }
                        onChange={handleChangeVoltageLevel}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'VoltageLevel',
                                })}
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...genHelperError(errorForVL, errorForVL)}
                            />
                        )}
                        PopperComponent={FittingPopper}
                    />
                </Grid>
                <Grid
                    item
                    xs={
                        direction &&
                        (direction === 'column' ||
                            direction === 'column-reverse')
                            ? 12
                            : 6
                    }
                    align="start"
                >
                    {/* TODO: autoComplete prop is not working properly with material-ui v4,
                            it clears the field when blur event is raised, which actually forces the user to validate free input
                            with enter key for it to be validated.
                            check if autoComplete prop is fixed in v5 */}
                    <Autocomplete
                        size="small"
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="equipment"
                        disabled={
                            !regulatingTerminalValue?.voltageLevel || disabled
                        }
                        options={equipmentsOptions}
                        getOptionLabel={(equipment) => {
                            return equipment === ''
                                ? '' // to clear field
                                : (equipment?.type ??
                                      equipmentSectionTypeDefaultValue) +
                                      ' : ' +
                                      equipment?.id || '';
                        }}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                           is created in the options list with a value equal to the input value
                        */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);

                            if (
                                params.inputValue !== '' &&
                                !options.find(
                                    (opt) => opt.id === params.inputValue
                                )
                            ) {
                                filtered.push({
                                    inputValue: params.inputValue,
                                    id: params.inputValue,
                                });
                            }
                            return filtered;
                        }}
                        value={currentEquipment}
                        onChange={handleChangeEquipment}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'Equipment',
                                })}
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...genHelperError(
                                    errorForTerminal,
                                    errorForTerminal
                                )}
                            />
                        )}
                        PopperComponent={FittingPopper}
                    />
                </Grid>
            </Grid>
        </>
    );
};

RegulatingTerminalEdition.propTypes = {
    validation: PropTypes.object,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    regulatingTerminalValue: PropTypes.object,
    onChangeVoltageLevel: PropTypes.func.isRequired,
    onChangeEquipmentSection: PropTypes.func.isRequired,
    direction: PropTypes.string,
    disabled: PropTypes.bool,
    voltageLevelEquipmentsCallback: PropTypes.func.isRequired,
    voltageLevelsEquipments: PropTypes.arrayOf(PropTypes.object),
};

export default RegulatingTerminalEdition;
