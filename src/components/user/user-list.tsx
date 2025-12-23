import React, { useState, useEffect } from 'react';
import API_URL from '@/lib/api';

interface User {
    username: string;
    name: string;
    lastname: string;
    is_active: boolean;
    status: 'USER' | 'ADMIN';
}

const UserList = ({ token }: { token: string }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        lastname: '',
        is_active: true,
        status: 'USER' as 'USER' | 'ADMIN'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.ok === false) {
                    alert(data.error);
                    return;
                }
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing ? `${API_URL}/api/users/${currentUser?.username}` : `${API_URL}/api/users/register`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.ok === false) {
                alert(data.error || data.message);
                return;
            }
            alert(`User ${isEditing ? 'updated' : 'created'} successfully`);
            
            // Re-fetch users after submission
            const fetchUsers = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (data.ok === false) {
                        alert(data.error);
                        return;
                    }
                    setUsers(data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();

            resetForm();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, error);
        }
    };
    
    const handleEdit = (user: User) => {
        setIsEditing(true);
        setCurrentUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            lastname: user.lastname,
            is_active: user.is_active,
            status: user.status
        });
    };

    const handleDelete = async (username: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.ok === false) {
                alert(data.error);
                return;
            }
            alert('User deleted successfully');
            const fetchUsers = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (data.ok === false) {
                        alert(data.error);
                        return;
                    }
                    setUsers(data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentUser(null);
        setFormData({
            username: '',
            password: '',
            name: '',
            lastname: '',
            is_active: true,
            status: 'USER'
        });
    };

    return (
        <div>
            <div className="mb-4 p-4 border rounded">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add User'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} className="p-2 border rounded" required disabled={isEditing} />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="p-2 border rounded" required={!isEditing} />
                        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="p-2 border rounded" required />
                        <input type="text" name="lastname" placeholder="Lastname" value={formData.lastname} onChange={handleInputChange} className="p-2 border rounded" required />
                        <select name="status" value={formData.status} onChange={handleInputChange} className="p-2 border rounded">
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <div className="flex items-center">
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleCheckboxChange} className="mr-2" />
                            <label htmlFor="is_active">Active</label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Username</th>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2">Active</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.username}>
                            <td className="border px-4 py-2">{user.username}</td>
                            <td className="border px-4 py-2">{user.name}</td>
                            <td className="border px-4 py-2">{user.status}</td>
                            <td className="border px-4 py-2">{user.is_active ? 'Yes' : 'No'}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEdit(user)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(user.username)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
