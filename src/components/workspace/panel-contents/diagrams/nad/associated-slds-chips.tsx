/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Box, Chip, Button, ButtonGroup, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import {
    Close as CloseIcon,
    GridView as GridViewIcon,
    Layers as CascadeIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import { selectAssociatedPanels } from '../../../../../redux/slices/workspace-selectors';
import { type MuiStyles, PopupConfirmationDialog } from '@gridsuite/commons-ui';
import { LayoutMode } from './hooks/use-sld-layout';
import { NAD_SLD_CONSTANTS } from './constants';
import { useWorkspacePanelActions } from '../../../hooks/use-workspace-panel-actions';

interface AssociatedSldsChipsProps {
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
        py: 0.5,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        zIndex: 1000,
        minHeight: '40px',
    }),
    actionButton: {
        fontSize: '0.7rem',
        minWidth: 'auto',
        padding: '2px 8px',
        textTransform: 'none',
        flexShrink: 0,
    },
    chipsScrollContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexGrow: 1,
        minWidth: 0,
        overflow: 'hidden',
    },
    chip: {
        cursor: 'pointer',
        flexShrink: 0,
        '& .MuiChip-deleteIcon': {
            fontSize: '16px',
        },
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
    removeAllButton: {
        fontSize: '0.7rem',
        minWidth: 'auto',
        padding: '2px 8px',
        textTransform: 'none',
        flexShrink: 0,
    },
    menu: {
        '& .MuiPaper-root': {
            p: 0.5,
            maxHeight: '300px',
            overflowY: 'auto',
        },
        '& .MuiList-root': {
            padding: 0,
        },
    },
    menuItem: {
        padding: 1,
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&:not(:last-child)': {
            borderBottom: 1,
            borderColor: 'divider',
        },
    },
} as const satisfies MuiStyles;

export const AssociatedSldsChips = memo(function AssociatedSldsChips({
    nadPanelId,
    onToggleVisibility,
    onReorganize,
    onHideAll,
}: AssociatedSldsChipsProps) {
    const intl = useIntl();
    const { deletePanel, deletePanels } = useWorkspacePanelActions();
    const containerRef = useRef<HTMLDivElement>(null);
    const [chipLimit, setChipLimit] = useState(5);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showRemoveAllConfirmation, setShowRemoveAllConfirmation] = useState(false);

    const associatedPanels = useSelector((state: RootState) => selectAssociatedPanels(state, nadPanelId), shallowEqual);

    const panelDetails = useMemo(
        () =>
            associatedPanels.map((p) => ({
                id: p.id,
                title: p.title,
                isVisible: !p.minimized,
            })),
        [associatedPanels]
    );

    const visibleSldPanels = useMemo(() => associatedPanels.filter((p) => !p.minimized), [associatedPanels]);
    const associatedPanelIds = useMemo(() => associatedPanels.map((p) => p.id), [associatedPanels]);

    const visibleCount = visibleSldPanels.length;
    const hasReorganizeButton = visibleCount > 1 && onReorganize;
    const hasMultiplePanels = panelDetails.length > 1;

    // Dynamically calculate how many chips can fit based on container width
    useEffect(() => {
        const updateChipLimit = () => {
            if (!containerRef.current) {
                return;
            }
            const hideShowButtonWidth = onHideAll ? NAD_SLD_CONSTANTS.BUTTON_WIDTH : 0;
            const removeAllButtonWidth = hasMultiplePanels ? NAD_SLD_CONSTANTS.BUTTON_WIDTH : 0;
            const buttonGroupWidth = hasReorganizeButton ? NAD_SLD_CONSTANTS.BUTTON_WIDTH : 0;

            const containerWidth = containerRef.current.clientWidth;
            const reservedWidth =
                hideShowButtonWidth + removeAllButtonWidth + buttonGroupWidth + NAD_SLD_CONSTANTS.COUNTER_CHIP_WIDTH;
            const availableWidth = containerWidth - reservedWidth;
            const maxChips = Math.max(1, Math.floor(availableWidth / NAD_SLD_CONSTANTS.CHIP_WIDTH));
            setChipLimit(maxChips);
        };

        updateChipLimit();
        const resizeObserver = new ResizeObserver(updateChipLimit);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [panelDetails.length, hasReorganizeButton, hasMultiplePanels, onHideAll]);

    const displayedPanels = panelDetails.slice(0, chipLimit);
    const hiddenPanels = panelDetails.slice(chipLimit);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleChipClick = (sldPanelId: UUID) => {
        onToggleVisibility(sldPanelId);
        handleCloseMenu();
    };

    const handleChipDelete = (sldPanelId: UUID, event: React.MouseEvent) => {
        event.stopPropagation();
        deletePanel(sldPanelId);
    };

    const renderChip = (
        { id, title, isVisible }: { id: UUID; title: string | undefined; isVisible: boolean },
        inMenu = false
    ) => {
        return (
            <Chip
                key={id}
                label={title}
                size="small"
                color={isVisible ? 'primary' : 'default'}
                onClick={inMenu ? undefined : () => onToggleVisibility(id)}
                onDelete={(e) => handleChipDelete(id, e)}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={styles.chip}
            />
        );
    };

    const handleRemoveAll = () => {
        setShowRemoveAllConfirmation(true);
    };

    const handleConfirmRemoveAll = () => {
        deletePanels(associatedPanelIds);
        setShowRemoveAllConfirmation(false);
    };

    if (panelDetails.length === 0) {
        return null;
    }

    return (
        <Box sx={styles.container}>
            {onHideAll && (
                <Button variant="text" size="small" onClick={onHideAll} sx={styles.actionButton}>
                    {intl.formatMessage({ id: visibleCount > 0 ? 'hideAll' : 'showAll' })}
                </Button>
            )}

            <Box sx={styles.chipsScrollContainer} ref={containerRef}>
                {displayedPanels.map((panel) => renderChip(panel))}
                {hiddenPanels.length > 0 && (
                    <>
                        <Chip
                            label={hiddenPanels.length}
                            size="small"
                            icon={<AddIcon />}
                            onClick={handleOpenMenu}
                            sx={styles.chip}
                        />
                        <Menu
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleCloseMenu}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            sx={styles.menu}
                        >
                            {hiddenPanels.map((panel) => (
                                <MenuItem key={panel.id} sx={styles.menuItem} onClick={() => handleChipClick(panel.id)}>
                                    {renderChip(panel, true)}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}
            </Box>

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

            {panelDetails.length > 1 && (
                <Button variant="text" color="error" size="small" onClick={handleRemoveAll} sx={styles.removeAllButton}>
                    {intl.formatMessage({ id: 'removeAll' })}
                </Button>
            )}

            {showRemoveAllConfirmation && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({ id: 'removeAllAssociatedSldsConfirmation' })}
                    openConfirmationPopup
                    setOpenConfirmationPopup={() => setShowRemoveAllConfirmation(false)}
                    handlePopupConfirmation={handleConfirmRemoveAll}
                />
            )}
        </Box>
    );
});
