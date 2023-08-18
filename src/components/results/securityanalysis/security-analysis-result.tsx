import React, { FunctionComponent } from 'react';
import {
    PreContingencyResult,
    SecurityAnalysisResult,
    SecurityAnalysisResultProps,
} from './security-analysis.type';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage, useIntl } from 'react-intl';
import { NMK_TYPE_RESULT } from '../../security-analysis-result';
import { useTheme } from '@mui/styles';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { SecurityAnalysisTableN } from './security-analysis-result-tableN';
import { ReduxState } from '../../../redux/reducer.type';
import makeStyles from '@mui/styles/makeStyles';
import { GridStudyTheme } from '../../app-wrapper.type';
import { SecurityAnalysisResultTableNmKContingencies } from './security-analysis-result-tableNmKContingencies';
const useStyles = makeStyles<GridStudyTheme>((theme) => ({
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
export const SecurityAnalusisResult: FunctionComponent<
    SecurityAnalysisResultProps
> = ({ result, onClickNmKConstraint }) => {
    console.log(' result final: ', result);
    const classes = useStyles();
    const theme: GridStudyTheme = useTheme();

    const [tabIndex, setTabIndex] = React.useState(0);

    const [nmkTypeResult, setNmkTypeResult] = React.useState(
        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
    );

    const intl = useIntl();

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
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
                        <SecurityAnalysisResultTableNmKContingencies
                            postContingencyResults={
                                result?.postContingencyResults
                            }
                            onClickNmKConstraint={onClickNmKConstraint}
                        />
                    )}
            </div>
        </>
    );
};
