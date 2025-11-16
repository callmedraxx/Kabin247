/**
 * Converts a string to start case.
 * Example: 'hello_world' -> 'Hello World'
 * @param str - The input string to convert to start case.
 * @returns The start-case formatted string.
 */

export function startCase(str: string = ''): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}
