export const LoadingState = () => {
  return (
    <div className="container mt-5 text-center fade-in">
      <div className="py-5">
        <div
          className="spinner-border mb-4"
          role="status"
          style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '0.25rem',
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-literary fs-5">
          <em>Turning the pages...</em>
        </p>
        <small className="text-muted">
          Fetching your literary collection
        </small>
      </div>
    </div>
  );
};
