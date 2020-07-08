export default `\
#define SHADER_NAME arrow-layer-fragment-shader

precision highp float;

varying vec4 vFillColor;
varying float shouldDiscard;

void main(void) {
    if (shouldDiscard > 0.0) {
        discard;
    }
    gl_FragColor = vFillColor;
}
`;
