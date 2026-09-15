import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import logo from '../../assets/fevicon.png';

const getAgentUrl = (path: string) => import.meta.env.VITE_AI_API ? `${import.meta.env.VITE_AI_API}/${path}` : `${import.meta.env.VITE_API_URL}/webhook/${path}`;

const agentConfigs: Record<string, any> = {
  "review_generation": {
    title: "Review Generation Agent",
    url: getAgentUrl("review-gen"),
    fields: [
      { id: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., John Doe" },
      { id: "product", label: "Product/Service", type: "text", placeholder: "e.g., Premium Web Plan" }
    ]
  },
  "review_response": {
    title: "Review Response Agent",
    url: getAgentUrl("review-response"),
    fields: [
      { id: "star_rating", label: "Star Rating (1-5)", type: "text", placeholder: "e.g., 4" },
      { id: "review_text", label: "Customer Review Text", type: "textarea", placeholder: "Paste customer review..." }
    ]
  },
  "social_publishing": {
    title: "Social Publishing Agent",
    url: getAgentUrl("social-pub"),
    fields: [
      { id: "topic", label: "Post Topic", type: "textarea", placeholder: "e.g., New feature announcement" }
    ]
  },
  "social_engagement": {
    title: "Social Engagement Agent",
    url: getAgentUrl("social-engage"),
    fields: [
      { id: "brand_tone", label: "Brand Tone", type: "text", placeholder: "e.g., Friendly & Professional" },
      { id: "user_comment", label: "User Comment to Reply To", type: "textarea", placeholder: "Paste the user comment here..." }
    ]
  },
  "reporting": {
    title: "Reporting Agent",
    url: getAgentUrl("reporting"),
    fields: [
      { id: "metrics", label: "Raw Metrics Data", type: "textarea", placeholder: "e.g., 500 visitors, 10 sales, 2% conversion rate" }
    ]
  },
  "listings_optimization": {
    title: "Listings Optimization Agent",
    url: getAgentUrl("listings-opt"),
    fields: [
      { id: "business_name", label: "Business Name", type: "text", placeholder: "e.g., Joe's Coffee" },
      { id: "keywords", label: "Target Keywords (SEO)", type: "textarea", placeholder: "e.g., best coffee, organic espresso, downtown cafe" }
    ]
  },
  "lead_generation": {
    title: "Lead Generation Agent",
    url: getAgentUrl("lead-gen"),
    fields: [
      { id: "industry", label: "Target Industry", type: "text", placeholder: "e.g., Real Estate" },
      { id: "region", label: "Region", type: "text", placeholder: "e.g., New York" }
    ]
  },
  "contact_segmentation": {
    title: "Contact Segmentation Agent",
    url: getAgentUrl("segmentation"),
    fields: [
      { id: "customer_data", label: "Customer Data Example", type: "textarea", placeholder: "e.g., Age 25, clicked email 3 times, bought shoes." }
    ]
  },
  "template_design": {
    title: "Template Design Agent",
    url: getAgentUrl("template-design"),
    fields: [
      { id: "topic", label: "Website/Template Title or Topic", type: "text", placeholder: "e.g., Luxury Watch Landing Page" }
    ]
  },
  "custom": {
    title: "Custom Agent",
    url: getAgentUrl("custom"),
    fields: [
      { id: "instruction", label: "Custom Instruction (System Prompt)", type: "text", placeholder: "e.g., Act as a marketing director..." },
      { id: "input", label: "Input Data", type: "textarea", placeholder: "Enter raw data to process..." }
    ]
  },
  "website_builder": {
    title: "Full Website Architect",
    url: getAgentUrl("website-builder"),
    premium: true,
    fields: [
      { id: "topic", label: "Business Name / Website Topic", type: "text", placeholder: "e.g., LuxeCuts - A Premium Barber Shop in New York" },
      { id: "pages", label: "Select or Write Pages", type: "custom_pages" },
      { id: "technology", label: "Select Technology / Framework", type: "select", options: ["HTML/Tailwind", "Next.js (React)", "React (Tailwind)", "WordPress", "Vue.js"] },
      { id: "primaryColor", label: "Primary Color", type: "color", placeholder: "#036cd8" },
      { id: "secondaryColor", label: "Secondary Color", type: "color", placeholder: "#6366f1" },
      { id: "logo", label: "Upload Logo (optional)", type: "file", placeholder: "" }
    ]
  },
  "seo_optimizer": {
    title: "AI SEO Optimizer Agent",
    url: getAgentUrl("seo-opt"),
    premium: true,
    fields: [
      { id: "website_url", label: "Website URL", type: "text", placeholder: "e.g., https://myclientwebsite.com" },
      { id: "keywords", label: "Target Keywords (Comma Separated)", type: "textarea", placeholder: "e.g., real estate, apartments for rent, buy houses" },
      { id: "framework", label: "Website Tech Stack / Framework", type: "select", options: ["WordPress", "Next.js", "React (Client-Side)", "Node.js (SSR)", "Static HTML"] },
      { id: "focus_area", label: "Optimization Focus", type: "select", options: ["All-in-One Optimization", "Meta Tags & Content Audit", "Image Alt Text Generation", "Technical / Speed Enhancements"] }
    ]
  }
};

export const Agents: React.FC = () => {
  const [selectedAgentKey, setSelectedAgentKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [responseText, setResponseText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [customPageText, setCustomPageText] = useState('');
  const [editPromptText, setEditPromptText] = useState('');
  const agentStatuses: Record<string, 'active' | 'sleeping'> = {
    "review_generation": "active",
    "review_response": "active",
    "social_publishing": "active",
    "social_engagement": "active",
    "reporting": "active",
    "listings_optimization": "active",
    "lead_generation": "active",
    "contact_segmentation": "active",
    "template_design": "active",
    "custom": "active",
    "website_builder": "active",
    "seo_optimizer": "active"
  };

  useEffect(() => {
    // Inject html2pdf script if not present
    if (!document.getElementById('html2pdf-script')) {
      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(script);
    }
  }, []);

  const openAgentModal = (agentKey: string) => {
    setSelectedAgentKey(agentKey);
    const config = agentConfigs[agentKey];
    if (config) {
      const defaults: any = {};
      config.fields.forEach((f: any) => {
        if (f.type === 'color') {
          defaults[f.id] = f.id === 'secondaryColor' ? '#6366f1' : '#036cd8';
        }
        if (f.type === 'select') {
          defaults[f.id] = f.options[0]; // Default to first option
        }
        if (f.type === 'custom_pages') {
          defaults[f.id] = 'Home, About Us, Services, Portfolio, Contact Us';
        }
      });
      setFormData(defaults);
    } else {
      setFormData({});
    }
    setResponseText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, _fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          logoBase64: event.target?.result,
          logoFileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const runAgentWorkflow = async () => {
    if (!selectedAgentKey) return;
    const config = agentConfigs[selectedAgentKey] || { url: getAgentUrl("generic") };

    setIsLoading(true);
    setResponseText('');
    setProgress(0);
    setLoadingStage('Initializing Agent...');

    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setLoadingStage('Analyzing Inputs...');
          return prev + Math.random() * 5;
        }
        if (prev < 60) {
          setLoadingStage('Synthesizing Content...');
          return prev + Math.random() * 3;
        }
        if (prev < 90) {
          setLoadingStage('Finalizing Results...');
          return prev + Math.random() * 2;
        }
        return prev;
      });
    }, 400);

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        clearInterval(progressInterval);
        setProgress(100);
        setLoadingStage('Generation Complete!');

        const data = await response.json();
        let output = typeof data === 'object' ? data.aiOutput || JSON.stringify(data, null, 2) : data;
        const cleanHtml = output.replace(/```html/gi, '').replace(/```/g, '').trim();

        setTimeout(() => {
          setResponseText(cleanHtml);
          toast.success(`${agentConfigs[selectedAgentKey].title} completed successfully!`);
        }, 500);
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setResponseText(`Error: Cannot reach local backend. Is 'npm run start:dev' running in backend?\nDetails: ${error.message}`);
      toast.error("Workflow failed. Check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    const editInstruction = editPromptText.trim();
    if (!editInstruction || !responseText) return;

    setIsLoading(true);
    setProgress(0);
    setLoadingStage('Analyzing Existing Design...');
    setEditPromptText(''); // Clear input

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          setLoadingStage('Locating Targets...');
          return prev + Math.random() * 6;
        }
        if (prev < 75) {
          setLoadingStage('Applying Code Refinements...');
          return prev + Math.random() * 4;
        }
        if (prev < 90) {
          setLoadingStage('Finalizing Site Preview...');
          return prev + Math.random() * 2;
        }
        return prev;
      });
    }, 400);

    try {
      const config = agentConfigs['website_builder'];
      const payload = {
        ...formData,
        previousHtml: responseText,
        editInstruction: editInstruction
      };

      const response = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        clearInterval(progressInterval);
        setProgress(100);
        setLoadingStage('Edit Completed!');

        const data = await response.json();
        let output = typeof data === 'object' ? data.aiOutput || JSON.stringify(data, null, 2) : data;
        const cleanHtml = output.replace(/```html/gi, '').replace(/```/g, '').trim();

        setTimeout(() => {
          setResponseText(cleanHtml);
          toast.success("Design updated successfully!");
        }, 500);
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast.error(`Edit failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPdf = () => {
    const element = document.getElementById('pdf-content-area');
    if (!element || !responseText) return;

    // @ts-ignore
    const html2pdf = window.html2pdf;
    if (!html2pdf) {
      toast.error("PDF library not loaded yet. Please try again in a moment.");
      return;
    }

    const opt = {
      margin: 10,
      filename: `Wheedle_${selectedAgentKey}_Result.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const selectedConfig = selectedAgentKey ? agentConfigs[selectedAgentKey] : null;
  const isWebsiteBuilder = selectedAgentKey === 'website_builder';

  return (
    <div className="birdai-wrapper animate-fade-in">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        .birdai-wrapper {
            font-family: 'Outfit', 'Inter', sans-serif;
            background: transparent;
            min-height: calc(100vh - 80px);
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            color: var(--text-primary);
            overflow: hidden;
            margin: -20px;
        }

        .background-effects {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            pointer-events: none;
        }

        .circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 1px solid rgba(139, 92, 246, 0.1);
            box-shadow: 0 0 60px rgba(139, 92, 246, 0.05);
        }

        .circle-1 { width: 400px; height: 400px; border-color: rgba(139, 92, 246, 0.15); }
        .circle-2 { width: 700px; height: 700px; border-color: rgba(59, 130, 246, 0.1); }
        .circle-3 { width: 1000px; height: 1000px; border-color: rgba(236, 72, 153, 0.05); }

        .dashboard-container {
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 60px;
            width: 100%;
            max-width: 1200px;
            padding: 40px;
        }

        .agent-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .left-column { align-items: flex-end; }
        .right-column { align-items: flex-start; }

        .agent-btn {
            background: var(--bg-elevated);
            backdrop-filter: blur(12px);
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 16px 24px;
            font-size: 15px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            min-width: 320px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }

        .agent-btn::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
        }

        .agent-btn i, .agent-btn span {
            position: relative;
            z-index: 2;
        }

        .agent-btn:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
        }

        .agent-btn:hover::before { opacity: 1; }

        .agent-btn i { font-size: 20px; color: #8b5cf6; width: 24px; text-align: center; }

        .status-dot {
            width: 8px; height: 8px; border-radius: 50%;
            position: absolute; top: 12px; right: 12px; z-index: 3;
        }
        .status-active { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
        .status-sleeping { background: #64748b; }

        .premium-btn {
            background: var(--glass-bg);
            border: 1px solid rgba(245, 158, 11, 0.3);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
        }

        .premium-btn:hover {
            box-shadow: 0 0 35px rgba(245, 158, 11, 0.25);
            border-color: rgba(245, 158, 11, 0.8);
        }
        
        .premium-btn i { color: #f59e0b; filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }

        .center-logo {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 16px; z-index: 20; background: var(--bg-card);
            backdrop-filter: blur(24px); padding: 40px; border-radius: 50%;
            width: 220px; height: 220px; border: 1px solid rgba(139, 92, 246, 0.2);
            box-shadow: 0 0 60px rgba(139, 92, 246, 0.15); transition: all 0.4s ease;
        }
        .center-logo:hover { transform: scale(1.05); border-color: rgba(139, 92, 246, 0.4); }
        .center-logo h1 { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; }

        .modal {
            position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%;
            background-color: var(--glass-bg); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
        }

        .modal-content {
            background-color: var(--bg-secondary); 
            padding: 32px; border-radius: 24px;
            width: 90%; max-width: 580px; max-height: 85vh; overflow-y: auto;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7); position: relative;
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(20px);
        }
        .modal-content.wide { max-width: 850px; }

        .close-btn {
            position: absolute; top: 24px; right: 24px; font-size: 24px; cursor: pointer;
            color: var(--text-secondary); background: var(--bg-elevated); border: none;
            width: 36px; height: 36px; border-radius: 50%; display: flex;
            justify-content: center; align-items: center; transition: all 0.2s;
        }
        .close-btn:hover { color: #fff; background: 'var(--glass-border)'; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: var(--text-secondary); }
        .form-group input, .form-group textarea {
            width: 100%; padding: 14px; border: 1px solid var(--glass-border); border-radius: 12px;
            outline: none; color: var(--text-primary); background: var(--bg-elevated); font-size: 15px;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #0766f5; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

        #triggerAgentBtn {
            background: linear-gradient(135deg, #7033f5 0%, #3b82f6 100%);
            color: white; border: none; padding: 16px 24px; border-radius: 12px;
            cursor: pointer; font-weight: 600; width: 100%; font-size: 16px;
            transition: all 0.3s; box-shadow: 0 4px 15px rgba(112, 51, 245, 0.3);
        }
        #triggerAgentBtn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(112, 51, 245, 0.4); }
        #triggerAgentBtn:disabled { opacity: 0.7; cursor: not-allowed; }

        pre {
            background: var(--bg-elevated); padding: 16px; border-radius: 12px;
            font-size: 14px; overflow-x: auto; margin-top: 8px;
            white-space: pre-wrap; border: 1px solid var(--glass-border); color: var(--text-primary);
        }
        
        .action-btn {
            flex: 1; background: var(--bg-elevated); color: var(--text-primary);
            border: 1px solid var(--glass-border); padding: 14px;
            border-radius: 10px; cursor: pointer; font-weight: 600;
            display: flex; justify-content: center; align-items: center; gap: 10px;
            transition: all 0.3s;
        }
        .action-btn:hover { background: 'var(--glass-border)'; transform: translateY(-2px); }

        /* PDF hidden area */
        #pdf-content-area { background: var(--bg-primary); color: var(--text-primary); padding: 40px; font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="background-effects">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="dashboard-container">
        <div className="agent-column left-column">
          {Object.entries(agentConfigs).slice(0, 5).map(([key, config]) => (
            <button key={key} className={`agent-btn ${config.premium ? 'premium-btn' : ''}`} onClick={() => openAgentModal(key)}>
              <div className={`status-dot ${agentStatuses[key] === 'active' ? 'status-active' : 'status-sleeping'}`}></div>
              <i className={key.includes('social') ? 'fa-solid fa-share-nodes' : config.premium ? 'fa-solid fa-wand-magic-sparkles' : 'fa-regular fa-star'}></i>
              <span>{config.title} {config.premium && <span className="premium-badge" style={{ fontSize: '9px', background: '#f59e0b', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>PRO</span>}</span>
            </button>
          ))}
        </div>

        <div className="center-logo">
      <div style={{ padding: '0 8px', marginBottom: '-20px', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)',
        }}>
          <div style={{
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
}}>
  {<img
    src={logo}
    alt="logo"
    style={{
      width: '100%',
      height: '120%',
      objectFit: 'contain',
    }}
  /> }
</div>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: 'var(--text-primary)', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
          Wheedle Technologies.ai
        </h2>
      </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Agent Ecosystem</p>
        </div>

        <div className="agent-column right-column">
          {Object.entries(agentConfigs).slice(5).map(([key, config]) => (
            <button key={key} className={`agent-btn ${config.premium ? 'premium-btn' : ''}`} onClick={() => openAgentModal(key)}>
              <div className={`status-dot ${agentStatuses[key] === 'active' ? 'status-active' : 'status-sleeping'}`}></div>
              <i className={config.premium ? 'fa-solid fa-wand-magic-sparkles' : 'fa-regular fa-user'}></i>
              <span>{config.title} {config.premium && <span className="premium-badge" style={{ fontSize: '9px', background: '#f59e0b', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }}>PRO</span>}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedConfig && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setSelectedAgentKey(null)}>
          <div className={`modal-content ${selectedConfig.premium ? 'wide' : ''}`}>
            <button className="close-btn" onClick={() => { setSelectedAgentKey(null); setResponseText(''); }}>&times;</button>
            <h2 style={{ marginBottom: '10px', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedConfig.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Fill in the parameters to trigger the AI workflow.</p>

            <div id="formContainer" style={{ marginBottom: '20px' }}>
              {selectedConfig.fields.map((field: any) => (
                <div key={field.id} className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>{field.label}</label>
                    {field.id === 'keywords' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const websiteUrl = formData['website_url'] || formData['website'] || formData['url'];
                          if (!websiteUrl) {
                            toast.error("Please enter a Website URL first to suggest keywords!");
                            return;
                          }
                          const toastId = toast.loading("Analyzing site & generating keywords...");
                          try {
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                            const response = await fetch(`${baseUrl}/webhook/suggest-keywords`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ website_url: websiteUrl })
                            });
                            if (response.ok) {
                              const json = await response.json();
                              if (json && json.keywords) {
                                setFormData((prev: any) => ({ ...prev, keywords: json.keywords }));
                                toast.success("Keywords generated successfully!", { id: toastId });
                              } else {
                                throw new Error("Invalid response format");
                              }
                            } else {
                              throw new Error("HTTP error " + response.status);
                            }
                          } catch (e: any) {
                            toast.error("Failed to suggest keywords: " + e.message, { id: toastId });
                          }
                        }}
                        style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#8b5cf6',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Suggest Keywords via AI
                      </button>
                    )}
                  </div>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      rows={3}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      value={formData[field.id] || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      value={formData[field.id] || ''}
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-elevated)', fontSize: '15px' }}
                    >
                      <option value="">-- Choose Option --</option>
                      {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'custom_pages' ? (
                    (() => {
                      const activePages = (formData[field.id] || '')
                        .split(',')
                        .map((p: string) => p.trim())
                        .filter(Boolean);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Tag Pills */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {activePages.map((page: string) => (
                              <span key={page} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(139, 92, 246, 0.12)',
                                color: '#a78bfa',
                                border: '1px solid rgba(139, 92, 246, 0.25)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500
                              }}>
                                {page}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = activePages.filter((p: string) => p !== page);
                                    setFormData({ ...formData, [field.id]: updated.join(', ') });
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#a78bfa',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    padding: 0,
                                    marginLeft: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* Dropdown + Input group */}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <select
                              onChange={(e) => {
                                const selected = e.target.value;
                                if (selected && !activePages.includes(selected)) {
                                  const updated = [...activePages, selected];
                                  setFormData({ ...formData, [field.id]: updated.join(', ') });
                                }
                                e.target.value = ""; // reset
                              }}
                              style={{
                                flex: '1 1 180px',
                                padding: '12px',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            >
                              <option value="">+ Add Common Page</option>
                              {["Home", "About Us", "Services", "Portfolio", "Pricing", "Features", "Testimonials", "Contact Us", "FAQ", "Blog", "Careers"]
                                .filter(p => !activePages.includes(p))
                                .map(p => <option key={p} value={p}>{p}</option>)}
                            </select>

                            <div style={{ display: 'flex', flex: '2 1 240px', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="Or type page name..."
                                value={customPageText}
                                onChange={(e) => setCustomPageText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = customPageText.trim();
                                    if (val && !activePages.includes(val)) {
                                      const updated = [...activePages, val];
                                      setFormData({ ...formData, [field.id]: updated.join(', ') });
                                      setCustomPageText('');
                                    }
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: '12px',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: '10px',
                                  background: 'var(--bg-elevated)',
                                  color: 'var(--text-primary)',
                                  fontSize: '14px',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = customPageText.trim();
                                  if (val && !activePages.includes(val)) {
                                    const updated = [...activePages, val];
                                    setFormData({ ...formData, [field.id]: updated.join(', ') });
                                    setCustomPageText('');
                                  }
                                }}
                                style={{
                                  padding: '10px 16px',
                                  background: 'rgba(139, 92, 246, 0.15)',
                                  color: '#8b5cf6',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : field.type === 'file' ? (
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, field.id)} />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                      value={formData[field.id] || ''}
                    />
                  )}
                </div>
              ))}
            </div>

            <button id="triggerAgentBtn" onClick={runAgentWorkflow} disabled={isLoading}>
              {isLoading ? (isWebsiteBuilder ? '⚡ Architecting Site...' : 'Processing...') : (isWebsiteBuilder ? '✦ Generate Website' : 'Run Agent Workflow')}
            </button>

            {isLoading && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{loadingStage}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                      transition: 'width 0.4s ease-out',
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                    }}
                  />
                </div>
              </div>
            )}

            {responseText && (
              <div id="responseContainer" style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Agent Output:</h3>
                  <button className="action-btn" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={downloadAsPdf}>
                    <i className="fa-solid fa-file-pdf"></i> Save as PDF
                  </button>
                </div>

                {isWebsiteBuilder ? (
                  <>
                    <div id="pdf-content-area" style={{ display: 'none' }}>
                      <h1>Wheedle AI Website Project</h1>
                      <p>Topic: {formData.topic}</p>
                      <div dangerouslySetInnerHTML={{ __html: responseText }} />
                    </div>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
                      <div style={{ background: 'var(--bg-card)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>localhost — Preview</span>
                        <span style={{ color: '#3b82f6', fontSize: '12px' }}>AI Architect v1.0</span>
                      </div>
                      <div style={{ height: '500px', background: 'var(--bg-primary)', borderRadius: '0 0 16px 16px' }}>
                        <iframe srcDoc={responseText} style={{ width: '100%', height: '100%', border: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
                      <button className="action-btn" onClick={() => window.open(URL.createObjectURL(new Blob([responseText], { type: 'text/html' })), '_blank')}>
                        <i className="fa-solid fa-eye"></i> Full Preview
                      </button>
                      <button className="action-btn" onClick={() => {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(new Blob([responseText], { type: 'text/html' }));
                        a.download = `Wheedle_Site_${Date.now()}.html`;
                        a.click();
                      }}>
                        <i className="fa-solid fa-download"></i> Download HTML
                      </button>
                    </div>
                    {/* AI Refinement Hub (Conversational Edit) */}
                    <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#8b5cf6' }}></i>
                        AI Refinement Hub (Conversational Edit)
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                        Type any modification instruction (like Figma). The AI will update your live HTML site preview on the fly!
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="e.g. 'Make the background solid black', 'Add a price grid', 'Increase title size'..."
                          value={editPromptText}
                          onChange={(e) => setEditPromptText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading) {
                              handleEditSubmit();
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={handleEditSubmit}
                          disabled={isLoading || !editPromptText.trim()}
                          style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: (isLoading || !editPromptText.trim()) ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                          }}
                        >
                          {isLoading ? 'Updating...' : '✦ Apply Edit'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div id="pdf-content-area" className="result-preview" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '24px', borderRadius: '12px', maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--glass-border)' }}>
                    {responseText.trim().startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: responseText }} />
                    ) : (
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, border: 'none', background: 'transparent', color: 'inherit', padding: 0 }}>{responseText}</pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

