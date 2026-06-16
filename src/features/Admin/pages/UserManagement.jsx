import { useState } from "react";
import { UserPlus, Search, MoreHorizontal } from "lucide-react";
import { Card, CardHeader, SectionTitle, Badge, Avatar, Table, TableRow, TableCell, Input, Select, Modal, Button } from "../components/ui";
import { users as initialUsers } from "../data/mockData";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui";

const roleColors = { Nurse: "blue", Doctor: "purple", Admin: "danger", HOD: "info" };

function UserFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: "", email: "", role: "Nurse", department: "Ward A", status: "active" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const labelCls = "block text-[12px] font-semibold text-txt-secondary mb-1";
  const inputCls = "w-full h-9 rounded-lg border border-slate-200 bg-surf text-[13px] text-txt-primary px-3 outline-none focus:border-accent focus:bg-white transition-colors";

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit User" : "Create New User"}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => onSave(form)}>Save</Button></>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className={labelCls}>Full Name</label><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sarah Al-Amin" /></div>
        <div className="col-span-2"><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@hospital.com" /></div>
        {!initial && <div className="col-span-2"><label className={labelCls}>Password</label><input className={inputCls} type="password" placeholder="••••••••" /></div>}
        <div>
          <label className={labelCls}>Role</label>
          <select className={inputCls} value={form.role} onChange={e => set("role", e.target.value)}>
            {["Nurse","Doctor","Admin","HOD"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Department</label>
          <select className={inputCls} value={form.department} onChange={e => set("department", e.target.value)}>
            {["Ward A","Ward B","ICU","Admin","System"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default function UserManagement() {
  const [userList, setUserList] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const { toasts, show, remove } = useToast();

  const avatarColors = ["#2563EB","#7C3AED","#DC2626","#059669","#D97706","#0891B2","#BE185D"];

  const filtered = userList.filter(u => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === "all" || u.role === roleFilter;
    return ms && mr;
  });

  const handleCreate = form => {
    const initials = form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    setUserList(l => [...l, { ...form, id: Date.now(), initials, lastLogin: "Never", color: avatarColors[l.length % avatarColors.length] }]);
    setCreateOpen(false);
    show("User created successfully", "success");
  };

  const handleEdit = form => {
    setUserList(l => l.map(u => u.id === editUser.id ? { ...u, ...form } : u));
    setEditUser(null);
    show("User updated", "success");
  };

  const handleSuspend = id => {
    setUserList(l => l.map(u => u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u));
    setOpenMenu(null);
    show("User status updated", "success");
  };

  const handleResetPw = () => {
    setOpenMenu(null);
    show("Password reset email sent", "info");
  };

  return (
    <div className="flex flex-col gap-5">
      <Toast toasts={toasts} remove={remove} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">User Management</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">{userList.length} registered accounts</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <UserPlus size={15} /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <SectionTitle>All Users</SectionTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={14} />} className="w-44" />
            <Select value={roleFilter} onChange={setRoleFilter}
              options={["all","Nurse","Doctor","Admin","HOD"].map(r => ({ value: r, label: r === "all" ? "All Roles" : r }))}
              className="w-32"
            />
          </div>
        </CardHeader>

        <Table headers={["Name", "Role", "Department", "Status", "Last Login", "Actions"]}>
          {filtered.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar initials={user.initials} color={user.color} size="sm" />
                  <div>
                    <p className="font-medium text-txt-primary">{user.name}</p>
                    <p className="text-[11px] text-txt-muted">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge variant={user.role}>{user.role}</Badge></TableCell>
              <TableCell><span className="text-txt-secondary">{user.department}</span></TableCell>
              <TableCell><Badge variant={user.status}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge></TableCell>
              <TableCell><span className="text-txt-muted text-[12px]">{user.lastLogin}</span></TableCell>
              <TableCell>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-muted hover:bg-surf transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenu === user.id && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-slate-100 shadow-card-hover z-20 overflow-hidden">
                      <button onClick={() => { setEditUser(user); setOpenMenu(null); }} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-txt-primary hover:bg-surf">Edit</button>
                      <button onClick={() => handleSuspend(user.id)} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-warning hover:bg-amber-50">{user.status === "suspended" ? "Reactivate" : "Suspend"}</button>
                      <button onClick={handleResetPw} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-accent hover:bg-blue-50">Reset Password</button>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <UserFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
      <UserFormModal open={!!editUser} onClose={() => setEditUser(null)} onSave={handleEdit} initial={editUser} />
    </div>
  );
}
