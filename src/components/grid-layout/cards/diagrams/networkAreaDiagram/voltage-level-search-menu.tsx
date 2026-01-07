/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, type FC } from 'react';
import { useIntl } from 'react-intl';
import { Menu, TextField, InputAdornment, Box, Autocomplete, styled, Popper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { VoltageLevelSearchMenuList } from './voltage-level-search-menu-list';

interface VoltageLevelSearchMenuProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    voltageLevels: string[];
    onSelect: (voltageLevelId: string) => void;
}

const VoltageLevelSearchMenu: FC<VoltageLevelSearchMenuProps> = ({
    open,
    anchorEl,
    onClose,
    voltageLevels,
    onSelect,
}) => {
    const intl = useIntl();
    const orderedVoltageLevels = useMemo(() => voltageLevels.sort(), [voltageLevels]);

    const highlightText = useMemo(
        () => (text: string, highlight: string) => {
            if (!highlight) {
                return text;
            }
            const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
            return (
                <span>
                    {parts.map((part, partIndex) =>
                        part.toLowerCase() === highlight.toLowerCase() ? (
                            <strong key={`${part}-${partIndex}`}>{part}</strong>
                        ) : (
                            <span key={`${part}-${partIndex}`}>{part}</span>
                        )
                    )}
                </span>
            );
        },
        []
    );

    const handleClose = () => {
        onClose();
    };

    const NoMaxHeightPopper = styled(Popper)({
        '& .MuiAutocomplete-listbox': {
            maxHeight: 'none',
        },
    });

    if (!open || orderedVoltageLevels.length === 0) {
        return null;
    }

    return (
        <>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <Box minWidth={250}>
                    <Autocomplete
                        size="small"
                        disableListWrap
                        onChange={(event: any, newValue: string | null) => {
                            if (newValue) {
                                onSelect(newValue);
                            }
                        }}
                        ListboxComponent={VoltageLevelSearchMenuList}
                        // if not set, max popper heigt is 40vh, which is not enough to display ~8 elements
                        PopperComponent={(props) => <NoMaxHeightPopper {...props} />}
                        options={orderedVoltageLevels}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                autoFocus
                                sx={{ paddingX: '4px' }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder={intl.formatMessage({ id: 'searchVoltageLevelInNad' })}
                            />
                        )}
                        renderOption={(props, option, { inputValue }) => {
                            const { key, ...optionProps } = props;
                            return (
                                <li key={key} {...optionProps}>
                                    {highlightText(option, inputValue)}
                                </li>
                            );
                        }}
                    />
                </Box>
            </Menu>
        </>
    );
};

export default VoltageLevelSearchMenu;
