/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useRef, useState } from 'react';
import { Badge, Grid, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CustomHeaderMenuParams } from './custom-aggrid-header.type';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
};

interface CustomAggridMenuProps {
    field: string;
    customMenuParams: CustomHeaderMenuParams;
}

export const CustomMenu = ({ field, customMenuParams }: CustomAggridMenuProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);

    const { isCustomColumn, tabIndex, Menu } = customMenuParams;

    return (
        isCustomColumn && (
            <>
                <Grid item direction={'row'}>
                    <IconButton ref={menuButtonRef} size={'small'} onClick={() => setMenuOpen(true)}>
                        <Badge color="secondary">
                            <MoreVertIcon sx={styles.iconSize} />
                        </Badge>
                    </IconButton>
                </Grid>
                <Menu
                    open={menuOpen}
                    tabIndex={tabIndex}
                    customColumnName={field}
                    onClose={() => setMenuOpen(false)}
                    anchorEl={menuButtonRef.current}
                />
            </>
        )
    );
};
