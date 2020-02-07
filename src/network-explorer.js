/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from "prop-types";
import {FixedSizeList} from 'react-window';

import ListItem from '@material-ui/core/ListItem';

import Network from "./network";

const itemSize = 35;

const NetworkExplorer = (props) => {
    const voltageLevels = props.network.getVoltageLevels();

    const Row = ({ index, style }) => (
        <ListItem button style={style} key={index} onClick={() => props.onSubstationClick(voltageLevels[index].id)}>
            {voltageLevels[index].id}
        </ListItem>
    );

    return (
        <FixedSizeList
            height={30 * itemSize}
            itemCount={voltageLevels.length}
            itemSize={itemSize}
            width="100%"
        >
            {Row}
        </FixedSizeList>
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
