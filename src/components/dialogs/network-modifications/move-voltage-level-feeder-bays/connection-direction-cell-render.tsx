/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { IntegerInput } from "@gridsuite/commons-ui";
import { IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

type ConnectionDirectionCellRendererProps = {
    direction: string;
};

export default function ConnectionDirectionCellRenderer({ direction }: Readonly<ConnectionDirectionCellRendererProps>) {
    let [isDirectionTop] = useState<boolean>(direction === 'TOP');
    let [directionValue] = useState<string>(direction);
    return (
        <div>
          <IconButton
            style={{
              alignItems: 'end',
            }}
            edge="end"
            onClick={() => {
                isDirectionTop = !isDirectionTop;
                if (isDirectionTop) {
                
            }}
            size={'small'}>
            {directionValue}
            {isDirectionTop ?
            <ArrowUpwardIcon /> :
            <ArrowDownwardIcon/>}
          </IconButton>
        </div>
    );
}
