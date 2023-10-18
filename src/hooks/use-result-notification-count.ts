/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';

export const useResultNotificationCount = () => {
    const loadflowNotif = useSelector(
        (state: ReduxState) => state.loadflowNotif
    );

    const saNotif = useSelector((state: ReduxState) => state.saNotif);

    const sensiNotif = useSelector((state: ReduxState) => state.sensiNotif);

    const allBusesshortCircuitNotif = useSelector(
        (state: ReduxState) => state.allBusesShortCircuitNotif
    );

    const oneBusShortCircuitNotif = useSelector(
        (state: ReduxState) => state.oneBusShortCircuitNotif
    );

    const voltageInitNotif = useSelector(
        (state: ReduxState) => state.voltageInitNotif
    );

    const dynamicSimulationNotif = useSelector(
        (state: ReduxState) => state.dynamicSimulationNotif
    );

    return [
        loadflowNotif,
        saNotif,
        sensiNotif,
        allBusesshortCircuitNotif,
        oneBusShortCircuitNotif,
        voltageInitNotif,
        dynamicSimulationNotif,
    ].filter(Boolean).length;
};
