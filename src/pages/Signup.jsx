import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const signupSchema = Yup.object().shape({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  dob: Yup.string().required('Date of birth is required'),
  joiningDate: Yup.string().required('Joining date is required'),
  address: Yup.string().required('Address is required'),
  department: Yup.string().required('Select department'),
  position: Yup.string().required('Select position'),
  gender: Yup.string().required('Select gender'),
  maritalStatus: Yup.string().required('Select marital status'),
  nationality: Yup.string().required('Select nationality'),
  role: Yup.string().required('Select role'),
  status: Yup.string(),
  password: Yup.string().min(4, 'Too short').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function Signup() {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      // Check if email already exists
      const res = await axios.get(`http://localhost:4000/users?email=${values.email}`);
      if (res.data.length > 0) {
        setErrors({ general: 'Account already exists with this email' });
        setSubmitting(false);
        return;
      }

      // Create new account
      await axios.post('http://localhost:4000/users', {
        ...values,
        status: 'Active',
      });

      alert('Account created successfully!');
      resetForm();
      navigate('/login');
    } catch (error) {
      setErrors({ general: 'Signup failed, please try again' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/3 bg-gradient-to-tr from-blue-600 to-indigo-700 items-center justify-center p-16">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-extrabold mb-6">Join StaffMate</h1>
          <p className="text-lg leading-relaxed">
            Create an account to manage employees, attendance, and HR tasks easily.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center w-full md:w-2/3 px-8 sm:px-16 lg:px-24">
        <div className="max-w-3xl w-full mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Sign Up</h2>

          <Formik
            initialValues={{
              name: '',
              email: '',
              dob: '',
              joiningDate: '',
              address: '',
              department: '',
              position: '',
              gender: '',
              maritalStatus: '',
              nationality: '',
              status: 'Active',
              role: 'Employee',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={signupSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors }) => (
              <Form className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {errors.general}
                  </div>
                )}

                {/* Name & Email */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                {/* DOB & Joining Date */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <Field name="dob" type="date" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
                    <ErrorMessage name="dob" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                    <Field name="joiningDate" type="date" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
                    <ErrorMessage name="joiningDate" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Field name="address" type="text" placeholder="123 Street, City" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
                  <ErrorMessage name="address" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                {/* Department & Position */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <Field as="select" name="department" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Department</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                    </Field>
                    <ErrorMessage name="department" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <Field as="select" name="position" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Position</option>
                      <option value="Manager">Manager</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Staff">Staff</option>
                    </Field>
                    <ErrorMessage name="position" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                {/* Gender & Marital Status */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <Field as="select" name="gender" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <Field as="select" name="maritalStatus" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </Field>
                    <ErrorMessage name="maritalStatus" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                {/* Nationality & Status */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <Field as="select" name="nationality" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Nationality</option>
                      <option value="American">American</option>
                      <option value="Indian">Indian</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="nationality" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Field name="status" type="text" disabled className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
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

                {/* Password & Confirm Password */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <Field name="password" type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
                    <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <Field name="confirmPassword" type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-indigo-500" />
                    <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-md text-white font-semibold transition ${
                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Signing up...' : 'Sign Up'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium">
                Sign In
              </button>
            </p>
          </div>

          <p className="mt-8 text-center text-gray-500 text-sm">&copy; {new Date().getFullYear()} StaffMate HR Portal</p>
        </div>
      </div>
    </div>
  );
}
