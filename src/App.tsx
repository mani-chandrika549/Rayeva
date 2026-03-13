import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Plus, 
  Send, 
  History, 
  CheckCircle2, 
  Leaf,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categorizeProduct, generateProposal, generateImpactReport } from './services/ai';
import { ArchitectureCard } from './components/ArchitectureCard';
import { ProductResult, ProposalResult, ImpactResult, AiLog } from './types';

type Module = 'categorize' | 'proposal' | 'impact' | 'whatsapp' | 'logs';

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('categorize');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [aiKeyStatus, setAiKeyStatus] = useState<'checking' | 'present' | 'missing'>('checking');

  // Module 1 State
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [catResult, setCatResult] = useState<ProductResult | null>(null);

  // Module 2 State
  const [clientName, setClientName] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [propResult, setPropResult] = useState<ProposalResult | null>(null);

  // Module 3 State
  const [orderData, setOrderData] = useState('');
  const [impactResult, setImpactResult] = useState<ImpactResult | null>(null);

  useEffect(() => {
    console.log("App mounted, checking status...");
    checkStatus();
    
    // Check AI Key
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      setAiKeyStatus('present');
    } else {
      setAiKeyStatus('missing');
    }
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendStatus('online');
        console.log("Backend is online");
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      console.error("Backend check failed:", err);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    if (activeModule === 'logs') {
      console.log("Fetching logs...");
      fetchLogs();
    }
  }, [activeModule]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      console.log("Logs fetched:", data.length);
      setLogs(data);
    } catch (err) {
      console.error("Fetch logs error:", err);
    }
  };

  const handleCategorize = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Categorize form submitted - Frontend AI");
    setLoading(true);
    try {
      const { result, raw } = await categorizeProduct(productName, productDesc);
      console.log("AI Categorize success:", result);
      setCatResult(result);

      // Log and Save to DB
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'Categorization', prompt: `Name: ${productName}, Desc: ${productDesc}`, response: raw })
      });

      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, description: productDesc, result })
      });

    } catch (err: any) {
      console.error("Categorize error:", err);
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Proposal form submitted - Frontend AI");
    setLoading(true);
    try {
      const b = parseFloat(budget);
      const { result, raw } = await generateProposal(clientName, b, requirements);
      console.log("AI Proposal success:", result);
      setPropResult(result);

      // Log and Save to DB
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'Proposal', prompt: `Client: ${clientName}, Budget: ${budget}`, response: raw })
      });

      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: clientName, budget: b, result })
      });

    } catch (err: any) {
      console.error("Proposal error:", err);
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Impact form submitted - Frontend AI");
    setLoading(true);
    try {
      const { result, raw } = await generateImpactReport(orderData);
      console.log("AI Impact success:", result);
      setImpactResult(result);

      // Log to DB
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'Impact', prompt: `Order: ${orderData}`, response: raw })
      });

    } catch (err: any) {
      console.error("Impact error:", err);
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-black/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">Rayeva AI</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            active={activeModule === 'categorize'} 
            onClick={() => setActiveModule('categorize')}
            icon={<LayoutGrid size={18} />}
            label="Auto-Categorizer"
          />
          <NavItem 
            active={activeModule === 'proposal'} 
            onClick={() => setActiveModule('proposal')}
            icon={<FileText size={18} />}
            label="B2B Proposal"
          />
          <NavItem 
            active={activeModule === 'impact'} 
            onClick={() => setActiveModule('impact')}
            icon={<BarChart3 size={18} />}
            label="Impact Reporting"
          />
          <NavItem 
            active={activeModule === 'whatsapp'} 
            onClick={() => setActiveModule('whatsapp')}
            icon={<MessageSquare size={18} />}
            label="WhatsApp Bot"
          />
          <div className="h-px bg-black/5 my-4" />
          <NavItem 
            active={activeModule === 'logs'} 
            onClick={() => setActiveModule('logs')}
            icon={<History size={18} />}
            label="AI Logs"
          />
        </nav>

        <div className="mt-auto space-y-3">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">System Status</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">Backend: {backendStatus}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <div className={`w-2 h-2 rounded-full ${aiKeyStatus === 'present' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-sm font-medium">AI Key: {aiKeyStatus}</span>
              </div>
            </div>
          </div>
          {aiKeyStatus === 'missing' && (
            <p className="text-[10px] text-amber-700 px-2">
              ⚠️ Please set GEMINI_API_KEY in Secrets to enable AI features.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-12 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeModule === 'categorize' && (
            <motion.div 
              key="cat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Auto-Category & Tag Generator</h1>
                <p className="text-black/50 text-lg">Automate cataloging with AI-driven categorization and sustainability tagging.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <form onSubmit={handleCategorize} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Product Name</label>
                      <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="e.g. Bamboo Toothbrush"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea 
                        value={productDesc}
                        onChange={(e) => setProductDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all h-32"
                        placeholder="Describe the product materials, usage, and benefits..."
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : <><Plus size={18} /> Generate Catalog Data</>}
                    </button>
                  </form>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database size={120} />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Cpu size={20} className="text-emerald-400" />
                      AI Output Preview
                    </h3>
                    {catResult && (
                      <button 
                        onClick={() => setCatResult(null)}
                        className="text-xs text-emerald-300 hover:text-white transition-colors"
                      >
                        Clear Results
                      </button>
                    )}
                  </div>
                  
                  {catResult ? (
                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Primary Category</p>
                          <p className="font-semibold">{catResult.primary_category}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Sub-Category</p>
                          <p className="font-semibold">{catResult.sub_category}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">SEO Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {catResult.seo_tags.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/10">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">Sustainability Filters</p>
                        <div className="flex flex-wrap gap-2">
                          {catResult.sustainability_filters.map((filter: string) => (
                            <span key={filter} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={14} /> {filter}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 py-12">
                      <BarChart3 size={48} className="mb-4 opacity-20" />
                      <p>Enter product details to see AI generation</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'proposal' && (
            <motion.div 
              key="prop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">B2B Proposal Generator</h1>
                <p className="text-black/50 text-lg">Create data-driven sustainable product proposals for corporate clients.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <form onSubmit={handleProposal} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Client Name</label>
                        <input 
                          type="text" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500"
                          placeholder="e.g. EcoCorp"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Budget ($)</label>
                        <input 
                          type="number" 
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500"
                          placeholder="5000"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Specific Requirements</label>
                      <textarea 
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500 h-32"
                        placeholder="e.g. Focus on plastic-free office supplies for 50 employees..."
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : <><Send size={18} /> Generate Proposal</>}
                    </button>
                  </form>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm overflow-auto max-h-[600px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FileText size={20} className="text-emerald-600" />
                      Generated Proposal
                    </h3>
                    {propResult && (
                      <button 
                        onClick={() => setPropResult(null)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {propResult ? (
                    <div className="space-y-8">
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-900 mb-2">Impact Summary</h4>
                        <p className="text-emerald-800 text-sm leading-relaxed">{propResult.impact_summary}</p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-4 flex items-center justify-between">
                          <span>Product Mix</span>
                          <span className="text-xs font-normal text-black/40 uppercase tracking-widest">Estimated Allocation</span>
                        </h4>
                        <div className="space-y-3">
                          {propResult.product_mix.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5">
                              <div>
                                <p className="font-semibold">{item.product_name}</p>
                                <p className="text-xs text-black/40">Qty: {item.quantity} × ${item.unit_price}</p>
                              </div>
                              <p className="font-bold">${(item.quantity * item.unit_price).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-black/5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold">Total Estimated Cost</span>
                          <span className="text-2xl font-black text-emerald-600">{propResult.cost_breakdown}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-black/20 py-12">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p>Generate a proposal to see the breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'impact' && (
            <motion.div 
              key="impact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Impact Reporting Generator</h1>
                <p className="text-black/50 text-lg">Calculate and visualize the environmental impact of orders.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <form onSubmit={handleImpact} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Order Details</label>
                      <textarea 
                        value={orderData}
                        onChange={(e) => setOrderData(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all h-32"
                        placeholder="e.g. 500 Bamboo Straws, 200 Recycled Notebooks..."
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Calculating...' : <><BarChart3 size={18} /> Generate Impact Report</>}
                    </button>
                  </form>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database size={120} />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Cpu size={20} className="text-emerald-400" />
                      Impact Analysis
                    </h3>
                    {impactResult && (
                      <button 
                        onClick={() => setImpactResult(null)}
                        className="text-xs text-emerald-300 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {impactResult ? (
                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Plastic Saved</p>
                          <p className="text-2xl font-bold">{impactResult.plastic_saved} kg</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">CO2 Avoided</p>
                          <p className="text-2xl font-bold">{impactResult.carbon_avoided} kg</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">Local Impact</p>
                        <p className="text-sm leading-relaxed">{impactResult.local_impact}</p>
                      </div>

                      <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">Impact Statement</p>
                        <p className="italic font-serif">"{impactResult.impact_statement}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 py-12">
                      <BarChart3 size={48} className="mb-4 opacity-20" />
                      <p>Enter order details to calculate impact</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'whatsapp' && (
            <motion.div 
              key="wa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">WhatsApp Support Bot</h1>
                <p className="text-black/50 text-lg">AI-powered conversational interface for sustainable commerce.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-emerald-600" size={24} />
                    System Architecture
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <ArchitectureCard 
                      title="1. Webhook Layer"
                      content="Express server handles incoming POST requests from Meta/Twilio. Validates signature and extracts user message."
                    />
                    <ArchitectureCard 
                      title="2. Contextual RAG"
                      content="System queries SQLite for product catalog and user order history to ground the AI response."
                    />
                    <ArchitectureCard 
                      title="3. Gemini Processing"
                      content="Processes query with context. Uses Function Calling to trigger order status checks or product lookups."
                    />
                    <ArchitectureCard 
                      title="4. Response Delivery"
                      content="Sends formatted WhatsApp message back to user via API."
                    />
                  </div>
                </div>

                <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Cpu size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">Ready for Integration</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                    This module requires a verified Meta Business account and Twilio/Meta API keys. The backend logic is pre-structured to handle these webhooks.
                  </p>
                  <div className="pt-4 flex gap-4">
                    <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/10">Twilio Ready</div>
                    <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/10">Meta API Ready</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">AI Prompt & Response Logs</h1>
                <p className="text-black/50 text-lg">Transparency and debugging for all AI operations.</p>
              </div>

              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 border-bottom border-black/5">
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Timestamp</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Module</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Prompt Snippet</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                        <td className="p-4 text-sm text-black/60">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">{log.module}</span>
                        </td>
                        <td className="p-4 text-sm font-mono truncate max-w-xs">{log.prompt.substring(0, 50)}...</td>
                        <td className="p-4">
                          <button 
                            onClick={() => alert(`Full Response:\n${log.response}`)}
                            className="text-emerald-600 text-sm font-bold hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      type="button"
      onClick={() => {
        console.log(`Navigating to ${label}`);
        onClick();
      }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all w-full text-left
        ${active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
          : 'text-black/60 hover:bg-black/5 hover:text-black'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
