/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from "react";

import {useDispatch, useSelector} from "react-redux";

import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";

import NetworkExplorer from "./network/network-explorer";
import NetworkMap from "./network/network-map";
import SingleLineDiagram from "./single-line-diagram";
import {fetchVoltageLevelDiagram} from "../utils/rest-api";
import {loadVoltageLevelDiagramSuccess} from "../redux/actions";

const useStyles = makeStyles(theme => ({
    main: {
        position: "absolute",
        width:"100%",
        height: 'calc(100vh - 56px)',
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            height: 'calc(100vh - 48px)'
        },
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 64px)'
        },
    }
}));

const NetworkPane = () => {

    const dispatch = useDispatch();

    const network = useSelector(state => state.network);

    const openedStudyName = useSelector(state => state.openedStudyName);

    const diagram = useSelector(state => state.diagram);

    const useName = useSelector(state => state.useName);

    const classes = useStyles();

    function showVoltageLevelDiagram(voltageLevelId, voltageLevelName) {
        // load svg
        fetchVoltageLevelDiagram(openedStudyName, voltageLevelId, useName)
            .then(svg => {
                dispatch(loadVoltageLevelDiagramSuccess(voltageLevelId, svg, voltageLevelName));
            });
    }

    return (
        <Grid container className={classes.main}>
            <Grid item xs={12} md={2} key="explorer">
                <NetworkExplorer network={network}
                                 onVoltageLevelClick={ (id, name) => showVoltageLevelDiagram(id, name) }/>
            </Grid>
            <Grid item xs={12} md={10} key="map">
                <div style={{position:"relative", width:"100%", height: "100%"}}>
                    <NetworkMap network={network}
                                labelsZoomThreshold={8}
                                initialPosition={[2.5, 46.6]}
                                initialZoom={6}
                                onSubstationClick={ (id, name) => showVoltageLevelDiagram(id, name) } />
                    {
                        diagram &&
                        <div style={{ position: "absolute", left: 10, top: 10, zIndex: 1 }}>
                            <SingleLineDiagram diagramTitle={useName ? diagram.name : diagram.id} svg={ diagram.svg } />
                        </div>
                    }
                </div>
            </Grid>
        </Grid>
    );
};

export default NetworkPane;