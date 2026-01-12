"use client"

import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Suspense } from "react"

function DashboardContent() {
  return <AdminDashboard />
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  )
}

