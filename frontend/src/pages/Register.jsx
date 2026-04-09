import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(form)
    try {
      const res = await axios.post("http://localhost:5000/api/v1/user/register", form);
      alert("Registration successful. Now login.");
      //console.log(res);
      
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div >
      
      <form onSubmit={handleSubmit} className='flex  flex-col  gap-3 h-screen w-screen items-center pt-30 bg-gray-100  ' >
        <h2 className='text-xl font-medium'>Register</h2>
          <input
         
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className='outline-none shadow-lg px-4 '
       />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
         className='outline-none shadow-lg px-4 '
        />
        <button type="submit"  className='bg-gray-300 px-3 mt-4 cursor-pointer font-medium  rounded'>Register</button>
     <p>Already registered? <Link to="/login"><b>Login</b> here</Link></p>
    {/* Already registered? <a href="/login">Login here</a> */}
      </form>
 
       
       
   
    </div>
  );
}

export default Register;
