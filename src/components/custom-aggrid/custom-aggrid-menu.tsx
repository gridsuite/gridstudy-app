/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useRef, useState } from 'react';
import { Badge, Grid, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
};

export interface CustomMenuProps<T> {
    Menu: React.FC<T | DialogMenuProps>;
    menuParams: T;
}

export interface DialogMenuProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export const CustomMenu = <T,>({ Menu, menuParams }: CustomMenuProps<T>) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);

    return (
        <>
            <Grid container direction={'row'}>
                <IconButton ref={menuButtonRef} size={'small'} onClick={() => setMenuOpen(true)}>
                    <Badge color="secondary">
                        <MoreVertIcon sx={styles.iconSize} />
                    </Badge>
                </IconButton>
            </Grid>
            <Menu open={menuOpen} onClose={() => setMenuOpen(false)} anchorEl={menuButtonRef.current} {...menuParams} />
        </>
    );
};
