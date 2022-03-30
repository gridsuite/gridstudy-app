/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IconButton, ListItem } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../utils/config-params';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';

const useStyles = makeStyles((theme) => ({
    listItem: {
        paddingRight: theme.spacing(1),
    },
    label: {
        flexGrow: '1',
    },
}));

export const ModificationListItem = ({
    modification,
    onDelete,
    onEdit,
    ...props
}) => {
    const intl = useIntl();
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const classes = useStyles();

    const equipmentCreationModificationsType = new Set([
        'GENERATOR_CREATION',
        'LINE_CREATION',
        'LOAD_CREATION',
        'SHUNT_COMPENSATOR_CREATION',
        'SUBSTATION_CREATION',
        'TWO_WINDINGS_TRANSFORMER_CREATION',
        'VOLTAGE_LEVEL_CREATION',
    ]);

    const getComputedLabel = useCallback(() => {
        return useName && modification.equipmentName
            ? modification.equipmentName
            : modification.equipmentId;
    }, [modification, useName]);

    const getLabel = useCallback(
        () =>
            intl.formatMessage(
                { id: 'network_modifications/' + modification.type },
                {
                    ...modification,
                    computedLabel: <strong>{getComputedLabel()}</strong>,
                }
            ),
        [modification, getComputedLabel, intl]
    );
    return (
        <>
            <ListItem {...props} className={classes.listItem}>
                <Grid container>
                    <Grid item xs={1}>
                        {equipmentCreationModificationsType.has(
                            modification.type
                        ) && (
                            <IconButton
                                onClick={() => onEdit(modification.uuid)}
                                size={'small'}
                            >
                                <EditIcon />
                            </IconButton>
                        )}
                    </Grid>
                    <Grid item xs={10}>
                        <OverflowableText
                            className={classes.label}
                            text={getLabel()}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton
                            onClick={() => onDelete(modification.uuid)}
                            size={'small'}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>
            <Divider />
        </>
    );
};

ModificationListItem.propTypes = {
    modification: PropTypes.object,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
};
