/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useStyles } from '../parameters';
import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    Typography,
} from '@mui/material';
import {
    ExpandCircleDown,
    ExpandMore,
    Settings as SettingsIcon,
} from '@mui/icons-material';
//Expand, ExpandCircleDown, ExpandCircleDownOutlined, ExpandCircleDownRounded, ExpandCircleDownSharp, ExpandCircleDownTwoTone, ExpandLess, ExpandLessOutlined, ExpandLessRounded, ExpandLessSharp,
// ExpandLessTwoTone, ExpandMore, ExpandMoreOutlined, ExpandMoreRounded, ExpandMoreSharp, ExpandMoreTwoTone, ExpandOutlined, ExpandRounded, ExpandSharp, ExpandTwoTone

type ParameterGroupProps = {
    label: string;
    state: boolean;
    onClick: (show: boolean) => void;
    disabled: boolean;
    infoText: string;
    unmountOnExit: boolean;
};

export const ParameterGroup: FunctionComponent<
    PropsWithChildren<ParameterGroupProps>
> = (props, context) => {
    const classes = useStyles();
    const [mouseHover, setMouseHover] = useState(false);

    return (
        <>
            <Grid item xs={12} className={classes.subgroupParameters}>
                <Accordion
                    className={classes.subgroupParametersAccordion}
                    expanded={props.state}
                    onChange={(event, showed) => props.onClick(showed)}
                    disableGutters
                    elevation={0}
                    square
                    TransitionProps={{
                        unmountOnExit: props.unmountOnExit || false,
                    }}
                    disabled={props.disabled || undefined}
                >
                    <AccordionSummary
                        className={classes.subgroupParametersAccordionSummary}
                        expandIcon={
                            mouseHover ? <ExpandCircleDown /> : <ExpandMore />
                            /*<ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />*/
                        }
                        onMouseEnter={(event) => setMouseHover(true)}
                        onMouseLeave={(event) => setMouseHover(false)}
                    >
                        <SettingsIcon />
                        <Typography>
                            <FormattedMessage id={props.label} />
                        </Typography>
                        {/*TODO: missing CSS on left
                        props.infoText && (
                            <Typography
                                sx={{ color: 'text.secondary' }}
                                noWrap={true}
                                align="right"
                                variant="body2"
                            >
                                {props.infoText}
                            </Typography>
                        )*/}
                    </AccordionSummary>
                    <AccordionDetails
                        className={classes.subgroupParametersAccordionDetails}
                    >
                        {props.children}
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </>
    );
};
