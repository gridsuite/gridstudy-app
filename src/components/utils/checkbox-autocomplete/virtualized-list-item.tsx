/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ListChildComponentProps } from 'react-window';
import CheckboxItem from './checkbox-item';

const VirtualizedListItem = (props: ListChildComponentProps) => {
    const { data, index } = props;
    const [option, selected, getOptionLabel, otherProps] = data[index];

    return (
        <CheckboxItem
            option={option}
            selected={selected}
            getOptionLabel={getOptionLabel}
            {...otherProps}
        />
    );
};

export default VirtualizedListItem;
