/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import type { UUID } from 'node:crypto';

export interface PccMinResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    singlePccMinResultInfos: SinglePccMinResultInfos[];
}
export interface SinglePccMinResultInfos {
    singlePccMinResultUuid: string;
    busId: String;
    pccMinTri: number;
    limitingEquipment: String;
    x: number;
    r: number;
}

export interface PccMinTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface PccMinResultTableProps {
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    tableName: string;
}

export interface PccMinResultStatusProps {
    result: PccMinResult;
}

export interface PccMinResultProps extends PccMinResultTableProps, PccMinResultStatusProps {}
