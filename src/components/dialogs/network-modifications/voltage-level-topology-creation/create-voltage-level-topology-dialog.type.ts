/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SECTION_COUNT, SWITCH_KINDS, SWITCHES_BETWEEN_SECTIONS } from '../../../utils/field-constants';

export type CreateVoltageLevelTopologyDialogSchemaForm = {
    [SECTION_COUNT]?: number | null;
    [SWITCH_KINDS]?: { switchKind: string }[] | null;
    [SWITCHES_BETWEEN_SECTIONS]?: string | null;
};
