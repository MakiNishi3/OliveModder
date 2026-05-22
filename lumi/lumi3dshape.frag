uniform sampler2D tex;
uniform vec2 texture_size;
uniform float shape_type;
uniform float scale;
uniform float distortion;
uniform float light_pos_x;
uniform float light_pos_y;

varying vec2 tex_coord;

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
    p.x += sin(p.z * distortion) * 0.2;
    p.y += cos(p.x * distortion) * 0.2;
    
    float d = 0.0;
    if (shape_type < 0.5) {
        d = sdSphere(p, 0.5 * scale);
    } else if (shape_type < 1.5) {
        d = sdTorus(p, vec2(0.5, 0.2) * scale);
    } else {
        d = sdBox(p, vec3(0.4, 0.4, 0.4) * scale);
    }
    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main() {
    vec2 uv = tex_coord - 0.5;
    uv.x *= texture_size.x / texture_size.y;

    vec3 ro = vec3(0.0, 0.0, -2.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    
    float t = 0.0;
    float max_d = 10.0;
    vec3 p = ro;
    bool hit = false;

    for (int i = 0; i < 64; i++) {
        p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) {
            hit = true;
            break;
        }
        t += d;
        if (t > max_d) break;
    }

    vec4 bg_color = texture2D(tex, tex_coord);

    if (hit) {
        vec3 n = getNormal(p);
        vec3 light_pos = vec3(light_pos_x, light_pos_y, -3.0);
        vec3 l = normalize(light_pos - p);
        
        float diff = max(dot(n, l), 0.0);
        vec3 v = normalize(ro - p);
        vec3 r = reflect(-l, n);
        float spec = pow(max(dot(v, r), 0.0), 32.0);
        
        vec3 base_color = vec3(0.5) + 0.5 * cos(p + vec3(0.0, 2.0, 4.0));
        vec3 final_color = base_color * (diff + 0.1) + vec3(0.8) * spec;
        
        gl_FragColor = vec4(final_color, 1.0);
    } else {
        gl_FragColor = bg_color;
    }
}
