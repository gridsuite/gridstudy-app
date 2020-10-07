/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {makeStyles} from "@material-ui/core/styles";
import {green, grey, orange, red} from "@material-ui/core/colors";
import {startLoadFlow} from "../utils/rest-api";
import Button from "@material-ui/core/Button";
import PlayIcon from "@material-ui/icons/PlayArrow";
import Typography from "@material-ui/core/Typography";
import React from "react";

const useStyles = makeStyles({
    root: {
        backgroundColor: grey[500],
        '&:hover': {
            backgroundColor: grey[700],
        },
    },
    label: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

export const LFStatus = {
    CONVERGED: 'Converged',
    DIVERGED: 'Diverged',
    NOT_DONE: 'Start LoadFlow',
    RUNNING: 'LoadFlow running…',
};

const RunButton = (props) => {

    const classes = useStyles();

    const subStyle = {
        running: {
            backgroundColor: orange[500],
            color: 'black',
        },
        diverged: {
            backgroundColor: red[500],
            color: 'black',
        },
        converged: {
            backgroundColor: green[500],
            color: 'black',
        },
        root: {
            backgroundColor: grey[500],
            '&:hover': {
                backgroundColor: grey[700],
            },
            color: 'black',
        },
    };

    const handleClick = () =>
        startLoadFlow(props.studyName, props.userId).then();

    function getStyle() {
        switch (props.loadFlowState) {
            case LFStatus.CONVERGED:
                return subStyle.converged;
            case LFStatus.DIVERGED:
                return subStyle.diverged;
            case LFStatus.RUNNING:
                return subStyle.running;
            case LFStatus.NOT_DONE:
            default:
                return {};
        }
    }

    return (
        <Button
            variant="containedSecondary"
            fullWidth={true}
            className={classes.root}
            startIcon={
                props.loadFlowState === LFStatus.NOT_DONE ? <PlayIcon /> : null
            }
            disabled={props.loadFlowState !== LFStatus.NOT_DONE}
            onClick={
                props.loadFlowState === LFStatus.NOT_DONE ? handleClick : null
            }
            style={getStyle()}
        >
            <div className={getStyle()}>
                <Typography noWrap>{props.loadFlowState}</Typography>
            </div>
        </Button>
    );
};

export default RunButton;

