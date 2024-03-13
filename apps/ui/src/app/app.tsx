// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import "bootstrap/dist/css/bootstrap.min.css";

import Login from './login';

import { Route, Routes, Link } from 'react-router-dom';
export function App() {
  return (
    <div>
      <Login />
      
      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      {/* <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes> */}
      {/* END: routes */}
    </div>
  );
}

export default App;
