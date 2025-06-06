import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import BlogList from "./BlogList";
import BlogForm from "./BlogForm";
import BlogDetails from "./BlogDetails";

const BlogPage = () => {
  const { isRecruiter, companyToken, token } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // To trigger BlogList refresh after create/update/delete
  const handleRefresh = () => setRefresh((r) => !r);

  return (
    <div className="container mx-auto py-6">
      {!selectedBlog && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold">Latest Blogs</h2>
            {isRecruiter && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowForm(true)}
              >
                Write Blog
              </button>
            )}
          </div>
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