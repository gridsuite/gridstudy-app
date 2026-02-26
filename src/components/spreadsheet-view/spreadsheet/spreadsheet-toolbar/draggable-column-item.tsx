/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, IconButton, ListItem, ListItemIcon, ListItemText, Theme } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import type { UUID } from 'node:crypto';
import { FunctionComponent } from 'react';

const styles = {
    checkboxItem: {
        cursor: 'pointer',
    },
    columnConfigClosedLock: (theme: Theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.active,
    }),
    columnConfigOpenLock: (theme: Theme) => ({
        fontSize: '1.2em',
        color: theme.palette.action.disabled,
    }),
};

interface DraggableColumnItemProps {
    uuid: UUID;
    name: string;
    visible: boolean;
    dragHandleProps: any;
    draggableProps: any;
    innerRef: (element: HTMLElement | null) => any;
    onClickOnLock: (uuid: UUID) => void;
    isLocked: (uuid: UUID) => boolean;
    onToggle: (uuid: UUID) => void;
}

export const DraggableColumnItem: FunctionComponent<DraggableColumnItemProps> = ({
    uuid,
    name,
    visible,
    dragHandleProps,
    draggableProps,
    innerRef,
    onClickOnLock,
    isLocked,
    onToggle,
}) => {
    return (
        <div ref={innerRef} {...draggableProps}>
            <ListItem
                sx={styles.checkboxItem}
                style={{
                    padding: '0 16px',
                }}
            >
                <IconButton {...dragHandleProps} size={'small'}>
                    <DragIndicatorIcon spacing={0} edgeMode={'start'} />
                </IconButton>

                <ListItemIcon
                    onClick={() => onClickOnLock(uuid)}
                    style={{
                        minWidth: 0,
                        width: '20px',
                    }}
                >
                    {isLocked(uuid) ? (
                        <LockIcon sx={styles.columnConfigClosedLock} />
                    ) : (
                        <LockOpenIcon sx={styles.columnConfigOpenLock} />
                    )}
                </ListItemIcon>
                <ListItemIcon onClick={() => onToggle(uuid)}>
                    <Checkbox checked={visible} />
                </ListItemIcon>
                <ListItemText onClick={() => onToggle(uuid)} primary={name} />
            </ListItem>
        </div>
    );
};
