import { vec, Vector } from 'excalibur';

export function normalizeAndScale(x: number, y: number, targetVectorLength: number): Vector {
    if (x === 0 && y === 0) {
        return vec(0, 0);
    }

    const v = vec(x, y).normalize();

    const newX = v.x * targetVectorLength;
    const newY = v.y * targetVectorLength;

    return vec(newX, newY);
}
