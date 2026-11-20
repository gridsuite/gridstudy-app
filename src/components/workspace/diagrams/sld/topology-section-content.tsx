/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Fragment, memo } from 'react';
import {
    BreakerCloseIcon,
    BreakerOpenIcon,
    DisconnectorCloseIcon,
    DisconnectorOpenIcon,
    LoadBreakerSwitchCloseIcon,
    LoadBreakerSwitchOpenIcon,
    mergeSx,
    type MuiStyles,
    OverflowableText,
} from '@gridsuite/commons-ui';
import { groupByVoltageLevel, type PendingSwitch, type PendingSwitches } from './use-pending-switches';

const styles = {
    list: { py: 0 },
    voltageLevel: {
        mt: 1,
        px: 1,
        typography: 'caption',
        fontWeight: 'medium',
        color: 'text.primary',
        bgcolor: 'transparent',
    },
    switch: { px: 1, py: 0 },
    switchIcon: { minWidth: 28, color: 'text.primary', fontSize: 16 },
    // Same color as on the diagram (index.css)
    fictitiousSwitchIcon: { color: 'maroon' },
    switchName: { typography: 'caption', overflowWrap: 'anywhere' },
} as const satisfies MuiStyles;

const switchIcons: Record<string, { open: typeof BreakerOpenIcon; closed: typeof BreakerOpenIcon }> = {
    BREAKER: { open: BreakerOpenIcon, closed: BreakerCloseIcon },
    DISCONNECTOR: { open: DisconnectorOpenIcon, closed: DisconnectorCloseIcon },
    LOAD_BREAK_SWITCH: { open: LoadBreakerSwitchOpenIcon, closed: LoadBreakerSwitchCloseIcon },
};

const SwitchItem = ({ id, componentType, fictitious, open }: PendingSwitch) => {
    const icons = switchIcons[componentType] ?? switchIcons.BREAKER;
    const Icon = open ? icons.open : icons.closed;
    return (
        <ListItem sx={styles.switch}>
            <ListItemIcon sx={mergeSx(styles.switchIcon, fictitious ? styles.fictitiousSwitchIcon : undefined)}>
                <Icon fontSize="inherit" />
            </ListItemIcon>
            <ListItemText
                disableTypography
                primary={<OverflowableText text={id} maxLineCount={2} sx={styles.switchName} />}
            />
        </ListItem>
    );
};

interface TopologySectionContentProps {
    pendingSwitches: PendingSwitches;
}

export const TopologySectionContent = memo(function TopologySectionContent({
    pendingSwitches,
}: TopologySectionContentProps) {
    return (
        <List dense sx={styles.list}>
            {[...groupByVoltageLevel(pendingSwitches)].map(([voltageLevelId, switches], index) => (
                <Fragment key={voltageLevelId}>
                    {index > 0 && <Divider component="li" />}
                    <ListSubheader disableSticky sx={styles.voltageLevel}>
                        {voltageLevelId}
                    </ListSubheader>
                    {switches.map((pendingSwitch) => (
                        <SwitchItem key={pendingSwitch.id} {...pendingSwitch} />
                    ))}
                </Fragment>
            ))}
        </List>
    );
});
