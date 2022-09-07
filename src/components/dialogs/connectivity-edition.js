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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
} from '../../utils/rest-api';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import { validateField } from '../util/validation-functions';

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

/**
 * Creates a callback for _getting_ bus or busbar section for a given voltage level.
 * Usable firstly for giving to hereunder ConnectivityEdition.
 * @param studyUuid uuid of the study where to look for the voltage level bus(bar section)s.
 * @param currentNodeUuid uuid of the node of the study where to look for the voltage level bus(bar section)s.
 * @returns {(function(*, *): void)|*}
 */
export function makeRefreshBusOrBusbarSectionsCallback(
    studyUuid,
    currentNodeUuid
) {
    return (voltageLevel, putter) => {
        switch (voltageLevel?.topologyKind) {
            case 'NODE_BREAKER':
                fetchBusbarSectionsForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    voltageLevel.id
                ).then((busbarSections) => {
                    putter(busbarSections);
                });
                break;

            case 'BUS_BREAKER':
                fetchBusesForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    voltageLevel.id
                ).then((buses) => putter(buses));
                break;

            default:
                putter([]);
                break;
        }
    };
}

export const useConnectivityValue = ({
    label,
    id,
    validation = {
        isFieldRequired: true,
    },
    disabled = false,
    inputForm,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    direction = 'row',
    voltageLevelIdDefaultValue,
    voltageLevelPreviousValue,
    busOrBusbarSectionIdDefaultValue,
    busOrBusbarSectionPreviousValue,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setErrorBusBarSection] = useState();
    const intl = useIntl();
    const studyUuid = useSelector((state) => state.studyUuid);
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        setConnectivity({
            voltageLevel: null,
            busOrBusbarSection: null,
        });
    }, [inputForm.toggleClear]);

    useEffect(() => {
        if (!voltageLevelOptionsPromise) return;

        voltageLevelOptionsPromise.then((values) =>
            setVoltageLevelOptions(
                values.sort((a, b) => a.id.localeCompare(b.id))
            )
        );
    }, [voltageLevelOptionsPromise]);

    useEffect(() => {
        if (!voltageLevelOptions) return;
        setConnectivity({
            voltageLevel: voltageLevelIdDefaultValue
                ? {
                      id: voltageLevelIdDefaultValue,
                      topologyKind: voltageLevelOptions.find(
                          (vl) => vl.id === voltageLevelIdDefaultValue
                      )?.topologyKind,
                  }
                : null,
            busOrBusbarSection: busOrBusbarSectionIdDefaultValue
                ? {
                      id: busOrBusbarSectionIdDefaultValue,
                  }
                : null,
        });
    }, [
        voltageLevelOptions,
        busOrBusbarSectionIdDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    useEffect(() => {
        function validate() {
            const resVL = validateField(connectivity.voltageLevel, validation);
            setErrorVoltageLevel(resVL?.errorMsgId);
            const resBBS = validateField(
                connectivity.busOrBusbarSection,
                validation
            );
            setErrorBusBarSection(resBBS?.errorMsgId);
            return !resVL.error && !resBBS.error;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [connectivity, label, validation, inputForm, id]);

    const setVoltageLevel = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setBusOrBusbarSection = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, busOrBusbarSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <ConnectivityEdition
                disabled={disabled}
                voltageLevelOptions={voltageLevelOptions}
                voltageLevel={connectivity.voltageLevel}
                voltageLevelPreviousValue={voltageLevelPreviousValue}
                busOrBusbarSection={connectivity.busOrBusbarSection}
                busOrBusbarSectionPreviousValue={
                    busOrBusbarSectionPreviousValue
                }
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeBusOrBusbarSection={(busOrBusbarSection) =>
                    setBusOrBusbarSection(busOrBusbarSection)
                }
                errorVoltageLevel={errorVoltageLevel}
                helperTextVoltageLevel={
                    errorVoltageLevel &&
                    intl.formatMessage({
                        id: errorVoltageLevel,
                    })
                }
                errorBusOrBusBarSection={errorBusBarSection}
                helperTextBusOrBusBarSection={
                    errorBusBarSection &&
                    intl.formatMessage({
                        id: errorBusBarSection,
                    })
                }
                direction={direction}
                voltageLevelBusOrBBSCallback={makeRefreshBusOrBusbarSectionsCallback(
                    studyUuid,
                    currentNodeUuid
                )}
            />
        );
    }, [
        connectivity,
        disabled,
        direction,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
        studyUuid,
        currentNodeUuid,
        voltageLevelPreviousValue,
        busOrBusbarSectionPreviousValue,
    ]);

    return [connectivity, render];
};

