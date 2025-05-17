import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { backendURL } = useContext(AppContext);

    const sendOtp = async () => {
        setLoading(true);
        try {
            await axios.post(`${backendURL}/api/company/setUpOtp`, { email });
            toast.success("OTP sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            await axios.post(`${backendURL}/api/company/verifyOtp`, { email, otp });
            toast.success("OTP verified");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("Both password fields are required");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${backendURL}/api/company/resetPassword`, { email, password });
            toast.success("Password changed successfully");
            setStep(1);
            setEmail("");
            setOtp("");
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Reset Password"}
                </h2>

                {step === 1 && (
                    <>
                        <label className="block text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendOtp}
                            disabled={loading || !email}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <label className="block text-gray-700 mb-2">Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={verifyOtp}
                            disabled={loading || !otp}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <label className="block text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />

                        <label className="block text-gray-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={resetPassword}
                            disabled={loading || !password || !confirmPassword}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
