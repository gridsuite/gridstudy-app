/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { IconButton, type SxProps, type Theme } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import { selectPanel } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import type { SLDVoltageLevelPanel } from '../types/workspace.types';
import { AssociateNadMenu } from './associate-nad-menu';

interface SldAssociationButtonProps {
    panelId: UUID;
    title: string;
    iconButtonStyles: SxProps<Theme>;
}

/**
 * Component that encapsulates all SLD association button logic.
 * Renders the associate button + menu for voltage level SLD panels.
 */
export const SldAssociationButton = ({ panelId, title, iconButtonStyles }: SldAssociationButtonProps) => {
    const { associateSldToNad, createNadAndAssociateSld } = useWorkspaceActions();
    const [associateMenuAnchor, setAssociateMenuAnchor] = useState<HTMLElement | null>(null);
    const panel = useSelector((state: RootState) => selectPanel(state, panelId)) as SLDVoltageLevelPanel | undefined;

    const handleAssociateClick = (event: React.MouseEvent<HTMLElement>) => {
        setAssociateMenuAnchor(event.currentTarget);
    };

    const handleAssociateMenuClose = () => {
        setAssociateMenuAnchor(null);
    };

    const handleSelectNad = (nadPanelId: UUID) => {
        associateSldToNad({ sldPanelId: panelId, nadPanelId });
    };

    const handleCreateNad = () => {
        if (panel?.diagramId) {
            createNadAndAssociateSld({
                sldPanelId: panelId,
                voltageLevelId: panel.diagramId,
                voltageLevelName: title,
            });
        }
    };

    return (
        <>
            <IconButton
                className="panel-header-close-button"
                size="small"
                sx={iconButtonStyles}
                onClick={handleAssociateClick}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <LinkIcon fontSize="small" />
            </IconButton>
            <AssociateNadMenu
                anchorEl={associateMenuAnchor}
                open={Boolean(associateMenuAnchor)}
                onClose={handleAssociateMenuClose}
                onSelectNad={handleSelectNad}
                onCreateNad={handleCreateNad}
                voltageLevelId={panel?.diagramId}
            />
        </>
    );
};
