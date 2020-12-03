/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import { makeStyles, withStyles } from '@material-ui/core/styles';

import ListItemText from '@material-ui/core/ListItemText';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles(() => ({
    sizeLabel: {
        fontSize: '16px',
    },
    toggleDisplay: {
        marginLeft: '15px',
        pointerEvents: 'auto',
    },
    toggleButton: {
        height: '30px',
        padding: '7px',
        textTransform: 'capitalize',
    },
}));

export const USE_ID = 'Id';
export const USE_NAME = 'Name';
export const DARK_THEME = 'Dark';
export const LIGHT_THEME = 'Light';

const StyledMenuItem = withStyles((theme) => ({
    root: {
        '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
    },
}))(MenuItem);

const EquipmentDisplay = ({ handleDisplay, toggleState }) => {
    const classes = useStyles();

    return (
        <ul style={{ padding: 0 }}>
            <StyledMenuItem
                style={{
                    opacity: '1',
                    padding: '0',
                }}
                disabled={true}
            >
                <ListItemText>
                    <Typography className={classes.sizeLabel}>
                        <FormattedMessage
                            id="top-bar/equipmentDisplay"
                            defaultMessage={'Equipment display'}
                        />
                    </Typography>
                </ListItemText>
                <ToggleButtonGroup
                    exclusive
                    value={toggleState}
                    className={classes.toggleDisplay}
                    onChange={handleDisplay}
                >
                    <ToggleButton
                        value={USE_ID}
                        aria-label={USE_ID}
                        className={classes.toggleButton}
                    >
                        <FormattedMessage
                            id="top-bar/id"
                            defaultMessage={'Id'}
                        />
                    </ToggleButton>
                    <ToggleButton
                        value={USE_NAME}
                        aria-label={USE_NAME}
                        className={classes.toggleButton}
                    >
                        <FormattedMessage
                            id="top-bar/name"
                            defaultMessage={'Name'}
                        />
                    </ToggleButton>
                </ToggleButtonGroup>
            </StyledMenuItem>
        </ul>
    );
};

export default EquipmentDisplay;
