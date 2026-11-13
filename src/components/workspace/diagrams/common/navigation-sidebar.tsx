/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Typography, useTheme, Theme, IconButton } from '@mui/material';
import { memo, useCallback, useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';

export interface SidebarSection {
    /** Stable identifier of the section. */
    id: string;
    /** Icon element rendered in the header / collapsed rail (inherits color). */
    icon: ReactNode;
    /** Translation id of the section title. */
    titleId: string;
    /** When true the section cannot be expanded (header/icon greyed out). */
    disabled?: boolean;
    defaultExpanded?: boolean;
    /** Content rendered below the header when the section is expanded. */
    content: ReactNode;
}

interface NavigationSidebarProps {
    sections: SidebarSection[];
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const getBackgroundColor = (theme: Theme, isCollapsed: boolean) => {
    if (isCollapsed) {
        return 'transparent';
    }
    return theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33';
};

const styles = {
    sidebar: (theme: Theme, isCollapsed: boolean) => ({
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        backgroundColor: getBackgroundColor(theme, isCollapsed),
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowX: 'hidden',
    }),
    iconButton: {
        p: 0.5,
    },
    headerCollapsed: {
        display: 'flex',
        justifyContent: 'center',
    },
    headerExpanded: (theme: Theme, disabled?: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        p: 0.5,
        cursor: disabled ? 'default' : 'pointer',
        '&:hover': {
            backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
        },
    }),
    icon: (theme: Theme, disabled?: boolean) => ({
        display: 'flex',
        color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    }),
    // When the sidebar is too short, only an expanded section gives up space (its content scrolls):
    // a collapsed section would otherwise be squeezed below its header, which would then overlap.
    section: (expanded: boolean) => ({
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flexShrink: expanded ? 1 : 0,
    }),
    sectionContent: {
        flex: 1,
        overflow: 'auto',
        minHeight: 0,
    },
} as const;

export const NavigationSidebar = memo(function NavigationSidebar({ sections }: NavigationSidebarProps) {
    const theme = useTheme();
    const intl = useIntl();

    // Sections toggled by the user from their default state, a disabled section being always collapsed
    const [toggledIds, setToggledIds] = useState<ReadonlySet<string>>(new Set());

    const toggleExpand = useCallback((id: string) => {
        setToggledIds((prev) => {
            const next = new Set(prev);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isExpanded = (section: SidebarSection) =>
        !section.disabled && toggledIds.has(section.id) !== !!section.defaultExpanded;
    const anyExpanded = sections.some(isExpanded);

    if (sections.length === 0) {
        return null;
    }

    return (
        <Box sx={styles.sidebar(theme, !anyExpanded)}>
            {!anyExpanded
                ? // Collapsed rail: one icon button per section.
                  sections.map((section) => (
                      <Box key={section.id} sx={styles.headerCollapsed}>
                          <IconButton
                              onClick={section.disabled ? undefined : () => toggleExpand(section.id)}
                              disabled={section.disabled}
                              size="small"
                              sx={styles.iconButton}
                          >
                              <Box sx={styles.icon(theme, section.disabled)}>{section.icon}</Box>
                          </IconButton>
                      </Box>
                  ))
                : // Expanded: each section shows its header, and its content when open.
                  sections.map((section) => (
                      <Box key={section.id} sx={styles.section(isExpanded(section))}>
                          <Box
                              onClick={section.disabled ? undefined : () => toggleExpand(section.id)}
                              sx={styles.headerExpanded(theme, section.disabled)}
                          >
                              <Box sx={styles.icon(theme, section.disabled)}>{section.icon}</Box>
                              <Typography variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
                                  {intl.formatMessage({ id: section.titleId })}
                              </Typography>
                          </Box>
                          {isExpanded(section) && <Box sx={styles.sectionContent}>{section.content}</Box>}
                      </Box>
                  ))}
        </Box>
    );
});
