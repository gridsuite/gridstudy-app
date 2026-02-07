/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Identifiable, yupConfig as yup, type MuiStyles, type UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { ReactiveCapabilityCurvePoints } from 'components/dialogs/reactive-limits/reactive-limits.type';
import { SHUNT_COMPENSATOR_TYPES } from 'components/network/constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    MAX_Q_AT_NOMINAL_V,
    REACTIVE_CAPABILITY_CURVE,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_POINTS,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
} from 'components/utils/field-constants';
import { mapTwtDataForTable } from 'utils/spreadsheet-equipments-mapper';

export const styles = {
    dialogContent: {
        minWidth: '40vw',
        paddingTop: 2,
    },
    switchRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 1,
    },
    filterSelector: {
        marginLeft: 6,
        flex: 1,
    },
    columnsContainer: {
        marginLeft: 4,
        paddingLeft: 2,
        maxHeight: 300,
        overflowY: 'auto',
    },
    selectAllLabel: {
        fontWeight: 'bold',
    },
} as const satisfies MuiStyles;

export const RESTRICT_BY_FILTER = 'restrictByFilter';
export const SELECTED_FILTERS = 'selectedFilters';
export const USE_CURRENT_GRID_STATE = 'useCurrentGridState';
export const SELECTED_COLUMN_GROUPS = 'selectedColumnGroups';

export interface PrefilledModelFormType {
    [RESTRICT_BY_FILTER]: boolean;
    [SELECTED_FILTERS]: { id: string; name: string }[];
    [USE_CURRENT_GRID_STATE]: boolean;
    [SELECTED_COLUMN_GROUPS]: string[];
}

export const getPrefilledModelSchema = () => {
    return yup.object().shape({
        [RESTRICT_BY_FILTER]: yup.boolean().required(),
        [SELECTED_FILTERS]: yup
            .array()
            .of(
                yup.object().shape({
                    id: yup.string().required(),
                    name: yup.string().required(),
                })
            )
            .default([])
            .when(RESTRICT_BY_FILTER, {
                is: true,
                then: (schema) => schema.min(1, 'FieldIsRequired'),
                otherwise: (schema) => schema,
            }),
        [USE_CURRENT_GRID_STATE]: yup.boolean().required(),
        [SELECTED_COLUMN_GROUPS]: yup
            .array()
            .of(yup.string().required())
            .default([])
            .when(USE_CURRENT_GRID_STATE, {
                is: true,
                then: (schema) => schema.min(1, 'ColumnSelectionRequired'),
                otherwise: (schema) => schema,
            }),
    });
};

export const emptyFormData: PrefilledModelFormType = {
    [RESTRICT_BY_FILTER]: true,
    [SELECTED_FILTERS]: [],
    [USE_CURRENT_GRID_STATE]: false,
    [SELECTED_COLUMN_GROUPS]: [],
};

export interface GeneratePrefilledModelDialogProps {
    open: UseStateBooleanReturn;
    equipmentType: EQUIPMENT_TYPES;
    onGenerate: (params: PrefilledModelGenerationParams) => void;
}

export interface PrefilledModelGenerationParams {
    restrictByFilter: boolean;
    filterIds: string[];
    useCurrentGridState: boolean;
    selectedColumnGroups: string[];
}

/**
 * Converts the backend representation of reactive capability curve points to the frontend format.
 *
 * @param equipment - The equipment object containing reactive capability curve points from the backend.
 * @returns The equipment object with frontend-compatible reactive capability curve fields.
 */
export const mapReactiveCapabilityCurvePointsToFormFields = (equipment: Record<string, any>) => {
    let formattedEquipment = { ...equipment };
    if (!(REACTIVE_CAPABILITY_CURVE_POINTS in formattedEquipment)) {
        formattedEquipment[REACTIVE_CAPABILITY_CURVE] = false;
        return formattedEquipment;
    }
    const pointsFromBack = formattedEquipment[REACTIVE_CAPABILITY_CURVE_POINTS] as ReactiveCapabilityCurvePoints[];
    const curvePoint1 = pointsFromBack[0];

    if (curvePoint1) {
        formattedEquipment = {
            ...formattedEquipment,
            [REACTIVE_CAPABILITY_CURVE]: true,
            [REACTIVE_CAPABILITY_CURVE_P_MIN]: curvePoint1.p,
            [REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN]: curvePoint1.maxQ,
            [REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN]: curvePoint1.minQ,
        };
    }
    const curvePoint2 = pointsFromBack[1];
    const curvePoint3 = pointsFromBack[2];
    if (curvePoint2) {
        if (!curvePoint3) {
            formattedEquipment = {
                ...formattedEquipment,
                [REACTIVE_CAPABILITY_CURVE_P_MAX]: curvePoint2.p,
                [REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX]: curvePoint2.maxQ,
                [REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX]: curvePoint2.minQ,
            };
            return formattedEquipment;
        }
        formattedEquipment = {
            ...formattedEquipment,
            [REACTIVE_CAPABILITY_CURVE_P_0]: curvePoint2.p,
            [REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0]: curvePoint2.maxQ,
            [REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0]: curvePoint2.minQ,
        };
    }
    if (curvePoint3) {
        formattedEquipment = {
            ...formattedEquipment,
            [REACTIVE_CAPABILITY_CURVE_P_MAX]: curvePoint3.p,
            [REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX]: curvePoint3.maxQ,
            [REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX]: curvePoint3.minQ,
        };
    }

    return formattedEquipment;
};

export const mapShuntCompensatorToFormFields = (shuntCompensator: Record<string, any>) => {
    const formattedCompensator = { ...shuntCompensator };

    if (formattedCompensator.type === undefined) {
        formattedCompensator.type =
            formattedCompensator.maxSusceptance > 0
                ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                : SHUNT_COMPENSATOR_TYPES.REACTOR.id;
    }

    return {
        ...formattedCompensator,
        [MAX_Q_AT_NOMINAL_V]:
            Number(formattedCompensator.qatNominalV) * Number(formattedCompensator.maximumSectionCount),
    };
};

export const mapPrefilledEquipments = (equipmentType: EQUIPMENT_TYPES, equipments: Identifiable[]) => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return equipments.map(mapTwtDataForTable);
        case EQUIPMENT_TYPES.GENERATOR:
            return equipments.map((eq) => mapReactiveCapabilityCurvePointsToFormFields(eq));
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return equipments.map(mapShuntCompensatorToFormFields);
        case EQUIPMENT_TYPES.BATTERY:
            return equipments.map(mapReactiveCapabilityCurvePointsToFormFields);
        default:
            return equipments;
    }
};
