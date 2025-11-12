/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState, type FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Menu, TextField, MenuItem, ListItemText, InputAdornment, Box, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    textField: {
        m: 1,
        width: 250,
        position: 'sticky',
        top: 0,
    },
    menuList: {
        maxHeight: 300,
        overflow: 'auto',
    },
} as const satisfies MuiStyles;

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
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVoltageLevels = useMemo(() => {
        const compareVoltageLevels = (a: string, b: string) => a.localeCompare(b);

        if (!searchTerm) {
            return voltageLevels.toSorted(compareVoltageLevels);
        }

        const term = searchTerm.toLowerCase();
        const filtered = voltageLevels.filter((vlId) => vlId.toLowerCase().includes(term));

        // Sort with priority: items starting with search term first, then alphabetically
        return filtered.toSorted((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aStarts = aLower.startsWith(term);
            const bStarts = bLower.startsWith(term);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return compareVoltageLevels(a, b);
        });
    }, [searchTerm, voltageLevels]);

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
        setSearchTerm('');
        onClose();
    };

    const handleSelect = (voltageLevelId: string) => {
        onSelect(voltageLevelId);
        setSearchTerm('');
    };

    if (!open || voltageLevels.length === 0) {
        return null;
    }

    return (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <TextField
                autoFocus
                size="small"
                placeholder={intl.formatMessage({ id: 'searchVoltageLevelInNad' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={styles.textField}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />
            <Box sx={styles.menuList}>
                {filteredVoltageLevels.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText>
                            <FormattedMessage id="noResultsFound" />
                        </ListItemText>
                    </MenuItem>
                ) : (
                    filteredVoltageLevels.map((vlId) => (
                        <MenuItem key={vlId} onClick={() => handleSelect(vlId)}>
                            <ListItemText primary={highlightText(vlId, searchTerm)} />
                        </MenuItem>
                    ))
                )}
            </Box>
        </Menu>
    );
};

export default VoltageLevelSearchMenu;
