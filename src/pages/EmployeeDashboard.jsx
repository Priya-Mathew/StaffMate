import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState('profile');

  // Leave request states
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    fromDate: '',
    toDate: '',
    leaveType: '',
    reason: '',
  });
  const [editIndex, setEditIndex] = useState(null);

  // Fetch employee data
  useEffect(() => {
    if (!loggedUser) return;

    axios.get(`http://localhost:4000/users/${loggedUser.id}`)
      .then(res => {
        const data = res.data;
        if (data.dob) data.dob = new Date(data.dob).toISOString().split('T')[0];
        if (data.joiningDate) data.joiningDate = new Date(data.joiningDate).toISOString().split('T')[0];
        setEmployee(data);
      })
      .catch(() => setMessage('Failed to load employee data'));
  }, [loggedUser?.id]);

  // Fetch leave requests
  useEffect(() => {
    if (!loggedUser) return;

    axios.get(`http://localhost:4000/leaveRequests?userId=${loggedUser.id}`)
      .then(res => setLeaveRequests(res.data || []))
      .catch(() => setLeaveRequests([]));
  }, [loggedUser?.id]);

  // Update employee profile
  const updateProfile = () => {
    axios.put(`http://localhost:4000/users/${loggedUser.id}`, employee)
      .then(() => setMessage('Profile updated successfully!'))
      .catch(() => setMessage('Failed to update profile'));
  };

  // Save or update leave request
  const saveLeaveRequest = () => {
    const { fromDate, toDate, leaveType, reason } = leaveForm;
    if (!fromDate || !toDate || !leaveType || !reason) {
      alert("Please fill in all fields");
      return;
    }

    if (editIndex !== null) {
      const leave = leaveRequests[editIndex];
      axios.put(`http://localhost:4000/leaveRequests/${leave.id}`, leaveForm)
        .then(res => {
          const updatedLeaves = [...leaveRequests];
          updatedLeaves[editIndex] = res.data;
          setLeaveRequests(updatedLeaves);
          setEditIndex(null);
          setLeaveForm({ fromDate: '', toDate: '', leaveType: '', reason: '' });
        })
        .catch(() => alert("Failed to update leave request"));
    } else {
      const newLeave = { ...leaveForm, userId: loggedUser.id, dateSubmitted: new Date().toISOString(), status: "Pending" };
      axios.post(`http://localhost:4000/leaveRequests`, newLeave)
        .then(res => {
          setLeaveRequests([...leaveRequests, res.data]);
          setLeaveForm({ fromDate: '', toDate: '', leaveType: '', reason: '' });
        })
        .catch(() => alert("Failed to submit leave request"));
    }
  };

  const editLeave = (index) => {
    setLeaveForm({ ...leaveRequests[index] });
    setEditIndex(index);
  };

  const deleteLeave = (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    axios.delete(`http://localhost:4000/leaveRequests/${id}`)
      .then(() => {
        setLeaveRequests(leaveRequests.filter(l => l.id !== id));
      })
      .catch(() => alert("Failed to delete leave request"));
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!loggedUser) return <div className="p-6">Please login first</div>;
  if (!employee) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-8 text-blue-600">StaffMate</h2>
        <ul>        
          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setActiveMenu('profile')}
          >
            Employee Profile
          </li>
          <li
            className={`mb-4 cursor-pointer px-4 py-2 rounded ${activeMenu === 'leave' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setActiveMenu('leave')}
          >
            Leave Request
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
  

        {/* Employee Profile Tab */}
        {activeMenu === 'profile' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Employee Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              {/* Name */}
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input type="text" value={employee.name || ''} onChange={e => setEmployee({ ...employee, name: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              {/* Email */}
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input type="email" value={employee.email || ''} onChange={e => setEmployee({ ...employee, email: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              {/* DOB */}
              <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input type="date" value={employee.dob || ''} onChange={e => setEmployee({ ...employee, dob: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              {/* Joining Date */}
              <div>
                <label className="block mb-1 font-medium">Joining Date</label>
                <input type="date" value={employee.joiningDate || ''} onChange={e => setEmployee({ ...employee, joiningDate: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Address</label>
                <textarea value={employee.address || ''} onChange={e => setEmployee({ ...employee, address: e.target.value })} className="w-full p-2 border rounded" rows={3} />
              </div>
              {/* Department */}
              <div>
                <label className="block mb-1 font-medium">Department</label>
                <select value={employee.department || ''} onChange={e => setEmployee({ ...employee, department: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Development">Development</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              {/* Position */}
              <div>
                <label className="block mb-1 font-medium">Position</label>
                <select value={employee.position || ''} onChange={e => setEmployee({ ...employee, position: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Position</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              {/* Gender */}
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select value={employee.gender || ''} onChange={e => setEmployee({ ...employee, gender: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Marital Status */}
              <div>
                <label className="block mb-1 font-medium">Marital Status</label>
                <select value={employee.maritalStatus || ''} onChange={e => setEmployee({ ...employee, maritalStatus: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              {/* Nationality */}
              <div>
                <label className="block mb-1 font-medium">Nationality</label>
                <select value={employee.nationality || ''} onChange={e => setEmployee({ ...employee, nationality: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Nationality</option>
                  <option value="American">American</option>
                  <option value="Indian">Indian</option>
                  <option value="Canadian">Canadian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <input type="text" value={employee.status || 'Active'} readOnly className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed" />
              </div>
            </div>

            <button onClick={updateProfile} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Changes
            </button>

            {message && <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">{message}</div>}
          </div>
        )}

        {/* Leave Request Tab */}
        {activeMenu === 'leave' && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Submit Leave Request</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mb-4">
              <div>
                <label className="block mb-1 font-medium">From Date</label>
                <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">To Date</label>
                <input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Reason for Leave</label>
                <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full p-2 border rounded" rows={3} />
              </div>
            </div>

            <button onClick={saveLeaveRequest} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {editIndex !== null ? 'Update Leave Request' : 'Submit Leave Request'}
            </button>

            {/* Leave Requests List */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Your Leave Requests</h2>
            {leaveRequests.length === 0 && <p>No leave requests submitted yet.</p>}

            <ul className="space-y-4 max-w-xl">
              {leaveRequests.map((leave, idx) => (
                <li key={leave.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p><strong>From:</strong> {leave.fromDate}</p>
                      <p><strong>To:</strong> {leave.toDate}</p>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => editLeave(idx)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={leave.status === "Approved"}>
                        Edit
                      </button>
                      <button onClick={() => deleteLeave(leave.id)} className={`px-3 py-1 rounded text-white ${leave.status === "Pending" ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`} disabled={leave.status !== "Pending"}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <p><strong>Leave Type:</strong> {leave.leaveType}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={leave.status === "Approved" ? "text-green-600 font-semibold": leave.status === "Rejected"? "text-red-600 font-semibold": "text-yellow-600 font-semibold"}>
                      {leave.status || "Pending"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
