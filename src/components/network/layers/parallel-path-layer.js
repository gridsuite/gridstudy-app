/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PathLayer } from 'deck.gl';
import GL from '@luma.gl/constants';

const defaultProps = {
    getLineParallelIndex: { type: 'accessor', value: 0 },
    getLineAngle: { type: 'accessor', value: 0 },
    distanceBetweenLines: { type: 'number', value: 1000 },
    maxParallelOffset: { type: 'number', value: 100 },
    minParallelOffset: { type: 'number', value: 3 },
};

/**
 * A layer based on PathLayer allowing to shift path by an offset + angle
 * In addition to the shift for all points, the first point is also shifted
 * to coincide to the end of "fork lines" starting from the substations.
 * Needs to be kept in sync with ForkLineLayer and ArrowLayer because
 * ForkLineLayer must connect to this and the arrows must overlap on this.
 * props : getLineParallelIndex: real number representing the parallel translation, normalized to distanceBetweenLines
 *         getLineAngle: line angle in radian
 *         distanceBetweenLines: distance in meters between line when no pixel clamping is applied
 *         maxParallelOffset: max pixel distance
 *         minParallelOffset: min pixel distance
 */
export default class ParallelPathLayer extends PathLayer {
    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = Object.assign({}, shaders.inject, {
            'vs:#decl':
                shaders.inject['vs:#decl'] +
                `\
//Note: with the following 2 attributes, we have reached the limit (16 on most platforms) of the number of attributes.
//      with webgl2, this might be raised in the future to 32 on most platforms...
//      The PathLayer that this class extends already uses 13 attributes (and 14 with the dash extension).
//      If needed, we can pack some attributes together in a single attribute to
//      workaround the low limit of the number of vertex attrbutes .
//Note2: packing the attributes together, in addition to not beeing very readable,
//       also has the downside that you can't update one attribute and reconstruct
//       only its buffer, so it hurts performance in this case.
attribute vec3 instanceParallelIndexAndProximityFactor;
attribute vec3 instanceLineAngles;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;
`,
            'vs:#main-end':
                shaders.inject['vs:#main-end'] +
                `\

bool isSegmentEnd = isEnd > EPSILON;
bool isFirstSegment = (instanceTypes == 1.0 || instanceTypes == 3.0);
bool isLastSegment = (instanceTypes == 2.0 || instanceTypes == 3.0);

float instanceLineAngle = instanceLineAngles[1];
if ( !isSegmentEnd && isFirstSegment ){
    instanceLineAngle = instanceLineAngles[0];
}
else if ( isSegmentEnd && isLastSegment){
    instanceLineAngle = instanceLineAngles[2];
}
float instanceLineParallelIndex = instanceParallelIndexAndProximityFactor[0];
 
float offsetPixels = clamp(project_size_to_pixel(distanceBetweenLines), minParallelOffset, maxParallelOffset);
float offsetCommonSpace = project_pixel_size(offsetPixels);
vec4 trans = vec4(cos(instanceLineAngle), -sin(instanceLineAngle), 0, 0.) * instanceLineParallelIndex;

if(isSegmentEnd && isLastSegment) {
  float pf = instanceParallelIndexAndProximityFactor[2];
  trans.x += sin(instanceLineAngle) * pf ;
  trans.y += cos(instanceLineAngle) * pf;
}
else if (!isSegmentEnd && isFirstSegment)
{
  float pf = instanceParallelIndexAndProximityFactor[1];
  trans.x -= sin(instanceLineAngle) * pf;
  trans.y -= cos(instanceLineAngle) * pf;
}

trans = trans * offsetCommonSpace;
gl_Position += project_common_position_to_clipspace(trans) - project_uCenter;
`,
        });
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            // too much instances variables need to compact some...
            instanceParallelIndexAndProximityFactor: {
                size: 3,
                type: GL.FLOAT,
                accessor: 'getParallelIndexAndProximityFactor',
            },
            instanceLineAngles: {
                size: 3,
                type: GL.FLOAT,
                accessor: 'getLineAngles',
            },
        });
    }

    draw({ uniforms }) {
        super.draw({
            uniforms: {
                ...uniforms,
                distanceBetweenLines: this.props.distanceBetweenLines,
                maxParallelOffset: this.props.maxParallelOffset,
                minParallelOffset: this.props.minParallelOffset,
            },
        });
    }
}

ParallelPathLayer.layerName = 'ParallelPathLayer';
ParallelPathLayer.defaultProps = defaultProps;
