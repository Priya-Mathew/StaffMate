import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(4, 'Too short').required('Required'),
  role: Yup.string().required('Select a role'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear previous user on page load
  useEffect(() => {
    localStorage.removeItem('user');
  }, []);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/users?email=${values.email}&password=${values.password}&role=${values.role}`
      );
      const user = res.data[0];

      if (!user) {
        setErrors({ general: 'Invalid email, password, or role' });
        setSubmitting(false);
        return;
      }

      console.log('existingUser ' + values.email);

      let formattedDob = '';
      if (user.dob) {
        const d = new Date(user.dob);
        if (!isNaN(d)) formattedDob = d.toISOString().split('T')[0];
      }

      const updatedUser = { ...user, dob: formattedDob };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const token = 'mock-token-12345';
      dispatch(loginSuccess({ user: updatedUser, token, role: updatedUser.role }));

      if (updatedUser.role === 'HR') navigate('/hr');
      else if (updatedUser.role === 'Employee') navigate('/employee');
      else navigate('/login');
    } catch (error) {
      setErrors({ general: 'Login failed, try again' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (email) => {

    try {
      const res = await axios.get(`http://localhost:4000/users?email=${email.toLowerCase()}`);
      console.log('length ' + res.data.length);
      if (res.data.length > 0 && email) {
        alert("Account already exists. Please log in .");
      } else {
        navigate('/signup');
      }
    } catch (err) {
      console.error(err);
      alert("Error checking email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-blue-600 to-indigo-700 items-center justify-center p-16">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-extrabold mb-6">StaffMate HR Portal</h1>
          <p className="text-lg leading-relaxed">
            Manage employees, attendance, and HR tasks in one place.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Sign in</h2>

          <Formik
            enableReinitialize={true}
            initialValues={{ email: '', password: '', role: 'Employee' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, values }) => (
              <Form className="space-y-6">
                {errors.general && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {errors.general}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="off"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <Field type="radio" name="role" value="HR" />
                      HR
                    </label>
                    <label className="flex items-center gap-2">
                      <Field type="radio" name="role" value="Employee" />
                      Employee
                    </label>
                  </div>
                  <ErrorMessage name="role" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-md text-white font-semibold transition ${
                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Logging in...' : 'Sign In'}
                </button>

                {/* Sign Up Button */}
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button" // Prevents form submission
                      onClick={() => handleSignUp(values.email)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </Form>
            )}
          </Formik>

          <p className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} StaffMate HR Portal
          </p>
        </div>
      </div>
    </div>
  );
}
