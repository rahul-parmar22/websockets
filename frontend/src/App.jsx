
import Register from "./pages/Register";
import Login from "./pages/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
          


function App() {
 
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
