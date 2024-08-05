/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { OptionalServicesNames, OptionalServicesStatus } from '../components/utils/optional-services';

export const useOptionalServiceStatus = (serviceName: OptionalServicesNames): OptionalServicesStatus | undefined => {
    const optionalServices = useSelector((state: AppState) => state.optionalServices);
    const optionalService = optionalServices?.find((service) => service.name === serviceName);
    return optionalService?.status;
};
