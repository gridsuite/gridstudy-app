/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";

import {makeStyles} from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";

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
    }
}));

const NominalVoltageFilter = (props) => {

    const classes = useStyles();

    const [checkedNominalVoltages, setCheckedNominalVoltages] = useState([]);

    useEffect(() => {
        setCheckedNominalVoltages(props.filteredNominalVoltages);
    }, [props.filteredNominalVoltages]);

    const handleToggle = value => () => {
        const currentIndex = checkedNominalVoltages.indexOf(value);
        const newChecked = [...checkedNominalVoltages];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setCheckedNominalVoltages(newChecked);

        if (props.onNominalVoltageFilter !== null) {
            props.onNominalVoltageFilter(value);
        }
    };

    return (
        <Paper>
            <List className={classes.nominalVoltageZone}> {
                props.nominalVoltages.map(value => {
                    return (
                        <ListItem className={classes.nominalVoltageItem}
                            key={value}
                            button
                            onClick={handleToggle(value)}
                        >
                            <Checkbox color="default" className={classes.nominalVoltageCheck} checked={checkedNominalVoltages.indexOf(value) !== -1}/>
                            <ListItemText className={classes.nominalVoltageText} disableTypography primary={`${value}`}/>
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
    onNominalVoltageFilter: null
};

NominalVoltageFilter.propTypes = {
    nominalVoltages: PropTypes.array,
    filteredNominalVoltages: PropTypes.array,
    onNominalVoltageFilter: PropTypes.func
};

export default React.memo(NominalVoltageFilter);
