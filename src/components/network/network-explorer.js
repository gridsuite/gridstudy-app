/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import PropTypes from "prop-types";
import {FixedSizeList} from 'react-window';

import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';

import Network from "./network";
import {useDispatch, useSelector} from "react-redux";
import {toggleUseNameState} from "../../redux/actions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import {useIntl} from "react-intl";

const itemSize = 35;

const NetworkExplorer = (props) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const useName = useSelector(state => state.useName);
    const diagram = useSelector(state => state.diagram);

    const searchMsg = intl.formatMessage({id : 'search'}) + "...";

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState([]);
    const [currentVoltageLevel, setCurrentVoltageLevel] = React.useState(null);

    useEffect(() => {
        setFilteredVoltageLevels(props.network.getVoltageLevels())
    }, [props.network]);

    useEffect(() => {
        if (diagram !== null)
        {
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
        let entry = event.target.value.toLowerCase();
        setFilteredVoltageLevels(props.network.getVoltageLevels().filter(item => {
            const lc = useName ? item.name.toLowerCase() : item.id.toLowerCase();
            return lc.includes(entry);
        }));
    };

    const handleToggleUseName = () => {
        dispatch(toggleUseNameState());
    };


    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={useName}
                                onChange={handleToggleUseName}
                                value={useName}
                                color="primary"
                            />
                        }
                        label="Use name"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField id="standard-basic" label={searchMsg} onChange={filter} fullWidth={true}/>
                </Grid>
            </Grid>
            <FixedSizeList
                height={29 * itemSize}
                itemCount={filteredVoltageLevels.length}
                itemSize={itemSize}
                width="100%"
            >
                {Row}
            </FixedSizeList>
        </div>
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
