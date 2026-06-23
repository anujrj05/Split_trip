import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import { PASSWORD_HINT, validatePassword } from "../utils/passwordValidation";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") {
      setPasswordError("");
    }
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/user/forgot-password/request`,
        { email: formData.email }
      );
      toast.success(res.data.message || "OTP sent successfully");
      setStep(2);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }

    const passwordCheck = validatePassword(formData.newPassword);
    if (!passwordCheck.valid) {
      setPasswordError(passwordCheck.message);
      toast.error(passwordCheck.message);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/user/forgot-password/reset`,
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }
      );
      toast.success(res.data.message || "Password reset successful");
      navigate("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
        <p className="text-sm mb-5">Reset your password using email OTP.</p>

        <form onSubmit={step === 1 ? requestOtp : resetPassword}>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md outline-none"
              disabled={step === 2}
            />
          </div>

          {step === 2 && (
            <>
              <div className="mb-4">
                <label className="block mb-1">OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  className="w-full px-3 py-2 border rounded-md outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border rounded-md outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{PASSWORD_HINT}</p>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#1a43bf] text-white rounded-md px-3 py-2"
          >
            {step === 1 ? "Send OTP" : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/" className="text-blue-500 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
