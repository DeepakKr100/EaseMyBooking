import { useNavigate, useLocation } from "react-router-dom";
import { loginApi } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import loginBg from "../assets/login.jpg";
import { toast } from "react-hot-toast";

 
export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
 
  const formik = useFormik({
    initialValues: {
      email: "bob@easebook.com",
      password: "Visitor@123",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const data = await loginApi(values.email, values.password);
        const user = { id: data.userId, name: data.name, role: data.role };
        login(data.token, user);
 
        if (user.role === "Owner") {
          toast.success("Owner Login Successful.");
          navigate("/dashboard/owner", { replace: true });
        }
        else if (user.role === "Visitor") {
          toast.success("Visitor Login Successful.");
          navigate("/dashboard/visitor", { replace: true });
        }
        else navigate(from, { replace: true });
      } catch (err) {
        //alert(err?.response?.data || "Login failed");
        toast.error(err?.response?.data || "Login failed", { duration: 3000 });
      } finally {
        setLoading(false);
      }
    },
  });
 
  return (
<div
  className="min-h-screen bg-cover bg-center flex items-center justify-center"
  style={{
    backgroundImage: `url(${loginBg})`,
  }}
>
<div className="max-w-md w-full bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-lg p-8">
<h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h2>
<form className="space-y-4" onSubmit={formik.handleSubmit}>
<input
            className="input input-bordered w-full"
            placeholder="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
<p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
 
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
<p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
 
          <button
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading}
            type="submit"
>
            {loading ? "Logging in..." : "Login"}
</button>
</form>
</div>
</div>
  );
}