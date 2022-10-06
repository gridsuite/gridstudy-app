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
    voltageLevelOptions,
    regulatingTerminalValue,
    voltageLevelsEquipments,
    onChangeVoltageLevel,
    onChangeEquipmentSection,
    direction,
    disabled = false,
    voltageLevelEquipmentsCallback,
    equipmentSectionTypeDefaultValue,
    equipmentSectionIdDefaultValue,
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

    const handleChangeVoltageLevel = useCallback(
        (event, value, reason) => {
            if (reason === 'selectOption') {
                onChangeVoltageLevel(value);
                onChangeEquipmentSection(null);
            } else if (reason === 'clear') {
                onChangeVoltageLevel(null);
                onChangeEquipmentSection(null);
                setEquipmentsOptions([]);
            }
        },
        [onChangeEquipmentSection, onChangeVoltageLevel]
    );

    const handleChangeEquipment = (event, value, reason) => {
        onChangeEquipmentSection(value);
    };

    useEffect(() => {
        if (voltageLevelEquipmentsCallback) {
            let data = voltageLevelsEquipments.find(
                (vlEquipment) =>
                    vlEquipment?.voltageLevel?.id ===
                    regulatingTerminalValue?.voltageLevel?.id
            );

            if (
                equipmentSectionIdDefaultValue &&
                equipmentSectionTypeDefaultValue
            ) {
                let isDefaultValueInserted = data?.equipments?.find(
                    (equipment) =>
                        equipment.type === equipmentSectionTypeDefaultValue &&
                        equipment.id === equipmentSectionIdDefaultValue
                );

                //clear previous inserted default values
                if (data) {
                    data.equipments = data?.equipments?.filter(
                        (equipment) => equipment.isDefaultValue === undefined
                    );
                }
                if (!isDefaultValueInserted) {
                    data?.equipments?.unshift({
                        id: equipmentSectionIdDefaultValue,
                        name: equipmentSectionIdDefaultValue,
                        type: equipmentSectionTypeDefaultValue,
                        isDefaultValue: true,
                    });
                }
            }
            voltageLevelEquipmentsCallback(data, setEquipmentsOptions);
        }
    }, [
        regulatingTerminalValue.voltageLevel,
        setEquipmentsOptions,
        voltageLevelEquipmentsCallback,
        voltageLevelsEquipments,
    ]);

    useEffect(() => {
        setCurrentEquipment(
            regulatingTerminalValue?.equipmentSection &&
                equipmentsOptions.length
                ? equipmentsOptions.find(
                      (value) =>
                          value.id ===
                          regulatingTerminalValue.equipmentSection.id
                  )
                : regulatingTerminalValue?.equipmentSection === null
                ? ''
                : regulatingTerminalValue.equipmentSection
        );
    }, [equipmentsOptions, regulatingTerminalValue.equipmentSection]);

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
                                : equipment?.type + ' : ' + equipment?.id || '';
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
