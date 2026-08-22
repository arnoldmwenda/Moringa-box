import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./GridDistortion.css";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
varying vec2 vUv;
void main() {
  vec2 offset = texture2D(uDataTexture, vUv).rg;
  gl_FragColor = texture2D(uTexture, vUv - 0.02 * offset);
}`;

export default function GridDistortion({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return undefined;

    // Check WebGL support before attempting renderer initialization
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) return undefined;
    } catch {
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return undefined;
    }

    const scene = new THREE.Scene();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000);
    camera.position.z = 2;
    const size = Math.max(2, grid);
    const data = new Float32Array(size * size * 4);
    const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.needsUpdate = true;
    const uniforms = { uTexture: { value: null }, uDataTexture: { value: dataTexture } };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let texture = null;
    if (imageSrc) {
      texture = new THREE.TextureLoader().load(
        imageSrc,
        (loadedTexture) => {
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
          loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
          uniforms.uTexture.value = loadedTexture;
        },
        undefined,
        () => {
          // Texture loading failed gracefully
        }
      );
    }

    const mouseState = { x: 0.5, y: 0.5, previousX: 0.5, previousY: 0.5, velocityX: 0, velocityY: 0 };
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      mouseState.velocityX = x - mouseState.previousX;
      mouseState.velocityY = y - mouseState.previousY;
      mouseState.x = x;
      mouseState.y = y;
      mouseState.previousX = x;
      mouseState.previousY = y;
    };

    const handleMouseLeave = () => {
      mouseState.velocityX = 0;
      mouseState.velocityY = 0;
      mouseState.x = 0.5;
      mouseState.y = 0.5;
      mouseState.previousX = 0.5;
      mouseState.previousY = 0.5;
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      const aspect = width / height;
      plane.scale.set(aspect, 1, 1);
      camera.left = -aspect / 2;
      camera.right = aspect / 2;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let animationFrame;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      for (let index = 0; index < size * size; index += 1) {
        data[index * 4] *= relaxation;
        data[index * 4 + 1] *= relaxation;
      }
      const gridX = size * mouseState.x;
      const gridY = size * mouseState.y;
      const maxDistance = size * mouse;
      for (let x = 0; x < size; x += 1) {
        for (let y = 0; y < size; y += 1) {
          const distance = Math.hypot(gridX - x, gridY - y);
          if (distance < maxDistance) {
            const index = 4 * (x + size * y);
            const power = Math.min(maxDistance / Math.max(distance, 0.001), 10);
            data[index] += strength * 100 * mouseState.velocityX * power;
            data[index + 1] -= strength * 100 * mouseState.velocityY * power;
          }
        }
      }
      // Decay velocity each frame to prevent runaway distortion when cursor stops moving
      mouseState.velocityX *= 0.85;
      mouseState.velocityY *= 0.85;

      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      try {
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {
        // ignore
      }
      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if (texture) {
        try {
          texture.dispose();
        } catch {
          // ignore
        }
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [grid, mouse, strength, relaxation, imageSrc]);

  return <div ref={containerRef} className={`distortion-container ${className}`} aria-hidden="true" />;
}

