/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState, type FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Menu, TextField, MenuItem, ListItemText, InputAdornment, MenuList } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { List, type RowComponentProps } from 'react-window';

const styles = {
    textField: {
        m: 1,
        width: 250,
        position: 'sticky',
        top: 0,
    },
} as const satisfies MuiStyles;

const ITEM_HEIGHT = 36;
const MAX_VISIBLE_ITEMS = 8;

const VirtualizedMenuItem = ({
    index,
    style,
    data,
    searchTerm,
    onSelect,
}: RowComponentProps<{
    data: string[];
    searchTerm: string;
    onSelect: (id: string) => void;
}>) => {
    const vlId = data[index];

    const highlightText = (text: string, highlight: string) => {
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
    };

    return (
        <MenuItem key={vlId} onClick={() => onSelect(vlId)} style={style}>
            <ListItemText primary={highlightText(vlId, searchTerm)} />
        </MenuItem>
    );
};

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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVoltageLevels = useMemo(() => {
        const compareVoltageLevels = (a: string, b: string) => a.localeCompare(b);

        if (!searchTerm) {
            return voltageLevels.toSorted(compareVoltageLevels);
        }

        const term = searchTerm.toLowerCase();
        const filtered = voltageLevels.filter((vlId) => vlId.toLowerCase().includes(term));

        // items starting with search term first, then alphabetically
        return filtered.toSorted((a, b) => {
            const aStarts = a.toLowerCase().startsWith(term);
            const bStarts = b.toLowerCase().startsWith(term);

            if (aStarts !== bStarts) {
                return aStarts ? -1 : 1;
            }

            return compareVoltageLevels(a, b);
        });
    }, [searchTerm, voltageLevels]);

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

    const listHeight = Math.min(filteredVoltageLevels.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

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
            {filteredVoltageLevels.length === 0 ? (
                <MenuList>
                    <MenuItem disabled>
                        <ListItemText>
                            <FormattedMessage id="noResultsFound" />
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            ) : (
                <List
                    style={{ height: listHeight }}
                    rowCount={filteredVoltageLevels.length}
                    rowHeight={ITEM_HEIGHT}
                    rowProps={{ data: filteredVoltageLevels, searchTerm, onSelect: handleSelect }}
                    rowComponent={VirtualizedMenuItem}
                />
            )}
        </Menu>
    );
};

export default VoltageLevelSearchMenu;
