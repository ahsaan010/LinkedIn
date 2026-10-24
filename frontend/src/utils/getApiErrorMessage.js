export default function getApiErrorMessage(error, fallback) {
    const message = error?.response?.data?.message

    if (typeof message === "string" && message.trim()) {
        return message
    }

    if (!error?.response) {
        return "Unable to reach the server. Please check your connection and try again."
    }

    return fallback
}
