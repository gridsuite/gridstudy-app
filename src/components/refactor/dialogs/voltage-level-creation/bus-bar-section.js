import { Button, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { GridSection, useStyles } from 'components/dialogs/dialogUtils';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { BusBarSectionLine } from './bus-bar-section-line';
import { VOLTAGE_LEVEL_COMPONENTS } from 'components/network/constants';
import { Connectivity } from './connectivity';

export const BusBarSection = ({ id, values, onChange, type }) => {
    const classes = useStyles();
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });

    return (
        <Grid container spacing={2}>
            {rows.map((value, index) => (
                <Grid key={value.id} container spacing={3} item>
                    {type === VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_LINE ? (
                        <BusBarSectionLine id={id} index={index} />
                    ) : (
                        <Connectivity id={id} index={index} />
                    )}

                    <Grid item xs={1}>
                        <IconButton
                            key={value.id}
                            className={classes.icon}
                            onClick={() => remove(index)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Grid item xs={3}>
                <Button
                    fullWidth
                    className={classes.button}
                    startIcon={<AddIcon />}
                    onClick={() => insert(rows.length, {})}
                    //disabled={disabled}
                    style={{ top: '-1em' }}
                >
                    <FormattedMessage id={'CreateBusBarSection'} />
                </Button>
            </Grid>
        </Grid>
    );
};
