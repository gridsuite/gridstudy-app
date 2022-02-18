/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IconButton, ListItem } from '@material-ui/core';
import { useIntl } from 'react-intl';
import React, { useCallback } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../utils/config-params';
import Divider from '@material-ui/core/Divider';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';

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
    console.info('modification', modification);
    return (
        <>
            <ListItem {...props} className={classes.listItem}>
                {equipmentCreationModificationsType.has(modification.type) && (
                    <IconButton
                        onClick={() => onEdit(modification.uuid)}
                        size={'small'}
                    >
                        <EditIcon />
                    </IconButton>
                )}
                <OverflowableText
                    className={classes.label}
                    text={getLabel()}
                    style={{
                        paddingLeft:
                            !equipmentCreationModificationsType.has(
                                modification.type
                            ) && '30px',
                    }}
                />
                <IconButton
                    onClick={() => onDelete(modification.uuid)}
                    size={'small'}
                >
                    <DeleteIcon />
                </IconButton>
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
