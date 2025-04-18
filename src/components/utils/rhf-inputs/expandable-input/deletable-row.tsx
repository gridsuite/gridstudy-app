/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren, useState } from 'react';
import { useIntl } from 'react-intl';
import { Grid, IconButton, Tooltip } from '@mui/material';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DeletableRowProps extends PropsWithChildren {
    alignItems: string;
    onClick: () => void;
    deletionMark?: boolean | null;
}

export function DeletableRow({ alignItems, onClick, deletionMark, children }: Readonly<DeletableRowProps>) {
    const intl = useIntl();
    const [isMouseHover, setIsMouseHover] = useState(false);

    return (
        <Grid
            container
            spacing={2}
            item
            alignItems={alignItems}
            onMouseEnter={() => setIsMouseHover(true)}
            onMouseLeave={() => setIsMouseHover(false)}
        >
            {children}
            <Grid item xs={1}>
                {isMouseHover && (
                    <Tooltip
                        title={intl.formatMessage({
                            id: deletionMark ? 'button.restore' : 'DeleteRows',
                        })}
                    >
                        <IconButton onClick={onClick}>
                            {deletionMark ? <RestoreFromTrashIcon /> : <DeleteIcon />}
                        </IconButton>
                    </Tooltip>
                )}
            </Grid>
        </Grid>
    );
}
