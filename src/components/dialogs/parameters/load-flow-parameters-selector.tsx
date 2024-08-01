/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    SyntheticEvent,
    useCallback,
    useState,
} from 'react';

import { FormattedMessage } from 'react-intl';

import Grid from '@mui/material/Grid';
import { Box, Tab, Tabs } from '@mui/material';
import { TAB_VALUES } from './security-analysis/columns-definitions';
import { TabPanel, styles } from './parameters';
import { FlatParameters, mergeSx } from '@gridsuite/commons-ui';
import { LineSeparator } from '../dialogUtils';
import ParameterLineSlider from './widget/parameter-line-slider';
import { PARAM_LIMIT_REDUCTION } from 'utils/config-params';
import { ParameterGroup } from './widget';

const TAB_INFO = [
    { label: TAB_VALUES[TAB_VALUES.General] },
    { label: TAB_VALUES[TAB_VALUES.LimitReductions] },
];

const MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION = 50;

const alertThresholdMarks = [
    {
        value: MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION,
        label: MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION.toString(),
    },
    {
        value: 100,
        label: '100',
    },
];
const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    countries: 'Countries',
    double: 'Double',
};

// const BasicLoadFlowParameters = ({ lfParams, commitLFParameter }) => {
//     const defParams = {
//         transformerVoltageControlOn: {
//             type: TYPES.bool,
//             description: 'descLfTransformerVoltageControlOn',
//         },
//         phaseShifterRegulationOn: {
//             type: TYPES.bool,
//             description: 'descLfPhaseShifterRegulationOn',
//         },
//         dc: {
//             type: TYPES.bool,
//             description: 'descLfDC',
//         },
//         balanceType: {
//             type: TYPES.enum,
//             description: 'descLfBalanceType',
//             values: {
//                 PROPORTIONAL_TO_GENERATION_P: 'descLfBalanceTypeGenP',
//                 PROPORTIONAL_TO_GENERATION_P_MAX: 'descLfBalanceTypeGenPMax',
//                 PROPORTIONAL_TO_LOAD: 'descLfBalanceTypeLoad',
//                 PROPORTIONAL_TO_CONFORM_LOAD: 'descLfBalanceTypeConformLoad',
//             },
//         },
//         countriesToBalance: {
//             type: TYPES.countries,
//             description: 'descLfCountriesToBalance',
//         },
//         connectedComponentMode: {
//             type: TYPES.enum,
//             description: 'descLfConnectedComponentMode',
//             values: {
//                 MAIN: 'descLfConnectedComponentModeMain',
//                 ALL: 'descLfConnectedComponentModeAll',
//             },
//         },
//         hvdcAcEmulation: {
//             type: TYPES.bool,
//             description: 'descLfHvdcAcEmulation',
//         },
//     };

//     return makeComponentsFor(
//         defParams,
//         lfParams?.commonParameters || {},
//         lfParams,
//         commitLFParameter
//     );
// };

// const AdvancedLoadFlowParameters = ({ lfParams, commitLFParameter:any }) => {
//     const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

//     const defParams = {
//         voltageInitMode: {
//             type: TYPES.enum,
//             description: 'descLfVoltageInitMode',
//             values: {
//                 UNIFORM_VALUES: 'descLfUniformValues',
//                 PREVIOUS_VALUES: 'descLfPreviousValues',
//                 DC_VALUES: 'descLfDcValues',
//             },
//         },
//         useReactiveLimits: {
//             type: TYPES.bool,
//             description: 'descLfUseReactiveLimits',
//         },
//         twtSplitShuntAdmittance: {
//             type: TYPES.bool,
//             description: 'descLfTwtSplitShuntAdmittance',
//         },
//         readSlackBus: {
//             type: TYPES.bool,
//             description: 'descLfReadSlackBus',
//         },
//         writeSlackBus: {
//             type: TYPES.bool,
//             description: 'descLfWriteSlackBus',
//         },
//         distributedSlack: {
//             type: TYPES.bool,
//             description: 'descLfDistributedSlack',
//         },
//         shuntCompensatorVoltageControlOn: {
//             type: TYPES.bool,
//             description: 'descLfShuntCompensatorVoltageControlOn',
//         },
//         dcUseTransformerRatio: {
//             type: TYPES.bool,
//             description: 'descLfDcUseTransformerRatio',
//         },
//         dcPowerFactor: {
//             type: TYPES.double,
//             description: 'descLfDcPowerFactor',
//             gt: 0.0, // cosphi in ]0..1]
//             le: 1.0,
//         },
//     };

//     return (
//         <ParameterGroup
//             label={'showAdvancedParameters'}
//             state={showAdvancedLfParams}
//             onClick={setShowAdvancedLfParams}
//         >
//             {makeComponentsFor(
//                 defParams,
//                 lfParams?.commonParameters || {},
//                 lfParams,
//                 commitLFParameter
//             )}
//         </ParameterGroup>
//     );
// };

