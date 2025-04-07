/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DndColumnType } from '../../../utils/dnd-table/dnd-table.type';

export const TwoWindingsTransformerCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    RATIO_TAP_TAB: 2,
    PHASE_TAP_TAB: 3,
};

export const TwoWindingsTransformerModificationDialogTab = {
    CONNECTIVITY_TAB: 0,
    CHARACTERISTICS_TAB: 1,
    LIMITS_TAB: 2,
    STATE_ESTIMATION_TAB: 3,
    RATIO_TAP_TAB: 4,
    PHASE_TAP_TAB: 5,
};

export type IColomn =
    | {
          label: string;
          dataKey: string;
          type: DndColumnType;
          initialValue?: undefined;
          editable?: undefined;
          clearable?: undefined;
      }
    | {
          label: string;
          dataKey: string;
          initialValue: number;
          editable: boolean;
          type: DndColumnType;
          clearable: boolean;
      };
