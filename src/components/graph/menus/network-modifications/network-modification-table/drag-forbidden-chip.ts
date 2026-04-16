/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Unique attribute to identify injected chips so we can clean them up
export const CHIP_ATTR = 'data-drag-depth-chip';

interface DragForbiddenChipParams {
    side: 'left' | 'right';
    chipStyle: string;
    label: string;
    title?: string;
}

const createDragForbiddenChip = ({ side, chipStyle, label, title }: DragForbiddenChipParams): HTMLSpanElement => {
    const chip = document.createElement('span');
    chip.setAttribute(CHIP_ATTR, side);
    chip.setAttribute('style', `${chipStyle}; ${side}: 0px`);
    chip.textContent = label;
    if (title) {
        chip.title = title;
    }
    return chip;
};

export const injectForbiddenChips = (container: HTMLDivElement, rowEl: HTMLElement, isMovingDown: boolean): void => {
    container.querySelectorAll<HTMLElement>(`[${CHIP_ATTR}]`).forEach((c) => c.remove());
    const containerRect = container.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const shadowLineY = isMovingDown
        ? rowRect.bottom - containerRect.top + container.scrollTop
        : rowRect.top - containerRect.top + container.scrollTop;

    const chipStyle = [
        'position: absolute',
        `top: ${shadowLineY}px`,
        'transform: translateY(-50%)',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'height: 20px',
        'min-width: 20px',
        'padding: 0 6px',
        'border-radius: 10px',
        'font-size: 11px',
        'background-color: #d32f2f',
        'color: #ffffff',
        'z-index: 10',
        'box-shadow: 0 1px 3px rgba(0,0,0,0.3)',
    ].join('; ');
    container.appendChild(createDragForbiddenChip({ side: 'left', chipStyle, label: '✕' }));
};
