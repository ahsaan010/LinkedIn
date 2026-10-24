const redact = (value) => value
    .replace(/\b(?:mongodb(?:\+srv)?|rediss?):\/\/[^\s"'`]+/gi, "[REDACTED_CONNECTION_URI]")
    .replace(
        /\b(password|token|secret|api[_-]?key|authorization|cookie)\b(\s*[:=]\s*)[^\s,;]+/gi,
        "$1$2[REDACTED]"
    )

export const logServerError = (event, error, requestId) => {
    const details = {
        event,
        requestId,
        name: typeof error?.name === "string" ? error.name : "Error",
        code: typeof error?.code === "string" || typeof error?.code === "number"
            ? error.code
            : undefined,
        stack: typeof error?.stack === "string" ? redact(error.stack) : undefined
    }

    console.error(JSON.stringify(details))
}
