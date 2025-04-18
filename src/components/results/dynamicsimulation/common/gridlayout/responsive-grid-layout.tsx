/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import './react-grid-layout.main.css'; // from /node_modules/react-grid-layout/css/styles.css
import './react-grid-layout.custom.css';
// TODO place these css at global or directly into useStyles for RGLResponsive
import { Responsive as RGLResponsive, ResponsiveProps } from 'react-grid-layout';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useEffect, useMemo } from 'react';

export type ResponsiveGridLayoutProps = ResponsiveProps & {
    computeRowHeight: (height: number) => number;
};

function ResponsiveGridLayout({ computeRowHeight, ...otherProps }: Readonly<ResponsiveGridLayoutProps>) {
    useEffect(() => {
        return () => {
            console.log(`XXX demonté ResponsiveGridLayout: `);
        };
    }, []);
    const AutoSizerChildren = useMemo(() => {
        return ({ width, height }: { width: number; height: number }) => (
            <RGLResponsive width={width} rowHeight={computeRowHeight(height)} {...otherProps} />
        );
    }, [computeRowHeight, otherProps]);
    // use AutoSizer to make react-grid-layout Responsive component aware of width
    return <AutoSizer children={AutoSizerChildren} />;
}

export default ResponsiveGridLayout;
