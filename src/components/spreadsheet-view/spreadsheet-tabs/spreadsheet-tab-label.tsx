/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Menu, MenuItem, type Theme, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FormattedMessage } from 'react-intl';
import { type MuiStyles } from '@gridsuite/commons-ui';

// Menu action constants
const RENAME = 'RENAME';
const DELETE = 'DELETE';
const EDIT = 'EDIT';

const TAB_MENU_DEFINITION = {
    RENAME: { id: RENAME, label: 'spreadsheet/rename/label' },
    DELETE: { id: DELETE, label: 'spreadsheet/delete/label' },
    EDIT: { id: EDIT, label: 'spreadsheet/edit/label' },
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
    getContainer: (theme) => ({
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
} as const satisfies MuiStyles;

const getTabActionButton = (theme: Theme, disabled: boolean) => ({
    color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    padding: 0.5,
    borderRadius: '50%',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    '&:hover': {
        backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
    },
});

interface SpreadsheetTabLabelProps {
    name: string;
    onRemove: () => void;
    onRename?: () => void;
    onEdit: () => void;
    disabled: boolean;
}

export const SpreadsheetTabLabel: React.FC<SpreadsheetTabLabelProps> = ({
    name,
    onRemove,
    onRename,
    onEdit,
    disabled,
}) => {
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
            case EDIT:
                onEdit();
                break;
        }
    };

    const typographyComponent = (
        <Typography ref={textRef} variant="inherit" sx={styles.typography}>
            {name}
        </Typography>
    );

    return (
        <Box sx={(theme) => styles.getContainer(theme) /*TODO memoize*/}>
            {isTextTruncated ? (
                <Tooltip title={name} placement="bottom" arrow>
                    {typographyComponent}
                </Tooltip>
            ) : (
                typographyComponent
            )}
            <div className="tab-actions">
                <ButtonBase
                    component="div"
                    sx={(theme) => getTabActionButton(theme, disabled)}
                    disabled={disabled}
                    onClick={disabled ? undefined : handleMenuOpen}
                >
                    <MoreVertIcon fontSize="small" />
                </ButtonBase>
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

export default SpreadsheetTabLabel;
