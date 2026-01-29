// Custom shader for "alive" thumbnail effect with subtle glitch and wave distortion
export const cardShaderVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cardShaderFragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHoverIntensity;
  uniform float uGlitchIntensity;
  uniform vec3 uTintColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Noise function for glitch effect
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  // 2D noise
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Subtle wave distortion
    float wave = sin(vPosition.y * 5.0 + uTime * 2.0) * 0.003;
    uv.x += wave * uHoverIntensity;
    
    // Glitch effect (RGB split + scanlines)
    float glitch = step(0.97, noise(vec2(uTime * 0.5, floor(vUv.y * 50.0)))) * uGlitchIntensity;
    
    vec2 uvR = uv + vec2(glitch * 0.01, 0.0);
    vec2 uvG = uv;
    vec2 uvB = uv - vec2(glitch * 0.01, 0.0);
    
    float r = texture2D(uTexture, uvR).r;
    float g = texture2D(uTexture, uvG).g;
    float b = texture2D(uTexture, uvB).b;
    
    vec3 color = vec3(r, g, b);
    
    // Scanlines
    float scanline = sin(vUv.y * 800.0 + uTime * 3.0) * 0.02;
    color -= scanline * uHoverIntensity * 0.5;
    
    // Tint color on hover
    color = mix(color, color * uTintColor, uHoverIntensity * 0.15);
    
    // Subtle vignette
    float vignette = smoothstep(0.9, 0.3, length(vUv - 0.5));
    color *= vignette * 0.5 + 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Backside shader with futuristic typography glow
export const cardBackShaderFragment = /* glsl */ `
  uniform vec3 uBackgroundColor;
  uniform float uTime;
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  
  void main() {
    // Gradient background
    vec3 color = mix(
      uBackgroundColor * 0.5,
      uBackgroundColor,
      vUv.y
    );
    
    // Animated grid pattern
    float grid = step(0.98, fract(vUv.x * 20.0)) + step(0.98, fract(vUv.y * 20.0));
    grid *= sin(uTime * 2.0) * 0.5 + 0.5;
    color += grid * 0.05 * uGlowIntensity;
    
    // Pulsing edge glow
    float edge = 1.0 - smoothstep(0.0, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    color += edge * vec3(0.2, 0.4, 1.0) * (sin(uTime * 3.0) * 0.3 + 0.7) * uGlowIntensity;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
