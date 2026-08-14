import type { Quaternion, Vec3 } from "@/simulation";
import type { IkStatus } from "../types/IkStatus";
import type { TcpPose } from "../types/TcpPose";
import {
  quaternionConjugate,
  quaternionMultiply,
  quaternionToRotationVector,
} from "./quaternion";

export interface JointLimitBound {
  lowerRad: number;
  upperRad: number;
}

export interface IkSolveRequest {
  fk: (q: number[]) => TcpPose;
  q0: number[];
  targetPositionM: Vec3;
  targetQuaternion: Quaternion;
  limits: JointLimitBound[];
  maxIterations?: number;
  positionToleranceM?: number;
  orientationToleranceRad?: number;
  damping?: number;
  epsilon?: number;
  positionOnly?: boolean;
}

export interface IkSolveResult {
  q: number[];
  status: IkStatus;
  positionErrorM: number;
  orientationErrorRad: number;
  iterations: number;
  conditionNumber: number | null;
}

const DEFAULT_MAX_ITERATIONS = 48;
const DEFAULT_POSITION_TOLERANCE_M = 5e-4;
const DEFAULT_ORIENTATION_TOLERANCE_RAD = 1e-2;
const DEFAULT_DAMPING = 0.04;
const DEFAULT_EPSILON = 1e-5;

export function solveDampedLeastSquaresIk(
  request: IkSolveRequest
): IkSolveResult {
  const dof = request.q0.length;
  const positionOnly = request.positionOnly ?? dof < 6;
  const maxIterations = request.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  const positionTolerance =
    request.positionToleranceM ?? DEFAULT_POSITION_TOLERANCE_M;
  const orientationTolerance =
    request.orientationToleranceRad ?? DEFAULT_ORIENTATION_TOLERANCE_RAD;
  const damping = request.damping ?? DEFAULT_DAMPING;
  const epsilon = request.epsilon ?? DEFAULT_EPSILON;
  const errorSize = positionOnly ? 3 : 6;

  let q = request.q0.map((value, index) =>
    clampToLimit(value, request.limits[index])
  );
  let positionErrorM = Number.POSITIVE_INFINITY;
  let orientationErrorRad = Number.POSITIVE_INFINITY;
  let conditionNumber: number | null = null;
  let hitLimit = false;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const pose = request.fk(q);
    const error = poseError(
      pose,
      request.targetPositionM,
      request.targetQuaternion,
      positionOnly
    );
    positionErrorM = Math.hypot(error[0], error[1], error[2]);
    orientationErrorRad = positionOnly
      ? 0
      : Math.hypot(error[3] ?? 0, error[4] ?? 0, error[5] ?? 0);

    if (
      positionErrorM <= positionTolerance &&
      orientationErrorRad <= orientationTolerance
    ) {
      return {
        q,
        status: "valid",
        positionErrorM,
        orientationErrorRad,
        iterations: iteration,
        conditionNumber,
      };
    }

    const jacobian = computeJacobian(
      request.fk,
      q,
      pose,
      epsilon,
      errorSize,
      positionOnly
    );
    const { delta, condition } = dampedLeastSquaresStep(
      jacobian,
      error,
      damping
    );
    conditionNumber = condition;

    let maxDelta = 0;
    const next = q.map((value, index) => {
      const proposed = value + (delta[index] ?? 0);
      const clamped = clampToLimit(proposed, request.limits[index]);
      if (clamped !== proposed) {
        hitLimit = true;
      }
      maxDelta = Math.max(maxDelta, Math.abs(clamped - value));
      return clamped;
    });

    q = next;

    if (maxDelta < 1e-8) {
      break;
    }
  }

  const status: IkStatus = hitLimit ? "joint_limit" : "unreachable";

  return {
    q,
    status,
    positionErrorM,
    orientationErrorRad,
    iterations: maxIterations,
    conditionNumber,
  };
}

