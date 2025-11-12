/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState, type FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Menu, TextField, MenuItem, ListItemText, InputAdornment, Box } from '@mui/material';
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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVoltageLevels = useMemo(() => {
        const compareVoltageLevels = (a: string, b: string) => a.localeCompare(b);

        if (!searchTerm) {
            return voltageLevels.toSorted(compareVoltageLevels);
        }
        const term = searchTerm.toLowerCase();
        return voltageLevels.filter((vlId) => vlId.toLowerCase().includes(term)).toSorted(compareVoltageLevels);
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
                            <ListItemText primary={vlId} />
                        </MenuItem>
                    ))
                )}
            </Box>
        </Menu>
    );
};

export default VoltageLevelSearchMenu;
