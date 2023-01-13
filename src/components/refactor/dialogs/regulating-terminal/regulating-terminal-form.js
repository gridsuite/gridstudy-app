/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import { Popper } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import React, { useEffect, useState } from 'react';
import {
    fetchVoltageLevels,
    fetchVoltageLevelsEquipments,
} from '../../../../utils/rest-api';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import {
    EQUIPMENT,
    VOLTAGE_LEVEL,
    VOLTAGE_LEVEL_ID,
} from './regulating-terminal-form-utils';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';
import { useWatch } from 'react-hook-form';

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
    previousRegulatingTerminalValue,
    previousEquipmentSectionTypeValue,
}) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [equipmentsOptions, setEquipmentsOptions] = useState([]);

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${VOLTAGE_LEVEL_ID}`,
    });

    useEffect(() => {
        fetchVoltageLevels(studyUuid, currentNode?.id).then((values) => {
            setVoltageLevelOptions(
                values.sort((a, b) => a.id.localeCompare(b.id))
            );
        });
    }, [studyUuid, currentNode?.id]);

    useEffect(() => {
        fetchVoltageLevelsEquipments(studyUuid, currentNode?.id).then(
            (values) => {
                setEquipmentsOptions(
                    values.find(
                        (vlEquipment) =>
                            vlEquipment?.voltageLevel?.id ===
                            watchVoltageLevelId
                    ).equipments
                );
            }
        );
    }, [watchVoltageLevelId, studyUuid, currentNode?.id]);

    // const handleChangeVoltageLevel = useCallback(
    //     (event, value, reason) => {
    //         if (reason === 'selectOption') {
    //             onChangeVoltageLevel(value);
    //             onChangeEquipmentSection(null);
    //             inputForm.setHasChanged(true);
    //         } else if (reason === 'clear') {
    //             onChangeVoltageLevel(null);
    //             onChangeEquipmentSection(null);
    //             setEquipmentsOptions([]);
    //             inputForm.setHasChanged(true);
    //         }
    //     },
    //     [onChangeEquipmentSection, onChangeVoltageLevel, inputForm]
    // );

    // useEffect(() => {
    //     if (voltageLevelEquipmentsCallback) {
    //         voltageLevelEquipmentsCallback(
    //             voltageLevelsEquipments.find(
    //                 (vlEquipment) =>
    //                     vlEquipment?.voltageLevel?.id ===
    //                     regulatingTerminalValue?.voltageLevel?.id
    //             ),
    //             setEquipmentsOptions
    //         );
    //     }
    // }, [
    //     regulatingTerminalValue?.voltageLevel?.id,
    //     setEquipmentsOptions,
    //     voltageLevelEquipmentsCallback,
    //     voltageLevelsEquipments,
    // ]);

    // useEffect(() => {
    //     let selectedExistingEquipment;
    //     if (regulatingTerminalValue?.equipmentSection) {
    //         selectedExistingEquipment = equipmentsOptions.find(
    //             (value) =>
    //                 value.id === regulatingTerminalValue.equipmentSection.id
    //         );
    //     }
    //     //To refactor in order to simplify it :
    //     //If the user select an existing equipement from the list it is set as the current value
    //     //Otherwise if nothing have been typed in Equipment field the value is an empty string
    //     //If something has been typed but it does not match with an existing equipment, it is allowed in order to specify the equipment currently being created, the value will be the combination of what the user typed and default type passed as prop
    //     setCurrentEquipment(
    //         regulatingTerminalValue?.equipmentSection &&
    //             selectedExistingEquipment
    //             ? selectedExistingEquipment
    //             : regulatingTerminalValue?.equipmentSection === null
    //             ? ''
    //             : {
    //                   id: regulatingTerminalValue.equipmentSection.id,
    //                   type: equipmentSectionTypeDefaultValue,
    //               }
    //     );
    // }, [
    //     equipmentSectionTypeDefaultValue,
    //     equipmentsOptions,
    //     regulatingTerminalValue,
    //     regulatingTerminalValue.equipmentSection,
    // ]);

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
                            // disabled={
                            //     !regulatingTerminalValue?.voltageLevel || disabled
                            // }
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

    // return (
    //     <>
    //         <Grid container direction={direction || 'row'} spacing={2}>
    //             <Grid
    //                 item
    //                 xs={
    //                     direction &&
    //                     (direction === 'column' ||
    //                         direction === 'column-reverse')
    //                         ? 12
    //                         : 6
    //                 }
    //                 align="start"
    //             >
    //                 {/* TODO: autoComplete prop is not working properly with material-ui v4,
    //                          it clears the field when blur event is raised, which actually forces the user to validate free input
    //                          with enter key for it to be validated.
    //                          check if autoComplete prop is fixed in v5 */}
    //                 <Autocomplete
    //                     size="small"
    //                     freeSolo
    //                     forcePopupIcon
    //                     autoHighlight
    //                     selectOnFocus
    //                     disabled={disabled}
    //                     id="voltage-level"
    //                     options={voltageLevelOptions}
    //                     getOptionLabel={(vl) => (vl?.id ? vl.id : '')}
    //                     /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
    //                         is created in the options list with a value equal to the input value
    //                      */
    //                     filterOptions={(options, params) => {
    //                         const filtered = filter(options, params);
    //                         if (
    //                             params.inputValue !== '' &&
    //                             !options.find(
    //                                 (opt) => opt.id === params.inputValue
    //                             )
    //                         ) {
    //                             filtered.push({
    //                                 inputValue: params.inputValue,
    //                                 id: params.inputValue,
    //                             });
    //                         }
    //                         return filtered;
    //                     }}
    //                     value={
    //                         regulatingTerminalValue?.voltageLevel
    //                             ? regulatingTerminalValue.voltageLevel
    //                             : ''
    //                     }
    //                     onChange={handleChangeVoltageLevel}
    //                     renderInput={(params) => (
    //                         <TextField
    //                             {...params}
    //                             fullWidth
    //                             label={intl.formatMessage({
    //                                 id: 'VoltageLevel',
    //                             })}
    //                             FormHelperTextProps={{
    //                                 className: classes.helperText,
    //                             }}
    //                             {...genHelperError(errorForVL)}
    //                             helperText={previousRegulatingTerminalValue}
    //                         />
    //                     )}
    //                     PopperComponent={FittingPopper}
    //                 />
    //             </Grid>
    //             <Grid
    //                 item
    //                 xs={
    //                     direction &&
    //                     (direction === 'column' ||
    //                         direction === 'column-reverse')
    //                         ? 12
    //                         : 6
    //                 }
    //                 align="start"
    //             >
    //                 {/* TODO: autoComplete prop is not working properly with material-ui v4,
    //                          it clears the field when blur event is raised, which actually forces the user to validate free input
    //                          with enter key for it to be validated.
    //                          check if autoComplete prop is fixed in v5 */}
    //                 <Autocomplete
    //                     size="small"
    //                     freeSolo
    //                     forcePopupIcon
    //                     autoHighlight
    //                     selectOnFocus
    //                     id="equipment"
    //                     disabled={
    //                         !regulatingTerminalValue?.voltageLevel || disabled
    //                     }
    //                     options={equipmentsOptions}
    //                     getOptionLabel={(equipment) => {
    //                         return equipment === ''
    //                             ? '' // to clear field
    //                             : (equipment?.type ??
    //                                   equipmentSectionTypeDefaultValue) +
    //                                   ' : ' +
    //                                   equipment?.id || '';
    //                     }}
    //                     /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
    //                         is created in the options list with a value equal to the input value
    //                      */
    //                     filterOptions={(options, params) => {
    //                         const filtered = filter(options, params);

    //                         if (
    //                             params.inputValue !== '' &&
    //                             !options.find(
    //                                 (opt) => opt.id === params.inputValue
    //                             )
    //                         ) {
    //                             filtered.push({
    //                                 inputValue: params.inputValue,
    //                                 id: params.inputValue,
    //                             });
    //                         }
    //                         return filtered;
    //                     }}
    //                     value={currentEquipment}
    //                     onChange={handleChangeEquipment}
    //                     renderInput={(params) => (
    //                         <TextField
    //                             {...params}
    //                             className={
    //                                 genHelperError(errorForTerminal)?.error &&
    //                                 classes.fieldError
    //                             }
    //                             fullWidth
    //                             label={intl.formatMessage({
    //                                 id: 'Equipment',
    //                             })}
    //                             FormHelperTextProps={{
    //                                 className: classes.helperText,
    //                             }}
    //                             {...genHelperError(errorForTerminal)}
    //                             helperText={previousEquipmentSectionTypeValue}
    //                         />
    //                     )}
    //                     PopperComponent={FittingPopper}
    //                 />
    //             </Grid>
    //         </Grid>
    //     </>
    // );
};

RegulatingTerminalForm.propTypes = {
    id: PropTypes.string.isRequired,
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

export default RegulatingTerminalForm;
