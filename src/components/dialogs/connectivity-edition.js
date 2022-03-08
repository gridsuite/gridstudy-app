/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { Popper, TextField } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
} from '../../utils/rest-api';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

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
 * @param selectedNodeUuid : the currently selected tree node
 */
const ConnectivityEdition = ({
    voltageLevelOptions,
    voltageLevel,
    busOrBusbarSection,
    onChangeVoltageLevel,
    onChangeBusOrBusbarSection,
    direction,
    errorVoltageLevel,
    helperTextVoltageLevel,
    errorBusOrBusBarSection,
    helperTextBusOrBusBarSection,
    workingNodeUuid,
}) => {
    const classes = useStyles();
    const studyUuid = decodeURIComponent(useParams().studyUuid);

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
            if (reason === 'select-option') {
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
        //To force the update of busbar choices when voltageLevel change is not triggered by this component
        switch (voltageLevel?.topologyKind) {
            case 'NODE_BREAKER':
                fetchBusbarSectionsForVoltageLevel(
                    studyUuid,
                    workingNodeUuid,
                    voltageLevel.id
                ).then((busbarSections) => {
                    setBusOrBusbarSectionOptions(busbarSections);
                });
                break;

            case 'BUS_BREAKER':
                fetchBusesForVoltageLevel(
                    studyUuid,
                    workingNodeUuid,
                    voltageLevel.id
                ).then((buses) => setBusOrBusbarSectionOptions(buses));
                break;

            default:
                setBusOrBusbarSectionOptions([]);
                break;
        }
    }, [
        voltageLevel,
        handleChangeVoltageLevel,
        studyUuid,
        workingNodeUuid,
        setBusOrBusbarSectionOptions,
    ]);

    useEffect(() => {
        setCurrentBBS(
            busOrBusbarSection && busOrBusbarSectionOptions.length
                ? busOrBusbarSectionOptions.find(
                      (value) => value.id === busOrBusbarSection.id
                  )
                : ''
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
                        disabled={!voltageLevel}
                        options={busOrBusbarSectionOptions}
                        getOptionLabel={(bbs) => bbs?.id || ''}
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
    workingNodeUuid: PropTypes.string,
};

export default ConnectivityEdition;
