// CommentSection.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Rating, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { AppContext } from "../context/AppContext";

const CommentSection = ({ blogId }) => {
  const { isRecruiter, backendURL } = useContext(AppContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [editing, setEditing] = useState(null);

  const fetchComments = async () => {
   if(!isRecruiter) {
    const res = await axios.get(`${backendURL}/api/users/blogs/${blogId}/comments`);
  } else{
     const res = await axios.get(`${backendURL}/api/company/blogs/${blogId}/comments`);
  }
    setComments(res.data.comments || []);
  };

  useEffect(() => { fetchComments(); }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`${backendURL}//api/users/comments/${editing.id}`, { content, rating }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEditing(null);
    } else {
      await axios.post(`${backendURL}/api/users/blogs/${blogId}/comments`, { content, rating }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    }
    setContent("");
    setRating(0);
    fetchComments();
  };

  const handleEdit = (comment) => {
    setEditing(comment);
    setContent(comment.content);
    setRating(comment.rating || 0);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${backendURL}/api/users/comments/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    fetchComments();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 2 }}>Comments</Typography>
      {user && (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Write a comment"
            value={content}
            onChange={e => setContent(e.target.value)}
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
            <Button onClick={() => { setEditing(null); setContent(""); setRating(0); }} sx={{ ml: 2 }}>
              Cancel
            </Button>
          )}
        </form>
      )}
      <List>
        {comments.map(c => (
          <ListItem key={c.id} alignItems="flex-start"
            secondaryAction={
              user && c.userId === user._id && (
                <>
                  <IconButton onClick={() => handleEdit(c)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                </>
              )
            }
          >
            <ListItemText
              primary={c.content}
              secondary={
                <>
                  Rating: {c.rating || "N/A"} | {new Date(c.createdAt).toLocaleString()}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CommentSection;