// const SpecificLoadFlowParameters = ({
//     disabled,
//     subText,
//     specificParamsDescription,
//     specificCurrentParams,
//     onSpecificParamChange,
// }) => {
//     const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);
//     const onChange = (paramName:any, value:any, isEdit:any) => {
//         if (isEdit) {
//             return;
//         }
//         onSpecificParamChange(paramName, value);
//     };
//     const onSpecificParamChange = (paramName:string, newValue:any) => {
//         const specificParamDescr = Object.values(
//             specificParamsDescrWithoutNanVals[provider]
//         ).find((descr) => descr.name === paramName);

//         let specParamsToSave;
//         if (specificParamDescr.defaultValue !== newValue) {
//             specParamsToSave = {
//                 ...specificCurrentParams,
//                 [provider]: {
//                     ...specificCurrentParams[provider],
//                     [specificParamDescr.name]: newValue,
//                 },
//             };
//         } else {
//             const { [specificParamDescr.name]: value, ...otherProviderParams } =
//                 specificCurrentParams[provider] || {};
//             specParamsToSave = {
//                 ...specificCurrentParams,
//                 [provider]: otherProviderParams,
//             };
//         }
//     return (
//         <ParameterGroup
//             state={showSpecificLfParams}
//             label={'showSpecificParameters'}
//             onClick={setShowSpecificLfParams}
//             unmountOnExit={false}
//             disabled={disabled}
//             infoText={subText}
//         >
//             <FlatParameters
//                 sx={styles.parameterName}
//                 paramsAsArray={specificParamsDescription ?? []}
//                 initValues={specificCurrentParams}
//                 onChange={onChange}
//             />
//         </ParameterGroup>
//     );
// };

// const LoadFlowParametersSelector: FunctionComponent<{
//     params: Record<string, any>;
//     updateParameters: (value: Record<string, any>) => void;
// }> = ({ params, updateParameters }) => {
//     const [tabValue, setTabValue] = useState(TAB_VALUES.General);
//     const handleTabChange = useCallback(
//         (event: SyntheticEvent, newValue: number) => {
//             setTabValue(newValue);
//         },
//         []
//     );

//     return (
//         <>
//             <Grid sx={{ width: '100%' }}>
//                 <Tabs value={tabValue} onChange={handleTabChange}>
//                     {TAB_INFO.map((tab, index) => (
//                         <Tab
//                             key={tab.label}
//                             label={<FormattedMessage id={tab.label} />}
//                             value={index}
//                             sx={{
//                                 fontSize: 17,
//                                 fontWeight: 'bold',
//                                 textTransform: 'capitalize',
//                             }}
//                         />
//                     ))}
//                 </Tabs>

//                 {TAB_INFO.map((tab, index) => (
//                     <TabPanel key={tab.label} value={tabValue} index={index}>
//                         {tabValue === TAB_VALUES.General && (
//                                                                 <Box
//                     sx={{
//                         flexGrow: 1,
//                         overflow: 'auto',
//                     }}
//                 >
//                     <Grid
//                         container
//                         sx={mergeSx(styles.scrollableGrid, {
//                             maxHeight: '100%',
//                         })}
//                         key="lfParameters"
//                     >
//                         <LineSeparator />
//                         <Grid container spacing={1} paddingTop={1}>
//                             <ParameterLineSlider
//                                 paramNameId={PARAM_LIMIT_REDUCTION}
//                                 label="LimitReduction"
//                                 marks={alertThresholdMarks}
//                                 minValue={MIN_VALUE_ALLOWED_FOR_LIMIT_REDUCTION}
//                             />
//                             <LineSeparator />
//                         </Grid>
//                         <BasicLoadFlowParameters
//                             lfParams={params || {}}
//                             commitLFParameter={updateParameters}
//                         />
//                         <AdvancedLoadFlowParameters
//                             lfParams={params || {}}
//                             commitLFParameter={updateParameters}
//                         />
//                         <SpecificLoadFlowParameters
//                             disabled={!specificParamsDescriptions?.[provider]}
//                             subText={provider}
//                             specificParamsDescription={
//                                 specificParamsDescrWithoutNanVals[provider]
//                             }
//                             specificCurrentParams={
//                                 specificCurrentParams[provider]
//                             }
//                             onSpecificParamChange={onSpecificParamChange}
//                         />
//                     </Grid>
//                 </Box> 

//                         )}
//                         {tabValue === TAB_VALUES.LimitReductions && (
//                             <p>cc</p>
//                         )}
//                     </TabPanel>
//                 ))}
//             </Grid>
//         </>
//     );
// };

// export default LoadFlowParametersSelector;
