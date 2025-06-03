/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from '../../../utils/field-constants';

export type CreateCouplingDeviceDialogSchemaForm = {
    [BUS_BAR_SECTION_ID1]: { id: string | null; label: string | null };
    [BUS_BAR_SECTION_ID2]: { id: string | null; label: string | null };
};
