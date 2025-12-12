/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Menu, MenuItem, ListItemText, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { selectOpenPanels } from '../../../redux/slices/workspace-selectors';
import { PanelType } from '../types/workspace.types';
import type { UUID } from 'node:crypto';

interface AssociateNadMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    onSelectNad: (nadPanelId: UUID) => void;
    onCreateNad?: () => void;
    voltageLevelId?: string;
}

export const AssociateNadMenu = ({
    anchorEl,
    open,
    onClose,
    onSelectNad,
    onCreateNad,
    voltageLevelId,
}: AssociateNadMenuProps) => {
    const intl = useIntl();
    const allPanels = useSelector(selectOpenPanels);
    const nadPanels = allPanels.filter((p) => p.type === PanelType.NAD);

    return (
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
            {nadPanels.length > 0 && [
                ...nadPanels.map((panel) => (
                    <MenuItem
                        key={panel.id}
                        onClick={() => {
                            onSelectNad(panel.id);
                            onClose();
                        }}
                    >
                        <ListItemText primary={panel.title} secondary={intl.formatMessage({ id: 'existingNAD' })} />
                    </MenuItem>
                )),
                <Divider key="divider" />,
            ]}
            {onCreateNad && voltageLevelId && (
                <MenuItem
                    onClick={() => {
                        onCreateNad();
                        onClose();
                    }}
                >
                    <ListItemText primary={intl.formatMessage({ id: 'createNewNAD' })} secondary={voltageLevelId} />
                </MenuItem>
            )}
        </Menu>
    );
};
