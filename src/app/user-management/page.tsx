"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon } from "lucide-react";

import API_URL from "@/lib/api";

interface User {
  id: number;
  username: string;
  email?: string;
  name: string;
  lastname: string;
  organization?: string;
  status: string;
  is_active: string;
  is_approve: string;
}

interface UserPayload {
  username: string;
  email: string;
  name: string;
  lastname: string;
  organization: string;
  status: string;
  is_active: string;
  is_approve: string;
  password?: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  // Login History states
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Derived lists
  const pendingUsers = useMemo(() => users.filter((u) => u.is_approve === "N"), [users]);
  const approvedUsers = useMemo(() => users.filter((u) => u.is_approve === "Y"), [users]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const user: UserPayload = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      lastname: formData.get("lastname") as string,
      organization: formData.get("organization") as string,
      is_active: formData.get("is_active") as string,
      is_approve: formData.get("is_approve") as string,
      status: formData.get("status") as string,
    };

    if (password) {
      user.password = password;
    }

    if (currentUser) {
      try {
        const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to update user');
        toast.success('User updated successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to update user');
        console.error('Error updating user:', error);
      }
    } else {
      try {
        const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to create user');
        toast.success('User created successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to create user');
        console.error('Error creating user:', error);
      }
    }
    setIsDialogOpen(false);
  };

  const fetchAuditLogs = async (user: User) => {
    setHistoryUser(user);
    setIsHistoryDialogOpen(true);
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/audit-logs/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      toast.error('Failed to fetch login history');
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_approve: 'Y' }),
      });
      if (!response.ok) throw new Error('Failed to approve user');
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
      console.error('Error approving user:', error);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">LOGIN SUCCESS</Badge>;
      case 'LOGIN_FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">LOGIN FAILED</Badge>;
      case 'ACCOUNT_LOCKED':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">ACCOUNT LOCKED</Badge>;
      case 'LOGIN_LOCKED_ATTEMPT':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">LOCKED ATTEMPT</Badge>;
      case 'REGISTER_SUCCESS':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">REGISTERED</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  // Tab styles (same pattern as upload page)
  const tabActive = "bg-slate-900 text-white shadow-sm";
  const tabInactive = "bg-white text-slate-600 hover:bg-slate-100";
  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => { setCurrentUser(null); setIsDialogOpen(true); }}>Create User</Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "pending" ? tabActive : tabInactive}`}
        >
          Pending Approval
          {pendingUsers.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "approved" ? tabActive : tabInactive}`}
        >
          Approved Users
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {approvedUsers.length}
          </span>
        </button>
      </div>

      {/* ===== Pending Approval Tab ===== */}
      {activeTab === "pending" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No pending users.
                  </TableCell>
                </TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.name} {user.lastname}</TableCell>
                    <TableCell>{user.organization || "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproveUser(user.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setCurrentUser(user); setIsDialogOpen(true); }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ===== Approved Users Tab ===== */}
      {activeTab === "approved" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Is Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No approved users.
                  </TableCell>
                </TableRow>
              ) : (
                approvedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.name} {user.lastname}</TableCell>
                    <TableCell>{user.organization || "-"}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>{user.is_active === 'Y' ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setCurrentUser(user); setIsDialogOpen(true); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAuditLogs(user)}
                        >
                          <HistoryIcon className="h-4 w-4 mr-1" />
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit / Create User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={currentUser?.username}
                required
                readOnly={!!currentUser}
                className={currentUser ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser?.email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!currentUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={currentUser?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                name="lastname"
                defaultValue={currentUser?.lastname}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                defaultValue={currentUser?.organization}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Is Active</Label>
              <select
                id="is_active"
                name="is_active"
                defaultValue={currentUser ? currentUser.is_active : 'Y'}
                required
                className={selectClass}
              >
                <option value="Y">Activate</option>
                <option value="N">Deactivate</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_approve">Approved</Label>
              <select
                id="is_approve"
                name="is_approve"
                defaultValue={currentUser ? currentUser.is_approve : 'Y'}
                required
                className={selectClass}
              >
                <option value="Y">Approved</option>
                <option value="N">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Role</Label>
              <select
                id="status"
                name="status"
                defaultValue={currentUser?.status || 'VIEWER'}
                required
                className={selectClass}
              >
                {/* <option value="ADMIN">ADMIN</option> */}
                <option value="UPLOADER">UPLOADER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Login History — {historyUser?.username}
            </DialogTitle>
          </DialogHeader>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">No login history found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={log.details || '-'}>
                      {log.details || '-'}
                    </TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
