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
    ...(values.x !== undefined && { x: values.x * containerRect.width }),
    ...(values.y !== undefined && { y: values.y * containerRect.height }),
    ...(values.width !== undefined && { width: values.width * containerRect.width }),
    ...(values.height !== undefined && { height: values.height * containerRect.height }),
});

export const calculatePanelDimensions = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    containerRect: DOMRect,
    minSize: { width: number; height: number }
) => {
    // make sure size is not smaller than minSize
    const width = Math.max(minSize.width, size.width * containerRect.width);
    const height = Math.max(minSize.height, size.height * containerRect.height);
    // make sure position + size does not exceed container bounds
    const x = Math.max(0, Math.min(position.x * containerRect.width, containerRect.width - width));
    const y = Math.max(0, Math.min(position.y * containerRect.height, containerRect.height - height));
    return { x, y, width, height };
};
