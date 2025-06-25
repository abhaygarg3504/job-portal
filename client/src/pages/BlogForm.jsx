import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const BlogForm = ({ blog, onSuccess, onCancel }) => {
  const { isRecruiter, backendURL, companyToken, token } = useContext(AppContext);

  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  // <-- remove TS generic here
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(blog?.image || "");

  // whenever user picks a new file, generate an object URL
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // no TS types on the event
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build correct endpoint + token
    const url = isRecruiter
      ? blog
        ? `${backendURL}/api/company/blogs/${blog.id}`
        : `${backendURL}/api/company/blogs`
      : blog
      ? `${backendURL}/api/users/blogs/${blog.id}`
      : `${backendURL}/api/users/blogs`;

    const authToken = isRecruiter ? companyToken : token;
    if (!authToken) {
      toast.error("Missing authorization token");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (file) {
        // must match the multer field name on your server
        formData.append("image", file);
      }

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      };

      if (blog) {
        await axios.put(url, formData, { headers });
        toast.success("Blog updated successfully");
      } else {
        await axios.post(url, formData, { headers });
        toast.success("Blog posted successfully");
      }
      onSuccess();
    } catch (err) {
      console.error("Error submitting blog:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error posting blog");
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{blog ? "Edit Blog" : "Write Blog"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
            sx={{ my: 1 }}
          />
          <TextField
            label="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            fullWidth
            required
            multiline
            minRows={4}
            sx={{ my: 1 }}
          />

          {/* File picker + preview */}
          <Box display="flex" alignItems="center" sx={{ my: 1 }}>
            <IconButton color="primary" component="label">
              <input hidden accept="image/*" type="file" name="image" onChange={handleFileChange} />
              <PhotoCamera />
            </IconButton>
            {preview && (
              <Avatar
                src={preview}
                variant="rounded"
                sx={{ width: 80, height: 80, ml: 2 }}
              />
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button onClick={onCancel} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {blog ? "Update" : "Post"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;
