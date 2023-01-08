/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Draggable } from 'react-beautiful-dnd';
import { cloneElement } from 'react';

const DraggableTab = (props) => {
    const { index, children } = props;
    return (
        <Draggable
            draggableId={`${index}`}
            index={index}
            disableInteractiveElementBlocking
        >
            {(draggableProvided) => (
                <div
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                >
                    {cloneElement(children, {
                        ...props,
                        ...draggableProvided.dragHandleProps,
                    })}
                </div>
            )}
        </Draggable>
    );
};

export default DraggableTab;
