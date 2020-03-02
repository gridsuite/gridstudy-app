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

const itemSize = 35;

const NetworkExplorer = (props) => {
    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState([]);

    useEffect(() => {
        setFilteredVoltageLevels(props.network.getVoltageLevels())
    }, [props.network]);

    const Row = ({ index, style }) => (
        <ListItem button style={style} key={index} onClick={() => props.onSubstationClick(filteredVoltageLevels[index].id, filteredVoltageLevels[index].name)}>
            {filteredVoltageLevels[index].name}
        </ListItem>
    );

    const filter = (event) => {
        let entry = event.target.value.toLowerCase();
        setFilteredVoltageLevels(props.network.getVoltageLevels().filter(item => {
            const lc = item.id.toLowerCase();
            return lc.includes(entry);
        }));
    };

    return (
        <div>
            <TextField id="standard-basic" label="Search..." onChange={filter} fullWidth={true}/>
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
