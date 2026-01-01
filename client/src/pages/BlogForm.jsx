import React, { useState, useContext, useEffect, useRef } from "react";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BlogForm = ({ blog, onSuccess, onCancel }) => {
  const { isRecruiter, backendURL, companyToken, token } = useContext(AppContext);

  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(blog?.image || "");
  const quillRef = useRef(null);

  // Custom toolbar configuration with all the features you requested
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean'],
      ['insertTable', 'insertHr'] // Custom buttons we'll add
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'check',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'script', 'code-block'
  ];

  // whenever user picks a new file, generate an object URL
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Add custom handlers for table and horizontal rule
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Add custom button handlers
      const toolbar = quill.getModule('toolbar');
      
      // Custom handler for inserting table
      toolbar.addHandler('insertTable', () => {
        const tableHTML = `
          <table style="border-collapse: collapse; width: 100%;">
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
              </tr>
            </tbody>
          </table>
        `;
        
        const range = quill.getSelection();
        if (range) {
          quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
        }
      });

      // Custom handler for inserting horizontal rule
      toolbar.addHandler('insertHr', () => {
        const range = quill.getSelection();
        if (range) {
          quill.insertText(range.index, '\n', 'user');
          quill.insertEmbed(range.index + 1, 'divider', true, 'user');
          quill.setSelection(range.index + 2, 'user');
        }
      });
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build correct endpoint + token
    // const url = isRecruiter
    //   ? blog
    //     ? `${backendURL}/api/company/blogs/${blog.id}`
    //     : `${backendURL}/api/company/blogs`
    //   : blog
    //   ? `${backendURL}/api/users/blogs/${blog.id}`
    //   : `${backendURL}/api/users/blogs`;
    const url = blog 
      ? `${backendURL}/api/${isRecruiter ? 'company' : 'users'}/blogs/${blog.id || blog._id}`
      : `${backendURL}/api/${isRecruiter ? 'company' : 'users'}/blogs`;

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
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
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
          
          {/* Rich Text Editor with Quill */}
          <Box sx={{ my: 2 }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write your blog content here..."
              style={{
                minHeight: '200px',
                backgroundColor: 'white'
              }}
            />
          </Box>

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