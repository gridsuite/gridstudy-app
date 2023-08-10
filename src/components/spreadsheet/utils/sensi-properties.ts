import { ICellRendererParams } from 'ag-grid-community';

interface LinesType {
    [key: string]: string;
}
export class SensiProperties {
    private eGui: HTMLElement | null = null;
    init(params: ICellRendererParams) {
        const lines: LinesType = params?.value;

        if (lines && Object.keys(lines).length) {
            this.eGui = document.createElement('div');

            // Get the first two properties
            const properties = Object.keys(lines).slice(0, 2);

            // Generate HTML for each property
            const htmlParts = properties.map(
                (property) =>
                    `<div style="height: 28px;">
                    <span>${property} :</span>
                    <span>${lines[property]}</span>
                </div>`
            );

            this.eGui.innerHTML = htmlParts.join('');
        }
    }
    getGui() {
        return this.eGui;
    }
}
