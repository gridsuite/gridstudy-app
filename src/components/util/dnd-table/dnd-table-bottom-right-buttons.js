/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { SELECTED } from '../../refactor/utils/field-constants';

const DndTableBottomRightButtons = ({
    arrayFormName,
    handleAddButton,
    handleDeleteButton,
    handleMoveUpButton,
    handleMoveDownButton,
    disabled,
}) => {
    const intl = useIntl();

    const currentRows = useWatch({
        name: arrayFormName,
    });

    const noRowsSelected = !currentRows.some((row) => row[SELECTED]);
    const firstRowSelected = currentRows[0]?.[SELECTED];
    const lastRowSelected = currentRows[currentRows.length - 1]?.[SELECTED];

    return (
        <Grid
            container
            item
            spacing={1}
            xs={true}
            sx={{ justifyContent: 'flex-end' }}
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
                            disabled={disabled || noRowsSelected}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
            <Grid item>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'MoveUpRows',
                    })}
                    placement="top"
                >
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleMoveUpButton()}
                            disabled={
                                disabled || noRowsSelected || firstRowSelected
                            }
                        >
                            <ArrowUpwardIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
            <Grid item>
                <Tooltip
                    title={intl.formatMessage({
                        id: 'MoveDownRows',
                    })}
                    placement="top"
                >
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleMoveDownButton()}
                            disabled={
                                disabled || noRowsSelected || lastRowSelected
                            }
                        >
                            <ArrowDownwardIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

DndTableBottomRightButtons.prototype = {
    arrayFormName: PropTypes.string.isRequired,
    handleAddButton: PropTypes.func.isRequired,
    handleDeleteButton: PropTypes.func.isRequired,
    handleMoveUpButton: PropTypes.func.isRequired,
    handleMoveDownButton: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default DndTableBottomRightButtons;
