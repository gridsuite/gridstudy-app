/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentInfos } from '@gridsuite/commons-ui';

interface Identifier {
    type: string;
    contingencyId: string;
    identifierList: { type: string; identifier: string }[];
}

interface IdentifierContingencyList {
    type: string;
    version: string;
    name: string;
    identifiers: Identifier[];
}

export interface ContingencyList {
    identifierContingencyList: IdentifierContingencyList;
    type: string;
}

function createIdentifiersList(selectedEquipments: EquipmentInfos[]) {
    const identifierLists = selectedEquipments.map((eq) => {
        return {
            type: 'LIST',
            contingencyId: eq.name ? eq.name : eq.id,
            identifierList: [
                {
                    type: 'ID_BASED',
                    identifier: eq.id,
                },
            ],
        };
    });
    return identifierLists;
}

export function createIdentifierContingencyList(contingencyListName: string, equipmentList: EquipmentInfos[]) {
    const identifiersList = createIdentifiersList(equipmentList);
    return {
        identifierContingencyList: {
            type: 'identifier',
            version: '1.2',
            name: contingencyListName,
            identifiers: identifiersList,
        },
        type: 'IDENTIFIERS',
    };
}
