'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  IdentificationIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckSolid,
  ShieldCheckIcon as ShieldSolid,
} from '@heroicons/react/24/solid';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ROLE_COLORS = {
  tenant:   'bg-blue-100 text-blue-700',
  landlord: 'bg-purple-100 text-purple-700',
  investor: 'bg-green-100 text-green-700',
  admin:    'bg-red-100 text-red-700',
};

const ID_STATUS = {
  none:     { label: 'Not uploaded',   cls: 'bg-slate-100 text-slate-500' },
  pending:  { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved',       cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected',       cls: 'bg-red-100   text-red-700'   },
};

// Document Viewer Modal
function DocModal({ user, onClose, onApprove, onReject, busy }) {
  if (!user) return null;
  const isPDF = user.id_document?.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">ID Document Review</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {user.name} &middot; <span className="capitalize">{user.role}</span> &middot; {user.email}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-slate-50 min-h-0">
          {user.id_document ? (
            isPDF ? (
              <iframe src={user.id_document} className="w-full h-96 rounded-lg border border-slate-200" title="ID Document" />
            ) : (
              <img src={user.id_document} alt="ID Document" className="max-w-full max-h-[55vh] object-contain mx-auto rounded-lg border border-slate-200 shadow-sm" />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <IdentificationIcon className="w-12 h-12 mb-2" />
              <p className="text-sm">No document uploaded</p>
            </div>
          )}
        </div>
        <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-2 bg-white">
          <span className="text-sm text-slate-500">Current status:</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ID_STATUS[user.id_document_status ?? 'none']?.cls}`}>
            {ID_STATUS[user.id_document_status ?? 'none']?.label}
          </span>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition">Close</button>
          <button onClick={() => onReject(user.id)} disabled={!!busy || user.id_document_status === 'rejected' || !user.id_document}
            className="flex-1 py-2.5 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl hover:bg-red-100 disabled:opacity-40 transition text-sm flex items-center justify-center gap-2">
            <XCircleIcon className="w-4 h-4" /> {busy === user.id + 'reject_id' ? 'Rejecting...' : 'Reject ID'}
          </button>
          <button onClick={() => onApprove(user.id)} disabled={!!busy || user.id_document_status === 'approved' || !user.id_document}
            className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 transition text-sm flex items-center justify-center gap-2">
            <ShieldSolid className="w-4 h-4" /> {busy === user.id + 'approve_id' ? 'Approving...' : 'Approve ID'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [docUser, setDocUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role)   params.set('role', role);
      if (activeTab === 'pending_docs') params.set('pending_id', '1');

      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const data = await res.json();
      let list = data.users ?? [];
      if (activeTab === 'all' && idFilter) {
        list = list.filter(u => (u.id_document_status ?? 'none') === idFilter);
      }
      setUsers(list);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, role, idFilter, activeTab]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId, action) => {
    setBusy(userId + action);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u));
      if (docUser?.id === userId) setDocUser(prev => ({ ...prev, ...data.user }));
      const msgs = { approve: 'User activated', suspend: 'User suspended', approve_id: 'ID document approved ✓', reject_id: 'ID document rejected' };
      showToast(msgs[action] ?? `Action applied`);
    } catch (err) {
      showToast(err.message || `Failed to ${action}`, 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user permanently? This action cannot be undone.')) return;
    setBusy(userId + 'delete');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted permanently');
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleApproveId = uid => handleAction(uid, 'approve_id');
  const handleRejectId  = uid => handleAction(uid, 'reject_id');

  const pendingDocCount = activeTab === 'pending_docs' ? users.length : users.filter(u => u.id_document_status === 'pending' && u.id_document).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckSolid className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {docUser && (
        <DocModal user={docUser} onClose={() => setDocUser(null)} onApprove={handleApproveId} onReject={handleRejectId} busy={busy} />
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">Manage users and review identity documents</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {[
          { key: 'all', label: 'All Users', Icon: UserGroupIcon },
          { key: 'pending_docs', label: 'Pending ID Review', Icon: ClockIcon },
        ].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => { setActiveTab(key); setIdFilter(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            {key === 'pending_docs' && pendingDocCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full leading-none">{pendingDocCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <select value={role} onChange={e => setRole(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="investor">Investor</option>
            <option value="admin">Admin</option>
          </select>
          {activeTab === 'all' && (
            <select value={idFilter} onChange={e => setIdFilter(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">All ID Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="none">Not Uploaded</option>
            </select>
          )}
        </div>
        <div className="text-sm text-slate-500 self-center whitespace-nowrap">{users.length} users</div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" /><p className="text-slate-500 text-sm">Loading users...</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr><th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">User</th><th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th><th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Account</th><th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">ID Document</th><th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Joined</th><th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">{activeTab === 'pending_docs' ? 'No pending ID documents — all clear!' : 'No users found'}</td></tr>
                ) : users.map(u => {
                  const idSt = ID_STATUS[u.id_document_status ?? 'none'];
                  const hasPendingId = u.id_document_status === 'pending' && u.id_document;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${hasPendingId ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">{getInitials(u.name)}</div><div><p className="text-sm font-semibold text-slate-900">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div></div></td>
                      <td className="px-5 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                      <td className="px-5 py-4">{u.verified ? <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircleIcon className="w-4 h-4" /> Active</span> : <span className="px-2 py-1 text-xs font-bold rounded bg-amber-100 text-amber-700">Suspended</span>}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><span className={`px-2 py-1 text-xs font-bold rounded-full ${idSt.cls}`}>{idSt.label}</span>{u.id_document && <button onClick={() => setDocUser(u)} className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-500 hover:text-primary"><EyeIcon className="w-3.5 h-3.5" /></button>}{hasPendingId && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}</div></td>
                      <td className="px-5 py-4 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-4"><div className="flex items-center justify-end gap-2 flex-wrap">
                        {hasPendingId && (<><button onClick={() => handleApproveId(u.id)} disabled={!!busy} className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"><ShieldCheckIcon className="w-3 h-3" />{busy === u.id + 'approve_id' ? '…' : 'Approve ID'}</button><button onClick={() => handleRejectId(u.id)} disabled={!!busy} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50"><XCircleIcon className="w-3 h-3" />{busy === u.id + 'reject_id' ? '…' : 'Reject ID'}</button></>)}
                        {u.id_document && !hasPendingId && (<button onClick={() => setDocUser(u)} className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition"><EyeIcon className="w-3 h-3" /> View ID</button>)}
                        {u.role !== 'admin' && (!u.verified ? (<button onClick={() => handleAction(u.id, 'approve')} disabled={!!busy} className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">{busy === u.id + 'approve' ? '…' : 'Activate'}</button>) : (<button onClick={() => handleAction(u.id, 'suspend')} disabled={!!busy} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50">{busy === u.id + 'suspend' ? '…' : 'Suspend'}</button>))}
                        {u.role !== 'admin' && (<button onClick={() => handleDelete(u.id)} disabled={!!busy} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50">{busy === u.id + 'delete' ? '…' : 'Delete'}</button>)}
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}