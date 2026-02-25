/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JSX, RefObject, useCallback } from 'react';
import { Row } from '@tanstack/react-table';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { DraggableProvided, DraggableRubric, DraggableStateSnapshot, DragUpdate, DropResult } from '@hello-pangea/dnd';
import DragCloneRow from './row/drag-row-clone';
import { DROP_INDICATOR_BOTTOM, DROP_INDICATOR_TOP } from './styles';

interface UseModificationsDragAndDropParams {
    rows: Row<NetworkModificationMetadata>[];
    containerRef: RefObject<HTMLDivElement | null>;
    onRowDragEnd?: (result: DropResult) => void;
}

interface UseModificationsDragAndDropReturn {
    handleDragUpdate: (update: DragUpdate) => void;
    handleDragEnd: (result: DropResult) => void;
    renderClone: (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
        rubric: DraggableRubric
    ) => JSX.Element;
}

const clearRowDragIndicators = (container: HTMLDivElement | null): void => {
    container?.querySelectorAll<HTMLElement>('.modificationRow').forEach((el) => {
        el.style.boxShadow = '';
    });
};

export const useModificationsDragAndDrop = ({
    rows,
    containerRef,
    onRowDragEnd,
}: UseModificationsDragAndDropParams): UseModificationsDragAndDropReturn => {
    const handleDragUpdate = useCallback(
        (update: DragUpdate) => {
            clearRowDragIndicators(containerRef.current);

            const { source, destination } = update;
            if (!destination || source.index === destination.index) {
                return;
            }

            const targetUuid = rows[destination.index]?.original.uuid;
            const el = containerRef.current?.querySelector<HTMLElement>(`[data-row-id="${targetUuid}"]`);
            if (el) {
                el.style.boxShadow = destination.index > source.index ? DROP_INDICATOR_BOTTOM : DROP_INDICATOR_TOP;
            }
        },
        [rows, containerRef]
    );

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            clearRowDragIndicators(containerRef.current);

            if (result.destination && result.source.index !== result.destination.index) {
                onRowDragEnd?.(result);
            }
        },
        [containerRef, onRowDragEnd]
    );

    const renderClone = useCallback(
        (provided: DraggableProvided, _snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <DragCloneRow row={rows[rubric.source.index]} />
            </div>
        ),
        [rows]
    );

    return { handleDragUpdate, handleDragEnd, renderClone };
};
