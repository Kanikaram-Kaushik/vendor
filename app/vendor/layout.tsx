import VendorSidebar from '@/components/VendorSidebar'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <VendorSidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