function poseError(
  pose: TcpPose,
  targetPositionM: Vec3,
  targetQuaternion: Quaternion,
  positionOnly: boolean
): number[] {
  const positionError = [
    targetPositionM[0] - pose.positionM[0],
    targetPositionM[1] - pose.positionM[1],
    targetPositionM[2] - pose.positionM[2],
  ];
  if (positionOnly) {
    return positionError;
  }
  const errorQuaternion = quaternionMultiply(
    targetQuaternion,
    quaternionConjugate(pose.quaternion)
  );
  const rotationError = quaternionToRotationVector(errorQuaternion);
  return [...positionError, ...rotationError];
}

function computeJacobian(
  fk: (q: number[]) => TcpPose,
  q: number[],
  current: TcpPose,
  epsilon: number,
  errorSize: number,
  positionOnly: boolean
): number[][] {
  const dof = q.length;
  const jacobian = Array.from({ length: errorSize }, () =>
    Array.from({ length: dof }, () => 0)
  );

  for (let column = 0; column < dof; column += 1) {
    const perturbed = q.slice();
    perturbed[column] += epsilon;
    const pose = fk(perturbed);
    const error = poseError(
      current,
      pose.positionM,
      pose.quaternion,
      positionOnly
    );
    for (let row = 0; row < errorSize; row += 1) {
      jacobian[row][column] = (error[row] ?? 0) / epsilon;
    }
  }

  return jacobian;
}

function dampedLeastSquaresStep(
  jacobian: number[][],
  error: number[],
  damping: number
): { delta: number[]; condition: number } {
  const rows = jacobian.length;
  const cols = jacobian[0]?.length ?? 0;
  const jjt = multiply(jacobian, transpose(jacobian));
  for (let i = 0; i < rows; i += 1) {
    jjt[i][i] += damping * damping;
  }
  const solved = solveLinearSystem(jjt, error);
  const jte = solved
    ? multiplyVec(transpose(jacobian), solved)
    : Array.from({ length: cols }, () => 0);
  return {
    delta: jte,
    condition: estimateCondition(jjt),
  };
}

function transpose(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const result = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => 0)
  );
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

function multiply(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0]?.length ?? 0;
  const inner = b.length;
  const result = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < inner; k += 1) {
      const aik = a[i][k];
      for (let j = 0; j < cols; j += 1) {
        result[i][j] += aik * b[k][j];
      }
    }
  }
  return result;
}

function multiplyVec(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * (vector[index] ?? 0), 0)
  );
}

function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) {
        pivot = row;
      }
    }
    if (Math.abs(a[pivot][col]) < 1e-12) {
      return null;
    }
    if (pivot !== col) {
      const swap = a[col];
      a[col] = a[pivot];
      a[pivot] = swap;
    }
    const pivotValue = a[col][col];
    for (let j = col; j <= n; j += 1) {
      a[col][j] /= pivotValue;
    }
    for (let row = 0; row < n; row += 1) {
      if (row === col) {
        continue;
      }
      const factor = a[row][col];
      for (let j = col; j <= n; j += 1) {
        a[row][j] -= factor * a[col][j];
      }
    }
  }

  return a.map((row) => row[n]);
}

function estimateCondition(matrix: number[][]): number {
  let maxAbs = 0;
  let minAbs = Number.POSITIVE_INFINITY;
  for (const row of matrix) {
    for (const value of row) {
      const abs = Math.abs(value);
      maxAbs = Math.max(maxAbs, abs);
      if (abs > 1e-12) {
        minAbs = Math.min(minAbs, abs);
      }
    }
  }
  if (!Number.isFinite(minAbs) || minAbs === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return maxAbs / minAbs;
}

function clampToLimit(value: number, limit: JointLimitBound | undefined): number {
  if (!limit) {
    return value;
  }
  return Math.min(limit.upperRad, Math.max(limit.lowerRad, value));
}
