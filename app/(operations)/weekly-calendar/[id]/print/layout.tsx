export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        {children}
      </body>
    </html>
  )
}
