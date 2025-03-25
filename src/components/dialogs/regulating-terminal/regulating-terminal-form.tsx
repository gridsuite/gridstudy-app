/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, FilterOptionsState, Grid, GridDirection, Popper, PopperProps } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { EQUIPMENT, ID, VOLTAGE_LEVEL } from 'components/utils/field-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, Identifiable, Option } from '@gridsuite/commons-ui';
import { fetchVoltageLevelEquipments } from '../../../services/study/network-map';
import { UUID } from 'crypto';

// Factory used to create a filter method that is used to change the default
// option filter behaviour of the Autocomplete component
const filter = createFilterOptions() as (options: Option[], params: FilterOptionsState<Option>) => Option[];

// Specific Popper component to be used with Autocomplete
// This allows the popper to fit its content, which is not the case by default
const FittingPopper = (props: PopperProps) => {
    const { style, ...otherProps } = props; // We filter out the "style" props to remove the width provided by the autocomplete input field.
    return <Popper {...otherProps} placement="bottom-start" />;
};

interface RegulatingTerminalFormProps {
    id: string;
    direction?: GridDirection;
    disabled?: boolean;
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    voltageLevelOptions: Identifiable[];
    equipmentSectionTypeDefaultValue?: string;
    regulatingTerminalVlId?: string;
    equipmentSectionType?: string;
}

export function RegulatingTerminalForm({
    id, // id that has to be defined to determine it is parent object within the form
    direction,
    disabled = false,
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    equipmentSectionTypeDefaultValue,
    regulatingTerminalVlId,
    equipmentSectionType,
}: Readonly<RegulatingTerminalFormProps>) {
    const [equipmentsOptions, setEquipmentsOptions] = useState<Option[]>([]);
    const { setValue } = useFormContext();

    const watchVoltageLevelId = useWatch({
        name: `${id}.${VOLTAGE_LEVEL}.${ID}`,
    });

    const vlOptions = useMemo(
        () =>
            voltageLevelOptions.map((item) => ({
                id: item.id,
                label: item.name ?? '',
            })),
        [voltageLevelOptions]
    );

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
                watchVoltageLevelId,
                undefined,
                true
            ).then((equipments) => {
                setEquipmentsOptions(
                    equipments.map((equipment) => ({
                        id: equipment.id,
                        label: equipment.type,
                        type: equipment.type,
                    }))
                );
            });
        } else {
            setEquipmentsOptions([]);
        }
    }, [watchVoltageLevelId, voltageLevelOptions, id, studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const resetEquipment = useCallback(() => {
        setValue(`${id}.${EQUIPMENT}`, null);
    }, [id, setValue]);

    return (
        <Grid container direction={direction ?? 'row'} spacing={2}>
            <Grid
                item
                xs={direction && (direction === 'column' || direction === 'column-reverse') ? 12 : 6}
                sx={{ align: 'start' }}
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
                        options={vlOptions}
                        getOptionLabel={(vl) => (typeof vl !== 'string' ? vl?.id ?? '' : '')}
                        onChangeCallback={resetEquipment}
                        previousValue={regulatingTerminalVlId ?? undefined}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                            is created in the options list with a value equal to the input value
                            */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (
                                params.inputValue !== '' &&
                                !options.find((opt) => typeof opt !== 'string' && opt.id === params.inputValue)
                            ) {
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
                sx={{ align: 'start' }}
            >
                {
                    <AutocompleteInput
                        name={`${id}.${EQUIPMENT}`}
                        //setting null programmatically when allowNewValue is enabling (i.e. freeSolo enabled) wont empty the field => need to convert null to empty and vice versa
                        inputTransform={(value) => value ?? ''}
                        outputTransform={(value) => {
                            if (typeof value === 'string') {
                                return value === ''
                                    ? null
                                    : { id: value, label: value, type: equipmentSectionTypeDefaultValue };
                            }
                            return value;
                        }}
                        label="Equipment"
                        size="small"
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="equipment"
                        disabled={!watchVoltageLevelId || disabled}
                        previousValue={equipmentSectionType}
                        options={equipmentsOptions}
                        getOptionLabel={(equipment) => {
                            return typeof equipment !== 'string' ? equipment?.id ?? '' : '';
                        }}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;

                            let displayText = '';
                            if (typeof option !== 'string') {
                                if (option.label) {
                                    displayText = `${option.label} : ${option.id}`;
                                } else {
                                    displayText = option.id || '';
                                }
                            }

                            return (
                                <Box key={key} component="li" {...optionProps}>
                                    {displayText}
                                </Box>
                            );
                        }}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                            is created in the options list with a value equal to the input value
                         */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (
                                params.inputValue !== '' &&
                                !options.find((opt) => typeof opt !== 'string' && opt?.id === params.inputValue)
                            ) {
                                filtered.push({
                                    label: equipmentSectionTypeDefaultValue ?? '',
                                    id: params.inputValue,
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
}
