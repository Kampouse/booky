import { useParams } from 'react-router';
import { NoteEditor } from '@/components/note-editor';

const NoteEditorPage = () => {
  const { isbn, chapter } = useParams<{ isbn: string; chapter: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get('demo') === 'true';
  const returnUrl = searchParams.get('return') || '/book-library';

  if (!isbn || !chapter) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d4a3e 0%, #1a2a3a 100%)',
          color: '#ffffff',
          fontSize: '1.2rem',
          fontFamily: '"Lora", Georgia, serif',
        }}
      >
        Invalid URL. Please provide both ISBN and chapter.
      </div>
    );
  }

  return (
    <NoteEditor
      isbn={isbn}
      chapter={chapter}
      demoMode={demoMode}
      returnUrl={returnUrl}
    />
  );
};

export default NoteEditorPage;
