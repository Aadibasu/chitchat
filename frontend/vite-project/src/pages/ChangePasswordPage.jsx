import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router-dom";

function ChangePasswordPage() {
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "" });
  const { changePassword } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await changePassword(formData);
    setLoading(false);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-auto min-h-screen">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* form */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <LockIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Change Password</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="auth-input-label">Old password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        required
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        className="input"
                        placeholder="Current password"
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
                        placeholder="New password"
                      />
                    </div>
                  </div>

                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? <LoaderIcon className="w-full h-5 animate-spin text-center" /> : "Update Password"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/" className="auth-link">
                    Back to chat
                  </Link>
                </div>
              </div>
            </div>
            {/* illustration */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-80 h-80 object-contain rounded-2xl"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Keep your account safe</h3>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
