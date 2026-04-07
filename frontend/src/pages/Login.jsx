import React, { useState } from 'react';
import axios from 'axios';  // your axios instance
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/v1/user/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem("userId", res.data.user._id)
      navigate('/chat');  // change to /chat instead of /  aa khub jaruri chhe ama khali chat natu lakhyu 2 hour thai problem gotata...karn ke url bov dhyan aapine lakhva ke shu url hash etyare shu show karvu.. mention hatu ke "/"" hoy to login batavvu to aavya kartu login refresh thaine 
    } catch (err) {
      alert('Login failed: ' + (err.response?.data || 'Server error'));
    }
  };

  return (
    <form onSubmit={login} className='flex  flex-col  gap-3 h-screen w-screen items-center pt-30 bg-gray-100  '>
      <h2 className='text-xl font-medium'>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className='outline-none shadow-lg px-4 '
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
          className='outline-none shadow-lg px-4 '
      />
      <button type="submit" className='bg-gray-300 px-3 mt-4 cursor-pointer font-medium  rounded'>Login</button>
        <p>Don't have an account? <Link to="/register"><b>Register</b> here</Link></p>

    </form>
  );
}

export default Login;
