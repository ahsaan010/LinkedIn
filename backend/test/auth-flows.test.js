import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

const environmentKeys = [
    "JWT_SECRET",
    "MONGODB_URL",
    "REDIS_URL",
    "VERCEL",
    "NODE_ENV",
    "FRONTEND_URLS"
]
const originalEnvironment = Object.fromEntries(
    environmentKeys.map((key) => [key, process.env[key]])
)

let app
let io
let server
let User
let Post
let baseUrl
let users = []
let posts = []
let originalConnect
let originalUserMethods
let originalPostFind

before(async () => {
    process.env.JWT_SECRET = "local-test-secret"
    process.env.MONGODB_URL = "mongodb://127.0.0.1/test-only"
    delete process.env.REDIS_URL
    process.env.VERCEL = "1"
    process.env.NODE_ENV = "test"
    process.env.FRONTEND_URLS = ""

    originalConnect = mongoose.connect
    mongoose.connect = async () => mongoose

    const backend = await import("../index.js")
    const userModel = await import("../models/user.model.js")
    const postModel = await import("../models/post.model.js")
    app = backend.app
    io = backend.io
    server = backend.server
    User = userModel.default
    Post = postModel.default

    originalUserMethods = {
        findOne: User.findOne,
        findById: User.findById,
        create: User.create
    }
    originalPostFind = Post.find

    User.findOne = async (query) => {
        const filters = query.$or || [query]
        return users.find((user) => filters.some((filter) => (
            Object.entries(filter).every(([key, value]) => user[key] === value)
        ))) || null
    }
    User.create = async (fields) => {
        const user = {
            _id: new mongoose.Types.ObjectId().toString(),
            ...fields,
            toObject() {
                return { ...this }
            }
        }
        users.push(user)
        return user
    }
    User.findById = (id) => ({
        select: async () => {
            const user = users.find((candidate) => candidate._id === String(id))
            if (!user) return null
            const { password: _password, ...publicFields } = user
            return publicFields
        }
    })
    Post.find = () => ({
        populate() {
            return this
        },
        sort: async () => posts
    })

    await new Promise((resolve, reject) => {
        server.once("error", reject)
        server.listen(0, "127.0.0.1", resolve)
    })
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve) => io.close(resolve))
    mongoose.connect = originalConnect
    User.findOne = originalUserMethods.findOne
    User.findById = originalUserMethods.findById
    User.create = originalUserMethods.create
    Post.find = originalPostFind
    users = []
    posts = []

    for (const [key, value] of Object.entries(originalEnvironment)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
    }
})

const signup = (overrides = {}) => fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        userName: "test-user",
        email: "test@example.invalid",
        password: "test-password-123",
        ...overrides
    })
})

test("signup validates, creates an account, and returns a secure session without the password hash", async () => {
    const invalidResponse = await signup({ password: "short" })
    assert.equal(invalidResponse.status, 400)

    const response = await signup()
    assert.equal(response.status, 201)
    const body = await response.json()
    assert.equal(body.email, "test@example.invalid")
    assert.equal("password" in body, false)
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i)
    assert.match(response.headers.get("set-cookie"), /SameSite=Lax/i)

    const duplicateResponse = await signup()
    assert.equal(duplicateResponse.status, 409)
    assert.match((await duplicateResponse.json()).message, /already exists/i)
})

test("login, current-user loading, posts, and logout use the authenticated cookie", async () => {
    const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.invalid", password: "incorrect-password" })
    })
    assert.equal(invalidLogin.status, 401)

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.invalid", password: "test-password-123" })
    })
    assert.equal(loginResponse.status, 200)
    assert.equal("password" in await loginResponse.json(), false)
    const cookie = loginResponse.headers.get("set-cookie").split(";")[0]

    const currentUserResponse = await fetch(`${baseUrl}/api/user/currentuser`, {
        headers: { Cookie: cookie }
    })
    assert.equal(currentUserResponse.status, 200)
    assert.equal((await currentUserResponse.json()).userName, "test-user")

    posts = [{ _id: "test-post", description: "In-memory fixture" }]
    const postsResponse = await fetch(`${baseUrl}/api/post/getpost`, {
        headers: { Cookie: cookie }
    })
    assert.equal(postsResponse.status, 200)
    assert.deepEqual(await postsResponse.json(), posts)

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`)
    assert.equal(logoutResponse.status, 200)
    assert.match(logoutResponse.headers.get("set-cookie"), /Expires=/i)

    const unauthenticatedResponse = await fetch(`${baseUrl}/api/user/currentuser`)
    assert.equal(unauthenticatedResponse.status, 401)
})

test("passwords are hashed before storage", async () => {
    assert.equal(users.length, 1)
    assert.notEqual(users[0].password, "test-password-123")
    assert.equal(await bcrypt.compare("test-password-123", users[0].password), true)
})