/*
 * Component to edit the connection of an equipment (voltage level and bus or busbar section)
 *
 * @param voltageLevelOptions : the network voltageLevels available
 * @param voltage level : the voltage level currently selected
 * @param busOrBusbarSection : the bus or busbar section currently selected
 * @param errors : errors eventually associated to the fields
 * @param onChangeVoltageLevel : callback to change the voltage level in the parent component
 * @param onChangeBusOrBusbarSection : callback to change the bus or busbar section in the parent component
 * @param direction : voltageLevel and bus or busbar section inputs direction (row, row-reverse, column, column-reverse)
 * @param errorVoltageLevel : If true, the VoltageLevel input will be displayed in an error state.
 * @param helperTextVoltageLevel: helperText to display in cas of error for VoltageLevel input.
 * @param errorBusOrBusBarSection: If true, the BusOrBusBarSection input will be displayed in an error state.
 * @param helperTextBusOrBusBarSection: helperText to display in cas of error for BusOrBusBarSection input.
 * @param voltageLevelBusOrBBSCallback {(vl, putter) => } callback
 */
const ConnectivityEdition = ({
    voltageLevelOptions,
    voltageLevel,
    voltageLevelPreviousValue,
    busOrBusbarSection,
    busOrBusbarSectionPreviousValue,
    onChangeVoltageLevel,
    onChangeBusOrBusbarSection,
    direction,
    disabled = false,
    errorVoltageLevel,
    helperTextVoltageLevel,
    errorBusOrBusBarSection,
    helperTextBusOrBusBarSection,
    voltageLevelBusOrBBSCallback,
}) => {
    const classes = useStyles();

    const intl = useIntl();

    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );

    const [currentBBS, setCurrentBBS] = useState(null);

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
                onChangeBusOrBusbarSection(null);
            } else if (reason === 'clear') {
                onChangeVoltageLevel(null);
                onChangeBusOrBusbarSection(null);
                setBusOrBusbarSectionOptions([]);
            }
        },
        [onChangeBusOrBusbarSection, onChangeVoltageLevel]
    );

    const handleChangeBus = (event, value, reason) => {
        onChangeBusOrBusbarSection(value);
    };

    useEffect(() => {
        if (voltageLevelBusOrBBSCallback) {
            voltageLevelBusOrBBSCallback(
                voltageLevel,
                setBusOrBusbarSectionOptions
            );
        }
    }, [voltageLevel, voltageLevelBusOrBBSCallback]);

    useEffect(() => {
        setCurrentBBS(
            busOrBusbarSection && busOrBusbarSectionOptions.length
                ? busOrBusbarSectionOptions.find(
                      (value) => value.id === busOrBusbarSection.id
                  )
                : busOrBusbarSection === null
                ? ''
                : busOrBusbarSection
        );
    }, [busOrBusbarSectionOptions, busOrBusbarSection]);

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
                        getOptionLabel={(vl) => vl.id}
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
                        value={voltageLevel}
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
                                {...(voltageLevelPreviousValue && {
                                    error: false,
                                    helperText: voltageLevelPreviousValue,
                                })}
                                {...(errorVoltageLevel && {
                                    error: true,
                                    helperText: helperTextVoltageLevel,
                                })}
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
                        id="bus"
                        disabled={!voltageLevel || disabled}
                        options={busOrBusbarSectionOptions}
                        getOptionLabel={(bbs) => {
                            return bbs === ''
                                ? '' // to clear field
                                : bbs?.id || '';
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
                        value={currentBBS}
                        onChange={handleChangeBus}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'BusBarBus',
                                })}
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...(busOrBusbarSectionPreviousValue && {
                                    error: false,
                                    helperText: busOrBusbarSectionPreviousValue,
                                })}
                                {...(errorBusOrBusBarSection && {
                                    error: true,
                                    helperText: helperTextBusOrBusBarSection,
                                })}
                            />
                        )}
                        PopperComponent={FittingPopper}
                    />
                </Grid>
            </Grid>
        </>
    );
};

ConnectivityEdition.propTypes = {
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    voltageLevel: PropTypes.object,
    busOrBusbarSection: PropTypes.object,
    onChangeVoltageLevel: PropTypes.func.isRequired,
    onChangeBusOrBusbarSection: PropTypes.func.isRequired,
    direction: PropTypes.string,
    errorVoltageLevel: PropTypes.bool,
    helperTextVoltageLevel: PropTypes.string,
    errorBusOrBusBarSection: PropTypes.bool,
    helperTextBusOrBusBarSection: PropTypes.string,
};

export default ConnectivityEdition;
