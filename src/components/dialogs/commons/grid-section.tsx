/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Grid } from '@mui/material';
import { styled } from '@mui/system';
import { FormattedMessage } from 'react-intl';

interface GridSectionProps {
    title: string;
    heading?: string;
    size?: number;
    customStyle?: React.CSSProperties;
}

const createCustomTag = (heading: string, customStyle: React.CSSProperties) => {
    const StyledComponent = styled('div')(() => ({
        ...customStyle,
    }));

    return (props: React.ComponentProps<'div'>) =>
        React.createElement(`h${heading}`, { ...props, className: StyledComponent });
};

export function GridSection({ title, heading = '3', size = 12, customStyle = {} }: Readonly<GridSectionProps>) {
    const CustomTag = createCustomTag(heading, customStyle);
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <CustomTag>
                    <FormattedMessage id={title} />
                </CustomTag>
            </Grid>
        </Grid>
    );
}
