/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import PropTypes from "prop-types";

import {useSelector} from "react-redux";

import {useIntl} from "react-intl";

import Grid from "@material-ui/core/Grid";
import InputAdornment from '@material-ui/core/InputAdornment';
import {makeStyles} from "@material-ui/core/styles";
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import {FixedSizeList} from 'react-window';

import Network from "./network";

const itemSize = 35;

const useStyles = makeStyles(theme => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 16px)', // to fix an issue with fullWidth of textfield
    },
}));

const NetworkExplorer = (props) => {

    const intl = useIntl();

    const useName = useSelector(state => state.useName);

    const filterMsg = intl.formatMessage({id : 'filter'}) + "...";

    const classes = useStyles();

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState([]);
    const [currentVoltageLevel, setCurrentVoltageLevel] = React.useState(null);

    const voltageLevelComparator = (vl1, vl2) => {
        return useName ? vl1.name.localeCompare(vl2.name) : vl1.id.localeCompare(vl2.id);
    };

    useEffect(() => {
        setFilteredVoltageLevels(props.network.getVoltageLevels().sort(voltageLevelComparator))
    }, [props.network]);

    useEffect(() => {
        if (currentVoltageLevel !== null) {
            props.onVoltageLevelClick(currentVoltageLevel.id, currentVoltageLevel.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useName]);

    function onClickHandler(index) {
        if (props.onVoltageLevelClick !== null) {
            const vl = filteredVoltageLevels[index];
            props.onVoltageLevelClick(vl.id, vl.name);
            setCurrentVoltageLevel(vl);
        }
    }

    const Row = ({ index, style }) => (
        <ListItem button style={style} key={index} onClick={() => onClickHandler(index)}>
            {useName ? filteredVoltageLevels[index].name : filteredVoltageLevels[index].id}
        </ListItem>
    );

    const filter = (event) => {
        const entry = event.target.value.toLowerCase();
        setFilteredVoltageLevels(props.network.getVoltageLevels().filter(item => {
            const lc = useName ? item.name.toLowerCase() : item.id.toLowerCase();
            return lc.includes(entry);
        }).sort(voltageLevelComparator));
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
    onVoltageLevelClick: PropTypes.func
};

export default NetworkExplorer;
