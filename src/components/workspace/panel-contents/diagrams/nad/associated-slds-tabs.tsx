/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Box, ButtonGroup, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import {
    Close as CloseIcon,
    GridView as GridViewIcon,
    Layers as CascadeIcon,
    DeleteSweep as DeleteSweepIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
} from '@mui/icons-material';
import { useIntl, FormattedMessage } from 'react-intl';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import { selectAssociatedPanels, selectFocusedAssociatedSldId } from '../../../../../redux/slices/workspace-selectors';
import { mergeSx, type MuiStyles, OverflowableText, PopupConfirmationDialog } from '@gridsuite/commons-ui';
import { LayoutMode } from './hooks/use-sld-layout';
import { useWorkspacePanelActions } from '../../../hooks/use-workspace-panel-actions';
import { groupByVoltageLevel, usePendingSwitches } from '../../../diagrams/sld/use-pending-switches';
import { getPanelConfig } from '../../../constants/workspace.constants';

interface AssociatedSldsTabsProps {
    readonly nadPanelId: UUID;
    readonly onToggleVisibility: (sldPanelId: UUID) => void;
    readonly onReorganize?: (mode: LayoutMode) => void;
    readonly onHideAll?: () => void;
}

const styles = {
    container: (theme) => ({
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        zIndex: 1000,
        minHeight: '40px',
    }),
    tabs: {
        flexGrow: 1,
        minWidth: 0,
        minHeight: 36,
    },
    tab: {
        minHeight: 36,
        textTransform: 'none',
    },
    modifiedTab: {
        color: 'warning.main',
        '&.Mui-selected': {
            color: 'warning.main',
        },
    },
    tabLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
    },
    tabText: {
        maxWidth: 100,
    },
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: '50%',
        '&:hover': {
            backgroundColor: 'action.hover',
        },
        '& .MuiSvgIcon-root': { fontSize: 14 },
    },
    buttonGroup: (theme) => ({
        ml: 'auto',
        flexShrink: 0,
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.default,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        gap: theme.spacing(0.5),
        border: 'none',
        '& .MuiButtonGroup-grouped': {
            border: 'none',
            '&:not(:last-of-type)': {
                borderRight: 'none',
            },
        },
    }),
    iconButton: (theme) => ({
        width: theme.spacing(3),
        height: theme.spacing(3),
        padding: 0,
    }),
} as const satisfies MuiStyles;

export const AssociatedSldsTabs = memo(function AssociatedSldsTabs({
    nadPanelId,
    onToggleVisibility,
    onReorganize,
    onHideAll,
}: AssociatedSldsTabsProps) {
    const intl = useIntl();
    const { deletePanel, deletePanels } = useWorkspacePanelActions();
    const [showRemoveAllConfirmation, setShowRemoveAllConfirmation] = useState(false);

    const associatedPanels = useSelector((state: RootState) => selectAssociatedPanels(state, nadPanelId), shallowEqual);
    const focusedSldId = useSelector((state: RootState) => selectFocusedAssociatedSldId(state, nadPanelId));
    const { pendingSwitches } = usePendingSwitches();
    const pendingSwitchesByVoltageLevel = groupByVoltageLevel(pendingSwitches);

    const visibleCount = associatedPanels.filter((p) => !p.minimized).length;
    const hasReorganizeButton = visibleCount > 1 && onReorganize;

    const handleConfirmRemoveAll = () => {
        deletePanels(associatedPanels.map((p) => p.id));
        setShowRemoveAllConfirmation(false);
    };

    if (associatedPanels.length === 0) {
        return null;
    }

    return (
        <Box sx={styles.container}>
            {onHideAll && (
                <Tooltip title={<FormattedMessage id={visibleCount > 0 ? 'hideAll' : 'showAll'} />}>
                    <IconButton size="small" onClick={onHideAll}>
                        {visibleCount > 0 ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            )}

            <Tabs
                value={focusedSldId ?? false}
                variant="scrollable"
                scrollButtons="auto"
                sx={styles.tabs}
                slotProps={{ indicator: { sx: { top: 0, bottom: 'auto' } } }}
            >
                {associatedPanels.map(({ id, type, title, equipmentId }) => (
                    <Tab
                        key={id}
                        value={id}
                        onClick={() => onToggleVisibility(id)}
                        sx={mergeSx(
                            styles.tab,
                            pendingSwitchesByVoltageLevel.has(equipmentId) ? styles.modifiedTab : undefined
                        )}
                        label={
                            <Box sx={styles.tabLabel}>
                                {getPanelConfig(type).icon}
                                <OverflowableText text={title} sx={styles.tabText} />
                                <Box
                                    component="span"
                                    sx={styles.closeButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePanel(id);
                                    }}
                                >
                                    <CloseIcon />
                                </Box>
                            </Box>
                        }
                    />
                ))}
            </Tabs>

            {hasReorganizeButton && (
                <ButtonGroup variant="outlined" size="small" sx={styles.buttonGroup}>
                    <Tooltip title={intl.formatMessage({ id: 'gridLayout' })}>
                        <IconButton onClick={() => onReorganize(LayoutMode.GRID)} sx={styles.iconButton}>
                            <GridViewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={intl.formatMessage({ id: 'cascadeLayout' })}>
                        <IconButton onClick={() => onReorganize(LayoutMode.CASCADE)} sx={styles.iconButton}>
                            <CascadeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            )}

            <Tooltip title={<FormattedMessage id="removeAll" />}>
                <IconButton color="error" size="small" onClick={() => setShowRemoveAllConfirmation(true)}>
                    <DeleteSweepIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {showRemoveAllConfirmation && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({ id: 'removeAllAssociatedSldsConfirmation' })}
                    isTranslationNeeded={false}
                    openConfirmationPopup
                    setOpenConfirmationPopup={() => setShowRemoveAllConfirmation(false)}
                    handlePopupConfirmation={handleConfirmRemoveAll}
                />
            )}
        </Box>
    );
});
