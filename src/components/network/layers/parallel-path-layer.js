/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {PathLayer} from "deck.gl";
import GL from '@luma.gl/constants';

const defaultProps = {
    getParallelAttribsOffsetAngleOrigin: {type: 'accessor', value: [0, 0, 1000]},
    getDistanceBetweenLines: {type: 'accessor', value: 1000},
    getMaxParallelOffset: {type: 'accessor', value: 1},
    getMinParallelOffset: {type: 'accessor', value: 50}
};

/**
 * A layer based on PathLayer allowing to shift path by an offset + angle
 * props : parallelAttribsOffsetAngle : [lineParallelIndex, lineAngle]
 *         distanceBetweenLines
 *         maxParallelOffset
 *         minParallelOffset
 *
 * Note: the  parallelAttribsOffsetAngle are packed together in a single attribute to
 * workaround the low limit of the number of vertex attrbutes (16 on most platforms).
 * The PathLayer that this class extends already uses 13 attributes (14 with the dash extension),
 * so this leaves us with only 2 attribute slots.
 * Note2: packing the attributes together, in addition to not beeing very readable, also has the downside
 * that you can't update one attribute and reconstruct only its buffer, so it hurts performance in this case.
 */
export default class ParallelPathLayer extends PathLayer {

    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = Object.assign({}, shaders.inject, {
            'vs:#decl': shaders.inject['vs:#decl'] + `\
attribute vec3 parallelAttribsOffsetAngleOrigin;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;
`,
            'vs:#main-end': shaders.inject['vs:#main-end'] + `\
float instanceOffsets = parallelAttribsOffsetAngleOrigin.x;
float angleLine = parallelAttribsOffsetAngleOrigin.y;

if ( abs(instanceOffsets) == 9999. ) return;

float offsetPixels = clamp(project_size_to_pixel( distanceBetweenLines), minParallelOffset, maxParallelOffset );
float offsetCommonSpace = project_pixel_size(offsetPixels);
float radius = 6.1;
float angleMove = angleLine ;
vec4 trans = vec4(cos(angleMove), -sin(angleMove ), 0, 0.) * instanceOffsets ;

bool isSegmentEnd = isEnd > EPSILON;
bool isFirstSegment = (instanceTypes == 1.0 || instanceTypes == 3.0);
bool isLastSegment = (instanceTypes == 2.0 || instanceTypes == 3.0);
if( isSegmentEnd && isLastSegment ) {
  trans.x += sin(angleMove) ;
  trans.y += cos(angleMove) ;
}
if ( !isSegmentEnd && isFirstSegment )
{
  trans.x -= sin(angleMove ) ;
  trans.y -= cos(angleMove ) ;
}
trans = trans * offsetCommonSpace;
gl_Position += project_common_position_to_clipspace(trans) - project_uCenter;
`
        });
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            parallelAttribsOffsetAngleOrigin: {
                size: 3,
                type: GL.FLOAT,
                accessor: 'getParallelAttribsOffsetAngleOrigin'
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

ParallelPathLayer.layerName = 'ParallelPathLayer';
ParallelPathLayer.defaultProps = defaultProps;
