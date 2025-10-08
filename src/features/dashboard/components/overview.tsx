import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface OverviewProps {
  data?: {
    January: number
    February: number
    March: number
    April: number
    May: number
    June: number
    July: number
    August: number
    September: number
    October: number
    November: number
    December: number
  }
}

export function Overview({ data }: OverviewProps) {
  // Transform the data for the chart
  const chartData = data ? [
    { name: 'Jan', total: data.January },
    { name: 'Feb', total: data.February },
    { name: 'Mar', total: data.March },
    { name: 'Apr', total: data.April },
    { name: 'May', total: data.May },
    { name: 'Jun', total: data.June },
    { name: 'Jul', total: data.July },
    { name: 'Aug', total: data.August },
    { name: 'Sep', total: data.September },
    { name: 'Oct', total: data.October },
    { name: 'Nov', total: data.November },
    { name: 'Dec', total: data.December },
  ] : []
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
