import jwt from "jsonwebtoken"

// Define the payload structure for better type safety
interface TokenPayload {
    id: string
    username: string
}

const JWT_SECRET = process.env.JWT_SECRET || "privateKey1.0"

/**
 * Generates a signed JWT token
 * Returns the token string or false on failure
 */
export function createToken(infos: TokenPayload): string | false {
    try {
        return jwt.sign(infos, "privateKey1.0")
    } catch (error) {
        console.error("JWT Creation Error:", error)
        return false
    }
}

/**
 * Verifies and decodes a JWT token
 * Returns the decoded payload or false if invalid
 */
export function readToken(token: string): TokenPayload | false {
    try {
        return jwt.verify(token, "privateKey1.0") as TokenPayload
    } catch (error) {
        console.error("JWT Verification Error:", error)
        return false
    }
}