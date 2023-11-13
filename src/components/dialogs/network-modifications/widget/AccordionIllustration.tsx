/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Theme,
    Typography,
} from '@mui/material';
import { ExpandCircleDown, ExpandMore } from '@mui/icons-material';

type AccordionIllustrationProps = {
    state: boolean;
    onClick: (show: boolean) => void;
};

export const styles = {
    accordion: {
        background: 'none',
    },
    accordionIllustrationSummary: (theme: Theme) => ({
        alignContent: 'flex-start',
        flexDirection: 'row',
        flexGrow: 0,
        justifyContent: 'left',
        transition: '0.2s',
        '& .MuiAccordionSummary-expandIconWrapper': {
            transform: 'rotate(180deg)',
        },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(0deg)',
        },
        '& .MuiAccordionSummary-content': {
            marginLeft: theme.spacing(0),
            flexGrow: 0,
            msFlexPositive: 0,
            justifyContent: 'left',
        },
    }),
    accordionIllustrationSummaryHidden: (theme: Theme) => ({
        padding: theme.spacing(0),
        backgroundColor: 'none',
    }),
    accordionIllustrationSummaryShown: (theme: Theme) => ({
        padding: '0px 4px',
        backgroundColor: theme.palette.mode === 'light' ? 'none' : '#272727ff',
    }),
    accordionIllustrationDetails: (theme: Theme) => ({
        padding: theme.spacing(0),
    }),
};

export const AccordionIllustration: FunctionComponent<
    PropsWithChildren<AccordionIllustrationProps>
> = (props) => {
    const [mouseHover, setMouseHover] = useState(false);

    return (
        <>
            <Accordion
                sx={styles.accordion}
                expanded={props.state}
                onChange={(event, showed) => props.onClick(showed)}
                disableGutters
                elevation={0}
                square
            >
                <AccordionSummary
                    sx={[
                        styles.accordionIllustrationSummary,
                        props.state
                            ? styles.accordionIllustrationSummaryShown
                            : styles.accordionIllustrationSummaryHidden,
                    ]}
                    expandIcon={
                        mouseHover ? <ExpandCircleDown /> : <ExpandMore />
                    }
                    onMouseEnter={() => setMouseHover(true)}
                    onMouseLeave={() => setMouseHover(false)}
                >
                    <Typography variant="h6">
                        <FormattedMessage id="Information" />
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={styles.accordionIllustrationDetails}>
                    {props.children}
                </AccordionDetails>
            </Accordion>
        </>
    );
};
