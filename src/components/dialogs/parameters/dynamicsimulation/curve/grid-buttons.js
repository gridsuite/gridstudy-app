/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

const GridButtons = ({ onAddButton, onDeleteBUtton, disabled }) => {
    const intl = useIntl();

    const handleAddButton = useCallback(() => {}, []);
    const handleDeleteButton = useCallback(() => {}, []);

    const hasSelectedRow = false;

    return (
        <Grid
            container
            item
            xs
            spacing={1}
            sx={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}
        >
            <Grid item>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'AddRows',
                    })}
                    placement="top"
                >
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleAddButton()}
                            disabled={disabled}
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
            <Grid item>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'DeleteRows',
                    })}
                    placement="top"
                >
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleDeleteButton()}
                            disabled={disabled || hasSelectedRow}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

export default GridButtons;
