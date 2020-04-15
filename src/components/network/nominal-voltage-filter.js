/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from "prop-types";

import {makeStyles} from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import {FormattedMessage} from "react-intl";

const useStyles = makeStyles(theme => ({
    nominalVoltageZone: {
        minWidth: 90,
        maxHeight : 300,
        overflowY : 'auto',
    },
    nominalVoltageItem: {
        padding: '0px',
    },
    nominalVoltageCheck: {
        size: 'small',
        padding: '0px',
    },
    nominalVoltageText : {
        fontSize: 12
    },
    nominalVoltageSelectionControl : {
        fontSize: 12,
        textDecoration: "underline",
    },
}));

const NominalVoltageFilter = (props) => {

    const classes = useStyles();

    const handleToggle = value => () => {
        if (props.onNominalVoltageFilterChange !== null) {
            props.onNominalVoltageFilterChange(value);
        }
    };

    return (
        <Paper>
            <List className={classes.nominalVoltageZone}>
                <ListItem className={classes.nominalVoltageItem} >
                    <ListItemText disableTypography className={classes.nominalVoltageSelectionControl} onClick={ () => props.onCheckAll(true)}
                        primary={<FormattedMessage id="CBAll"/>} />
                    <ListItemText disableTypography className={classes.nominalVoltageText} primary={'/'}/>
                    <ListItemText disableTypography className={classes.nominalVoltageSelectionControl} onClick={ () => props.onCheckAll(false)}
                                  primary={<FormattedMessage id="CBNone"/>} />
                </ListItem>
                {
                props.nominalVoltages.map(value => {
                    return (
                        <ListItem className={classes.nominalVoltageItem}
                            key={value}
                            button
                            onClick={handleToggle(value)}
                        >
                            <Checkbox color="default" className={classes.nominalVoltageCheck} checked={props.filteredNominalVoltages.indexOf(value) !== -1}/>
                            <ListItemText className={classes.nominalVoltageText} disableTypography primary={`${value} kV`}/>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    )
};

NominalVoltageFilter.defaultProps = {
    nominalVoltages: [],
    filteredNominalVoltages: [],
    onNominalVoltageFilterChange: null,
    onCheckAll: null
};

NominalVoltageFilter.propTypes = {
    nominalVoltages: PropTypes.array,
    filteredNominalVoltages: PropTypes.array,
    onNominalVoltageFilterChange: PropTypes.func,
    onCheckAll: PropTypes.func
};

export default NominalVoltageFilter;
