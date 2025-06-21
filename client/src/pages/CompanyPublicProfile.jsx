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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress, 
} from '@mui/material'
import Navbar from '../components/Navbar'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';


export default function CompanyPublicProfile() {
  const { backendURL } = useContext(AppContext)
  const { slug } = useParams()
  const [viewMode, setViewMode] = useState('grid');
  const [company, setCompany] = useState(null)
  const [activityData, setActivityData] = useState([])
  const [blogs, setBlogs] = useState([])
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [selectedBlog, setSelectedBlog] = useState(null)
  const [blogComments, setBlogComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    if (!slug) return

    // Fetch company info
    axios.get(`${backendURL}/api/company/profile/${slug}`)
      .then(res => {
        if (res.data.success) setCompany(res.data.company)
        else setError(res.data.message)
      })
      .catch(() => setError('Could not load company'))

    // Fetch activity graph
    axios.get(`${backendURL}/api/company/profile/${slug}/activity`)
      .then(res => {
        if (res.data.success) {
          const entries = Object.entries(res.data.graph).map(([date, count]) => ({ date, count }))
          setActivityData(entries)
        }
      })
      .catch(() => {})

    // Fetch blogs (with nested comments)
    axios.get(`${backendURL}/api/company/profile/${slug}/blogs`)
      .then(res => {
        if (res.data.success) setBlogs(res.data.blogs)
      })
      .catch(() => {})
  }, [slug, backendURL])

  // When a blog is selected, extract comments from the blogs array
  useEffect(() => {
    if (selectedBlog) {
      setCommentsLoading(true)
      const blogObj = blogs.find(b => b.id === selectedBlog.id)
      setBlogComments(Array.isArray(blogObj?.comments) ? blogObj.comments : [])
      setCommentsLoading(false)
    }
  }, [selectedBlog, blogs])

  const handleClose = () => {
    setSelectedBlog(null)
    setBlogComments([])
  }

  if (error) {
    return <Container sx={{ mt: 4 }}><Typography color="error" align="center">{error}</Typography></Container>
  }
  if (!company) {
    return <Container sx={{ mt: 4 }}><Typography align="center">Loading…</Typography></Container>
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
      </Container>
    )
  }
  if (!company) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography align="center">Loading…</Typography>
      </Container>
    )
  }

  // prepare heatmap years
  const years = Array.from(
    new Set(activityData.map(a => new Date(a.date).getFullYear()))
  ).sort((a,b) => b - a)

  const heatmapValues = activityData.filter(
    a => new Date(a.date).getFullYear() === selectedYear
  )

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Navbar/>
      {/* Company Header */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src={company.image}
            alt={company.name}
            sx={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
          />
          <Box>
            <Typography variant="h4">{company.name}</Typography>
            {company.email && (
              <Typography color="text.secondary">{company.email}</Typography>
            )}
          </Box>
        </Box>
      </Card>

      {/* Activity Heatmap */}
      {years.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Activity</Typography>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Box>
          <CalendarHeatmap
            startDate={new Date(`${selectedYear}-01-01`)}
            endDate={new Date(`${selectedYear}-12-31`)}
            values={heatmapValues}
            classForValue={v =>
              v && v.count > 0
                ? `color-github-${Math.min(v.count,4)}`
                : 'color-empty'
            }
            tooltipDataAttrs={v => ({
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': v.date
                ? `${v.date}: ${v.count}`
                : 'No activity'
            })}
            showWeekdayLabels
          />
          <Tooltip id="heatmap-tooltip" />
        </Box>
      )}

      {/* Blogs List */}
         <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Blogs</h2>
        <div className="space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <GridViewOutlinedIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <ArticleOutlinedIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Blogs container: apply grid or list */}
      {blogs.length === 0 ? (
        <p className="text-gray-500">No blogs published yet.</p>
      ) : (
        <div className={viewMode === 'grid' ? 'blog-grid' : 'blog-list'}>
          {blogs.map(blog => (
            <div
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-medium mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-1 line-clamp-3">{blog.content}</p>
              <time className="text-sm text-gray-400">
                {moment(blog.createdAt).format('LL')}
              </time>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedBlog)} onClose={handleClose}
        BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
        PaperProps={{ sx: { width: '80vw', maxWidth: 'none', height: '80vh' } }}>
        <DialogTitle>{selectedBlog?.title}</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
          <Typography variant="body1" paragraph>{selectedBlog?.content}</Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Comments</Typography>
          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
          ) : (
            blogComments.map(c => (
              <Box key={c.id} sx={{ mb: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                
                <Typography variant="body2">{c.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {moment(c.createdAt).fromNow()}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions><Button onClick={handleClose}>Close</Button></DialogActions>
      </Dialog>
    </Container>
  )
}
