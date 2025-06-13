// Type definitions for JavaScript (using JSDoc comments for better IDE support)

/**
 * @typedef {Object} Message
 * @property {'user' | 'assistant'} role
 * @property {string} content
 * @property {'text' | 'image'} [type]
 * @property {string} [imageUrl]
 */

/**
 * @typedef {Object} ChatState
 * @property {Message[]} messages
 * @property {boolean} isLoading
 * @property {string | null} error
 */

/**
 * @typedef {Object} ChatHistory
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {Message[]} messages
 * @property {string} created_at
 * @property {string} updated_at
 */

// Export empty object to make this a module
export {};