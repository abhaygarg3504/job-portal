import React, { useState, useContext } from "react";
import axios from "axios";
import {
  Dialog, DialogTitle, DialogContent, Typography,
  Button, Box, IconButton, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlogForm from "./BlogForm";
import BlogCommentSection from "./BlogCommentSection"
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const BlogDetails = ({ blog, onClose, onBlogChange }) => {
  const { isRecruiter, token, companyToken, backendURL, userId, companyId } = useContext(AppContext);
  const [showEdit, setShowEdit] = useState(false);

  const blogId = blog.id || blog._id;

  // Check ownership
  const isOwner = isRecruiter
    ? blog.companyId === companyId || blog.companyId?._id === companyId
    : blog.userId === userId || blog.userId?._id === userId;

  const handleDelete = async () => {
    const route = isRecruiter
      ? `${backendURL}/api/company/blogs/${blogId}`
      : `${backendURL}/api/users/blogs/${blogId}`;

    const authToken = isRecruiter ? companyToken : token;

    if (!authToken) {
      toast.error("Unauthorized. Please login.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(route, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success("Blog deleted successfully");
        onBlogChange();
        onClose();
      } catch (err) {
        console.error("Delete failed", err);
        toast.error(err.response?.data?.message || "Error deleting blog");
      }
    }
  };

  const handleUpdate = async (updatedData) => {
    const route = isRecruiter
      ? `${backendURL}/api/company/blogs/${blogId}`
      : `${backendURL}/api/users/blogs/${blogId}`;

    const authToken = isRecruiter ? companyToken : token;

    if (!authToken) {
      toast.error("Unauthorized. Please login.");
      return;
    }

    try {
      await axios.put(route, updatedData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Blog updated successfully");
      setShowEdit(false);
      onBlogChange();
    } catch (err) {
      console.error("Update failed", err);
      toast.error(err.response?.data?.message || "Error updating blog");
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {blog.title}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" color="text.secondary">
          {blog.companyId?.name || blog.user?.name || ""}
        </Typography>
      <Box display="flex" alignItems="center" mb={2}>
  <img
    src={
      blog.author?.image ||
      blog.companyId?.image ||
      blog.user?.image ||
      "/default-avatar.png"
    }
    alt="Author"
    style={{
      width: 50,
      height: 50,
      borderRadius: "50%",
      objectFit: "cover",
      marginRight: "1rem",
    }}
  />
  <Box>
    <Typography variant="subtitle1" fontWeight={600}>
      {blog.author?.name ||
        blog.companyId?.name ||
        blog.user?.name ||
        "Unknown Author"}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {new Date(blog.createdAt).toLocaleDateString()}
    </Typography>
  </Box>
</Box>


        <Typography variant="body1" sx={{ my: 2 }}>{blog.content}</Typography>

        {blog.image && (
          <img src={blog.image} alt="blog" style={{ maxWidth: "100%", marginBottom: "1rem" }} />
        )}

        {showEdit ? (
          <BlogForm
            blog={blog}
            onSuccess={handleUpdate}
            onCancel={() => setShowEdit(false)}
          />
        ) : (
          isOwner && (
            <Box mt={2}>
              <Button variant="outlined" onClick={() => setShowEdit(true)}>Edit</Button>
              <Button variant="outlined" color="error" onClick={handleDelete} sx={{ ml: 2 }}>Delete</Button>
            </Box>
          )
        )}

        <Divider sx={{ my: 3 }} />
        <BlogCommentSection blogId={blogId} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogDetails;
