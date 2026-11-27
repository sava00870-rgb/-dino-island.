export function movementVector(yaw, forward, strafe) {
  // Camera is behind the player: screen-right is (+cos(yaw), 0, -sin(yaw)).
  // Positive strafe must always move to the right side of the screen.
  let x = Math.sin(yaw) * forward + Math.cos(yaw) * strafe;
  let z = Math.cos(yaw) * forward - Math.sin(yaw) * strafe;
  const length = Math.hypot(x, z);
  if (length > 1) {
    x /= length;
    z /= length;
  }
  return { x, z };
}

export function createResourceRecord({ mesh, index, original, linked = [] }) {
  if (!mesh || typeof mesh.setMatrixAt !== 'function') throw new TypeError('resource mesh must implement setMatrixAt');
  if (!Number.isInteger(index) || index < 0) throw new TypeError('resource index must be a non-negative integer');
  if (original == null) throw new TypeError('resource original transform is required');
  return { mesh, index, original, linked: [...linked], used: false };
}

function copyTransform(value) {
  return value && typeof value.clone === 'function' ? value.clone() : value;
}

export function resetResourceRecords(records) {
  const dirtyMeshes = new Set();
  for (const record of records) {
    record.used = false;
    record.mesh.setMatrixAt(record.index, copyTransform(record.original));
    dirtyMeshes.add(record.mesh);
    for (const linked of record.linked) {
      linked.mesh.setMatrixAt(linked.index, copyTransform(linked.original));
      dirtyMeshes.add(linked.mesh);
    }
  }
  for (const mesh of dirtyMeshes) {
    if ('instanceMatrix' in mesh) mesh.instanceMatrix.needsUpdate = true;
  }
}
