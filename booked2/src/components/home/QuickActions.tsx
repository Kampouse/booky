import { Link } from "react-router";

export const QuickActions = () => {
  return (
    <div className="row g-4 mb-5">
      <div className="col-md-6">
        <div
          className="paper-card h-100 text-center"
          style={{
            background: "linear-gradient(135deg, #5c4033 0%, #722f37 100%)",
            borderColor: "#d4af37",
            color: "#fffff0",
          }}
        >
          <div className="mb-3" style={{ fontSize: "60px", opacity: "0.9" }}>
            ➕
          </div>
          <h3
            className="mb-3"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Add a New Book
          </h3>
          <p
            className="mb-4"
            style={{
              opacity: 0.9,
              fontSize: "1.025rem",
            }}
          >
            Begin a new literary journey. Add details, set your reading status,
            and start tracking your progress chapter by chapter.
          </p>
          <Link
            to="/book-library"
            className="btn btn-lg"
            style={{
              background: "#d4af37",
              border: "none",
              color: "#1a1a1a",
              fontWeight: "600",
              borderRadius: "6px",
            }}
          >
            Add Book
          </Link>
        </div>
      </div>
      <div className="col-md-6">
        <div
          className="paper-card h-100 text-center"
          style={{
            background: "linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)",
            borderColor: "#5c4033",
            color: "#fffff0",
          }}
        >
          <div className="mb-3" style={{ fontSize: "60px", opacity: "0.9" }}>
            🔍
          </div>
          <h3
            className="mb-3"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Browse Library
          </h3>
          <p
            className="mb-4"
            style={{
              opacity: 0.9,
              fontSize: "1.025rem",
            }}
          >
            Explore your entire collection. Filter by status, update your
            progress, and manage your chapter notes with ease.
          </p>
          <Link
            to="/book-library"
            className="btn btn-lg"
            style={{
              background: "#d4af37",
              border: "none",
              color: "#1a1a1a",
              fontWeight: "600",
              borderRadius: "6px",
            }}
          >
            Browse Library
          </Link>
        </div>
      </div>
    </div>
  );
};
