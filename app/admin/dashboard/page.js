'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Users, Crown, LogOut, RefreshCw } from 'lucide-react'

const PLAN_BADGE = {
  free: 'bg-[#1e1e1e] text-[#888]',
  pro: 'bg-blue-600/20 text-blue-400',
  agency: 'bg-purple-600/20 text-purple-400',
}

const ROLE_BADGE = {
  user: 'bg-[#1e1e1e] text-[#888]',
  admin: 'bg-red-600/20 text-red-400',
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/admin/login?error=unauthorized')
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (session?.user?.role === 'admin') fetchUsers()
  }, [session])

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (userId === session?.user?.id) return // can't demote yourself
    setUpdatingId(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
    )
    setUpdatingId(null)
  }

  const stats = {
    total: users.length,
    pro: users.filter((u) => u.plan === 'pro').length,
    agency: users.filter((u) => u.plan === 'agency').length,
    admins: users.filter((u) => u.role === 'admin').length,
  }

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808]">
        <div className="text-[#555] text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 border border-red-600/30">
            <ShieldCheck size={16} className="text-red-400" />
          </div>
          <span className="font-semibold text-white">Pluto Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#666]">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.total, icon: Users },
            { label: 'Pro', value: stats.pro, icon: Crown },
            { label: 'Agency', value: stats.agency, icon: Crown },
            { label: 'Admins', value: stats.admins, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1e1e1e] bg-[#111] p-4"
            >
              <p className="text-xs text-[#555] mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#111] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
            <h2 className="text-sm font-semibold text-white">All Users</h2>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[#555]">Loading users…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-left text-xs text-[#555]">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Provider</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-[#888]">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${PLAN_BADGE[u.plan] || PLAN_BADGE.free}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#666] text-xs">{u.provider}</td>
                      <td className="px-5 py-3 text-[#666] text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {u._id !== session?.user?.id && (
                          <button
                            onClick={() => toggleRole(u._id, u.role)}
                            disabled={updatingId === u._id}
                            className={`text-xs rounded-lg px-2.5 py-1 transition-colors disabled:opacity-40 ${
                              u.role === 'admin'
                                ? 'bg-red-600/10 text-red-400 hover:bg-red-600/20'
                                : 'bg-[#1e1e1e] text-[#888] hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                          >
                            {updatingId === u._id
                              ? '…'
                              : u.role === 'admin'
                              ? 'Revoke admin'
                              : 'Make admin'}
                          </button>
                        )}
                        {u._id === session?.user?.id && (
                          <span className="text-xs text-[#444]">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-12 text-center text-sm text-[#555]">No users found.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
