/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import PropTypes from "prop-types";

import InputAdornment from '@material-ui/core/InputAdornment';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';

import {FixedSizeList} from 'react-window';

import Network from "./network";
import {useSelector} from "react-redux";
import {useIntl} from "react-intl";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const itemSize = 35;

const useStyles = makeStyles(theme => ({
    textField: {
        margin: theme.spacing(1),
    },
}));

const NetworkExplorer = (props) => {

    const intl = useIntl();
    const useName = useSelector(state => state.useName);
    const diagram = useSelector(state => state.diagram);

    const filterMsg = intl.formatMessage({id : 'filter'}) + "...";

    const classes = useStyles();

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState([]);
    const [currentVoltageLevel, setCurrentVoltageLevel] = React.useState(null);

    useEffect(() => {
        setFilteredVoltageLevels(props.network.getVoltageLevels())
    }, [props.network]);

    useEffect(() => {
        if (diagram !== null) {
            props.onSubstationClick(currentVoltageLevel.id, currentVoltageLevel.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useName]);

    const Row = ({ index, style }) => (
        <ListItem button style={style} key={index} onClick={() => {props.onSubstationClick(filteredVoltageLevels[index].id, filteredVoltageLevels[index].name); setCurrentVoltageLevel(filteredVoltageLevels[index])}}>
            {useName ? filteredVoltageLevels[index].name : filteredVoltageLevels[index].id}
        </ListItem>
    );

    const filter = (event) => {
        const entry = event.target.value.toLowerCase();
        setFilteredVoltageLevels(props.network.getVoltageLevels().filter(item => {
            const lc = useName ? item.name.toLowerCase() : item.id.toLowerCase();
            return lc.includes(entry);
        }));
    };

    return (
        <Grid container direction="column">
            <Grid item xs={12} key="filter">
                <TextField className={classes.textField} size="small" placeholder={filterMsg} onChange={filter} variant="outlined" InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }} />
            </Grid>
            <Grid item xs={12} key="list">
                <FixedSizeList
                    height={23 * itemSize}
                    itemCount={filteredVoltageLevels.length}
                    itemSize={itemSize}
                    width="100%"
                >
                    {Row}
                </FixedSizeList>
            </Grid>
        </Grid>
    )
};

NetworkExplorer.defaultProps = {
    network: new Network()
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network).isRequired,
    onSubstationClick: PropTypes.func
};

export default NetworkExplorer;
