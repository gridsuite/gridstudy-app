/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { SecurityAnalysisResultProps } from './security-analysis.type';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage } from 'react-intl';

import { SecurityAnalysisTableN } from './security-analysis-result-tableN';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import { SecurityAnalysisResultTableNmK } from './security-analysis-result-tableNmK';
import { NMK_TYPE_RESULT } from './security-analysis-result-utils';
const useStyles = makeStyles<Theme>((theme) => ({
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    nmkResultSelect: {
        position: 'absolute',
        right: theme.spacing(2),
    },
    button: {
        color: theme.link.color,
    },
}));
export const SecurityAnalysisResult: FunctionComponent<
    SecurityAnalysisResultProps
> = ({ result, onClickNmKConstraint }) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);

    const [nmkTypeResult, setNmkTypeResult] = React.useState(
        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
    );

    const switchNmkTypeResult = () => {
        setNmkTypeResult(
            nmkTypeResult === NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    return (
        <>
            <div className={classes.container}>
                <div className={classes.tabs}>
                    <Tabs
                        value={tabIndex}
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
                    >
                        <Tab label="N" />
                        <Tab label="N-K" />
                    </Tabs>
                </div>

                {tabIndex === 1 && (
                    <div className={classes.nmkResultSelect}>
                        <Select
                            labelId="nmk-type-result-label"
                            value={nmkTypeResult}
                            onChange={switchNmkTypeResult}
                            autoWidth={true}
                            size="small"
                        >
                            <MenuItem
                                value={
                                    NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                                }
                            >
                                <FormattedMessage id="ConstraintsFromContingencies" />
                            </MenuItem>
                            <MenuItem
                                value={
                                    NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                                }
                            >
                                <FormattedMessage id="ContingenciesFromConstraints" />
                            </MenuItem>
                        </Select>
                    </div>
                )}
            </div>
            <div style={{ flexGrow: 1 }}>
                {tabIndex === 0 && (
                    <SecurityAnalysisTableN
                        limitViolationsResult={
                            result?.preContingencyResult?.limitViolationsResult
                        }
                    />
                )}
                {tabIndex === 1 &&
                    nmkTypeResult ===
                        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES && (
                        <SecurityAnalysisResultTableNmK
                            postContingencyResults={
                                result?.postContingencyResults
                            }
                            onClickNmKConstraint={onClickNmKConstraint}
                            nmkTypeResult={
                                NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                            }
                        />
                    )}

                {tabIndex === 1 &&
                    nmkTypeResult ===
                        NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS && (
                        <SecurityAnalysisResultTableNmK
                            postContingencyResults={
                                result?.postContingencyResults
                            }
                            onClickNmKConstraint={onClickNmKConstraint}
                            nmkTypeResult={
                                NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                            }
                        />
                    )}
            </div>
        </>
    );
};
