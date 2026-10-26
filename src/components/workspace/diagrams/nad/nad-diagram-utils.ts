/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { DiagramSvg, NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';

export const isFilterDeleted = ({
    filterUuid,
    deletedFilterUuid,
}: Pick<NetworkAreaDiagram, 'filterUuid' | 'deletedFilterUuid'>) => !!filterUuid && filterUuid === deletedFilterUuid;

export const getActiveFilterUuid = (diagram: Pick<NetworkAreaDiagram, 'filterUuid' | 'deletedFilterUuid'>) =>
    isFilterDeleted(diagram) ? undefined : diagram.filterUuid;

export const getSvgVoltageLevelIds = (svg: DiagramSvg | null) =>
    svg?.additionalMetadata?.voltageLevels.map((vl) => vl.id) ?? [];

// Its own voltage levels, or with an active filter those its filter matches on the current node
export const getShownVoltageLevelIds = (
    diagram: Pick<NetworkAreaDiagram, 'svg' | 'voltageLevelIds' | 'filterUuid' | 'deletedFilterUuid'>
) => (getActiveFilterUuid(diagram) ? getSvgVoltageLevelIds(diagram.svg) : diagram.voltageLevelIds);
