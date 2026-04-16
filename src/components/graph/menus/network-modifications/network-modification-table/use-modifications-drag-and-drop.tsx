/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { JSX, RefObject, useCallback } from 'react';
import { Row } from '@tanstack/react-table';
import { DraggableProvided, DraggableRubric, DraggableStateSnapshot, DragUpdate, DropResult } from '@hello-pangea/dnd';
import DragCloneRow from './row/drag-row-clone';
import {
    DROP_FORBIDDEN_INDICATOR_BOTTOM,
    DROP_FORBIDDEN_INDICATOR_TOP,
    DROP_INDICATOR_BOTTOM,
    DROP_INDICATOR_TOP,
} from './network-modification-table-styles';
import {
    changeCompositeSubModificationOrder,
    changeNetworkModificationOrder,
} from '../../../../../services/study/network-modifications';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer.type';
import {
    ComposedModificationMetadata,
    findModificationInTree,
    getNestedRowRootParent,
    isCompositeModification,
    moveSubModificationInTree,
} from './utils';
import type { UUID } from 'node:crypto';
import { CHIP_ATTR, injectForbiddenChips } from './drag-forbidden-chip';

const MAX_NESTING_DEPTH = 5;

interface UseModificationsDragAndDropParams {
    rows: Row<ComposedModificationMetadata>[];
    containerRef: RefObject<HTMLDivElement | null>;
    composedModifications: ComposedModificationMetadata[];
    setComposedModifications: React.Dispatch<React.SetStateAction<ComposedModificationMetadata[]>>;
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
    // Remove the chip overlay layer anchored on the scroll container
    container?.querySelectorAll<HTMLElement>(`[${CHIP_ATTR}]`).forEach((chip) => chip.remove());
};

const computeTargetDepth = (
    sourceRow: Row<ComposedModificationMetadata>,
    targetRow: Row<ComposedModificationMetadata>
) => {
    const sourceRowIndex = sourceRow.depth > 0 ? getNestedRowRootParent(sourceRow).index : sourceRow.index;
    const targetRowIndex = targetRow.depth > 0 ? getNestedRowRootParent(targetRow).index : targetRow.index;
    const isDraggingDown = sourceRowIndex < targetRowIndex;
    return isCompositeModification(targetRow.original) && targetRow.getIsExpanded() && isDraggingDown
        ? targetRow.depth + 1
        : targetRow.depth;
};

const isDropForbidden = (
    sourceRow: Row<ComposedModificationMetadata>,
    targetRow: Row<ComposedModificationMetadata>
): boolean => {
    if (isCompositeModification(sourceRow.original)) {
        const targetDepth = computeTargetDepth(sourceRow, targetRow);
        return (
            (sourceRow.original.maxDepth ?? 0) + targetDepth > MAX_NESTING_DEPTH ||
            !!(
                isCompositeModification(sourceRow.original) &&
                findModificationInTree(targetRow.original.uuid, [sourceRow.original])
            )
        );
    }
    return false;
};

// When entering an expanded composite from outside, the target composite is the
// composite row itself; otherwise derive it from the target row's parent as usual.
function getTargetCompositeUuid(droppingIntoExpandedComposite: boolean, targetRow: Row<ComposedModificationMetadata>) {
    if (droppingIntoExpandedComposite) {
        return targetRow.original.uuid;
    }
    return targetRow.depth > 0 ? (targetRow.getParentRow()?.original.uuid ?? null) : null;
}

function getTargetSiblings(targetCompositeUuid: UUID | null, rows: Row<ComposedModificationMetadata>[]) {
    return targetCompositeUuid
        ? rows.filter((r) => r.depth > 0 && r.getParentRow()?.original.uuid === targetCompositeUuid)
        : rows.filter((r) => r.depth === 0);
}

function getContainerShadow(forbidden: boolean, isMovingDown: boolean) {
    if (forbidden) {
        return isMovingDown ? DROP_FORBIDDEN_INDICATOR_BOTTOM : DROP_FORBIDDEN_INDICATOR_TOP;
    }
    return isMovingDown ? DROP_INDICATOR_BOTTOM : DROP_INDICATOR_TOP;
}

