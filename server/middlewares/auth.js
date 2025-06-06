import jwt from "jsonwebtoken"
import Company from "../models/Comapny.js"
import User from "../models/User.js";
// middlewares/verifyClerkUser.js
import { verifyToken } from "@clerk/clerk-sdk-node"; // or '@clerk/backend' if you're using the newer version

// export const verifyClerkUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "Authorization header missing" });
//     }

//     const token = authHeader.split(" ")[1];

//     const payload = await verifyToken(token); // Verifies JWT from Clerk
//     req.user = {
//       _id: payload.sub, // Clerk's unique user ID
//       email: payload.email,
//       name: payload.name,
//       image: payload.image_url,
//     };

//     next();
//   } catch (err) {
//     console.error("Clerk user verification failed:", err.message);
//     res.status(401).json({ success: false, message: "Unauthorized" });
//   }
// };

// export const requireAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }
//     const token = authHeader.split(" ")[1];

//     // Verify Clerk JWT
//     const payload = await verifyToken(token);

//     // Find user in MongoDB using Clerk's user ID (sub)
//     let user = await User.findById(payload.sub);
//     if (!user) {
//       // Optionally, create the user in your DB if not found
//       user = await User.create({
//         _id: payload.sub, // Clerk's user ID as MongoDB _id
//         email: payload.email,
//         name: payload.name,
//         image: payload.image_url,
//       });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Clerk user verification failed:", err.message);
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }
// };

export const ProtectCompany = async(req, res, next) =>{ 

    const token = req.headers.token
    if(!token){
        return res.json({
            success: false,
            message: "Not Authorised, Login Again"
        })
    }
    try{
       const decoded = jwt.verify(token, process.env.JWT_SECRET)
       req.company = await Company.findById(decoded.id).select('-password') // this select property helps to remove password property from data

    }
    catch(err){
        console.log(`error in auth.js is - ${err}`)

    }

};

export const ProtectionCompany = async(req, res, next)=>{
    let token;

    // Check if the token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        token = req.headers.authorization.split(" ")[1]; // Extract token after "Bearer "
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.company = await Company.findById(decoded.id).select('-password'); // Attach company data to request
  
        if (!req.company) {
          return res.status(401).json({ success: false, message: "Company not found, please login again" });
        }
  
        next(); // Move to next middleware/controller
      } catch (error) {
        console.error("Error in ProtectCompany middleware:", error);
        return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
      }
    } else {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded); // 🛠 Debugging

        // ✅ Fetch company from DB
        const company = await Company.findById(decoded.id).select("-password");

        if (!company) {
            return res.status(401).json({ success: false, message: "Company not found, authorization denied" });
        }

        req.company = company; // ✅ Attach company to request
        // console.log("Company from Middleware:", req.company); // 🛠 Debugging

        next();
    } catch (err) {
        console.log("JWT Verification Error:", err.message); // 🛠 Debugging
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export const comapnyDataProtection = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        // console.log("Authorization Header:", authHeader); // 🛠 Debugging

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];
        // console.log("Extracted Token:", token); // 🛠 Debugging

        // ✅ Ensure token is a proper JWT format
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            console.error("Invalid Token Format: JWT must have 3 parts");
            return res.status(401).json({ success: false, message: "Invalid token format" });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded); // 🛠 Debugging

        // ✅ Fetch company from DB
        const company = await Company.findById(decoded.id).select("-password");

        if (!company) {
            return res.status(401).json({ success: false, message: "Company not found, authorization denied" });
        }

        req.company = company;
        // console.log("Company from Middleware:", req.company); // 🛠 Debugging

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

const protectCompany = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.company = await Company.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
};

export default protectCompany;

