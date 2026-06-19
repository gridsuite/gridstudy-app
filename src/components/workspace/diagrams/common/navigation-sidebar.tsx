/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    Theme,
    IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { memo, useCallback, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { mergeSx } from '@gridsuite/commons-ui';

export interface SidebarSection {
    /** Stable identifier of the section. */
    id: string;
    /** Icon element rendered in the header / collapsed rail (inherits color). */
    icon: ReactNode;
    /** Translation id of the section title. */
    titleId: string;
    /** When true the section cannot be expanded (header/icon greyed out). */
    isDisabled?: boolean;
    /** Content rendered below the header when the section is expanded. */
    content: ReactNode;
}

interface NavigationSidebarProps {
    sections: SidebarSection[];
    isAbsolutePositioned?: boolean;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const getBackgroundColor = (theme: Theme, isCollapsed: boolean) => {
    if (isCollapsed) {
        return 'transparent';
    }
    return theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33';
};

const getBorderRight = (theme: Theme, isCollapsed: boolean, isAbsolutePositioned: boolean) => {
    if (isAbsolutePositioned && isCollapsed) {
        return 'none';
    }
    return `1px solid ${theme.palette.divider}`;
};

const styles = {
    sidebar: (theme: Theme, isCollapsed: boolean, isAbsolutePositioned: boolean) => ({
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderRight: getBorderRight(theme, isCollapsed, isAbsolutePositioned),
        borderLeft: isAbsolutePositioned ? 'none' : `1px solid ${theme.palette.divider}`,
        backgroundColor: getBackgroundColor(theme, isCollapsed),
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowX: 'hidden',
        ...(isCollapsed &&
            isAbsolutePositioned && {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                pointerEvents: 'none',
            }),
    }),
    headerContainer: {
        pointerEvents: 'auto',
    },
    iconButton: {
        p: 0.5,
    },
    headerCollapsed: {
        display: 'flex',
        justifyContent: 'center',
    },
    headerExpanded: (theme: Theme, enabled: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        p: 0.5,
        cursor: enabled ? 'pointer' : 'default',
        '&:hover': {
            backgroundColor: enabled ? theme.palette.action.hover : 'transparent',
        },
    }),
    icon: (theme: Theme, enabled: boolean) => ({
        display: 'flex',
        color: enabled ? theme.palette.text.primary : theme.palette.text.disabled,
    }),
    section: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    },
    sectionContent: {
        flex: 1,
        overflow: 'auto',
        minHeight: 0,
    },
} as const;

export const NavigationSidebar = memo(function NavigationSidebar({
    sections,
    isAbsolutePositioned = false,
}: NavigationSidebarProps) {
    const theme = useTheme();
    const intl = useIntl();

    // Sections the user has opened. A disabled section is always shown collapsed regardless of this set.
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isExpanded = (section: SidebarSection) => !section.isDisabled && expandedIds.has(section.id);
    const anyExpanded = sections.some(isExpanded);

    return (
        <Box sx={styles.sidebar(theme, !anyExpanded, isAbsolutePositioned)}>
            {!anyExpanded
                ? // Collapsed rail: one icon button per section.
                  sections.map((section) => {
                      const enabled = !section.isDisabled;
                      return (
                          <Box key={section.id} sx={mergeSx(styles.headerContainer, styles.headerCollapsed)}>
                              <IconButton
                                  onClick={enabled ? () => toggleExpand(section.id) : undefined}
                                  disabled={!enabled}
                                  size="small"
                                  sx={styles.iconButton}
                              >
                                  <Box sx={styles.icon(theme, enabled)}>{section.icon}</Box>
                              </IconButton>
                          </Box>
                      );
                  })
                : // Expanded: each section shows its header, and its content when open.
                  sections.map((section) => {
                      const enabled = !section.isDisabled;
                      return (
                          <Box key={section.id} sx={styles.section}>
                              <Box sx={styles.headerContainer}>
                                  <Box
                                      onClick={enabled ? () => toggleExpand(section.id) : undefined}
                                      sx={styles.headerExpanded(theme, enabled)}
                                  >
                                      <Box sx={styles.icon(theme, enabled)}>{section.icon}</Box>
                                      <Typography variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
                                          {intl.formatMessage({ id: section.titleId })}
                                      </Typography>
                                  </Box>
                              </Box>
                              {isExpanded(section) && <Box sx={styles.sectionContent}>{section.content}</Box>}
                          </Box>
                      );
                  })}
        </Box>
    );
});

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
                    <ListItemIcon sx={{ minWidth: 32 }}>
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
