/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { List, ListItem, ListItemButton, ListItemText, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import type { MuiStyles } from '@gridsuite/commons-ui';
import type { NadSelectedInfoKey, NadSelectedInfos } from './use-nad-info-filter';

// One row per information layer, in the order shown in the sidebar.
const INFO_ROWS: { key: NadSelectedInfoKey; labelId: string }[] = [
    { key: 'activePowerValue', labelId: 'nadInfoActivePowerValue' },
    { key: 'reactivePowerValue', labelId: 'nadInfoReactivePowerValue' },
    { key: 'permanentLimitPercentage', labelId: 'nadInfoPermanentLimitPercentage' },
    { key: 'activePowerArrow', labelId: 'nadInfoActivePowerArrow' },
    { key: 'reactivePowerArrow', labelId: 'nadInfoReactivePowerArrow' },
    { key: 'voltageLevelName', labelId: 'nadInfoVoltageLevelName' },
];

const styles = {
    list: {
        width: '100%',
        py: 0,
    },
    item: {
        padding: 0,
    },
    text: {
        fontSize: 12,
        ml: 0.5,
    },
} as const satisfies MuiStyles;

export interface NadInfoFilterProps {
    selectedInfos: NadSelectedInfos;
    onToggle: (key: NadSelectedInfoKey) => void;
    isDisabled: boolean;
}

export default function NadInfoFilter({ selectedInfos, onToggle, isDisabled }: Readonly<NadInfoFilterProps>) {
    return (
        <List sx={styles.list}>
            {INFO_ROWS.map(({ key, labelId }) => (
                <ListItem sx={styles.item} key={key}>
                    <ListItemButton dense onClick={() => onToggle(key)} disabled={isDisabled}>
                        <Switch size="small" checked={selectedInfos[key]} edge="start" />
                        <ListItemText sx={styles.text} disableTypography primary={<FormattedMessage id={labelId} />} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}
