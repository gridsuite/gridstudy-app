import { Button, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import {
    filledTextField,
    gridItem,
    useStyles,
} from 'components/dialogs/dialogUtils';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import {
    BUS_BAR_SECTIONS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import { BusBarSectionLine } from './bus-bar-section-line';

export const BusBarSection = ({ id, values, onChange }) => {
    const classes = useStyles();
    const { fields: rows, insert, remove } = useFieldArray({ name: `${id}` });

    return (
        <Grid container spacing={2}>
            {rows.map((value, index) => (
                <Grid container spacing={3} item key={index}>
                    <BusBarSectionLine id={id} index={index} />

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
            <Grid item xs={12}>
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