export const useModificationsDragAndDrop = ({
    rows,
    containerRef,
    composedModifications,
    setComposedModifications,
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

            const forbidden = isDropForbidden(sourceRow, targetRow);
            const isMovingDown = destination.index > source.index;
            el.style.boxShadow = getContainerShadow(forbidden, isMovingDown);
            if (forbidden && containerRef.current) {
                injectForbiddenChips(containerRef.current, el, isMovingDown);
            }
        },
        [rows, containerRef]
    );

    const handleDragEndComposite = useCallback(
        (
            sourceRow: Row<ComposedModificationMetadata>,
            targetRow: Row<ComposedModificationMetadata>,
            droppingIntoExpandedComposite: boolean,
            isDraggingDown: boolean
        ) => {
            const movingUuid = sourceRow.original.uuid;
            const sourceCompositeUuid = sourceRow.depth > 0 ? (sourceRow.getParentRow()?.original.uuid ?? null) : null;

            const targetCompositeUuid: UUID | null = getTargetCompositeUuid(droppingIntoExpandedComposite, targetRow);

            const targetSiblings = getTargetSiblings(targetCompositeUuid, rows);

            let beforeUuid: UUID | null;
            if (droppingIntoExpandedComposite) {
                // Landing on an expanded composite header: enter it at first position
                beforeUuid = targetSiblings[0]?.original.uuid ?? null;
            } else {
                const landingIndexInSiblings = targetSiblings.findIndex(
                    (r) => r.original.uuid === targetRow.original.uuid
                );
                const beforeSiblingIndex = isDraggingDown ? landingIndexInSiblings + 1 : landingIndexInSiblings;
                beforeUuid = targetSiblings[beforeSiblingIndex]?.original.uuid ?? null;
            }

            const previousComposed = composedModifications;
            setComposedModifications((prev) =>
                moveSubModificationInTree(movingUuid, sourceCompositeUuid, targetCompositeUuid, beforeUuid, prev)
            );

            changeCompositeSubModificationOrder(
                studyUuid,
                currentNodeId,
                movingUuid,
                sourceCompositeUuid,
                targetCompositeUuid,
                beforeUuid
            ).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'errReorderModificationMsg' });
                setComposedModifications(previousComposed);
            });
        },
        [rows, studyUuid, currentNodeId, snackError, composedModifications, setComposedModifications]
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

            if (isDropForbidden(sourceRow, targetRow)) {
                return;
            }

            const isSubRowInvolved = sourceRow.depth > 0 || targetRow.depth > 0;

            const isDraggingDown = destination.index > source.index;
            const droppingIntoExpandedComposite = isDraggingDown && targetRow.getIsExpanded();

            if (isSubRowInvolved || droppingIntoExpandedComposite) {
                handleDragEndComposite(sourceRow, targetRow, droppingIntoExpandedComposite, isDraggingDown);
            } else {
                const sourceDepth0Uuid = sourceRow.original.uuid;
                const targetDepth0Uuid = targetRow.original.uuid;

                const oldPosition = composedModifications.findIndex((m) => m.uuid === sourceDepth0Uuid);
                const newPosition = composedModifications.findIndex((m) => m.uuid === targetDepth0Uuid);

                if (oldPosition === -1 || newPosition === -1 || oldPosition === newPosition || !currentNodeId) {
                    return;
                }

                // Optimistic update of the flat modifications list
                const previousModifications = [...composedModifications];
                const updatedModifications = [...composedModifications];
                const [movedItem] = updatedModifications.splice(oldPosition, 1);
                updatedModifications.splice(newPosition, 0, movedItem);
                setComposedModifications(updatedModifications);

                const before = updatedModifications[newPosition + 1]?.uuid ?? null;

                changeNetworkModificationOrder(studyUuid, currentNodeId, movedItem.uuid, before).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'errReorderModificationMsg' });
                    setComposedModifications(previousModifications);
                });
            }
        },
        [
            containerRef,
            onDragEnd,
            rows,
            studyUuid,
            currentNodeId,
            snackError,
            composedModifications,
            setComposedModifications,
            handleDragEndComposite,
        ]
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
