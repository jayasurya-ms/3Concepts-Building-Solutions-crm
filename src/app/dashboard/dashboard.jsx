import React, { useEffect } from 'react'
import { DASHBOARD_API } from '@/constants/apiConstants'
import { useGetApiMutation } from '@/hooks/useGetApiMutation'
import LoadingBar from '@/components/loader/loading-bar'
import ApiErrorPage from '@/components/api-error/api-error'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, LandPlot, Boxes, ArrowRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

const StatCard = ({ title, count, icon: Icon, color, link, onClick }) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-all border-l-4 overflow-hidden group"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{count}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: color + '20' }}>
          <Icon className="w-8 h-8" style={{ color: color }} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
        <span>View Details</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </CardContent>
  </Card>
)

function Dashboard() {
  const navigate = useNavigate()
  const { data: response, isLoading, isError, refetch } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ['dashboard-data'],
  })

  const dashboardData = response?.data || {}
  const recentTrips = dashboardData.recent_trips || []

  useEffect(() => {
    if (response) {
      console.log('Dashboard Data:', response)
    }
  }, [response])

  if (isLoading) return <LoadingBar />
  if (isError) return <ApiErrorPage onRetry={refetch} />

  const stats = [
    {
      title: 'Total Employees',
      count: dashboardData.employees_count || 0,
      icon: Users,
      color: '#3b82f6', // Blue
      link: '/employee'
    },
    {
      title: 'Total Sites',
      count: dashboardData.sites_count || 0,
      icon: LandPlot,
      color: '#10b981', // Emerald
      link: '/site'
    },
    {
      title: 'Total Trips',
      count: dashboardData.trips_count || 0,
      icon: Boxes,
      color: '#f59e0b', // Amber
      link: '/trip'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index} 
            {...stat} 
            onClick={() => navigate(stat.link)}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Trips</CardTitle>
          <button 
            onClick={() => navigate('/trip')}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All Trips
          </button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date/Time</th>
                  <th className="px-4 py-3 text-left font-medium">Employee</th>
                  <th className="px-4 py-3 text-left font-medium">From Site</th>
                  <th className="px-4 py-3 text-left font-medium">To Site</th>
                  <th className="px-4 py-3 text-right font-medium">KM</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTrips.length > 0 ? (
                  recentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{moment(trip.trips_date).format('DD MMM YYYY')}</div>
                        <div className="text-xs text-muted-foreground">{trip.trips_time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{trip.name}</div>
                        <div className="text-xs text-muted-foreground">{trip.employee_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{trip.from_site || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{trip.to_site || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {trip.trips_km} KM
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No recent trips found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard