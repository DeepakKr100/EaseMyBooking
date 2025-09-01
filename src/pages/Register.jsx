import { useState } from "react";
import { registerApi } from "../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
 
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Visitor" });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email address";
    }
    if (!form.password.trim()) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };
 
  const errors = validate();
 
  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(errors).length > 0) return;
 
    try {
      setLoading(true);
      await registerApi(form);
      //alert("Registration successful. Please login.");
      toast.success("Registration successful. Please login.", { duration: 3000 });
      navigate("/login");
    } catch (err) {
      //alert(err?.response?.data || "Register failed");
      toast.error(err?.response?.data || "Register failed", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };
 
  return (
<div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80%22)%27")',
      }}
        >
<div className="max-w-md w-full bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-lg p-8">
<h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Your Account</h2>
<form className="space-y-4" onSubmit={onSubmit}>
          {/* Name Field */}
<input
            className="input input-bordered w-full"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched({ ...touched, name: true })}
          />
          {touched.name && errors.name && (
<p className="text-red-500 text-sm">{errors.name}</p>
          )}
 
          {/* Email Field */}
<input
            className="input input-bordered w-full"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onBlur={() => setTouched({ ...touched, email: true })}
          />
          {touched.email && errors.email && (
<p className="text-red-500 text-sm">{errors.email}</p>
          )}
 
          {/* Password Field */}
<input
            type="password"
            className="input input-bordered w-full"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onBlur={() => setTouched({ ...touched, password: true })}
          />
          {touched.password && errors.password && (
<p className="text-red-500 text-sm">{errors.password}</p>
          )}
 
          {/* Role Field */}
<div>
<label className="label">
<span className="label-text">Role</span>
</label>
<select
              className="select select-bordered w-full"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
>
<option>Visitor</option>
<option>Owner</option>
</select>
</div>
 
          {/* Submit Button */}
<button
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading}
>
            {loading ? "Submitting..." : "Create Account"}
</button>
</form>
</div>
</div>
  );
}