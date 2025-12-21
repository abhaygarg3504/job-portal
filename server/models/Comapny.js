
import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    password: { type: String, required: true }
});

export const Company = mongoose.model("Company", companySchema);

export default Company;
// import mongoose from "mongoose";
// const companySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     image: { type: String, required: true },
//     password: { type: String, required: true },
//     slug: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true,
//   },
  
// });
// companySchema.pre("validate", function(next) {
//   if (this.isNew || this.isModified("name")) {
//     // e.g. "John Doe" → "john-doe-<shortid>"
//     const base = slugify(this.name, { lower: true, strict: true });
//     const suffix = this._id.slice(0, 6); 
//     this.slug = `${base}-${suffix}`;
//   }
//   next();
// });

// export const Company = mongoose.model("Company", companySchema);

// export default Company;