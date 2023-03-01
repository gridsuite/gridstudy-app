/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { useStyles } from 'components/dialogs/dialogUtils';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { BusBarSectionCreation } from './bus-bar-section-creation';
import { VOLTAGE_LEVEL_COMPONENTS } from 'components/network/constants';
import { BusBarSectionConnection } from './BusBarSectionConnection';
import { BUS_BAR_SECTIONS } from 'components/refactor/utils/field-constants';

export const BusBarSection = ({ id, type, errors }) => {
    const classes = useStyles();
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });

    return (
        <Grid container spacing={2}>
            {rows.map((value, index) => (
                <Grid key={value.id} container spacing={3} item>
                    {type === VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_LINE ? (
                        <BusBarSectionCreation
                            id={id}
                            index={index}
                            errors={errors}
                        />
                    ) : (
                        <BusBarSectionConnection id={id} index={index} />
                    )}

                    <Grid item xs={1}>
                        <IconButton
                            className={classes.icon}
                            onClick={() => remove(index)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}

            <Grid item xs={3} style={{ paddingLeft: 'inherit' }}>
                <span>
                    <Button
                        fullWidth
                        className={classes.button}
                        startIcon={<AddIcon />}
                        onClick={() => insert(rows.length, {})}
                        style={{ top: '-1em' }}
                    >
                        <FormattedMessage
                            id={
                                type ===
                                VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_LINE
                                    ? 'CreateBusBarSection'
                                    : 'CreateLink'
                            }
                        />
                    </Button>
                    {errors && errors?.[BUS_BAR_SECTIONS] && (
                        <div className={classes.emptyListError}>
                            {errors?.[BUS_BAR_SECTIONS].message}
                        </div>
                    )}
                </span>
            </Grid>
        </Grid>
    );
};
