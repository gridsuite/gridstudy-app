/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import GridSection from '../../../commons/grid-section';
import { BranchActiveReactivePowerMeasurementsFormProps } from './measurement.type';
import { PowerMeasurementsForm } from './power-measurements-form';
import { type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    h3: {
        marginTop: 0,
        marginBottom: 0,
    },
} as const satisfies MuiStyles;

const BranchActiveReactivePowerMeasurementsForm: FunctionComponent<BranchActiveReactivePowerMeasurementsFormProps> = ({
    equipmentToModify,
}) => {
    return (
        <>
            <GridSection title="MeasurementsSection" customStyle={styles.h3} />
            <GridSection title="Side1" heading={4} />
            <PowerMeasurementsForm
                side={1}
                activePowerMeasurement={equipmentToModify?.measurementP1}
                reactivePowerMeasurement={equipmentToModify?.measurementQ1}
            />
            <GridSection title="Side2" heading={4} />
            <PowerMeasurementsForm
                side={2}
                activePowerMeasurement={equipmentToModify?.measurementP2}
                reactivePowerMeasurement={equipmentToModify?.measurementQ2}
            />
        </>
    );
};

export default BranchActiveReactivePowerMeasurementsForm;
