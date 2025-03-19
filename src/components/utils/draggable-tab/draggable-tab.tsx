/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Draggable } from 'react-beautiful-dnd';
import Tab, { TabProps } from '@mui/material/Tab';
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface DraggableTabStyles {
    container?: SxProps<Theme>;
    tab?: SxProps<Theme>;
}

interface DraggableTabOwnProps {
    id: string;
    index: number;
    value: number;
    styles?: DraggableTabStyles;
}

type DraggableTabProps = DraggableTabOwnProps & Omit<TabProps, keyof DraggableTabOwnProps>;

const DraggableTab = (props: DraggableTabProps) => {
    const { id, index, value, label, styles = {}, ...others } = props;
    const { container = {}, tab = {} } = styles;

    return (
        <Draggable draggableId={id} index={index} disableInteractiveElementBlocking>
            {(draggableProvided) => (
                <Box ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} sx={container}>
                    <Tab value={value} label={label} {...others} {...draggableProvided.dragHandleProps} sx={tab} />
                </Box>
            )}
        </Draggable>
    );
};

export default DraggableTab;
