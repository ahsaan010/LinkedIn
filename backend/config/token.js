import jwt from "jsonwebtoken"

const genToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required")
    }

    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export default genToken