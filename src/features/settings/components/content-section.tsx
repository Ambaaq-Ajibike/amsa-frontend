interface ContentSectionProps {
  title: string
  desc: string
  children: React.JSX.Element
}

export default function ContentSection({
  title,
  desc,
  children,
}: ContentSectionProps) {
  return <section className='min-w-0 space-y-6'>
    <header className='border-b pb-5'>
      <p className='text-xs font-semibold uppercase tracking-[0.16em] text-primary'>Preferences</p>
      <h2 className='mt-1 text-2xl font-bold tracking-tight'>{title}</h2>
      <p className='mt-1 max-w-2xl text-sm leading-6 text-muted-foreground'>{desc}</p>
    </header>
    <div className='min-w-0'>{children}</div>
  </section>
}
