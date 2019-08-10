import React from "react";

export default () => {
  return (
    <footer
      className="sticky-footer"
      style={{ paddingTop: 150, paddingBottom: 50 }}
    >
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          <span>Copyright © {new Date().getFullYear()} NvooS Technologies</span>
          <br />
        </div>
      </div>
    </footer>
  );
};
