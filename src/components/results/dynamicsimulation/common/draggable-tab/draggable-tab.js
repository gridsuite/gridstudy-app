/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import Tab from '@mui/material/Tab';

const DraggableTab = (props) => {
    const { index, value, label, ...others } = props;
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
                    <Tab
                        key={index}
                        value={value}
                        label={label}
                        {...others}
                        {...draggableProvided.dragHandleProps}
                    />
                </div>
            )}
        </Draggable>
    );
};

DraggableTab.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.node,
};

export default DraggableTab;
