/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType, SEARCH_EQUIPMENTS } from '@gridsuite/commons-ui';
import { Search, SearchOff, Tune } from '@mui/icons-material';
import { AutocompleteRenderInputParams, Chip, IconButton, TextField } from '@mui/material';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TopBarEquipmentSearchPopover } from './top-bar-equipment-search-popover';

interface TopBarEquipmentSearchInputProps {
    displayedValue: string;
    params: AutocompleteRenderInputParams;
    equipmentType: EquipmentType | null;
    setEquipmentType: Dispatch<SetStateAction<EquipmentType | null>>;
}

const styles = {
    chip: {
        backgroundColor: 'lightblue',
        color: 'black',
        '& .MuiChip-deleteIcon': {
            color: 'black',
        },
    },
};

export const TopBarEquipmentSearchInput = (props: TopBarEquipmentSearchInputProps) => {
    const { displayedValue, params, equipmentType, setEquipmentType } = props;
    const intl = useIntl();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);
    return (
        <>
            <TextField
                ref={inputRef}
                // When the field is deactivated, passing displayedValue as value displays an empty input.
                // So we use the placeholder to clearly display the reason for deactivation
                placeholder={
                    params.disabled
                        ? displayedValue
                        : intl.formatMessage({
                              id: 'searchPlaceholder',
                          })
                }
                autoFocus={true}
                {...params}
                label={intl.formatMessage({
                    id: 'equipment_search/label',
                })}
                InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                        <>
                            {params.disabled ? <SearchOff color="disabled" /> : <Search color="disabled" />}
                            {params.InputProps.startAdornment}
                        </>
                    ),
                    endAdornment: (
                        <>
                            {!params.disabled && equipmentType && (
                                <Chip
                                    onDelete={() => setEquipmentType(null)}
                                    label={
                                        <FormattedMessage
                                            id={
                                                Object.values(SEARCH_EQUIPMENTS).find((eq) => eq.id === equipmentType)
                                                    ?.label
                                            }
                                        />
                                    }
                                    sx={styles.chip}
                                />
                            )}
                            <IconButton onClick={() => setIsPopoverOpen(true)} disabled={params.disabled}>
                                <Tune />
                            </IconButton>
                        </>
                    ),
                }}
                value={displayedValue}
            />
            <TopBarEquipmentSearchPopover
                anchorEl={inputRef.current}
                equipmentType={equipmentType}
                setEquipmentType={setEquipmentType}
                open={isPopoverOpen}
                setIsOpen={setIsPopoverOpen}
            />
        </>
    );
};
