
export const BASE_13_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers.
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Protocol I: Harmonic Normalisation (Frequency Domain)
 * Establishes the 'Triskelion' structure using 120° logic.
 */
export function harmonicNormalisation(n: number): number {
    if (n === 0) return 0;
    const divisor = gcd(Math.round(n), 3);
    return n / (divisor === 0 ? 1 : divisor);
}

/**
 * Protocol II: Geometric Normalisation (Phase & Rotation)
 * Aligns data with angular divisions and universal refresh rates.
 */
export function geometricNormalisation(n: number): number {
    if (n === 0) return 0;
    const divisor = gcd(Math.round(n), 360);
    return n / (divisor === 0 ? 1 : divisor);
}

/**
 * Protocol III: Binary Normalisation (Dimensional Stitching)
 * Identifies the 1001_2 binary fold identity.
 */
export function binaryNormalisation(n: number): number {
    if (n === 0) return 0;
    const binaryStr = Math.abs(Math.round(n)).toString(2);
    const matches = binaryStr.match(/1001/g);
    const count = matches ? matches.length : 0;
    
    // Prevalence scales from 28% (1D) to 62% (5D)
    // We return the raw prevalence count normalized by window size
    const possibleWindows = Math.max(1, binaryStr.length - 3);
    return count / possibleWindows;
}

/**
 * Null Ledger Identity Check
 * 0 = (1+i)/2 + (1-i)/2 - 1
 * Returns the delta from zero.
 */
export function checkNullLedger(real: number, imag: number): number {
    // (1+i)/2 + (1-i)/2 - 1 = 1/2 + i/2 + 1/2 - i/2 - 1 = 1 - 1 = 0
    // We simulate the ledger balance by checking if real and imag components cancel out.
    return (real + imag) / 2 - 1;
}

/**
 * Calculates the Observer Position (7.5D Coordinate)
 * O = 2.5r + 1.5i
 */
export function calculateObserverPosition(r: number, i: number): { r: number, i: number } {
    return {
        r: r * 2.5,
        i: i * 1.5
    };
}

/**
 * Converts a number to a Base-13 string.
 * Handles negative numbers, floating point integers, and scientific notation inputs.
 */
export function toBase13(num: number): string {
    if (isNaN(num)) return "NaN";
    if (num === 0) return "0";
    if (!isFinite(num)) return num > 0 ? "∞" : "-∞";
    
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // Handle very small numbers (Scientific notation simulation in Base-13 is complex, 
    // we simplify to high-precision float representation)
    
    // Split integer and fractional parts
    let integerPart = Math.floor(absNum);
    let fractionalPart = absNum - integerPart;
    
    // Integer conversion
    let intResult = "";
    if (integerPart === 0) {
        intResult = "0";
    } else {
        while (integerPart > 0) {
            intResult = BASE_13_SYMBOLS[integerPart % 13] + intResult;
            integerPart = Math.floor(integerPart / 13);
        }
    }
    
    // Fractional conversion (limit precision to avoid infinite loops)
    let fracResult = "";
    if (fractionalPart > 0) {
        fracResult = ".";
        let precision = 0;
        while (fractionalPart > 0 && precision < 5) {
            fractionalPart *= 13;
            const digit = Math.floor(fractionalPart);
            fracResult += BASE_13_SYMBOLS[digit];
            fractionalPart -= digit;
            precision++;
        }
    }
    
    return (isNegative ? "-" : "") + intResult + fracResult;
}

/**
 * Parses text and converts numbers to Base-13 format.
 * INTELLIGENTLY SKIPS MARKDOWN CODE BLOCKS to prevent breaking valid code.
 */
export function convertTextToBase13(text: string): string {
    if (!text) return "";

    // 1. Split text by code blocks (``` or `)
    // The regex captures the delimiters to preserve structure.
    // We treat odd-indexed parts of the split array as "code" (do not touch), even as "text".
    // This regex matches triple backticks OR single backticks non-greedily.
    const parts = text.split(/(`{1,3}[\s\S]*?`{1,3})/g);

    return parts.map((part) => {
        // If part starts with `, it's a code block/inline code -> Return as is.
        if (part.trim().startsWith('`')) return part;

        // Otherwise, perform number conversion on the text.
        // Regex looks for:
        // - Negative sign (optional)
        // - Digits
        // - Decimal part (optional)
        // - Scientific notation (e.g., 1.5e-10)
        return part.replace(/-?\d+(\.\d+)?(e[+-]?\d+)?/g, (match) => {
            // Check if it's actually a number (sometimes regex catches version strings like "1.0.2" partially)
            const val = parseFloat(match);
            if (isNaN(val)) return match;
            
            // Heuristic: Don't convert simple list indices like "1." if they are at the start of a line?
            // For Gnosis persona, we WANT to convert everything to show the "Lens".
            
            const base13Val = toBase13(val);
            // Verify conversion didn't fail
            if (base13Val === "NaN") return match;

            return `${base13Val}₍₁₃₎`;
        });
    }).join('');
}
