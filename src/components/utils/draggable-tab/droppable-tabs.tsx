/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { Tabs } from '@mui/material';

interface DroppableTabsProps {
    id: string;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
    tabsRender: () => React.ReactNode;
    onDragEnd: OnDragEndResponder;
}
const DroppableTabs = (props: DroppableTabsProps) => {
    const { id, value, onChange, tabsRender, onDragEnd } = props;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`dnd-tabs-${id}`} direction={'horizontal'}>
                {(droppableProvided) => (
                    <Tabs
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        value={value}
                        onChange={onChange}
                        variant={'scrollable'}
                        scrollButtons
                        allowScrollButtonsMobile
                    >
                        {tabsRender()}
                        {droppableProvided ? droppableProvided.placeholder : null}
                    </Tabs>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DroppableTabs;
