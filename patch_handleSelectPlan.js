const fs = require('fs');
const file = 'frontend/src/dashboard/components/Adcampaigndashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import api from '../../services/api';")) {
  code = "import api from '../../services/api';\n" + code;
}

const target = `  const handleSelectPlan = useCallback(async (planId: PlanId) => {
    setShowPlanModal(false);
    setLoading("publish");
    await new Promise<void>(r => setTimeout(r, 1200));
    showToast(\`Published with \${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!\`, "success");
    onPublish({ success: true }, planId);
    setLoading(null);
  }, [onPublish, showToast]);`;

const replacement = `  const handleSelectPlan = useCallback(async (planId: PlanId) => {
    setShowPlanModal(false);
    setLoading("publish");

    if (activePid === 'meta') {
      try {
        await api.post('/campaign/meta/publish', {
          userId: user?._id || user?.id,
          campaignName: brandDetails?.brand?.name || brandDetails?.brandName || 'AI Generated Campaign',
          dailyBudget: 10,
          objective: 'OUTCOME_TRAFFIC'
        });
        showToast('Draft Campaign created in Facebook Ads Manager!', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to publish to Meta.', 'error');
        setLoading(null);
        return;
      }
    } else {
      await new Promise<void>(r => setTimeout(r, 1200));
      showToast(\`Published with \${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!\`, "success");
    }

    onPublish({ success: true }, planId);
    setLoading(null);
  }, [onPublish, showToast, activePid, user, brandDetails]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
} else {
  console.log("Not found target string in Adcampaigndashboard.tsx.");
}
