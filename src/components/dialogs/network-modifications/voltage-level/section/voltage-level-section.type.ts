/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type CreateVoltageLevelSectionDialogSchemaForm = {
    busbarCount: string | null;
    busbarSectionId: string | null;
    switchesBeforeSections: string | null;
    switchesAfterSections: string | null;
    newSwitchStates?: boolean;
    isAfterBusBarSectionId?: boolean;
    busbarSections: number | null;
};

export type SectionInfo = {
    id: string;
    vertPos: number;
};

export type BusBarSectionInfos = {
    [key: `horizPos:${string}`]: SectionInfo[];
};
