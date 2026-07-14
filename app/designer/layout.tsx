import DesignerSidebar from '@/components/DesignerSidebar'

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <DesignerSidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
