const fs = require('fs');
const file = 'frontend/src/dashboard/components/Adcampaigndashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add toast and api imports if missing
if (!code.includes("import api from '../../services/api';")) {
    code = "import api from '../../services/api';\n" + code;
}
if (!code.includes("import toast from 'react-hot-toast';")) {
    code = "import toast from 'react-hot-toast';\n" + code;
}

// Replace handlePublish
const targetPublish = `const handlePublish = async (planId?: string) => {
    setIsPublishing(true);
    await onPublish({ success: true, message: 'Published successfully.' }, planId);
    setIsPublishing(false);
  };`;

const newPublish = `const handlePublish = async (planId?: string) => {
    setIsPublishing(true);
    if (activePid === 'meta') {
      try {
        await api.post('/campaign/meta/publish', {
          userId: user?._id || user?.id,
          campaignName: brandDetails?.brand?.name || brandDetails?.brandName || 'AI Generated Campaign',
          dailyBudget: 10,
          objective: 'OUTCOME_TRAFFIC'
        });
        toast.success('Draft Campaign created in Facebook Ads Manager!');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to publish to Meta.');
        setIsPublishing(false);
        return;
      }
    } else {
        toast.success('Campaign setup complete!');
    }
    await onPublish({ success: true, message: 'Published successfully.' }, planId);
    setIsPublishing(false);
  };`;

if (code.includes(targetPublish)) {
    code = code.replace(targetPublish, newPublish);
    fs.writeFileSync(file, code);
} else {
    console.log("Could not find exact handlePublish code to replace.");
}
