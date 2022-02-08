// @ts-ignore
// Libraries don't exist in the root directory,
// so this doesn't work properly
import { v4, parse } from 'uuid';

// RFC4648 Chapter 5 standard: URL/file-safe base64 encoding lookup string
const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/**
 * Generates a v4 (randomly generated) UUID, converted
 * into a 21-character long "base64" format ([A-Z][a-z][0-9]-_)
 */
export function generateBase64UUID(): string {
    // Generate UUID v4
    // bytes is a 16 length byte array
    const bytes = parse(v4())

    // Compress from 36 bytes to 21
    // "base64" "conversion" (doesnt actually
    //   convert into base64)
    var key = ''
    for (var it = 0; it < 15; it+=3) {
        var rem = 0
        for (var i = 0; i < 3; i++) {
            var byte = bytes[it+i]
            // Append the lowest 2 bits to rem
            rem = (rem << 2) | (byte & 3)
            // Rightshift byte
            // Range [127,0] -> [63,0]
            var byte = byte >> 2
            // Get "base64" character from lookup string
            key = key.concat(b64.charAt(byte))
        }
        // Append the remaining 6 bits
        key = key.concat(b64.charAt(rem))
    }
    // 1 byte is left remaining
    key = key.concat(b64.charAt(bytes[16] & 63), b64.charAt(bytes[16] >> 6))

    return key
}

// Collection names are alphabetic character names
// DB keys are url/filename-safe base64, alphanumeric with - and _
const idRegex = new RegExp('^([a-z]|[A-Z])+\/([0-9]|[a-z]|[A-Z]|-|_)+$')
const keyRegex = new RegExp('^([0-9]|[a-z]|[A-Z]|-|_)+$')

/**
 * Returns true if the passed string looks like a database id.
 * DOES NOT CHECK IF STR IS VALID REFERENCE.
 * @param str A string
 * @return True if str looks like [name/key]
 */
export function isDBId(str: string): boolean {
    return idRegex.test(str)
}

/**
 * Returns true if the passed string looks like a database key.
 * DOES NOT CHECK IF STR IS VALID REFERENCE.
 * @param str A string
 * @return True if str looks like [key]
 */
export function isDBKey(str: string): boolean {
    return keyRegex.test(str)
}