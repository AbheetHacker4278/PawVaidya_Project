import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { atoken, getdashdata, dashdata } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (atoken) {
      getdashdata()
    }
  }, [atoken])

  // Stats cards data
  const statsCards = [
    {
      title: 'Doctors',
      value: dashdata?.doctors || 0,
      icon: '👨‍⚕️',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      title: 'Appointments',
      value: dashdata?.appointments || 0,
      icon: '📅',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      title: 'Patients',
      value: dashdata?.patients || 0,
      icon: '🐾',
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    },
    {
      title: 'Cancelled',
      value: dashdata?.canceledAppointmentCount || 0,
      icon: '❌',
      color: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    },
    {
      title: 'Completed',
      value: dashdata?.completedAppointmentCount || 0,
      icon: '✅',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-600'
    }
  ]

  return dashdata && (
    <div className='p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='mb-6 md:mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <p className='text-gray-600 mt-1'>Overview of your veterinary platform</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8'>
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} ${card.borderColor} border-2 rounded-xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm md:text-base font-medium text-gray-600 mb-1'>{card.title}</p>
                <p className={`text-2xl md:text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <span className='text-2xl md:text-3xl'>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Sections - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Latest Booking 🪺', data: dashdata.latestAppointments, color: 'bg-blue-500' },
          { title: 'Latest Cancelling 🪺', data: dashdata.cancelledAppointments, color: 'bg-red-500' },
          { title: 'Latest Completed 🪺', data: dashdata.completedAppointments, color: 'bg-emerald-500' }
        ].map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            {/* Section Header */}
            <div
              className={`${section.color} text-white py-4 px-6`}
            >
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <p className="text-white/90 text-sm mt-1">
                {section.data?.length || 0} {section.data?.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Appointment List */}
            <div className="divide-y divide-gray-100">
              {section.data && section.data.length > 0 ? (
                section.data.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 md:p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white shadow-sm object-cover"
                        src={item.docData.image}
                        alt={item.docData.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCA0QzI5LjUyMjggNCAzNCA4LjQ3NzE1IDM0IDE0QzM0IDE5LjUyMjggMjkuNTIyOCAyNCAyNCAyNEMxOC40NzcyIDI0IDE0IDE5LjUyMjggMTQgMTRDMTQgOC40NzcxNSAxOC40NzcyIDQgMjQgNFoiIGZpbGw9IiM4ODhDNjFBIi8+CjxwYXRoIGQ9Ik0xMC45MDkyIDM0LjkwNThDMTEuNjU2MiAzNC4zOTY3IDEyLjU1MjIgMzQuMTMzMyAxMy40NzE3IDM0LjEzMzNIMzQuNTI4M0M1NS40NDc4IDM0LjEzMzMgMzYuMzQzOCAzNC4zOTY3IDM3LjA5MDggMzQuOTA1OEMzOS4yNzUgMzYuMzMzMyAzNi42NjY3IDQ0IDI0IDQ0QzExLjMzMzMgNDQgOC43MjUgMzYuMzMzMyAxMC45MDkyIDM0LjkwNThaIiBmaWxsPSIjODg4QzYxQSIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">
                          {item.docData.name}
                        </h4>
                        <p className="text-gray-500 text-xs md:text-sm mb-1">
                          {slotDateFormat(item.slotDate)} • {item.slotTime}
                        </p>
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="mr-1">📍</span>
                          <span className="truncate">
                            {item.docData.address?.Location || 'Location not available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No {section.title.toLowerCase()} found</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Location Booking Statistics */}
      {dashdata.locationBookings && dashdata.locationBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6">
            <h3 className="font-semibold text-lg">📍 Booking Locations</h3>
            <p className="text-white/90 text-sm mt-1">
              Where most people are booking vets from
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {dashdata.locationBookings.slice(0, 10).map((item, index) => {
                const maxCount = dashdata.locationBookings[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-indigo-600">#{index + 1}</span>
                        <span className="font-medium text-gray-800">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">{item.count} bookings</span>
                        <span className="text-xs text-gray-500">({((item.count / dashdata.appointments) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out group-hover:from-indigo-600 group-hover:to-purple-700 flex items-center px-3"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {dashdata.locationBookings.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing top 10 of {dashdata.locationBookings.length} locations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state for all sections */}
      {(!dashdata.latestAppointments?.length &&
        !dashdata.cancelledAppointments?.length &&
        !dashdata.completedAppointments?.length) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments yet</h3>
            <p className="text-gray-500">Appointments will appear here once they are created.</p>
          </div>
        )}
    </div>
  )
}

export default Dashboard
