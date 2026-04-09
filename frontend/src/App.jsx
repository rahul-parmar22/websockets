
import Register from "./pages/Register";
import Login from "./pages/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
          


function App() {
    // read me file ma aa aavu hovu joi...GitHub Maintain Karo: Teri repository ki README file ek dum chamakni chahiye. Screenshots daal, tech stack likh, aur batao ki "Kaunsa problem solve kiya"...
//  Live Link: Interviewer ke bolne se pehle hi chat box mein apna Netlify/Vercel ka link phenk dena. Live chalta hua kaam 1000 line ke code se zyada bolta hai.
    const router = createBrowserRouter([
    {
         path:"/",
         element:<Register/>
    },
    {
      path:"/chat",
      element:<Home/>
    }, 
    {
      path:"/register",
      element:<Register/>
    },
   {
      path:"/login",
      element:<Login/>
    },
  ]); 

  return (
    <>
<RouterProvider router={router} /> 
  
    </>
  );
}

export default App;
