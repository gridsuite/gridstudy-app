/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DataType, FieldType } from '@gridsuite/commons-ui';

// TODO this file is duplicated from the gridexplore-app => to be merged when merging two projects
export enum OperatorType {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    LOWER = 'LOWER',
    LOWER_OR_EQUALS = 'LOWER_OR_EQUALS',
    GREATER = 'GREATER',
    GREATER_OR_EQUALS = 'GREATER_OR_EQUALS',
    IS = 'IS',
    CONTAINS = 'CONTAINS',
    BEGINS_WITH = 'BEGINS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    EXISTS = 'EXISTS',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    IS_PART_OF = 'IS_PART_OF',
}

export enum CombinatorType {
    AND = 'AND',
    OR = 'OR',
}

export interface RuleTypeExport {
    field: FieldType;
    operator: OperatorType;
    value: string | number;
    dataType: DataType;
}

export interface RuleGroupTypeExport {
    combinator: CombinatorType;
    dataType: DataType;
    rules: (RuleTypeExport | RuleGroupTypeExport)[];
}
