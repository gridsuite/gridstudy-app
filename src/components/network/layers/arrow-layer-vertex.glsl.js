export default `\
#version 300 es
#define SHADER_NAME arrow-layer-vertex-shader

in vec3 positions;

in float instanceSize;
in float instanceArrowDistance;
in vec4 instanceColor;
in float instanceSpeedFactor;
in int instanceLinePositionsTextureOffset;
in int instanceLineDistancesTextureOffset;
in int instanceLinePointCount;
in float instanceLineDistance;

uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform float timestamp;
uniform sampler2D linePositionsTexture;
uniform sampler2D lineDistancesTexture;
uniform float maxTextureSize;

out vec4 vFillColor;

/**
 * Calculate 2 dimensions texture index from flat index. 
 */
ivec2 calulateTextureIndex(int flatIndex) {
  int x = int(mod(float(flatIndex), maxTextureSize));
  int y = int(trunc(float(flatIndex) / maxTextureSize));
  return ivec2(x, y);
}

/**
 * Fetch WGS84 position from texture for a given point of the line.  
 */
vec3 fetchLinePosition(int point) {
  int flatIndex = instanceLinePositionsTextureOffset + point;
  ivec2 textureIndex = calulateTextureIndex(flatIndex); 
  return vec3(texelFetch(linePositionsTexture, textureIndex, 0).xy, 0);
}

/**
 * Fetch distance (in meters from the start of the line) from texture for a point of the line.  
 */
float fetchLineDistance(int point) {
  int flatIndex = instanceLineDistancesTextureOffset + point;
  ivec2 textureIndex = calulateTextureIndex(flatIndex);
  return texelFetch(lineDistancesTexture, textureIndex, 0).x;
}

/**
 * Find the first point of the line that is after a given distance from the start (first line point).   
 */
int findFirstLinePointAfterDistance(float distance) {
  int pointAfterDistance;
  for (int point = 1; point < instanceLinePointCount; point++) {
      float pointDistance = fetchLineDistance(point);
      if (pointDistance > distance) {
          pointAfterDistance = point;
          break;
      }
  }
  return pointAfterDistance;
}

void main(void) {
  // arrow distance from the line start shifted with current timestamp
  float arrowDistance = mod(instanceLineDistance * instanceArrowDistance + timestamp * instanceSpeedFactor, instanceLineDistance);

  // look for first line point that is after arrow distance
  int linePoint = findFirstLinePointAfterDistance(arrowDistance);

  // position for the line point just before the arrow
  vec3 linePosition1 = fetchLinePosition(linePoint - 1);

  // position for the line point just after the arrow
  vec3 linePosition2 = fetchLinePosition(linePoint);

  // clamp to arrow size limits
  float sizePixels = clamp(project_size_to_pixel(instanceSize), sizeMinPixels, sizeMaxPixels);

  // calculate rotation angle for aligning the arrow with the line segment
  float angle = atan(linePosition1.x - linePosition2.x, linePosition1.y - linePosition2.y) + radians(180.0);
  mat3 rotation = mat3(cos(angle),  sin(angle),  0,
                       -sin(angle), cos(angle),  0,
                       0,           0,           0);

  // project the 2 line points position to clipspace 
  vec3 offset = positions * rotation * project_pixel_size(sizePixels);
  vec3 position64Low = vec3(0, 0, 0);
  vec4 clipspacePosition1 = project_position_to_clipspace(linePosition1, position64Low, offset);
  vec4 clipspacePosition2 = project_position_to_clipspace(linePosition2, position64Low, offset);

  // calculate arrow position by interpolating the 2 line points position
  float lineDistance1 = fetchLineDistance(linePoint - 1);
  float lineDistance2 = fetchLineDistance(linePoint);
  float interpolationValue = project_size_to_pixel(arrowDistance - lineDistance1) / project_size_to_pixel(lineDistance2 - lineDistance1);    
  vec4 arrowPosition = mix(clipspacePosition1, clipspacePosition2, interpolationValue);  

  // arrow vertex position
  gl_Position = arrowPosition;

  // arrow fill color for fragment shader 
  vFillColor = instanceColor;
}
`;
