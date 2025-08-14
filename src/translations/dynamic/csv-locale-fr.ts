/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const csv_locale_fr = {
    // Used in the tabular creation and modification
    'TabularCreationSkeletonComment.GENERATOR':
        '#;;HYDRO | NUCLEAR | WIND | THERMAL | SOLAR | OTHER;;;true | false;;TOP | BOTTOM;;;;;;;true | false;;;;;;;;;;;;true | false;required if voltageRegulationOn is true;;LINE | TWO_WINDINGS_TRANSFORMER | GENERATOR | LOAD | BATTERY | SHUNT_COMPENSATOR | STATIC_VAR_COMPENSATOR | DANGLING_LINE | HVDC_CONVERTER_STATION;;;true | false;;;;;;;',
    'TabularCreationSkeletonComment.BATTERY':
        '#;;;;true | false;;TOP | BOTTOM;;;;;;true | false;;;;;;;;;;;;true | false;',
    'TabularCreationSkeletonComment.LOAD': '#;;AUXILIARY | FICTITIOUS | UNDEFINED;;;true | false;;TOP | BOTTOM;;;',
    'TabularModificationSkeletonComment.GENERATOR':
        '#;;HYDRO | NUCLEAR | WIND | THERMAL | SOLAR | OTHER;true | false;;TOP | BOTTOM;;;;;;;true | false;;;;;;;;;;;;true | false;;;LINE | TWO_WINDINGS_TRANSFORMER | GENERATOR | LOAD | BATTERY | SHUNT_COMPENSATOR | STATIC_VAR_COMPENSATOR | DANGLING_LINE | HVDC_CONVERTER_STATION;;;true | false;;;;;;;',
    'TabularModificationSkeletonComment.BATTERY':
        '#;;true | false;;TOP | BOTTOM;;;;;;true | false;;;;;;;;;;;;true | false;',
    'TabularModificationSkeletonComment.LOAD': '#;;AUXILIARY | FICTITIOUS | UNDEFINED;true | false;;TOP | BOTTOM;;;',
    'TabularModificationSkeletonComment.LINE': '#;;;;;;;;true | false;;TOP | BOTTOM;;true | false;;TOP | BOTTOM;',
    'TabularModificationSkeletonComment.TWO_WINDINGS_TRANSFORMER':
        '#;;;;;;;;;true | false;;TOP | BOTTOM;;true | false;;TOP | BOTTOM;;true | false;SIDE1 | SIDE2',
    'TabularModificationSkeletonComment.SUBSTATION':
        '#;;Code à 2 lettres de la norme ISO 3166-1 (FR ES PT IT CH DE BE LU NL GB ...)',
    'TabularCreationSkeletonComment.SHUNT_COMPENSATOR':
        '#Pour chaque MCS il est possible de modifier soit la puissance réactive installée (et le type) soit la susceptance installée. En cas de conflit la susceptance installée sera ignorée.;;;;true | false;;TOP | BOTTOM;;;;REACTOR | CAPACITOR | requis si maxQAtNominalV est défini;;',
    'TabularModificationSkeletonComment.SHUNT_COMPENSATOR':
        '#Pour chaque MCS il est possible de modifier soit la puissance réactive installée (et le type) soit la susceptance installée. En cas de conflit la susceptance installée sera ignorée.;;true | false;;TOP | BOTTOM;;;;REACTOR | CAPACITOR;;',
    TabularLimitSetsModificationSkeletonComment:
        '#;ONE | TWO;;true | false;;ADD | MODIFY | REPLACE;ADD | MODIFY | DELETE | REPLACE pris en compte uniquement lorsque modificationType est défini à MODIFY',
};

export default csv_locale_fr;
