import '@/app/globals.css'

export default function PrintGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Minimal layout for print pages - no sidebar, no app shell
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
