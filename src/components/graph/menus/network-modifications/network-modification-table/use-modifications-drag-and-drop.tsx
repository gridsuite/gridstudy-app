/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { JSX, RefObject, useCallback } from 'react';
import { Row } from '@tanstack/react-table';
import { DraggableProvided, DraggableRubric, DraggableStateSnapshot, DragUpdate, DropResult } from '@hello-pangea/dnd';
import DragCloneRow from './row/drag-row-clone';
import {
    DROP_FORBIDDEN_INDICATOR_BOTTOM,
    DROP_FORBIDDEN_INDICATOR_TOP,
    DROP_INDICATOR_BOTTOM,
    DROP_INDICATOR_TOP,
} from './styles';
import { ComposedModificationMetadata } from './utils';
import { changeNetworkModificationOrder } from '../../../../../services/study/network-modifications';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer.type';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';

interface UseModificationsDragAndDropParams {
    rows: Row<ComposedModificationMetadata>[];
    containerRef: RefObject<HTMLDivElement | null>;
    modifications: NetworkModificationMetadata[];
    setModifications: (modifications: NetworkModificationMetadata[]) => void;
    onDragEnd: () => void;
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
    container?.querySelectorAll<HTMLElement>('[data-row-id]').forEach((el) => {
        el.style.boxShadow = '';
    });
};

/**
 * Returns true when dropping a depth-0 row AFTER an expanded composite row is forbidden.
 *
 * When a composite is expanded, the visual rows immediately after it are its children (depth > 0).
 * Dropping a depth-0 item "after" the composite (i.e. destination === source + 1 while moving down,
 * or the target is the expanded composite and we are coming from above) would place the item between
 * the composite and its children — which is a cross-depth move we currently forbid.
 *
 * The rule: if the target row is at depth 0 and is expanded, and the drag is downward
 * (destination > source), the drop is forbidden because the item would land after the composite
 * header but before its still-visible children.
 */
const isDropAfterExpandedComposite = (
    sourceIndex: number,
    destinationIndex: number,
    targetRow: Row<ComposedModificationMetadata>
): boolean => {
    const isDraggingDown = destinationIndex > sourceIndex;
    return isDraggingDown && targetRow.depth === 0 && targetRow.getIsExpanded();
};

/**
 * Determines whether a proposed drop is forbidden based on depth / parent constraints
 * plus the expanded-composite boundary rule.
 */
const isDropForbidden = (
    sourceIndex: number,
    destinationIndex: number,
    sourceRow: Row<ComposedModificationMetadata>,
    targetRow: Row<ComposedModificationMetadata>
): boolean => {
    // Cross-depth drops are always forbidden
    if (targetRow.depth !== sourceRow.depth) {
        return true;
    }
    // Sub-rows must stay within the same parent composite
    if (sourceRow.depth > 0 && targetRow.getParentRow()?.id !== sourceRow.getParentRow()?.id) {
        return true;
    }
    // Depth-0 drops directly after an expanded composite are forbidden
    if (sourceRow.depth === 0 && isDropAfterExpandedComposite(sourceIndex, destinationIndex, targetRow)) {
        return true;
    }
    return false;
};

export const useModificationsDragAndDrop = ({
    rows,
    containerRef,
    modifications,
    setModifications,
    onDragEnd,
}: UseModificationsDragAndDropParams): UseModificationsDragAndDropReturn => {
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);

    const handleDragUpdate = useCallback(
        (update: DragUpdate) => {
            clearRowDragIndicators(containerRef.current);

            const { source, destination } = update;
            if (!destination || source.index === destination.index) {
                return;
            }

            const sourceRow = rows[source.index];
            const targetRow = rows[destination.index];
            const el = containerRef.current?.querySelector<HTMLElement>(`[data-row-id="${targetRow?.original.uuid}"]`);

            if (!el) {
                return;
            }

            const forbidden = isDropForbidden(source.index, destination.index, sourceRow, targetRow);
            const isMovingDown = destination.index > source.index;

            el.style.boxShadow = forbidden
                ? isMovingDown
                    ? DROP_FORBIDDEN_INDICATOR_BOTTOM
                    : DROP_FORBIDDEN_INDICATOR_TOP
                : isMovingDown
                  ? DROP_INDICATOR_BOTTOM
                  : DROP_INDICATOR_TOP;
        },
        [rows, containerRef]
    );

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            clearRowDragIndicators(containerRef.current);
            onDragEnd();

            const { source, destination } = result;
            if (!destination || source.index === destination.index) {
                return;
            }

            const sourceRow = rows[source.index];
            const targetRow = rows[destination.index];

            if (isDropForbidden(source.index, destination.index, sourceRow, targetRow)) {
                return;
            }

            // Map flat visual row indices back to depth-0 modification indices.
            // `rows` contains both depth-0 and depth-1 rows; `modifications` is depth-0 only.
            // We use the row's own parentId to identify depth-0 rows and find their position
            // in the flat modifications array by UUID.
            const sourceDepth0Uuid =
                sourceRow.depth === 0 ? sourceRow.original.uuid : sourceRow.getParentRow()!.original.uuid;
            const targetDepth0Uuid =
                targetRow.depth === 0 ? targetRow.original.uuid : targetRow.getParentRow()!.original.uuid;

            const oldPosition = modifications.findIndex((m) => m.uuid === sourceDepth0Uuid);
            const newPosition = modifications.findIndex((m) => m.uuid === targetDepth0Uuid);

            if (oldPosition === -1 || newPosition === -1 || oldPosition === newPosition || !currentNodeId) {
                return;
            }

            // Optimistic update of the flat modifications list
            const previousModifications = [...modifications];
            const updatedModifications = [...modifications];
            const [movedItem] = updatedModifications.splice(oldPosition, 1);
            updatedModifications.splice(newPosition, 0, movedItem);
            setModifications(updatedModifications);

            const before = updatedModifications[newPosition + 1]?.uuid ?? null;

            changeNetworkModificationOrder(studyUuid, currentNodeId, movedItem.uuid, before).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'errReorderModificationMsg' });
                setModifications(previousModifications);
            });
        },
        [containerRef, onDragEnd, rows, modifications, setModifications, currentNodeId, studyUuid, snackError]
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
