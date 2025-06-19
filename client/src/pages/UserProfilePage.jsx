import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { Tooltip } from 'react-tooltip'
import { AppContext } from '../context/AppContext'  // adjust import path

export default function UserProfilePage() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const { backendURL } = useContext(AppContext)
  const { slug } = useParams()

  // Activity heatmap state
  const [activityData, setActivityData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Fetch user profile by slug
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/users/profile/${slug}`)
        if (res.data.success) {
          setUser(res.data.user)
        } else {
          setError(res.data.message || 'Profile not found')
        }
      } catch (err) {
        console.error(err)
        setError('Could not load profile')
      }
    }
    if (slug) fetchProfile()
  }, [slug, backendURL])

  // Fetch public activity graph by slug
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await axios.get(
          `${backendURL}/api/users/profile/${slug}/activity-graph`
        )
        if (res.data.success) {
          const entries = Object.entries(res.data.graph).map(
            ([date, count]) => ({ date, count })
          )
          setActivityData(entries)
        }
      } catch (err) {
        console.error('Could not load activity graph', err)
      }
    }
    if (slug) fetchGraph()
  }, [slug, backendURL])

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>
  if (!user)  return <p className="p-6 text-center">Loading…</p>

  // prepare year options and filtered values
  const years = Array.from(
    new Set(activityData.map(a => new Date(a.date).getFullYear()))
  ).sort((a, b) => b - a)
  const valuesForYear = activityData.filter(
    a => new Date(a.date).getFullYear() === selectedYear
  )

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center p-6 space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <img
              src={user.image}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
            />
            {user.isPro && (
              <span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.email && <p className="mt-1 text-gray-500">{user.email}</p>}
            {user.resume && (
              <a
                href={user.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Resume
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Skills */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Skills</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {user.skills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
            {/* Education */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Education</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {user.education.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </section>
            {/* Experience */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Experience</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {user.experience.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </section>
            {/* Achievements */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Achievements</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {user.achievements.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Public Activity Heatmap */}
      {years.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Application Activity</h2>
            <select
              className="border px-2 py-1 rounded"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <CalendarHeatmap
            startDate={new Date(`${selectedYear}-01-01`)}
            endDate={new Date(`${selectedYear}-12-31`)}
            values={valuesForYear}
            classForValue={value => {
              if (!value || value.count === 0) return 'color-empty'
              return `color-github-${Math.min(value.count, 4)}`
            }}
            tooltipDataAttrs={value => ({
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': value.date ?
                `${value.date}<br/>${value.count} application(s)` : 'No data'
            })}
            showWeekdayLabels
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      )}
    </div>
  )
}
