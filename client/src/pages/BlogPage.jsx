import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import BlogList from "./BlogList";
import BlogForm from "./BlogForm";
import BlogDetails from "./BlogDetails";
import Navbar from "../components/Navbar";

const BlogPage = () => {
  const { isRecruiter, companyToken, token } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const handleRefresh = () => setRefresh((r) => !r);

  return (
    <div className="container mx-auto py-6">
      {!isRecruiter ? <Navbar/> : <></>}
      {!selectedBlog && (
        <>
          {showForm ? (
            <BlogForm
              isRecruiter={isRecruiter}
              token={isRecruiter ? companyToken : token}
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                handleRefresh();
              }}
            />
          ) : (
            <BlogList
              onSelectBlog={setSelectedBlog}
              refresh={refresh}
            />
          )}
        </>
      )}
      {selectedBlog && (
        <BlogDetails
          blog={selectedBlog}
          isRecruiter={isRecruiter}
          token={isRecruiter ? companyToken : token}
          onClose={() => setSelectedBlog(null)}
          onBlogChange={handleRefresh}
        />
      )}
    </div>
  );
};

export default BlogPage;