export const Footer = () => {
  return (
    <div
      className="py-5 mt-5"
      style={{
        background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
        color: '#fffff0',
        textAlign: 'center',
      }}
    >
      <div>
        <div className="divider-literary mb-4" style={{ opacity: '0.3' }}></div>
        <div
          className="d-flex justify-content-center gap-4 mb-4"
          style={{ fontSize: '0.9rem', opacity: '0.8' }}
        >
          <span>Secure</span>
          <span>•</span>
          <span>Permanent</span>
          <span>•</span>
          <span>Yours</span>
        </div>
        <small
          className="text-white-40"
          style={{
            fontSize: '0.8rem',
            textAlign: 'center',
            display: 'block',
          }}
        >
          Built with 📖 on NEAR Protocol
        </small>
      </div>
    </div>
  );
};
