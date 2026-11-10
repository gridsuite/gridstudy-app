/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState, type FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Popover, TextField, MenuItem, ListItemText, InputAdornment, MenuList, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GpsFixed as GpsFixedIcon } from '@mui/icons-material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { List, type RowComponentProps } from 'react-window';
import { escapeRegExp } from '../../../../utils/utils';

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
    onOpen,
    onLocate,
}: RowComponentProps<{
    data: string[];
    searchTerm: string;
    onOpen: (id: string) => void;
    onLocate: (id: string) => void;
}>) => {
    const vlId = data[index];

    const highlightText = (text: string, highlight: string) => {
        if (!highlight) {
            return text;
        }
        const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
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
        <MenuItem key={vlId} onClick={() => onOpen(vlId)} style={style}>
            <ListItemText primary={highlightText(vlId, searchTerm)} />
            <IconButton
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    onLocate(vlId);
                }}
            >
                <GpsFixedIcon fontSize="small" />
            </IconButton>
        </MenuItem>
    );
};

interface VoltageLevelSearchMenuProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    voltageLevels: string[];
    onOpen: (voltageLevelId: string) => void;
    onLocate: (voltageLevelId: string) => void;
}

const VoltageLevelSearchMenu: FC<VoltageLevelSearchMenuProps> = ({
    open,
    anchorEl,
    onClose,
    voltageLevels,
    onOpen,
    onLocate,
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

    const handleOpen = (voltageLevelId: string) => {
        onOpen(voltageLevelId);
        setSearchTerm('');
    };

    const handleLocate = (voltageLevelId: string) => {
        onLocate(voltageLevelId);
        setSearchTerm('');
    };

    if (!open || voltageLevels.length === 0) {
        return null;
    }

    const listHeight = Math.min(filteredVoltageLevels.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

    return (
        <Popover
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <TextField
                autoFocus
                size="small"
                placeholder={intl.formatMessage({ id: 'searchVoltageLevelInNad' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={styles.textField}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <MenuList>
                {filteredVoltageLevels.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText>
                            <FormattedMessage id="noResultsFound" />
                        </ListItemText>
                    </MenuItem>
                ) : (
                    <List
                        style={{ height: listHeight }}
                        rowCount={filteredVoltageLevels.length}
                        rowHeight={ITEM_HEIGHT}
                        rowProps={{
                            data: filteredVoltageLevels,
                            searchTerm,
                            onOpen: handleOpen,
                            onLocate: handleLocate,
                        }}
                        rowComponent={VirtualizedMenuItem}
                    />
                )}
            </MenuList>
        </Popover>
    );
};

export default VoltageLevelSearchMenu;
