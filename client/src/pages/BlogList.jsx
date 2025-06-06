import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Container, Typography, Card, CardContent, Button, Box } from "@mui/material";
import BlogDetails from "./BlogDetails";
import BlogForm from "./BlogForm";
import { AppContext } from "../context/AppContext";

const BlogList = () => {
  const {
    isRecruiter,
    companyToken,
    getToken,
    backendURL,
  } = useContext(AppContext);

  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchBlogs();
  }, [isRecruiter]);

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Typography variant="h4">Blogs</Typography>
        <Button variant="contained" onClick={() => setShowForm(true)}>
          Write Blog
        </Button>
      </Box>

      {showForm && (
        <BlogForm
          onSuccess={() => {
            setShowForm(false);
            fetchBlogs();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {blogs.map((blog) => (
        <Card key={blog._id} sx={{ my: 2, cursor: "pointer" }} onClick={() => setSelectedBlog(blog)}>
          <CardContent>
            <Typography variant="h6">{blog.title}</Typography>
            <Typography variant="body2">{blog.content.slice(0, 100)}...</Typography>
          </CardContent>
        </Card>
      ))}

      {selectedBlog && (
        <BlogDetails
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
          onBlogChange={fetchBlogs}
        />
      )}
    </Container>
  );
};

export default BlogList;
