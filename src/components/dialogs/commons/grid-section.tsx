/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ComponentProps, createElement, CSSProperties } from 'react';

export interface GridSectionProps {
    title: string;
    heading?: string;
    size?: number;
    customStyle?: CSSProperties;
}

const createCustomTag = (heading: string, customStyle: CSSProperties) => {
    const StyledComponent = styled('div')(() => ({
        ...customStyle,
    }));

    return (props: ComponentProps<'div'>) => createElement(`h${heading}`, { ...props, className: StyledComponent });
};

export default function GridSection({ title, heading = '3', size = 12, customStyle }: Readonly<GridSectionProps>) {
    const CustomTag = createCustomTag(heading, customStyle ?? {});
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
