/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { Popper, TextField } from '@material-ui/core';
import React from 'react';
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
        marginTop: 3,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
}));

const ConnectivityEdition = ({
    network,
    voltageLevel,
    busOrBusbarSection,
    busOrBusbarSectionOptions,
    errors,
    changeVoltageLevel,
    changeBusOrBusbarSection,
    changeBusOrBusbarSectionOptions,
}) => {
    const classes = useStyles();
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const intl = useIntl();

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

    const handleChangeVoltageLevel = (event, value, reason) => {
        if (reason === 'select-option') {
            changeVoltageLevel(value);
            changeBusOrBusbarSection(null);
            switch (value?.topologyKind) {
                case 'NODE_BREAKER':
                    // TODO specify the correct network variant num
                    fetchBusbarSectionsForVoltageLevel(
                        studyUuid,
                        0,
                        value.id
                    ).then((busbarSections) => {
                        changeBusOrBusbarSectionOptions(busbarSections);
                    });
                    break;

                case 'BUS_BREAKER':
                    // TODO specify the correct network variant num
                    fetchBusesForVoltageLevel(studyUuid, 0, value.id).then(
                        (buses) => changeBusOrBusbarSectionOptions(buses)
                    );
                    break;

                default:
                    changeBusOrBusbarSectionOptions([]);
                    break;
            }
        } else if (reason === 'clear') {
            changeVoltageLevel(null);
            changeBusOrBusbarSection(null);
            changeBusOrBusbarSectionOptions([]);
        }
    };

    const handleChangeBus = (event, value, reason) => {
        changeBusOrBusbarSection(value);
    };

    return (
        <>
            <FormattedMessage id="Connectivity" />
            <Grid container spacing={2}>
                <Grid item xs={4} align="left">
                    {/* TODO: autoComplete prop is not working properly with material-ui v4,
                            it clears the field when blur event is raised, which actually forces the user to validate free input
                            with enter key for it to be validated.
                            check if autoComplete prop is fixed in v5 */}
                    <Autocomplete
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="voltage-level"
                        size="small"
                        options={network?.voltageLevels}
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
                                {...(errors.get('voltage-level')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('voltage-level')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        )}
                        PopperComponent={FittingPopper}
                    />
                </Grid>
                <Grid item xs={4} align="left">
                    {/* TODO: autoComplete prop is not working properly with material-ui v4,
                            it clears the field when blur event is raised, which actually forces the user to validate free input
                            with enter key for it to be validated.
                            check if autoComplete prop is fixed in v5 */}
                    <Autocomplete
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="bus"
                        size="small"
                        disabled={!voltageLevel}
                        options={busOrBusbarSectionOptions}
                        getOptionLabel={(busOrBusbarSection) =>
                            busOrBusbarSection?.id
                        }
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
                        value={busOrBusbarSection}
                        onChange={handleChangeBus}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'BusBarBus',
                                })}
                                {...(errors.get('bus-bar')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('bus-bar')?.errorMsgId,
                                    }),
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
    network: PropTypes.object.isRequired,
    voltageLevel: PropTypes.object,
    busOrBusbarSection: PropTypes.object,
    busOrBusbarSectionOptions: PropTypes.array,
    errors: PropTypes.object,
    changeVoltageLevel: PropTypes.func.isRequired,
    changeBusOrBusbarSection: PropTypes.func.isRequired,
    changeBusOrBusbarSectionOptions: PropTypes.func.isRequired,
};

export default ConnectivityEdition;
