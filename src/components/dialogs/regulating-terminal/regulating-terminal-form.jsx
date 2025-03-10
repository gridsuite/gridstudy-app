/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, Popper } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { EQUIPMENT, ID, TYPE, VOLTAGE_LEVEL } from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { fetchVoltageLevelEquipments } from '../../../services/study/network-map';

// Factory used to create a filter method that is used to change the default
// option filter behaviour of the Autocomplete component
const filter = createFilterOptions();

export const REGULATING_VOLTAGE_LEVEL = 'regulating-voltage-level';
export const REGULATING_EQUIPMENT = 'regulating-equipment';

// Specific Popper component to be used with Autocomplete
// This allows the popper to fit its content, which is not the case by default
const FittingPopper = (props) => {
    const { style, ...otherProps } = props; // We filter out the "style" props to remove the width provided by the autocomplete input field.
    return <Popper {...otherProps} placement="bottom-start" />;
};

const RegulatingTerminalForm = ({
    id, // id that has to be defined to determine it's parent object within the form
    direction,
    disabled = false,
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    equipmentSectionTypeDefaultValue,
    previousRegulatingTerminalValue,
    previousEquipmentSectionTypeValue,
}) => {
    const [equipmentsOptions, setEquipmentsOptions] = useState([]);
    const { setValue } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${ID}`,
    });

    useEffect(() => {
        if (
            watchVoltageLevelId &&
            /* avoid fetch non existing vl id */
            voltageLevelOptions.find((vlOption) => vlOption.id === watchVoltageLevelId)
        ) {
            fetchVoltageLevelEquipments(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                undefined,
                watchVoltageLevelId,
                true
            ).then((values) => {
                setEquipmentsOptions(values);
            });
        } else {
            setEquipmentsOptions([]);
        }
    }, [watchVoltageLevelId, voltageLevelOptions, id, studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const resetEquipment = useCallback(() => {
        setValue(`${id}.${EQUIPMENT}`, null);
    }, [id, setValue]);

    return (
        <Grid container direction={direction || 'row'} spacing={2}>
            <Grid
                item
                xs={direction && (direction === 'column' || direction === 'column-reverse') ? 12 : 6}
                align="start"
            >
                {
                    <AutocompleteInput
                        name={`${id}.${VOLTAGE_LEVEL}`}
                        label="VOLTAGE_LEVEL"
                        size="small"
                        // particular outputTransform case for string type when a user clicks outside after editing whatever input
                        outputTransform={(value) => {
                            return typeof value === 'string' ? { id: value, label: value } : value;
                        }}
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        disabled={disabled}
                        id="voltage-level"
                        options={voltageLevelOptions}
                        getOptionLabel={(vl) => (vl?.id ? vl?.id : '')}
                        onChangeCallback={resetEquipment}
                        previousValue={previousRegulatingTerminalValue}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                            is created in the options list with a value equal to the input value
                            */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (params.inputValue !== '' && !options.find((opt) => opt?.id === params.inputValue)) {
                                filtered.push({
                                    id: params.inputValue,
                                    label: params.inputValue,
                                });
                            }
                            return filtered;
                        }}
                        PopperComponent={FittingPopper}
                        allowNewValue
                    />
                }
            </Grid>
            <Grid
                item
                xs={direction && (direction === 'column' || direction === 'column-reverse') ? 12 : 6}
                align="start"
            >
                {
                    <AutocompleteInput
                        name={`${id}.${EQUIPMENT}`}
                        outputTransform={(value) => {
                            return typeof value === 'string' ? { id: value, label: value } : value;
                        }}
                        label="Equipment"
                        size="small"
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="equipment"
                        disabled={!watchVoltageLevelId || disabled}
                        previousValue={previousEquipmentSectionTypeValue}
                        options={equipmentsOptions}
                        getOptionLabel={(equipment) => {
                            return equipment === '' ? '' : equipment?.[ID] || '';
                        }}
                        renderOption={(props, option) => {
                            return <Box {...props}>{`${option?.[TYPE]} : ${option?.[ID]}`}</Box>;
                        }}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                            is created in the options list with a value equal to the input value
                         */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (params.inputValue !== '' && !options.find((opt) => opt?.id === params.inputValue)) {
                                filtered.push({
                                    [TYPE]: equipmentSectionTypeDefaultValue,
                                    [ID]: params.inputValue,
                                });
                            }
                            return filtered;
                        }}
                        allowNewValue
                        PopperComponent={FittingPopper}
                    />
                }
            </Grid>
        </Grid>
    );
};

RegulatingTerminalForm.propTypes = {
    id: PropTypes.string.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    currentRootNetworkUuid: PropTypes.string.isRequired,
    direction: PropTypes.string,
    disabled: PropTypes.bool,
};

export default RegulatingTerminalForm;
