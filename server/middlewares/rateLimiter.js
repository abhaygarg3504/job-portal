// import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import redis from '../config/redis.js'; // your ioredis instance

// export const loginLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 5,
//   message: { success: false, message: "Too many login attempts, please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: new RedisStore({
//     sendCommand: (...args) => redis.call(...args),
//   }),
// });
// // Example: Limit to 10 job applications per 2min per IP
// export const applyJobLimiter = rateLimit({
//   windowMs: 60 * 2 * 1000, // 2 min
//   max: 10,
//   message: { success: false, message: "Too many job applications, please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: new RedisStore({
//     sendCommand: (...args) => redis.call(...args),
//   }),
// });

// export const blogLimiter = rateLimit({
//   windowMs: 60 * 1 * 1000, // 2 min
//   max: 2,
//   message: { success: false, message: "Too many blog, please try again later." },
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: new RedisStore({
//     sendCommand: (...args) => redis.call(...args),
//   }),
// });
