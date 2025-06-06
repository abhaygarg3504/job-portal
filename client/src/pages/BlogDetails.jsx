import React, { useState, useContext } from "react";
import axios from "axios";
import {
  Dialog, DialogTitle, DialogContent, Typography,
  Button, Box, IconButton, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlogForm from "./BlogForm";
import CommentSection from "./BlogCommentSection";
import { AppContext } from "../context/AppContext";

const BlogDetails = ({ blog, onClose, onBlogChange }) => {
  const { isRecruiter, getToken } = useContext(AppContext);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    const token = await getToken();
    const route = isRecruiter
      ? `/api/company/blogs/${blog._id}`
      : `/api/users/blogs/${blog._id}`;

    if (window.confirm("Delete this blog?")) {
      try {
        await axios.delete(route, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onBlogChange();
        onClose();
      } catch (err) {
        console.error("Delete failed", err.message);
      }
    }
  };

  const handleUpdate = async (updatedData) => {
    const token = await getToken();
    const route = isRecruiter
      ? `/api/company/blogs/${blog._id}`
      : `/api/users/blogs/${blog._id}`;

    try {
      await axios.put(route, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEdit(false);
      onBlogChange();
    } catch (err) {
      console.error("Update failed", err.message);
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
          {blog.companyId?.name || ""}
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>{blog.content}</Typography>
        {blog.image && <img src={blog.image} alt="blog" style={{ maxWidth: "100%" }} />}
        {showEdit ? (
          <BlogForm
            blog={blog}
            onSuccess={handleUpdate}
            onCancel={() => setShowEdit(false)}
          />
        ) : (
          <Box mt={2}>
            <Button variant="outlined" onClick={() => setShowEdit(true)}>Edit</Button>
            <Button variant="outlined" color="error" onClick={handleDelete} sx={{ ml: 2 }}>Delete</Button>
          </Box>
        )}
        <Divider sx={{ my: 3 }} />
        <CommentSection blogId={blog._id} />
      </DialogContent>
    </Dialog>
  );
};

export default BlogDetails;
