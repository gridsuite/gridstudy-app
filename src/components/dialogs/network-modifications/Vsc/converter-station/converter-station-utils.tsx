import { string } from 'yup';
import yup from '../../../../utils/yup-config';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    ID,
    LOSS_FACTOR,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER,
    VOLTAGE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_ON,
} from '../../../../utils/field-constants';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../../network/constants';
import { sanitizeString } from '../../../dialogUtils';

export function getVscConverterStationSchema(id: string) {
    return {
        [id]: yup.object().shape({
            [CONVERTER_STATION_ID]: yup.string().nullable().required(),
            [CONVERTER_STATION_NAME]: yup.string().nullable(),
            [LOSS_FACTOR]: yup.number().nullable(),
            [REACTIVE_POWER]: yup.number().nullable(),
            [VOLTAGE_REGULATION]: yup.boolean(),
            [VOLTAGE]: yup.number().nullable(),
            ...getConnectivityWithPositionValidationSchema(),
            ...getReactiveLimitsSchema({}),
        }),
    };
}

export function getVscConverterStationEmptyFormData(id: string) {
    return {
        [id]: {
            [CONVERTER_STATION_ID]: null,
            [CONVERTER_STATION_NAME]: null,
            [LOSS_FACTOR]: null,
            [REACTIVE_POWER]: null,
            [VOLTAGE_REGULATION]: null,
            [VOLTAGE]: null,
            ...getConnectivityWithPositionEmptyFormData(),
            ...getReactiveLimitsEmptyFormData(),
        },
    };
}

export function getConverterStationCreationData(converterStation: any) {
    const reactiveLimits = converterStation[REACTIVE_LIMITS];
    const isReactiveCapabilityCurveOn =
        reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
    return {
        equipmentId: converterStation[CONVERTER_STATION_ID],
        equipmentName: converterStation[CONVERTER_STATION_NAME],
        lossFactor: converterStation[LOSS_FACTOR],
        reactivePower: converterStation[REACTIVE_POWER],
        voltageRegulationOn: converterStation[VOLTAGE_REGULATION_ON],
        voltage: converterStation[VOLTAGE],
        voltageLevelId: converterStation[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
        busOrBusbarSectionId:
            converterStation[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
        connectionName: sanitizeString(
            converterStation[CONNECTIVITY]?.[CONNECTION_NAME]
        ),
        connectionDirection:
            converterStation[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
            UNDEFINED_CONNECTION_DIRECTION,
        connectionPosition:
            converterStation[CONNECTIVITY]?.[CONNECTION_POSITION],
        reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
        minimumReactivePower: isReactiveCapabilityCurveOn
            ? null
            : reactiveLimits[MINIMUM_REACTIVE_POWER],
        maximumReactivePower: isReactiveCapabilityCurveOn
            ? null
            : reactiveLimits[MAXIMUM_REACTIVE_POWER],
        reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
            ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
            : null,
    };
}
