import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import logo from '../../assets/fevicon.png';

const agentConfigs: Record<string, any> = {
  "review_generation": {
    title: "Review Generation Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/review-gen`,
    fields: [
      { id: "customer_name", label: "Customer Name", type: "text", placeholder: "e.g., John Doe" },
      { id: "product", label: "Product/Service", type: "text", placeholder: "e.g., Premium Web Plan" }
    ]
  },
  "review_response": {
    title: "Review Response Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/review-response`,
    fields: [
      { id: "star_rating", label: "Star Rating (1-5)", type: "text", placeholder: "e.g., 4" },
      { id: "review_text", label: "Customer Review Text", type: "textarea", placeholder: "Paste customer review..." }
    ]
  },
  "social_publishing": {
    title: "Social Publishing Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/social-pub`,
    fields: [
      { id: "topic", label: "Post Topic", type: "textarea", placeholder: "e.g., New feature announcement" }
    ]
  },
  "social_engagement": {
    title: "Social Engagement Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/social-engage`,
    fields: [
      { id: "brand_tone", label: "Brand Tone", type: "text", placeholder: "e.g., Friendly & Professional" },
      { id: "user_comment", label: "User Comment to Reply To", type: "textarea", placeholder: "Paste the user comment here..." }
    ]
  },
  "reporting": {
    title: "Reporting Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/reporting`,
    fields: [
      { id: "metrics", label: "Raw Metrics Data", type: "textarea", placeholder: "e.g., 500 visitors, 10 sales, 2% conversion rate" }
    ]
  },
  "listings_optimization": {
    title: "Listings Optimization Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/listings-opt`,
    fields: [
      { id: "business_name", label: "Business Name", type: "text", placeholder: "e.g., Joe's Coffee" },
      { id: "keywords", label: "Target Keywords (SEO)", type: "textarea", placeholder: "e.g., best coffee, organic espresso, downtown cafe" }
    ]
  },
  "lead_generation": {
    title: "Lead Generation Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/lead-gen`,
    fields: [
      { id: "industry", label: "Target Industry", type: "text", placeholder: "e.g., Real Estate" },
      { id: "region", label: "Region", type: "text", placeholder: "e.g., New York" }
    ]
  },
  "contact_segmentation": {
    title: "Contact Segmentation Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/segmentation`,
    fields: [
      { id: "customer_data", label: "Customer Data Example", type: "textarea", placeholder: "e.g., Age 25, clicked email 3 times, bought shoes." }
    ]
  },
  "template_design": {
    title: "Template Design Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/template-design`,
    fields: [
      { id: "topic", label: "Website/Template Title or Topic", type: "text", placeholder: "e.g., Luxury Watch Landing Page" }
    ]
  },
  "custom": {
    title: "Custom Agent",
    url: `${import.meta.env.VITE_API_URL}/webhook/custom`,
    fields: [
      { id: "instruction", label: "Custom Instruction (System Prompt)", type: "text", placeholder: "e.g., Act as a marketing director..." },
      { id: "input", label: "Input Data", type: "textarea", placeholder: "Enter raw data to process..." }
    ]
  },
  "website_builder": {
    title: "Full Website Architect",
    url: `${import.meta.env.VITE_API_URL}/webhook/website-builder`,
    fields: [
      { id: "topic", label: "Business Name / Website Topic", type: "text", placeholder: "e.g., LuxeCuts - A Premium Barber Shop in New York" },
      { id: "pages", label: "Pages (Count or Names)", type: "text", placeholder: "e.g., 5 OR Home, About, Services, Contact" },
      { id: "theme", label: "Select Theme", type: "select", options: ["Corporate", "Startup", "SaaS", "Agency", "Portfolio", "Education", "Healthcare", "Restaurant", "E-commerce", "Real Estate"] },
      { id: "primaryColor", label: "Primary Color", type: "color", placeholder: "#036cd8" },
      { id: "secondaryColor", label: "Secondary Color", type: "color", placeholder: "#6366f1" },
      { id: "logo", label: "Upload Logo (optional)", type: "file", placeholder: "" }
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
  const agentStatuses: Record<string, 'active' | 'sleeping'> = {
    "review_generation": "active",
    "review_response": "active",
    "social_publishing": "sleeping",
    "social_engagement": "sleeping",
    "reporting": "active",
    "listings_optimization": "active",
    "lead_generation": "active",
    "contact_segmentation": "active",
    "template_design": "active",
    "custom": "active",
    "website_builder": "active"
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
          defaults[f.id] = f.options[0]; // Default to first option (Corporate)
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
    const config = agentConfigs[selectedAgentKey] || { url: `${import.meta.env.VITE_API_URL}/webhook/generic` };

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
            color: #e2e8f0;
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
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(12px);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.08);
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
            background: rgba(15, 23, 42, 0.8);
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
            gap: 16px; z-index: 20; background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(24px); padding: 40px; border-radius: 50%;
            width: 220px; height: 220px; border: 1px solid rgba(139, 92, 246, 0.2);
            box-shadow: 0 0 60px rgba(139, 92, 246, 0.15); transition: all 0.4s ease;
        }
        .center-logo:hover { transform: scale(1.05); border-color: rgba(139, 92, 246, 0.4); }
        .center-logo h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0; }

        .modal {
            position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
        }

        .modal-content {
            background-color: #0a0f1e; 
            padding: 32px; border-radius: 24px;
            width: 90%; max-width: 580px; max-height: 85vh; overflow-y: auto;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7); position: relative;
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
        }
        .modal-content.wide { max-width: 850px; }

        .close-btn {
            position: absolute; top: 24px; right: 24px; font-size: 24px; cursor: pointer;
            color: #94a3b8; background: rgba(255,255,255,0.05); border: none;
            width: 36px; height: 36px; border-radius: 50%; display: flex;
            justify-content: center; align-items: center; transition: all 0.2s;
        }
        .close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; color: #cbd5e1; }
        .form-group input, .form-group textarea {
            width: 100%; padding: 14px; border: 1px solid #334155; border-radius: 12px;
            outline: none; color: #fff; background: #0f172a; font-size: 15px;
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
            background: #0f172a; padding: 16px; border-radius: 12px;
            font-size: 14px; overflow-x: auto; margin-top: 8px;
            white-space: pre-wrap; border: 1px solid #334155; color: #e2e8f0;
        }
        
        .action-btn {
            flex: 1; background: rgba(255,255,255,0.05); color: white;
            border: 1px solid rgba(255, 255, 255, 0.1); padding: 14px;
            border-radius: 10px; cursor: pointer; font-weight: 600;
            display: flex; justify-content: center; align-items: center; gap: 10px;
            transition: all 0.3s;
        }
        .action-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* PDF hidden area */
        #pdf-content-area { background: #050a18; color: white; padding: 40px; font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="background-effects">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="dashboard-container">
        <div className="agent-column left-column">
          {Object.entries(agentConfigs).slice(0, 5).map(([key, config]) => (
            <button key={key} className="agent-btn" onClick={() => openAgentModal(key)}>
              <div className={`status-dot ${agentStatuses[key] === 'active' ? 'status-active' : 'status-sleeping'}`}></div>
              <i className={key.includes('social') ? 'fa-solid fa-share-nodes' : 'fa-regular fa-star'}></i>
              <span>{config.title}</span>
            </button>
          ))}
        </div>

        <div className="center-logo">
      <div style={{ padding: '0 8px', marginBottom: '-20px', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          // background: 'var(--accent-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          // boxShadow: '0 8px 16px rgba(112,51,245,0.25)', flexShrink: 0,
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
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: '#f5f5f5', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
          Wheedle Technologies.ai
        </h2>
      </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Agent Ecosystem</p>
        </div>

        <div className="agent-column right-column">
          {Object.entries(agentConfigs).slice(5).map(([key, config]) => (
            <button key={key} className={`agent-btn ${key === 'website_builder' ? 'premium-btn' : ''}`} onClick={() => openAgentModal(key)}>
              <div className={`status-dot ${agentStatuses[key] === 'active' ? 'status-active' : 'status-sleeping'}`}></div>
              <i className={key === 'website_builder' ? 'fa-solid fa-wand-magic-sparkles' : 'fa-regular fa-user'}></i>
              <span>{config.title}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedConfig && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setSelectedAgentKey(null)}>
          <div className={`modal-content ${isWebsiteBuilder ? 'wide' : ''}`}>
            <button className="close-btn" onClick={() => { setSelectedAgentKey(null); setResponseText(''); }}>&times;</button>
            <h2 style={{ marginBottom: '10px', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedConfig.title}</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>Fill in the parameters to trigger the AI workflow.</p>

            <div id="formContainer" style={{ marginBottom: '20px' }}>
              {selectedConfig.fields.map((field: any) => (
                <div key={field.id} className="form-group">
                  <label>{field.label}</label>
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
                      style={{ width: '100%', padding: '14px', border: '1px solid #334155', borderRadius: '12px', outline: 'none', color: '#fff', background: '#0f172a', fontSize: '15px' }}
                    >
                      <option value="">-- Choose Theme --</option>
                      {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
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
                  <span style={{ color: '#94a3b8' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
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
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>Agent Output:</h3>
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
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>
                      <div style={{ background: '#1e293b', padding: '12px 20px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>localhost — Preview</span>
                        <span style={{ color: '#3b82f6', fontSize: '12px' }}>AI Architect v1.0</span>
                      </div>
                      <div style={{ height: '500px', background: '#050a18', borderRadius: '0 0 16px 16px' }}>
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
                  </>
                ) : (
                  <div id="pdf-content-area" className="result-preview" style={{ background: 'rgba(255,255,255,0.02)', color: '#fff', padding: '24px', borderRadius: '12px', maxHeight: '500px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
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

