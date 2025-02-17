/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType, SEARCH_EQUIPMENTS } from '@gridsuite/commons-ui';
import { HorizontalRule } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, Popover, Radio, RadioGroup, Theme } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

const styles = {
    popoverPaper: {
        // prevent prevent component from hovering searchbar when too high
        maxHeight: '45%',
    },
    noFilterOption: {
        display: 'flex',
        gap: 1,
        paddingBottom: 1,
        cursor: 'pointer',
    },
    radioButtonColor: (theme: Theme) => ({
        '& .Mui-checked + .MuiFormControlLabel-label': {
            color: theme.palette.primary.main,
        },
    }),
};

interface TopBarEquipmentSearchPopoverProps {
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    anchorEl: HTMLDivElement | null;
    equipmentType: EquipmentType | null;
    setEquipmentType: Dispatch<SetStateAction<EquipmentType | null>>;
}

export const TopBarEquipmentSearchPopover = (props: TopBarEquipmentSearchPopoverProps) => {
    const { open, setIsOpen, equipmentType, setEquipmentType, anchorEl } = props;

    return (
        <Popover
            slotProps={{
                paper: {
                    style: styles.popoverPaper,
                },
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                // can't use theme.spacing in a clean way here because it would return a string which is not accepted by "horizontal"
                horizontal: 32,
            }}
            open={open}
            onClose={() => setIsOpen(false)}
            anchorEl={anchorEl}
        >
            <Box m={2}>
                <FormControl>
                    <RadioGroup
                        value={equipmentType}
                        name="equipment-type-radio"
                        onChange={(_event, value) => {
                            setEquipmentType(value as EquipmentType);
                            setIsOpen(false);
                        }}
                    >
                        <Box
                            sx={styles.noFilterOption}
                            onClick={() => {
                                setEquipmentType(null);
                                setIsOpen(false);
                            }}
                        >
                            <HorizontalRule />
                            <FormattedMessage id="NoFilter" />
                        </Box>
                        {Object.values(SEARCH_EQUIPMENTS).map((type) => {
                            return (
                                <FormControlLabel
                                    key={type.id}
                                    value={type.id}
                                    control={<Radio />}
                                    sx={styles.radioButtonColor}
                                    label={<FormattedMessage id={type.label} />}
                                />
                            );
                        })}
                    </RadioGroup>
                </FormControl>
            </Box>
        </Popover>
    );
};
