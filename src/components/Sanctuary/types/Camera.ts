export interface Camera {
  position: { x: number; y: number; z: number };
  zoom: number;
  rotation: number;
}

export interface ViewFrustum {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
} 