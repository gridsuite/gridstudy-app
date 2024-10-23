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
    onDeleteClick: () => void;
    deletionMark?: boolean | null;
}

export function DeletableRow({ alignItems, onDeleteClick, deletionMark, children }: Readonly<DeletableRowProps>) {
    const intl = useIntl();
    const [isHover, setIsHover] = useState(false);

    return (
        <Grid
            container
            spacing={2}
            item
            alignItems={alignItems}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            {children}
            <Grid item xs={1}>
                {isHover && (
                    <Tooltip
                        title={intl.formatMessage({
                            id: deletionMark ? 'button.restore' : 'DeleteRows',
                        })}
                    >
                        <IconButton onClick={onDeleteClick}>
                            {deletionMark ? <RestoreFromTrashIcon /> : <DeleteIcon />}
                        </IconButton>
                    </Tooltip>
                )}
            </Grid>
        </Grid>
    );
}
