export const deepEqual = <T>(obj1: T, obj2: T): boolean => {
  // Check if both are the same reference
  if (obj1 === obj2) return true;

  // If either is null or not an object, they are not equal
  if (
    obj1 == null ||
    obj2 == null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  // Get all the keys from both objects
  const keys1 = Object.keys(obj1) as (keyof T)[];
  const keys2 = Object.keys(obj2) as (keyof T)[];

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) return false;

  // Check if all keys in obj1 are also in obj2
  for (const key of keys1) {
    // Recursively check for deep equality of values
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};
