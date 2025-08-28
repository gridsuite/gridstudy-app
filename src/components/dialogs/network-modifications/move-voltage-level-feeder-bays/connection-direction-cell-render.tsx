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
    name: string;
};

export default function ConnectionDirectionCellRenderer({ name }: Readonly<ConnectionDirectionCellRendererProps>) {
    const {
        field: { value },
    } = useController({ name });
  const [direction] = useState<string>();
    return (
        <div>
          <IconButton >
            {name}
            direction === ''
            <ArrowUpwardIcon />
            <ArrowDownwardIcon/>
          </IconButton>
        </div>
    );
}
