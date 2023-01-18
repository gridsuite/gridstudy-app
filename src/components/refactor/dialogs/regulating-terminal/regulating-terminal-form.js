/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { Popper } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import {
    EQUIPMENT,
    VOLTAGE_LEVEL,
    VOLTAGE_LEVEL_ID,
} from './regulating-terminal-form-utils';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';
import { useFormContext, useWatch } from 'react-hook-form';

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
    //Style class to override disabled input style
    fieldError: {
        '& .MuiOutlinedInput-root': {
            '&.Mui-disabled fieldset': {
                borderColor: 'red',
            },
        },
    },
}));

export const REGULATING_VOLTAGE_LEVEL = 'regulating-voltage-level';
export const REGULATING_EQUIPMENT = 'regulating-equipment';

export function makeRefreshRegulatingTerminalSectionsCallback() {
    return (voltageLevel, putter) => {
        if (voltageLevel?.equipments) {
            putter(voltageLevel.equipments);
        } else {
            putter([]);
        }
    };
}

// Specific Popper component to be used with Autocomplete
// This allows the popper to fit its content, which is not the case by default
const FittingPopper = (props) => {
    const classes = useStyles();
    return (
        <Popper
            {...props}
            style={classes.popper.style}
            placement="bottom-start"
        />
    );
};

const RegulatingTerminalForm = ({
    id, // id that has to be defined to determine it's parent object within the form
    direction,
    disabled = false,
    equipmentSectionTypeDefaultValue,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    previousRegulatingTerminalValue,
    previousEquipmentSectionTypeValue,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [equipmentsOptions, setEquipmentsOptions] = useState([]);
    const { setValue } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${VOLTAGE_LEVEL_ID}`,
    });

    useEffect(() => {
        voltageLevelOptionsPromise.then((values) => {
            setVoltageLevelOptions(
                values.sort((a, b) => a.id.localeCompare(b.id))
            );
        });
    }, [voltageLevelOptionsPromise]);

    useEffect(() => {
        if (watchVoltageLevelId) {
            voltageLevelsEquipmentsOptionsPromise.then((values) => {
                setEquipmentsOptions(
                    values.find(
                        (vlEquipment) =>
                            vlEquipment?.voltageLevel?.id ===
                            watchVoltageLevelId
                    ).equipments
                );
            });
        } else {
            setValue(`${id}.${EQUIPMENT}`, null);
            setEquipmentsOptions([]);
        }
    }, [
        watchVoltageLevelId,
        id,
        setValue,
        voltageLevelsEquipmentsOptionsPromise,
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
                    {
                        <AutocompleteInput
                            name={`${id}.${VOLTAGE_LEVEL}`}
                            label="VoltageLevel"
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
                            PopperComponent={FittingPopper}
                        />
                    }
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
                    {
                        <AutocompleteInput
                            name={`${id}.${EQUIPMENT}`}
                            label="Equipment"
                            size="small"
                            freeSolo
                            forcePopupIcon
                            autoHighlight
                            selectOnFocus
                            id="equipment"
                            disabled={!watchVoltageLevelId || disabled}
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
                            PopperComponent={FittingPopper}
                        />
                    }
                </Grid>
            </Grid>
        </>
    );
};

RegulatingTerminalForm.propTypes = {
    id: PropTypes.string.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    direction: PropTypes.string,
    disabled: PropTypes.bool,
};

export default RegulatingTerminalForm;
