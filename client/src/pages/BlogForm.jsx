import React, { useState, useContext } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const BlogForm = ({ blog, onSuccess, onCancel }) => {
  const { isRecruiter, backendURL, companyToken, token } = useContext(AppContext);
  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  const [image, setImage] = useState(blog?.image || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "";
      let headers = {};

      const payload = { title, content, image };

      // Recruiter flow
      if (isRecruiter) {
        if (!companyToken) {
          toast.error("Company token is missing");
          return;
        }

        url = `${backendURL}/api/company/blogs${blog ? `/${blog.id}` : ""}`;
        headers = { Authorization: `Bearer ${companyToken}` };
      }
      // User flow
      else {
        if (!token) {
          toast.error("User token is missing");
          return;
        }

        url = `${backendURL}/api/users/blogs${blog ? `/${blog.id}` : ""}`;
        headers = { Authorization: `Bearer ${token}` };
      }

      if (blog) {
        await axios.put(url, payload, { headers });
        toast.success("Blog updated successfully");
      } else {
        await axios.post(url, payload, { headers });
        toast.success("Blog posted successfully");
      }

      onSuccess(); // trigger refresh or dialog close
    } catch (err) {
      console.error("Error submitting blog:", err.message);
      toast.error(err.response?.data?.message || "Failed to submit blog");
    }
  };

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>{blog ? "Edit Blog" : "Write Blog"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ my: 1 }}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            required
            sx={{ my: 1 }}
          />
          <TextField
            label="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            fullWidth
            sx={{ my: 1 }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={onCancel} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {blog ? "Update" : "Post"}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;
