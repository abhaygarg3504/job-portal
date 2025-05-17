import mongoose from "mongoose";
import Joi from "joi";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    password: { type: String, required: true }
});

export const Company = mongoose.model("Company", companySchema);

export const validate = (user) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        image: Joi.string().uri().required(),
        password: Joi.string().required()
    });
    return schema.validate(user);
};
export default Company;
// export {  validate };
