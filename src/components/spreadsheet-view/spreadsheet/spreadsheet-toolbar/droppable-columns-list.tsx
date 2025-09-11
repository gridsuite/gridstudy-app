/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableColumnItem } from './draggable-column-item';
import { ColumnDefinition, SpreadsheetTabDefinition } from 'components/spreadsheet-view/types/spreadsheet.type';
import { UUID } from 'crypto';

interface DroppableColumnsListProps {
    tableDefinition: SpreadsheetTabDefinition;
    columns: ColumnDefinition[];
    onDragEnd: (result: DropResult) => void;
    onToggle: (uuid: UUID) => void;
    onClickOnLock: (uuid: UUID) => void;
    isLocked: (uuid: UUID) => boolean;
}

export const DroppableColumnsList: FunctionComponent<DroppableColumnsListProps> = ({
    tableDefinition,
    columns,
    onDragEnd,
    onToggle,
    onClickOnLock,
    isLocked,
}) => (
    <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="network-table-columns-list">
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                    {columns.map(({ uuid, name, visible }, index) => (
                        <Draggable
                            draggableId={tableDefinition.uuid + '-' + index}
                            index={index}
                            key={tableDefinition.uuid + '-' + index}
                        >
                            {(providedDraggable) => (
                                <DraggableColumnItem
                                    uuid={uuid}
                                    name={name}
                                    visible={visible}
                                    dragHandleProps={providedDraggable.dragHandleProps}
                                    draggableProps={providedDraggable.draggableProps}
                                    innerRef={providedDraggable.innerRef}
                                    isLocked={isLocked}
                                    onClickOnLock={onClickOnLock}
                                    onToggle={onToggle}
                                />
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </DragDropContext>
);
