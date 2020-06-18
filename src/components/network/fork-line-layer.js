/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LineLayer} from "deck.gl";
import ArrowLayer from "./layers/arrow-layer";


const defaultProps = {
    getParallelIndex: {type: 'accessor', value: 0},
    getLineAngle: {type: 'accessor', value: 0},
    getDistanceBetweenLines: {type: 'accessor', value: 1000.},
    getMaxParallelOffset: {type: 'accessor', value: 1.},
    getPinParallelOffset: {type: 'accessor', value: 50.}
};

export class ForkLineLayer extends LineLayer {

    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = {
            'vs:#decl': `\
attribute float instanceOffsets;
attribute float angleLine;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;
`,

            'float segmentIndex = positions.x': `;

      float offsetPixels = clamp(project_pixel_size(distanceBetweenLines), minParallelOffset, maxParallelOffset);
      vec4 trans = project_common_position_to_clipspace(vec4(-cos(angleLine), sin(angleLine),0,0) * instanceOffsets) * project_size_to_pixel(offsetPixels);
      target = source + trans;      
            `
        };
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceOffsets: {
                size: 1,
                accessor: 'getParallelIndex'
            },
            angleLine: {
                size: 1,
                accessor: 'getAngle'
            }
        });
    }

    draw({uniforms}) {
        super.draw({
            uniforms:
                {
                    ...uniforms,
                    distanceBetweenLines: this.props.getDistanceBetweenLines(),
                    maxParallelOffset: this.props.getMaxParallelOffset(),
                    minParallelOffset: this.props.getMinParallelOffset()
                }
        })
    }
}

ArrowLayer.layerName = 'ForkLineLayer';
ArrowLayer.defaultProps = defaultProps;
