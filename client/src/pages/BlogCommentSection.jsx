import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button,
  Rating, List, ListItem, ListItemText, IconButton, Avatar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { AppContext } from "../context/AppContext";

const BlogCommentSection = ({ blogId }) => {
  const {
    isRecruiter, backendURL, token, companyToken,
    userId, companyId
  } = useContext(AppContext);

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [editing, setEditing] = useState(null);

  const authToken = isRecruiter ? companyToken : token;
  const loggedInId = isRecruiter ? companyId : userId;

  const fetchComments = async () => {
    try {
      const url = isRecruiter
        ? `${backendURL}/api/company/blogs/${blogId}/comments`
        : `${backendURL}/api/users/blogs/${blogId}/comments`;
      const res = await axios.get(url);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => { fetchComments(); }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const url = editing
        ? `${backendURL}/api/${isRecruiter ? "company" : "users"}/comments/${editing.id}`
        : `${backendURL}/api/${isRecruiter ? "company" : "users"}/blogs/${blogId}/comments`;

      const method = editing ? axios.put : axios.post;
      await method(url, { content, rating }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setContent("");
      setRating(0);
      setEditing(null);
      fetchComments();
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const handleEdit = (comment) => {
    setEditing(comment);
    setContent(comment.content);
    setRating(comment.rating || 0);
  };

  const handleDelete = async (id) => {
    if (!authToken) return;
    const url = `${backendURL}/api/${isRecruiter ? "company" : "users"}/comments/${id}`;

    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Comments</Typography>

      {authToken && (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Write a comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            sx={{ my: 1 }}
          />
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            sx={{ mb: 1 }}
          />
          <Button type="submit" variant="contained">
            {editing ? "Update Comment" : "Post Comment"}
          </Button>
          {editing && (
            <Button onClick={() => {
              setEditing(null);
              setContent("");
              setRating(0);
            }} sx={{ ml: 2 }}>
              Cancel
            </Button>
          )}
        </form>
      )}

      <List>
        {comments.map(c => {
          const isMyComment = isRecruiter
            ? c.companyId === companyId
            : c.userId === userId;

          const authorName = c.author?.name || "Unknown";
          const authorImage = c.author?.image || "https://via.placeholder.com/40";

          return (
            <ListItem key={c.id} alignItems="flex-start"
              secondaryAction={
                isMyComment && (
                  <>
                    <IconButton onClick={() => handleEdit(c)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                  </>
                )
              }
            >
              <Avatar alt={authorName} src={authorImage} sx={{ mr: 2 }} />
              <ListItemText
                primary={c.content}
                secondary={
                  <>
                    <Typography component="span" fontWeight="bold">{authorName}</Typography>{" | "}
                    Rating: {c.rating || "N/A"}{" | "}
                    {new Date(c.createdAt).toLocaleString()}
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default BlogCommentSection;
