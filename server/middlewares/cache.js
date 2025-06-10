// server/middleware/cache.js
import redis from '../config/redis.js';

// export const cacheJobs = async (req, res, next) => {
//   const cacheKey = 'jobs:all';
//   const cached = await redis.get(cacheKey);
//   console.log(`cache jobs key are`, cacheKey)
//   console.log(`cached is `, cached)
//   if (cached) {
//     return res.json({ success: true, jobs: JSON.parse(cached), cached: true });
//   }
//   res.locals.cacheKey = cacheKey;
//   next();
// };
export const cacheJobs = async (req, res, next) => {
  const cacheKey = 'jobs:all';
  try {
    const cached = await redis.get(cacheKey);
    console.log(`cache jobs key: ${cacheKey}`);
    if (cached) {
      console.log('✅ Cache hit for jobs');
      return res.json({ success: true, jobs: JSON.parse(cached), cached: true });
    }
    console.log('❌ Cache miss for jobs');
    res.locals.cacheKey = cacheKey;
    next();
  } catch (err) {
    console.error('Redis error in cacheJobs:', err);
    next(); // Always call next() on error so DB fetch still works
  }
};
export const cacheUserProfile = async(req, res, next)=>{
    const userId = req.params.id;
  const cacheKey = `user:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ success: true, user: JSON.parse(cached), cached: true });
  }
  res.locals.cacheKey = cacheKey;
  next();

}

export const cacheCompanyProfile = async (req, res, next) => {
  const companyId = req.params.id;
  const cacheKey = `company:${companyId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ success: true, company: JSON.parse(cached), cached: true });
  }
  res.locals.cacheKey = cacheKey;
  next();
};

export const cacheJobById = async (req, res, next) => {
  const jobId = req.params.id;
  const cacheKey = `job:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ success: true, job: JSON.parse(cached), cached: true });
  }
  res.locals.cacheKey = cacheKey;
  next();
};

// server/middlewares/cache.js

export const cacheBlogs = async (req, res, next) => {
  const cacheKey = 'blogs:all';
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ success: true, blogs: JSON.parse(cached), cached: true });
  }
  res.locals.cacheKey = cacheKey;
  next();
};

export const cacheBlogById = async (req, res, next) => {
  const blogId = req.params.id;
  const cacheKey = `blog:${blogId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ success: true, blog: JSON.parse(cached), cached: true });
  }
  res.locals.cacheKey = cacheKey;
  next();
};

// server/middlewares/cache.js

export const cacheCommentsByBlogId = async (req, res, next) => {
  const blogId = req.params.blogId || req.params.id; // adjust as per your route
  const cacheKey = `comments:blog:${blogId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, comments: JSON.parse(cached), cached: true });
    }
    res.locals.cacheKey = cacheKey;
    next();
  } catch (err) {
    console.error('Redis error (comments cache):', err);
    next();
  }
};
