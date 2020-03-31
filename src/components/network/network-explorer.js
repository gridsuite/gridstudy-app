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

import {FixedSizeList as List} from 'react-window';

import Network from "./network";
import Divider from "@material-ui/core/Divider";
import {AutoSizer} from "react-virtualized";

const itemSize = 35;

const useStyles = makeStyles(theme => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 16px)', // to fix an issue with fullWidth of textfield
    },
}));

const NetworkExplorer = ({network, onVoltageLevelClick}) => {

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
        if (network) {
            setFilteredVoltageLevels(network.getVoltageLevels().sort(voltageLevelComparator))
        }
    }, [network]);

    useEffect(() => {
        if (currentVoltageLevel !== null) {
            onVoltageLevelClick(currentVoltageLevel.id, currentVoltageLevel.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useName]);

    function onClickHandler(index) {
        if (onVoltageLevelClick !== null) {
            const vl = filteredVoltageLevels[index];
            onVoltageLevelClick(vl.id);
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
        setFilteredVoltageLevels(network.getVoltageLevels().filter(item => {
            const lc = useName ? item.name.toLowerCase() : item.id.toLowerCase();
            return lc.includes(entry);
        }).sort(voltageLevelComparator));
    };

    return (
        <AutoSizer>
            {({width, height}) => (
                <div style={{width:width, height:height}}>
                    <Grid container direction="column">
                        <Grid item>
                             <TextField className={classes.textField} size="small" placeholder={filterMsg} onChange={filter} variant="outlined" InputProps={{
                                 startAdornment: (
                                     <InputAdornment position="start">
                                         <SearchIcon />
                                     </InputAdornment>
                                 ),
                             }} />
                        </Grid>
                        <Divider />
                        <Grid item>
                            <List
                                height={height-57}
                                itemCount={filteredVoltageLevels.length}
                                itemSize={itemSize}
                                width="100%"
                            >
                                {Row}
                            </List>
                        </Grid>
                    </Grid>
                 </div>
            )}
        </AutoSizer>
    )
};

NetworkExplorer.defaultProps = {
    network: null
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network),
    onVoltageLevelClick: PropTypes.func
};

export default NetworkExplorer;
