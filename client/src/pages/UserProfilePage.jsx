import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { Tooltip } from 'react-tooltip'
import { AppContext } from '../context/AppContext'  
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  CircularProgress
} from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function UserProfilePage() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const { backendURL } = useContext(AppContext)
  const { slug } = useParams()
   const [selectedBlog, setSelectedBlog] = useState(null)
    const [blogComments, setBlogComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
    const [view, setView] = useState('applications') 

  // Public profile state
  const [activityData, setActivityData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [userApplications, setUserApplications] = useState([])
  const [blogs, setBlogs] = useState([])

  // Fetch user profile
  useEffect(() => {
    if (!slug) return
    axios.get(`${backendURL}/api/users/profile/${slug}`)
      .then(res => {
        if (res.data.success) setUser(res.data.user)
        else setError(res.data.message || 'Profile not found')
      })
      .catch(() => setError('Could not load profile'))
  }, [slug, backendURL])

  // Fetch activity heatmap
  useEffect(() => {
    if (!slug) return
    axios.get(`${backendURL}/api/users/profile/${slug}/activity-graph`)
      .then(res => {
        if (res.data.success) {
          const entries = Object.entries(res.data.graph).map(([date, count]) => ({ date, count }))
          setActivityData(entries)
        }
      })
      .catch(err => console.error('Heatmap load error', err))
  }, [slug, backendURL])

  // Fetch applications
  useEffect(() => {
    if (!slug) return
    axios.get(`${backendURL}/api/users/profile/${slug}/applications`)
      .then(res => {
        if (res.data.success) setUserApplications(res.data.applications)
        else setError(res.data.message || 'Could not load applications')
      })
      .catch(err => console.error('Applications load error', err))
  }, [slug, backendURL])

 useEffect(() => {
    if (!slug) return
    axios.get(`${backendURL}/api/users/profile/${slug}/blogs`)
      .then(res => {
        if (res.data.success) setBlogs(res.data.blogs)
        else setError(res.data.message || 'Could not load blogs')
      })
      .catch(err => console.error('Blogs load error', err))
  }, [slug, backendURL])

  // When a blog is selected, extract its comments from the previously fetched blogs
  useEffect(() => {
    if (selectedBlog) {
      setCommentsLoading(true)
      // find the blog object in blogs array
      const blogObj = blogs.find(b => b.id === selectedBlog.id)
      if (blogObj && Array.isArray(blogObj.comments)) {
        setBlogComments(blogObj.comments)
      } else {
        setBlogComments([])
      }
      setCommentsLoading(false)
    }
  }, [selectedBlog, blogs])
  const fetchBlogs = () => {
    if (!slug) return
    axios.get(`${backendURL}/api/users/profile/${slug}/blogs`)
      .then(res => {
        if (res.data.success) setBlogs(res.data.blogs)
        else setError(res.data.message || 'Could not load blogs')
      })
      .catch(err => console.error('Blogs load error', err))
  }

  // Fetch blogs on mount and when slug changes
  useEffect(fetchBlogs, [slug, backendURL])
    
   const handleClose = () => {
    setSelectedBlog(null)
    setBlogComments([])
  }

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>
  if (!user) return <p className="p-6 text-center">Loading…</p>

  // prepare year options and filtered values
  const years = Array.from(new Set(activityData.map(a => new Date(a.date).getFullYear())))
    .sort((a, b) => b - a)
  const valuesForYear = activityData.filter(a => new Date(a.date).getFullYear() === selectedYear)

  return (
    <div className="max-w-[100%] mx-auto mt-10 px-4">
        <Navbar/>
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center p-6 space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <img src={user.image} alt={user.name} className="w-28 h-28 rounded-full object-cover border-4 border-gray-200" />
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
              <a href={user.resume} target="_blank" rel="noopener noreferrer"
                 className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Resume
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {user.skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {user.education.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {user.experience.map((ex, i) => <li key={i}>{ex}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Achievements</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {user.achievements.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </section>
        </div>
      </div>

      {/* Public Activity Heatmap */}
      {years.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Application Activity</h2>
            <select className="border px-2 py-1 rounded" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <CalendarHeatmap
            startDate={new Date(`${selectedYear}-01-01`)}
            endDate={new Date(`${selectedYear}-12-31`)}
            values={valuesForYear}
            classForValue={value => (value && value.count > 0 ? `color-github-${Math.min(value.count, 4)}` : 'color-empty')}
            tooltipDataAttrs={value => ({
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': value.date ? `${value.date}<br/>${value.count} application(s)` : 'No data'
            })}
            showWeekdayLabels
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      )}
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
        <Button onClick={() => setView('applications')} variant={view==='applications' ? 'contained' : 'outlined'}>Applications</Button>
        <Button onClick={() => setView('blogs')} variant={view==='blogs' ? 'contained' : 'outlined'}>Blogs</Button>
      </ButtonGroup>
 {view === 'applications' ? (
        userApplications.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Typography variant="h5" gutterBottom>
              Jobs Applied
            </Typography>
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr>
                  {['Company', 'Job Title', 'Date', 'Status', 'Interview Date'].map(
                    header => (
                      <th
                        key={header}
                        className="py-2 px-4 text-left border-b"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {userApplications.map((app, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b flex items-center gap-2">
                      {app.companyId ? (
                        <>
                          <img
                            src={app.companyId.image}
                            alt={app.companyId.name}
                            className="w-8 h-8 rounded"
                          />
                          {app.companyId.name}
                        </>
                      ) : (
                        <span className="italic text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {app.jobId?.title || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {moment(app.date).format('LL')}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded ${
                          app.status === 'Accepted'
                            ? 'bg-green-200'
                            : app.status === 'Rejected'
                            ? 'bg-red-200'
                            : 'bg-blue-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {app.interviewDate
                        ? moment(app.interviewDate).format('LL')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography>No applications to display.</Typography>
        )
      ) :
       (
       <Box>
          {blogs.length === 0 && <Typography>No blogs to display.</Typography>}
          {blogs.map(blog => (
            <Card key={blog.id} sx={{ my: 2, cursor: 'pointer' }} onClick={() => setSelectedBlog(blog)}>
              <CardContent>
                <Typography variant="h6">{blog.title}</Typography>
                <Typography variant="body2">{blog.content.slice(0, 100)}…</Typography>
              </CardContent>
            </Card>
          ))}

          <Dialog
            open={Boolean(selectedBlog)}
            onClose={handleClose}
            BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
            PaperProps={{ sx: { width: '80vw', maxWidth: 'none', height: '80vh' } }}
          >
            <DialogTitle>{selectedBlog?.title}</DialogTitle>
            <DialogContent dividers sx={{ overflowY: 'auto' }}>
              <Typography variant="body1" paragraph>
                {selectedBlog?.content}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Comments
              </Typography>
              {commentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                blogComments.map(comment => (
                  <Box key={comment.id} sx={{ mb: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body2">{comment.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(comment.createdAt).fromNow()}
                    </Typography>
                  </Box>
                ))
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      <Footer/>
    </div>
  )
}
