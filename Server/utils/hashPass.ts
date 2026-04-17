import bcrypt from 'bcrypt'

/**
 * Hashes a plain text password using a salt
 * Returns a Promise with the hashed string or false on failure
 */
export async function hashPassword(password: string): Promise<string | false> {
    try {
        // A salt round of 12 is a good balance between security and performance
        const salt = await bcrypt.genSalt(12)
        return await bcrypt.hash(password, salt)
    } catch (error) {
        console.error("Hashing Error:", error)
        return false
    }
}

/**
 * Compares a plain text password with a stored hash
 * Returns a Promise with a boolean result
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        console.error("Comparison Error:", error)
        return false
    }
}