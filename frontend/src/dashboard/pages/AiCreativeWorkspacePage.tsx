import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AiCreativeWorkspace from '../components/content/AiCreativeWorkspace';

type WorkspaceLocationState = {
  productUrl?: string;
  selectedImages?: string[];
  allImages?: string[];
  genType?: string;
  promptOnly?: boolean;
};

const AiCreativeWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as WorkspaceLocationState;

  const promptOnly = state.promptOnly || false;

  const productUrl = state.productUrl || '';
  const selectedImages = Array.isArray(state.selectedImages) ? state.selectedImages : [];
  const genType = state.genType || 'url_scrape';

  // if (!productUrl || selectedImages.length === 0) {
  //   navigate('/content', { replace: true });
  //   return null;
  // }
  if (!productUrl && !promptOnly) {
  navigate('/content', { replace: true });
  return null;
}

if (!promptOnly && selectedImages.length === 0) {
  navigate('/content', { replace: true });
  return null;
}

  const handleBackToSelection = () => {
    navigate('/content', {
      state: {
        reopenAiCreativeModal: true,
        productUrl,
        genType,
      },
    });
  };

  const handleCloseWorkspace = () => {
    navigate('/content');
  };

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      <div style={{ padding: '20px 32px' }}>
        <AiCreativeWorkspace
          open={true}
          productUrl={productUrl}
          selectedImages={selectedImages}
          onBackToSelection={handleBackToSelection}
          onCloseWorkspace={handleCloseWorkspace}
        />
      </div>
    </div>
  );
};

export default AiCreativeWorkspacePage;