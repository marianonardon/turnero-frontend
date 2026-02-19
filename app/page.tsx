import { redirect } from "next/navigation"

export default function Home() {
  // Redirigir directamente al booking del tenant por defecto
  const defaultTenantSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || "demo"
  redirect(`/${defaultTenantSlug}/book`)
}

