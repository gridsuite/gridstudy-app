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
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    listItem: {
        paddingRight: theme.spacing(1),
    },
    label: {
        flexGrow: '1',
    },
}));

export const ModificationListItem = ({ modification, onDelete, ...props }) => {
    const intl = useIntl();
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const classes = useStyles();

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
                <OverflowableText className={classes.label} text={getLabel()} />
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
};
