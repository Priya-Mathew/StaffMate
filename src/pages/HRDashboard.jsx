import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HRDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const [hrProfile, setHrProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState('home');

  // Leave approval states
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Employee management states
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // ✅ This is the state you were missing / out of scope
  const DEFAULT_FORM = {
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
    role: 'Employee',
    status: 'Active', // non-editable in UI
  };
  const [formData, setFormData] = useState(DEFAULT_FORM);
  // Fetch HR profile
  useEffect(() => {
    if (!loggedUser) return;

    axios.get(`http://localhost:4000/users/${loggedUser.id}`)
      .then(res => {
        const data = res.data;
        if (data.dob) data.dob = new Date(data.dob).toISOString().split('T')[0];
        if (data.joiningDate) data.joiningDate = new Date(data.joiningDate).toISOString().split('T')[0];
        setHrProfile(data);
      })
      .catch(() => setMessage('Failed to load HR data'));
  }, [loggedUser?.id]);

  // Fetch all employee leave requests
  useEffect(() => {
    axios.get(`http://localhost:4000/leaveRequests`)
      .then(res => setLeaveRequests(res.data || []))
      .catch(() => setLeaveRequests([]));
  }, []);

  // Fetch all employees
  useEffect(() => {

    axios.get(`http://localhost:4000/users`)
      .then(res => {
        const empList = res.data.filter(u => u.role === 'Employee'); // Only employees
        setEmployees(empList);
      })
      .catch(() => setEmployees([]));

  }, [activeMenu]);

  // Derived counts for Home tab
  const totalEmployees = employees.length;
  const pendingLeaves = leaveRequests.filter(l => l.status === "Pending").length;


  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateProfile = () => {
    axios.put(`http://localhost:4000/users/${loggedUser.id}`, hrProfile)
      .then(() => setMessage('Profile updated successfully!'))
      .catch(() => setMessage('Failed to update profile'));
  };

  const approveLeave = (id) => {
    axios.patch(`http://localhost:4000/leaveRequests/${id}`, { status: 'Approved' })
      .then(() => setLeaveRequests(leaveRequests.map(l => l.id === id ? { ...l, status: 'Approved' } : l)))
      .catch(() => alert("Failed to approve leave"));
  };

  const rejectLeave = (id) => {
    axios.patch(`http://localhost:4000/leaveRequests/${id}`, { status: 'Rejected' })
      .then(() => setLeaveRequests(leaveRequests.map(l => l.id === id ? { ...l, status: 'Rejected' } : l)))
      .catch(() => alert("Failed to reject leave"));
  };

  // Employee management handlers
  const deleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios.delete(`http://localhost:4000/users/${id}`)
        .then(() => setEmployees(employees.filter(emp => emp.id !== id)))
        .catch(() => alert("Failed to delete employee"));
    }
  };
  const saveEmployee = () => {
    axios.put(`http://localhost:4000/users/${editingEmployee.id}`, editingEmployee)
      .then(() => {
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
        setEditingEmployee(null);
      })
      .catch(() => alert("Failed to update employee"));
  };
  const openEditModal = (employee) => {
    setFormData(employee); // pre-fill modal
    setEditingEmployee(employee);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveEmployee = () => {
    axios.put(`http://localhost:4000/users/${formData.id}`, formData)
      .then(() => {
        setEmployees(employees.map(emp => emp.id === formData.id ? formData : emp));
        setEditingEmployee(null);
      })
      .catch(() => alert("Failed to update employee"));
  };
  // Open add modal

  const handleAddClick = () => {
    setFormData(DEFAULT_FORM); // clean form with default role/status
    setAddModalOpen(true);
  };

  // Save new employee
  const handleAddSave = () => {
    axios.post("http://localhost:4000/users", formData)
      .then((res) => {
        setEmployees(prev => [...prev, res.data]); // keep table & home count in sync
        setAddModalOpen(false);
      })
      .catch(() => alert("Failed to add employee"));
  };
  if (!loggedUser) return <div className="p-6">Please login first</div>;
  if (!hrProfile) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - identical style to Employee Dashboard */}
      <nav className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-8 text-blue-600">StaffMate</h2>
        <ul>
          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setActiveMenu('home')}
          >
            Home
          </li>
          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setActiveMenu('profile')}
          >
            HR Profile
          </li>
          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'employees' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`} onClick={() => setActiveMenu('employees')}>
            Employee Management
          </li>

          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'leave' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setActiveMenu('leave')}
          >
            Leave Approval
          </li>
          <li
            className="mt-8 cursor-pointer px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleSignOut}
          >
            Sign Out
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Home Tab */}
        {activeMenu === 'home' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {hrProfile.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div className="p-4 bg-white shadow rounded">
                <h2 className="text-xl font-semibold">Total Employees</h2>
                <p className="text-2xl mt-2">{totalEmployees}</p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h2 className="text-xl font-semibold">Pending Leave Requests</h2>
                <p className="text-2xl mt-2">{pendingLeaves}</p>
              </div>
            </div>
          </div>
        )}

        {/* HR Profile Tab */}
        {activeMenu === 'profile' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">HR Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input type="text" value={hrProfile.name || ''} onChange={e => setHrProfile({ ...hrProfile, name: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input type="email" value={hrProfile.email || ''} onChange={e => setHrProfile({ ...hrProfile, email: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input type="date" value={hrProfile.dob || ''} onChange={e => setHrProfile({ ...hrProfile, dob: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Joining Date</label>
                <input type="date" value={hrProfile.joiningDate || ''} onChange={e => setHrProfile({ ...hrProfile, joiningDate: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Address</label>
                <textarea value={hrProfile.address || ''} onChange={e => setHrProfile({ ...hrProfile, address: e.target.value })} className="w-full p-2 border rounded" rows={3} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Department</label>
                <select value={hrProfile.department || ''} onChange={e => setHrProfile({ ...hrProfile, department: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Development">Development</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Position</label>
                <select value={hrProfile.position || ''} onChange={e => setHrProfile({ ...hrProfile, position: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Position</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select value={hrProfile.gender || ''} onChange={e => setHrProfile({ ...hrProfile, gender: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Marital Status</label>
                <select value={hrProfile.maritalStatus || ''} onChange={e => setHrProfile({ ...hrProfile, maritalStatus: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Nationality</label>
                <select value={hrProfile.nationality || ''} onChange={e => setHrProfile({ ...hrProfile, nationality: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Nationality</option>
                  <option value="American">American</option>
                  <option value="Indian">Indian</option>
                  <option value="Canadian">Canadian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <input type="text" value={hrProfile.status || 'Active'} readOnly className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed" />
              </div>
            </div>
            <button onClick={updateProfile} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Changes
            </button>
            {message && <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">{message}</div>}
          </div>
        )}

        {/* Leave Approval Tab */}
        {activeMenu === 'leave' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Employee Leave Requests</h1>
            {leaveRequests.length === 0 && <p>No leave requests submitted yet.</p>}
            <ul className="space-y-4 max-w-xl">
              {leaveRequests.map((leave) => (
                <li key={leave.id} className="border p-4 rounded shadow-sm">
                  <p><strong>Employee ID:</strong> {leave.userId}</p>
                  <p><strong>From:</strong> {leave.fromDate}</p>
                  <p><strong>To:</strong> {leave.toDate}</p>
                  <p><strong>Type:</strong> {leave.leaveType}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p><strong>Status:</strong> {leave.status || 'Pending'}</p>
                  <div className="mt-2 space-x-2">
                    <button onClick={() => approveLeave(leave.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => rejectLeave(leave.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Employee Management */}
        {activeMenu === 'employees' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Employee Management</h1>
            <button onClick={handleAddClick} className="bg-green-500 text-white px-4 py-2 rounded">Add Employee</button>
            {employees.length === 0 && <p>No employees found.</p>}
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Department</th>
                  <th className="py-2 px-4 border">Position</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="py-2 px-4 border">{emp.name}</td>
                    <td className="py-2 px-4 border">{emp.email}</td>
                    <td className="py-2 px-4 border">{emp.department}</td>
                    <td className="py-2 px-4 border">{emp.position}</td>
                    <td className="py-2 px-4 border space-x-2">
                      <button onClick={() => { setEditingEmployee(emp); setFormData(emp); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                      <button onClick={() => deleteEmployee(emp.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            {/* Edit Employee Modal */}
            {editingEmployee && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="bg-white p-6 rounded w-1/2">
                  <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                  <div className="grid grid-cols-2 gap-4">

                    <label>
                      Name
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Name"
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Email
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="Email"
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Phone
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="Phone"
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Date of Birth
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Joining Date
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Address
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        placeholder="Address"
                        className="border p-2 rounded w-full"
                      />
                    </label>

                    <label>
                      Department
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Development">Development</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </label>

                    <label>
                      Position
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Select Position</option>
                        <option value="Manager">Manager</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Developer">Developer</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </label>

                    <label>
                      Gender
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </label>

                    <label>
                      Marital Status
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </label>

                    <label>
                      Nationality
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                      >
                        <option value="">Select Nationality</option>
                        <option value="American">American</option>
                        <option value="Indian">Indian</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    <label>
                      Status
                      <input
                        name="status"
                        value={formData.status || "Active"}
                        disabled
                        className="border p-2 rounded bg-gray-100 w-full"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingEmployee(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEmployee}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

            )}


            {/* Add Modal */}
            {addModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded w-1/2">
                  <h2 className="text-xl font-bold mb-4">Add Employee</h2>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Name */}
                    <div>
                      <label className="block mb-1 font-semibold">Name</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter Name"
                        className="border p-2 w-full"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block mb-1 font-semibold">Email</label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="Enter Email"
                        className="border p-2 w-full"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block mb-1 font-semibold">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      />
                    </div>

                    {/* Joining Date */}
                    <div>
                      <label className="block mb-1 font-semibold">Joining Date</label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block mb-1 font-semibold">Address</label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        placeholder="Enter Address"
                        className="border p-2 w-full"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block mb-1 font-semibold">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Development">Development</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block mb-1 font-semibold">Position</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      >
                        <option value="">Select Position</option>
                        <option value="Manager">Manager</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Developer">Developer</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block mb-1 font-semibold">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label className="block mb-1 font-semibold">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block mb-1 font-semibold">Nationality</label>
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleFormChange}
                        className="border p-2 w-full"
                      >
                        <option value="">Select Nationality</option>
                        <option value="American">American</option>
                        <option value="Indian">Indian</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block mb-1 font-semibold">Status</label>
                      <input
                        name="status"
                        value={formData.status}
                        readOnly
                        className="border p-2 bg-gray-200 w-full"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block mb-1 font-semibold">Role</label>
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="role"
                            value="Employee"
                            checked={formData.role === "Employee"}
                            onChange={handleFormChange}
                          /> Employee
                        </label>
                        <label className="ml-4">
                          <input
                            type="radio"
                            name="role"
                            value="HR"
                            checked={formData.role === "HR"}
                            onChange={handleFormChange}
                          /> HR
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setAddModalOpen(false)}
                      className="bg-gray-400 px-4 py-2 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSave}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
           </div>
        )}
      </main>
    </div>
  );
}