/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { CustomMenuItem } from '../../utils/custom-nested-menu';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It set paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

const ChildMenuItem = ({ item }) => {
    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={item.action}
            disabled={item.disabled}
        >
            <ListItemText
                primary={
                    <Typography>
                        <FormattedMessage id={item.id} />
                    </Typography>
                }
            />
        </CustomMenuItem>
    );
};

ChildMenuItem.protoTypes = {
    item: PropTypes.object.isRequired,
};
export default ChildMenuItem;
