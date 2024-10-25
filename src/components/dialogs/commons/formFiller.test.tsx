import { RenderBuilder } from '@gridsuite/commons-ui';
import { createTheme, ThemeOptions } from '@mui/material';
import { FormFiller } from './formFiller';

const renderBuilder = new RenderBuilder().withTheme(
    createTheme({
        formFiller: {
            background: '#e6e6e6',
        },
    } as ThemeOptions)
);

describe('FormFiller', () => {
    it('should render the form filler component', () => {
        const { getByTestId } = renderBuilder.render(<FormFiller lineHeight={undefined}>test</FormFiller>);
        const formFiller = getByTestId('FormFiller');
        expect(formFiller).toBeDefined();
    });
});
