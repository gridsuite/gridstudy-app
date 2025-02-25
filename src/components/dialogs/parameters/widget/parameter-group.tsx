/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ExpandCircleDown, ExpandMore, Settings as SettingsIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { styles } from '../parameters-style';

type ParameterGroupProps = {
    label: string;
    state: boolean;
    onClick: (show: boolean) => void;
    disabled?: boolean;
    infoText?: string;
    unmountOnExit?: boolean;
};

export const ParameterGroup: FunctionComponent<PropsWithChildren<ParameterGroupProps>> = (props, context) => {
    const [mouseHover, setMouseHover] = useState(false);

    return (
        <Grid item xs={12} sx={styles.subgroupParameters}>
            <Accordion
                sx={styles.subgroupParametersAccordion}
                expanded={props.state}
                onChange={(event, showed) => props.onClick(showed)}
                disableGutters
                elevation={0}
                square
                slotProps={{
                    transition: {
                        unmountOnExit: props.unmountOnExit || false,
                    },
                }}
                disabled={props.disabled || undefined}
            >
                <AccordionSummary
                    sx={styles.subgroupParametersAccordionSummary}
                    expandIcon={mouseHover ? <ExpandCircleDown /> : <ExpandMore />}
                    onMouseEnter={(event) => setMouseHover(true)}
                    onMouseLeave={(event) => setMouseHover(false)}
                >
                    <SettingsIcon />
                    <Typography sx={{ width: '66%', flexShrink: 0 }}>
                        <FormattedMessage id={props.label} />
                    </Typography>
                    {props.infoText && (
                        <Typography
                            sx={{ color: 'text.secondary', width: '34%' }}
                            noWrap={true}
                            align="right"
                            variant="body2"
                        >
                            {props.infoText}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails sx={styles.subgroupParametersAccordionDetails}>{props.children}</AccordionDetails>
            </Accordion>
        </Grid>
    );
};
