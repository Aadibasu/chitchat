import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPage() {
  const [step, setStep] = useState(1); // 1 = request otp, 2 = reset password
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "" });
  const { requestPasswordReset, resetPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(formData.email);
    setLoading(false);
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    await resetPassword(formData);
    setLoading(false);
    // after successful reset maybe redirect to login
    window.location.href = "/login";
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-auto min-h-screen">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* left form */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <MailIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    {step === 1 ? "Forgot Password" : "Reset Password"}
                  </h2>
                </div>
                <form onSubmit={step === 1 ? handleRequest : handleReset} className="space-y-6">
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {step === 2 && (
                    <>
                      <div>
                        <label className="auth-input-label">OTP code</label>
                        <div className="relative">
                          <LockIcon className="auth-input-icon" />
                          <input
                            type="text"
                            required
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            className="input"
                            placeholder="6-digit code"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="auth-input-label">New password</label>
                        <div className="relative">
                          <LockIcon className="auth-input-icon" />
                          <input
                            type="password"
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="input"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? <LoaderIcon className="w-full h-5 animate-spin text-center" /> : step === 1 ? "Send OTP" : "Reset Password"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
            {/* right illustration */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-80 h-80 object-contain rounded-2xl"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Secure your account</h3>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ForgotPage;
