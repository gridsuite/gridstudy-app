import { FlatParameters } from '@gridsuite/commons-ui';
import { makeStyles } from '@mui/styles';
import { GridStudyTheme } from 'components/app-wrapper.type';
import { FunctionComponent, useCallback, useState } from 'react';
import { AdvancedParameterButton } from './advanced-parameter-button';
import { CaseImportParameters } from 'services/network-conversion';
import { Divider } from '@mui/material';

export interface ImportParametersProps {
    formatWithParameters: CaseImportParameters[];
    currentParameters: Record<string, any>;
    onChange: (paramName: string, value: any, isEdit: boolean) => void;
}

const useStyles = makeStyles<GridStudyTheme>((theme) => ({
    paramDivider: {
        marginTop: theme.spacing(2),
    },
}));

export const ImportParameters: FunctionComponent<ImportParametersProps> = (
    props
) => {
    const { formatWithParameters, onChange, currentParameters } = props;
    const classes = useStyles();

    const [areParamsDisplayed, setAreParamsDisplayed] = useState(false);

    const handleShowParametersForCaseFileClick = useCallback(() => {
        setAreParamsDisplayed((oldValue) => !oldValue);
    }, []);

    return (
        <>
            <Divider className={classes.paramDivider} />
            <div
                style={{
                    marginTop: '10px',
                }}
            >
                <AdvancedParameterButton
                    showOpenIcon={areParamsDisplayed}
                    label={'importParameters'}
                    callback={handleShowParametersForCaseFileClick}
                    disabled={formatWithParameters.length === 0}
                />
                {areParamsDisplayed && (
                    <FlatParameters
                        paramsAsArray={formatWithParameters}
                        initValues={currentParameters}
                        onChange={onChange}
                        variant="standard"
                    />
                )}
            </div>
        </>
    );
};
