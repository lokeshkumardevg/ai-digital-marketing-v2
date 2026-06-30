import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AiCreativeWorkspace from '../components/content/AiCreativeWorkspace';

type WorkspaceLocationState = {
  productUrl?: string;
  selectedImages?: string[];
  allImages?: string[];
  genType?: string;
  promptOnly?: boolean;
  workspaceType?: 'scrape' | 'prompt' | 'upload';
};

const AiCreativeWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as WorkspaceLocationState;

  const promptOnly = state.promptOnly || false;

  const productUrl = state.productUrl || '';
  const selectedImages = Array.isArray(state.selectedImages) ? state.selectedImages : [];
  const genType = state.genType || 'url_scrape';

  const workspaceType =
    promptOnly
      ? 'prompt'
      : genType === 'user_upload'
      ? 'upload'
      : 'scrape';


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
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      <div style={{ padding: '20px 32px' }}>
        <AiCreativeWorkspace
          open={true}
          productUrl={productUrl}
          selectedImages={selectedImages}
          onBackToSelection={handleBackToSelection}
          onCloseWorkspace={handleCloseWorkspace}
          workspaceType={workspaceType}
        />
      </div>
    </div>
  );
};

export default AiCreativeWorkspacePage;
