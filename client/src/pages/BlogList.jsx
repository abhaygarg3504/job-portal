import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import moment from "moment";
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BlogForm from "./BlogForm";
import { AppContext } from "../context/AppContext";

const BlogList = () => {
  const { isRecruiter, backendURL } = useContext(AppContext);

  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [blogComments, setBlogComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const fetchBlogs = async () => {
    try {
      const url = isRecruiter
        ? `${backendURL}/api/company/getAllBlogs`
        : `${backendURL}/api/users/getAllBlogs`;

      const res = await axios.get(url);
      if (res.data.success) {
        setBlogs(res.data.blogs || []);
      } else {
        console.error(res.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err.message);
    }
  };

  const fetchComments = async (blogId) => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`${backendURL}/api/blog/comments/${blogId}`);
      if (res.data.success) {
        setBlogComments(res.data.comments || []);
      } else {
        setBlogComments([]);
      }
    } catch (err) {
      setBlogComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSelectBlog = (blog) => {
    setSelectedBlog(blog);
    fetchComments(blog._id);
  };

  const handleClose = () => {
    setSelectedBlog(null);
    setBlogComments([]);
  };

  useEffect(() => {
    fetchBlogs();
  }, [isRecruiter]);

  return (
    <Container sx={{ mt: 4 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Blogs</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            <GridViewOutlinedIcon />
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            <ArticleOutlinedIcon />
          </Button>
          <Button variant="contained" onClick={() => setShowForm(true)}>
            Write Blog
          </Button>
        </div>
      </div>

      {showForm && (
        <BlogForm
          onSuccess={() => {
            setShowForm(false);
            fetchBlogs();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {blogs.length === 0 ? (
        <p className="text-gray-500">No blogs published yet.</p>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => handleSelectBlog(blog)}
              className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-medium mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-1 line-clamp-3">{blog.content}</p>
              <time className="text-sm text-gray-400">
                {moment(blog.createdAt).format("LL")}
              </time>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selectedBlog)}
        onClose={handleClose}
        BackdropProps={{ style: { backgroundColor: "rgba(0, 0, 0, 0.5)" } }}
        PaperProps={{ sx: { width: "80vw", maxWidth: "none", height: "80vh" } }}
      >
        <DialogTitle>{selectedBlog?.title}</DialogTitle>
        <DialogContent dividers sx={{ overflowY: "auto" }}>
          <Typography variant="body1" paragraph>
            {selectedBlog?.content}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Comments
          </Typography>
          {commentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            blogComments.map((c) => (
              <Box
                key={c._id}
                sx={{ mb: 2, p: 1, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Typography variant="body2">{c.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {moment(c.createdAt).fromNow()}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogList;
