/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type CreateVoltageLevelSectionDialogSchemaForm = {
    busbarIndex: { id: string };
    busbarSectionId: { id: string };
    isAfterBusBarSectionId: string | null;
    switchesBeforeSections?: string | null;
    switchesAfterSections?: string | null;
    allBusbarSections?: boolean;
    newSwitchStates?: boolean;
};

export type BusBarSections = Record<string, string[]>;
