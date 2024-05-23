/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fetchAppsAndUrls } from '@gridsuite/commons-ui';
import { PredefinedProperties } from 'components/dialogs/network-modifications/common/properties/property-utils';

export interface Metadata {
    name: string;
    url: string;
    appColor: string;
    hiddenInAppsMenu: boolean;
    resources: unknown;
}

export interface StudyMetadata extends Metadata {
    name: 'Study';
    predefinedEquipmentProperties: {
        [networkElementType: string]: PredefinedProperties;
    };
    defaultCountry?: string;
}

const isStudyMetadata = (metadata: Metadata): metadata is StudyMetadata => {
    return metadata.name === 'Study';
};

export function fetchStudyMetadata() {
    console.info(`Fetching study metadata...`);
    return fetchAppsAndUrls().then((res: [Metadata]) => {
        const studyMetadata = res.filter(isStudyMetadata);
        if (!studyMetadata) {
            return Promise.reject('Study entry could not be found in metadata');
        }
        return studyMetadata[0]; // There should be only one study metadata
    });
}
