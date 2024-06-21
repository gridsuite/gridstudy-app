/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType } from '@gridsuite/commons-ui';
import { HorizontalRule } from '@mui/icons-material';
import {
    Box,
    FormControl,
    FormControlLabel,
    Popover,
    Radio,
    RadioGroup,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface TopBarEquipmentSearchPopoverProps {
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    anchorEl: HTMLDivElement | null;
    equipmentType: EquipmentType | null;
    setEquipmentType: Dispatch<SetStateAction<EquipmentType | null>>;
}

const unsearchableTypes = [
    EquipmentType.SWITCH,
    EquipmentType.VSC_CONVERTER_STATION,
    EquipmentType.LCC_CONVERTER_STATION,
];

export const TopBarEquipmentSearchPopover = (
    props: TopBarEquipmentSearchPopoverProps
) => {
    const { open, setIsOpen, equipmentType, setEquipmentType, anchorEl } =
        props;

    return (
        <Popover
            slotProps={{
                paper: {
                    style: {
                        maxHeight: '45%',
                        marginRight: 10,
                    },
                },
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
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
                            sx={{
                                display: 'flex',
                                gap: 1,
                                paddingBottom: 1,
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                setEquipmentType(null);
                                setIsOpen(false);
                            }}
                        >
                            <HorizontalRule />
                            <FormattedMessage id="NoFilter" />
                        </Box>
                        {Object.values(EquipmentType)
                            .filter((type) => !unsearchableTypes.includes(type))
                            .map((type) => {
                                return (
                                    <FormControlLabel
                                        key={type.toString()}
                                        value={type.toString()}
                                        control={<Radio />}
                                        label={
                                            <FormattedMessage
                                                id={type.toString()}
                                            />
                                        }
                                    />
                                );
                            })}
                    </RadioGroup>
                </FormControl>
            </Box>
        </Popover>
    );
};
