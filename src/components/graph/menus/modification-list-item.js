/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ListItem } from '@material-ui/core';
import { useIntl } from 'react-intl';
import React from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';

export const ModificationListItem = ({ modification, ...props }) => {
    const intl = useIntl();
    const label = intl.formatMessage(
      {id:'network_modifications/' + modification.type},
        modification
    );
    return (
        <ListItem {...props}>
          <OverflowableText text={label} style={{ whiteSpace: "pre" }}/>
        </ListItem>
    );
};
