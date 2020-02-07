/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Network from './network';

const substations = [
    {
        "id": "S1",
        "voltageLevels": [
            {
                "id": "S1_7",
                "nominalVoltage": 380
            },
            {
                "id": "S1_6",
                "nominalVoltage": 225
            }
        ]
    },
    {
        "id": "S2",
        "voltageLevels": [
            {
                "id": "S2_6",
                "nominalVoltage": 225
            }
        ]
    }
]

test('network', () => {
    const network = new Network();
    network.setSubstations(substations);
    expect(network.substations).toHaveLength(2);
    expect(network.substations[0].id).toEqual("S1");
    expect(network.substations[1].id).toEqual("S2");
    expect(network.substations[0].voltageLevels[0].id).toEqual("S1_6");
    expect(network.substations[0].voltageLevels[1].id).toEqual("S1_7");
    expect(network.getVoltageLevel("S1_7")).not.toBeNull();
    expect(network.voltageLevelsByNominalVoltage.get(225)).toHaveLength(2);
});
