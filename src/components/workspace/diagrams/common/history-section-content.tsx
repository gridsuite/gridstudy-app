/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { memo } from 'react';

interface HistorySectionContentProps {
    navigationHistory: string[];
    onNavigate: (voltageLevelId: string) => void;
    isItemSelected?: (voltageLevelId: string) => boolean;
    isDisabled: boolean;
}

export const HistorySectionContent = memo(function HistorySectionContent({
    navigationHistory,
    onNavigate,
    isItemSelected,
    isDisabled,
}: HistorySectionContentProps) {
    return (
        <List dense sx={{ py: 0 }}>
            {navigationHistory.map((voltageLevelId, index) => (
                <ListItemButton
                    key={`${voltageLevelId}-${index}`}
                    selected={isItemSelected ? isItemSelected(voltageLevelId) : false}
                    onClick={() => onNavigate(voltageLevelId)}
                    disabled={isDisabled}
                >
                    <ListItemIcon>
                        <ArrowBackIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary={voltageLevelId}
                        primaryTypographyProps={{
                            variant: 'caption',
                            noWrap: true,
                        }}
                    />
                </ListItemButton>
            ))}
        </List>
    );
});
