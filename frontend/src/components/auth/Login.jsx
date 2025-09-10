import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaUser } from "react-icons/fa";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3002/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLogin(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen bg-cover bg-center"
      // style={{ backgroundImage: "url('back.jpg')" }}
      
    >
    
      <div className="w-full max-w-md m-auto">
        <div
        className="fixed inset-0 -z-10 bg-[url('back.jpg')] bg-cover bg-no-repeat bg-center"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-green-600/40 to-blue-600/40"
        aria-hidden="true"
      />
        <div className="bg-black/55 border-4 border-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 class="text-3xl font-bold text-gray-700 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            VANNETRA & WebGIS
          </h2>
              
            <p className="text-white mt-1" >
              Forest Rights Act Decision Support System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Login As
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 flex items-center justify-center ${
                    selectedRole === "admin"
                      ? "bg-green-600 text-white shadow"
                      : "bg-transparent text-gray-600 hover:bg-gray-300 hover:text-gray-800 hover:scale-105"
                  }`}
                >
                  <FaUserShield className="mr-2" /> Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("user")}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-300 flex items-center justify-center ${
                    selectedRole === "user"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-transparent text-gray-600 hover:bg-gray-300 hover:text-gray-800 hover:scale-105"
                  }`}
                >
                  <FaUser className="mr-2" /> Beneficiary
                </button>
              </div>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white "
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300  shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 placeholder-gray-400 rounded-md"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold text-white transition-all duration-300 transform rounded-md ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:scale-105" // Added hover effects
                }`}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-white text-xl">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-green-600 hover:text-green-700 text-xl"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;