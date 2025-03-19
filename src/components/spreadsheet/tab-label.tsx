/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Box, Typography, Menu, MenuItem, Tooltip, Theme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FormattedMessage } from 'react-intl';

// Menu action constants
const RENAME = 'RENAME';
const DELETE = 'DELETE';

const TAB_MENU_DEFINITION = {
    RENAME: { id: RENAME, label: 'spreadsheet/rename/label' },
    DELETE: { id: DELETE, label: 'spreadsheet/delete/label' },
};

const styles = {
    typography: {
        width: '100%',
        textAlign: 'center',
        transition: 'transform 0.2s',
        pr: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    getContainer: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: theme.spacing(30),
        minWidth: theme.spacing(4),
        px: theme.spacing(2),
        '& .tab-actions': {
            position: 'absolute',
            right: theme.spacing(-1),
            display: 'flex',
        },
    }),
};

interface TabLabelProps {
    name: string;
    onRemove: () => void;
    onRename?: () => void;
    disabled: boolean;
}

export const TabLabel: React.FC<TabLabelProps> = ({ name, onRemove, onRename, disabled }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isTextTruncated, setIsTextTruncated] = useState(false);
    const textRef = useRef<HTMLSpanElement>(null);
    const open = Boolean(anchorEl);

    // Check if text is truncated when component mounts or name changes
    useEffect(() => {
        if (textRef.current) {
            setIsTextTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, [name]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (option: { id: string }) => {
        handleMenuClose();
        switch (option.id) {
            case RENAME:
                onRename?.();
                break;
            case DELETE:
                onRemove();
                break;
        }
    };

    const typographyComponent = (
        <Typography ref={textRef} variant="inherit" sx={styles.typography}>
            {name}
        </Typography>
    );

    return (
        <Box sx={(theme) => styles.getContainer(theme)}>
            {isTextTruncated ? (
                <Tooltip title={name} placement="bottom" arrow>
                    {typographyComponent}
                </Tooltip>
            ) : (
                typographyComponent
            )}
            <div className="tab-actions">
                <IconButton size="small" onClick={handleMenuOpen} disabled={disabled}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} onClick={(e) => e.stopPropagation()}>
                    {Object.values(TAB_MENU_DEFINITION).map((option) => (
                        <MenuItem
                            key={option.id}
                            onClick={() => {
                                handleMenuItemClick(option);
                            }}
                        >
                            <FormattedMessage id={option.label} />
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </Box>
    );
};

export default TabLabel;
