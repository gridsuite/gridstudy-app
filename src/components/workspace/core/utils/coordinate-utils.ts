/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const positionToRelative = (position: { x: number; y: number }, containerRect: DOMRect) => ({
    x: position.x / containerRect.width,
    y: position.y / containerRect.height,
});

export const sizeToRelative = (size: { width: number; height: number }, containerRect: DOMRect) => ({
    width: size.width / containerRect.width,
    height: size.height / containerRect.height,
});

export const toPixels = (
    values: { x?: number; y?: number; width?: number; height?: number },
    containerRect: DOMRect
) => ({
    ...(values.x !== undefined && { x: Math.round(values.x * containerRect.width) }),
    ...(values.y !== undefined && { y: Math.round(values.y * containerRect.height) }),
    ...(values.width !== undefined && { width: Math.round(values.width * containerRect.width) }),
    ...(values.height !== undefined && { height: Math.round(values.height * containerRect.height) }),
});

export const calculatePanelDimensions = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    containerRect: DOMRect,
    minSize: { width: number; height: number }
) => {
    // make sure size is not smaller than minSize
    // Round to integer pixels to prevent subpixel blur on Chromium 125-133
    // (CSS transform: translate() with fractional values causes blurry panel content)
    const width = Math.round(Math.max(minSize.width, size.width * containerRect.width));
    const height = Math.round(Math.max(minSize.height, size.height * containerRect.height));
    // make sure position + size does not exceed container bounds
    const x = Math.round(Math.max(0, Math.min(position.x * containerRect.width, containerRect.width - width)));
    const y = Math.round(Math.max(0, Math.min(position.y * containerRect.height, containerRect.height - height)));
    return { x, y, width, height };
};
