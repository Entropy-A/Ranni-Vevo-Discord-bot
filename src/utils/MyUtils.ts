// -----------------------General utils-------------------------
export namespace MyUtils {

    /**
     * Checks if object is empty.
     * @returns boolean
     */
    export function objectEmpty(object: Object) {
        if (Object.keys(object).length === 0) return true
        return false
    }

    /**
     * Accesses the deepest level values of an Object an keeps track of the nested path.
     * @returns {Object} {value: unkown, path: string[]}
     */
    export function getDeepestElements(object: Object, path: string[] = []): { value: unknown; path: string[] }[] {
        const values = [];

        // Returns the deepes value that's not an Object. Arrays will be returned as a whole.
        if (typeof object !== "object" || Array.isArray(object)) {
            values.push({ value: object, path });

        // Enters one level deeper in Object
        } else {
            const objectEntries = Object.entries(object);
            for (const [key, deeperObject] of objectEntries) {
                values.push(...getDeepestElements(deeperObject, [...path, key]));
            }
        }

        return values;
    }
}

// -----------------------Array Extentions-------------------------
export namespace ArrayExtensions {

    /**
     * Chooses a random element from an array.
     * @param {unknown} array 
     * @returns Unknown element of array.
     */
    export function sample<T>(array: T[]): T | undefined {
        if (array.length === 0) return undefined

        const randomIndex = Math.floor(array.length* Math.random())
        return array[randomIndex]
    }
}