export default function MarketingLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex flex-col min-h-screen'>
      <div>navbar</div>
      {children}
      <div>footer</div>
    </div>
  )
}
