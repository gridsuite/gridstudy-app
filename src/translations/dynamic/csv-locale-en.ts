/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const csv_locale_en = {
    // Used in the tabular creation and modification
    'TabularCreationSkeletonComment.GENERATOR':
        '#,,HYDRO | NUCLEAR | WIND | THERMAL | SOLAR | OTHER,,,true | false,,TOP | BOTTOM | UNDEFINED,,,,,,,,,true | false,required if voltageRegulationOn is true,,LINE | TWO_WINDINGS_TRANSFORMER | GENERATOR | LOAD | BATTERY | SHUNT_COMPENSATOR | STATIC_VAR_COMPENSATOR | DANGLING_LINE | HVDC_CONVERTER_STATION,,,true | false,required if frequencyRegulation is true,,,,,,,',
    'TabularModificationSkeletonComment.GENERATOR':
        '#,HYDRO | NUCLEAR | WIND | THERMAL | SOLAR | OTHER,,,,,,true | false,,true | false,,,,,,',
    'TabularModificationSkeletonComment.LOAD': '#,AUXILIARY | FICTITIOUS,,,true | false',
    'TabularModificationSkeletonComment.SUBSTATION':
        '#,2-letter code from ISO 3166-1 standard (FR ES PT IT CH DE BE LU NL GB ...)',
    'TabularModificationSkeletonComment.SHUNT_COMPENSATOR':
        '#For each shunt compensator it is possible to modify either the maximum reactive power (and the type) or the maximum susceptance. In case of conflicting input the maximum susceptance will be ignored.,,,REACTOR | CAPACITOR,,,true | false',
};

export default csv_locale_en;
