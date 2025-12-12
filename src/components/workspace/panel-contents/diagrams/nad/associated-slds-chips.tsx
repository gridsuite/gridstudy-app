/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
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
import {
    selectAssociatedPanelDetails,
    selectVisibleAssociatedSldPanels,
} from '../../../../../redux/slices/workspace-selectors';
import { deleteAssociatedSld, removeAllAssociatedSlds } from '../../../../../redux/slices/workspace-slice';
import { type MuiStyles, PopupConfirmationDialog } from '@gridsuite/commons-ui';
import { LayoutMode } from './hooks/use-sld-layout';

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
        padding: 0.5,
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
    const dispatch = useDispatch();
    const containerRef = useRef<HTMLDivElement>(null);
    const [chipLimit, setChipLimit] = useState(5);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showRemoveAllConfirmation, setShowRemoveAllConfirmation] = useState(false);

    const panelDetails = useSelector(
        (state: RootState) => selectAssociatedPanelDetails(state, nadPanelId),
        shallowEqual
    );
    const visibleSldPanels = useSelector(
        (state: RootState) => selectVisibleAssociatedSldPanels(state, nadPanelId),
        shallowEqual
    );

    // Dynamically calculate how many chips can fit based on container width
    useEffect(() => {
        const updateChipLimit = () => {
            if (!containerRef.current) {
                return;
            }
            const chipWidth = 90;
            const counterChipWidth = 64;
            const containerWidth = containerRef.current.clientWidth;
            const maxChips = Math.max(1, Math.floor((containerWidth - counterChipWidth) / chipWidth));
            setChipLimit(maxChips);
        };

        updateChipLimit();
        const resizeObserver = new ResizeObserver(updateChipLimit);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [panelDetails.length]);

    const displayedPanels = panelDetails.slice(0, chipLimit);
    const hiddenPanels = panelDetails.slice(chipLimit);
    const visibleCount = visibleSldPanels.length;
    const hasReorganizeButton = visibleCount > 1 && onReorganize;

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleChipDelete = (sldPanelId: UUID, event: React.MouseEvent) => {
        event.stopPropagation();
        dispatch(deleteAssociatedSld(sldPanelId));
    };

    const renderChip = (
        { id, title, isVisible }: { id: UUID; title: string | undefined; isVisible: boolean },
        inMenu = false
    ) => {
        const chip = (
            <Chip
                key={id}
                label={title}
                size="small"
                color={isVisible ? 'primary' : 'default'}
                onClick={() => onToggleVisibility(id)}
                onDelete={(e) => handleChipDelete(id, e)}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={styles.chip}
            />
        );

        return inMenu ? (
            <MenuItem key={id} sx={styles.menuItem}>
                {chip}
            </MenuItem>
        ) : (
            chip
        );
    };

    const handleRemoveAll = () => {
        setShowRemoveAllConfirmation(true);
    };

    const handleConfirmRemoveAll = () => {
        dispatch(removeAllAssociatedSlds(nadPanelId));
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
                            {hiddenPanels.map((panel) => renderChip(panel, true))}
                        </Menu>
                    </>
                )}
            </Box>

            {hasReorganizeButton && (
                <ButtonGroup variant="outlined" size="small" sx={styles.buttonGroup}>
                    <Tooltip title={intl.formatMessage({ id: 'grid' })}>
                        <IconButton onClick={() => onReorganize(LayoutMode.GRID)} sx={styles.iconButton}>
                            <GridViewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={intl.formatMessage({ id: 'cascade' })}>
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
