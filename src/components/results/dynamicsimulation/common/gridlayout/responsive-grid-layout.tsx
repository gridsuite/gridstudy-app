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
import { RefObject, useRef } from 'react';

function getDimensions(
    width: number,
    height: number,
    prevDimensionRef: RefObject<{
        width: number;
        height: number;
    }>
) {
    // when a parent component is hidden, width and height computed by AutoSizer may be not valid, e.g. negative or zero
    // need to reuse the previous valid dimensions
    const newWidth = width > 0 ? width : prevDimensionRef.current.width;
    const newHeight = height > 0 ? height : prevDimensionRef.current.height;

    // update previous with valid dimensions
    if (newWidth !== prevDimensionRef.current.width) {
        prevDimensionRef.current.width = newWidth;
    }
    if (newHeight !== prevDimensionRef.current.height) {
        prevDimensionRef.current.height = newHeight;
    }
    return { newWidth, newHeight };
}

export type ResponsiveGridLayoutProps = ResponsiveProps & {
    computeRowHeight: (height: number) => number;
};

function ResponsiveGridLayout({ computeRowHeight, ...otherProps }: Readonly<ResponsiveGridLayoutProps>) {
    const prevDimensionsRef = useRef({ width: 0, height: 0 });
    // use AutoSizer to make react-grid-layout Responsive component aware of width
    return (
        <AutoSizer doNotBailOutOnEmptyChildren /* to prevent unmount children when computed dimensions are zero */>
            {({ width, height }) => {
                const { newWidth, newHeight } = getDimensions(width, height, prevDimensionsRef);
                return <RGLResponsive width={newWidth} rowHeight={computeRowHeight(newHeight)} {...otherProps} />;
            }}
        </AutoSizer>
    );
}

export default ResponsiveGridLayout;
