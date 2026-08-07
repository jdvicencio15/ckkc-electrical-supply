import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


function Register() {

    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await authService.register(formData);



    toast.success("Account created successfully!");

setTimeout(() => {
  navigate("/login");
}, 2000);

  } catch (error) {


    toast.error(
      error.response?.data?.message || "Registration failed"
    );

  }
};


  return (
    <div>

      <h1>Register</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />


        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />


        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />


        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />


        <button type="submit">
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;