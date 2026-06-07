import React, { useState, useEffect } from 'react';
import { 
  Activity, Play, Check, X, Layers, Cpu, Sliders, AlertTriangle, 
  TrendingUp, RefreshCw, Send, ChevronRight, CheckCircle2, Server, HelpCircle
} from 'lucide-react';

interface Task {
  id: string;
  trigger: string;
  source: string;
  agentDecision: string;
  proposedAction: string;
  confidence: number;
  data: string;
  status: 'pending' | 'approved' | 'corrected';
  correctionText?: string;
}

interface Agent {
  name: string;
  role: string;
  model: string;
  accuracy: number;
  skills: string[];
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TSK-8492",
      trigger: "Email Client",
      source: "walter.support@entreprise.tg",
      agentDecision: "Reclamation Produit Endommage",
      proposedAction: "Generer un bon de reduction de 10% + reponse d'excuses standard.",
      confidence: 84,
      data: "Bonjour, j'ai recu ma commande ce matin mais le produit principal est casse dans le carton. Pouvez-vous faire quelque chose ? C'est pour un cadeau d'anniversaire demain !",
      status: 'pending'
    },
    {
      id: "TSK-8493",
      trigger: "Webhook Stripe",
      source: "stripe_event_ch_394k2",
      agentDecision: "Echec Paiement Abonnement",
      proposedAction: "Envoyer un email de relance doux et planifier un retry dans 3 jours.",
      confidence: 97,
      data: "Event: invoice.payment_failed | Customer: cus_94K20d | Retries remaining: 2",
      status: 'pending'
    },
    {
      id: "TSK-8494",
      trigger: "Formulaire Contact",
      source: "marketing@startup.tg",
      agentDecision: "Demande de Devis sur Mesure",
      proposedAction: "Transferer au commercial Afrique + Rediger un premier jet d'email de prise de contact.",
      confidence: 76,
      data: "Bonjour, nous sommes une startup de 15 personnes et nous souhaiterions deployer vos solutions de bots RH. Quels sont vos tarifs annuels pour 50 utilisateurs ?",
      status: 'pending'
    }
  ]);

  const [logs, setLogs] = useState<string[]>([
    "[10:30:15] [System] Demarrage de la plateforme Self-Improving Auto-Ops",
    "[10:30:16] [System] Connecteurs Webhook Stripe et SMTP configurables OK",
    "[10:30:18] [Hermes Dispatcher] Chargement du modele de classification d'intentions OK",
    "[10:31:02] [Hermes Executor] Tache TSK-8492 detectee. Intent: Reclamation. Confiance: 84%",
    "[10:31:02] [System] TSK-8492 envoyee dans la file d'attente Validation Humaine (HITL)",
    "[10:31:15] [Hermes Executor] Tache TSK-8493 detectee. Intent: Echec Paiement. Confiance: 97%",
    "[10:31:15] [System] TSK-8493 envoyee dans la file d'attente Validation Humaine (HITL)"
  ]);

  const [selectedNode, setSelectedNode] = useState<string>('dispatcher');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempCorrection, setTempCorrection] = useState<string>('');
  const [learningCycle, setLearningCycle] = useState<number>(42);
  const [automatedRate, setAutomatedRate] = useState<number>(94.2);
  const [successBadge, setSuccessBadge] = useState<string | null>(null);

  const agents: Record<string, Agent> = {
    dispatcher: {
      name: "Hermes Dispatcher",
      role: "Classificateur & Routeur de Taches",
      model: "Llama 3.1 70B (Groq)",
      accuracy: 98.4,
      skills: ["Analyse de sentiment", "Extraction d'intentions", "Routage conditionnel"]
    },
    executor: {
      name: "Hermes Executor",
      role: "Generateur de Propositions",
      model: "Gemini 2.5 Flash",
      accuracy: 95.1,
      skills: ["Generation de reponses mail", "Appels d'API externes", "Calcul de compensations client"]
    },
    corrector: {
      name: "Hermes Corrector",
      role: "Apprentissage & Amelioration Continue",
      model: "Claude 3.5 Sonnet",
      accuracy: 99.1,
      skills: ["Analyse d'erreurs", "Mise a jour de invites-systeme (Prompt Engineering)", "Rapport d'apprentissage"]
    }
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleApprove = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    const task = tasks.find(t => t.id === id);
    addLog(`[System] Action de la tache ${id} approuvee et executee.`);
    addLog(`[API External] Action deployee avec succes pour ${task?.source}.`);
    
    // Trigger mock self-learning cycles
    triggerLearningSuccess();
  };

  const handleCorrect = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditingTaskId(id);
    setTempCorrection(task.proposedAction);
  };

  const submitCorrection = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'corrected', correctionText: tempCorrection } : t));
    setEditingTaskId(null);
    addLog(`[Operateur] Tache ${id} corrigee : "${tempCorrection}"`);
    addLog(`[Hermes Corrector] Demarrage de l'analyse corrective...`);
    
    setTimeout(() => {
      addLog(`[Hermes Corrector] Identifie l'erreur de decision sur ${id}. Modifie la regle de competence.`);
      addLog(`[Hermes Executor] Competence mise a jour avec succes. Cycle de correction termine.`);
      setLearningCycle(prev => prev + 1);
      setAutomatedRate(prev => Math.min(99.9, parseFloat((prev + 0.15).toFixed(2))));
      setSuccessBadge(`Cycle de correction ${learningCycle + 1} effectue ! L'agent a appris.`);
      
      // Auto-hide success badge
      setTimeout(() => setSuccessBadge(null), 4000);
    }, 1500);
  };

  const triggerLearningSuccess = () => {
    // Increment stats slightly
    setAutomatedRate(prev => Math.min(99.9, parseFloat((prev + 0.02).toFixed(2))));
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
              <Layers className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              Auto-Ops Platform
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Live
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Systeme d'automatisation auto-apprenant (Human-In-The-Loop)
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400">Mode d'Execution</span>
            <p className="text-sm font-semibold text-indigo-400">Apprentissage Actif</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition btn-neon text-sm font-medium">
            <RefreshCw className="h-4 w-4" /> Reset Simulation
          </button>
        </div>
      </header>

      {/* Success Badge Banner */}
      {successBadge && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center space-x-3 fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-semibold">{successBadge}</p>
        </div>
      )}

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux d'Autonomie</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-cyan-400">{automatedRate}%</h3>
            <span className="text-xs text-slate-500">+0.8% depuis hier</span>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cycles d'Apprentissage</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-indigo-400">{learningCycle}</h3>
            <span className="text-xs text-slate-500">Auto-corrections hermes</span>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approbations HITL</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-400">
              {tasks.filter(t => t.status === 'pending').length}
            </h3>
            <span className="text-xs text-slate-500">Taches en attente d'approb</span>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temps Economise</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-400">14.6 h</h3>
            <span className="text-xs text-slate-500">Equivalent de 2.5 jours</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Flow Builder Visualizer */}
        <section className="lg:col-span-5 glass p-6 rounded-2xl flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" /> Workflow Multi-Agents
            </h2>
            <span className="text-xs text-slate-400">Interactif - Cliquez pour inspecter</span>
          </div>

          {/* Graphical Pipeline representation */}
          <div className="flex flex-col items-center space-y-4 py-4 relative">
            
            {/* Input Trigger Node */}
            <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Trigger</span>
                  <h4 className="text-sm font-semibold">Emails / Webhook Stripe</h4>
                </div>
              </div>
              <Play className="h-4 w-4 text-slate-600" />
            </div>

            <ChevronRight className="h-5 w-5 text-indigo-500/50 transform rotate-90" />

            {/* Dispatcher Agent Node */}
            <div 
              onClick={() => setSelectedNode('dispatcher')}
              className={`w-full cursor-pointer p-4 rounded-xl border transition-all ${
                selectedNode === 'dispatcher' 
                  ? 'border-indigo-500 bg-indigo-950/20 active-glow' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Agent Classificateur</span>
                    <h4 className="text-sm font-bold text-indigo-300">Hermes Dispatcher</h4>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 rounded-full text-indigo-400">98% Acc</span>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-indigo-500/50 transform rotate-90" />

            {/* Executor Agent Node */}
            <div 
              onClick={() => setSelectedNode('executor')}
              className={`w-full cursor-pointer p-4 rounded-xl border transition-all ${
                selectedNode === 'executor' 
                  ? 'border-cyan-500 bg-cyan-950/20 active-glow' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Agent Decisionnel</span>
                    <h4 className="text-sm font-bold text-cyan-300">Hermes Executor</h4>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-500/10 rounded-full text-cyan-400">95% Acc</span>
              </div>
            </div>

            <div className="w-full flex justify-between items-center py-2">
              <div className="w-[45%] h-[1px] bg-slate-800"></div>
              <span className="text-[10px] text-amber-500 uppercase tracking-widest px-2 border border-amber-500/20 bg-amber-500/5 rounded-full">
                HITL Check (Validation)
              </span>
              <div className="w-[45%] h-[1px] bg-slate-800"></div>
            </div>

            {/* Learning Corrector Agent Node */}
            <div 
              onClick={() => setSelectedNode('corrector')}
              className={`w-full cursor-pointer p-4 rounded-xl border transition-all ${
                selectedNode === 'corrector' 
                  ? 'border-emerald-500 bg-emerald-950/20 active-glow' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Correcteur & Apprenant</span>
                    <h4 className="text-sm font-bold text-emerald-300">Hermes Corrector</h4>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full text-emerald-400">Self-Heal</span>
              </div>
            </div>

          </div>

          {/* Node details / configuration */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-indigo-300">{agents[selectedNode].name}</h4>
              <span className="text-xs text-slate-500">{agents[selectedNode].model}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Role Principal</span>
              <p className="text-xs text-slate-300 mt-0.5">{agents[selectedNode].role}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Competences Activees</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {agents[selectedNode].skills.map((skill, index) => (
                  <span key={index} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Pending Approvals Queue (HITL) */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* HITL list */}
          <div className="glass p-6 rounded-2xl flex flex-col space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" /> File d'Attente Validation Humaine
            </h2>
            
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 transition hover:border-slate-700">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">{task.id}</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                          {task.trigger}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">De : {task.source}</span>
                      </div>
                      <h3 className="text-sm font-bold text-indigo-200 mt-1.5">
                        Classification Agent : {task.agentDecision}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      task.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      task.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {task.status === 'pending' ? 'En attente' :
                       task.status === 'approved' ? 'Approuve' : 'Corrige'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg text-xs text-slate-400 italic border-l-2 border-indigo-500">
                    "{task.data}"
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Proposition d'action autonome (Confiance {task.confidence}%)
                    </span>
                    
                    {editingTaskId === task.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={tempCorrection}
                          onChange={(e) => setTempCorrection(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setEditingTaskId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                          >
                            Annuler
                          </button>
                          <button 
                            onClick={() => submitCorrection(task.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold btn-neon"
                          >
                            <Send className="h-3.5 w-3.5" /> Enregistrer & Entrainer l'Agent
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4">
                        <p className="text-xs text-slate-200">
                          {task.status === 'corrected' ? (
                            <span>
                              <strong className="text-purple-400">Corrige par l'operateur : </strong>
                              {task.correctionText}
                            </span>
                          ) : (
                            task.proposedAction
                          )}
                        </p>
                        
                        {task.status === 'pending' && (
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button 
                              onClick={() => handleCorrect(task.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                            >
                              Corriger
                            </button>
                            <button 
                              onClick={() => handleApprove(task.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Check className="h-3 w-3" /> Approuver
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Console / Event Log Panel */}
          <div className="glass p-6 rounded-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-400" /> Flux d'Execution & Logs d'Apprentissage
              </h2>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-slate-300 h-48 overflow-y-auto space-y-1.5 border border-slate-900">
              {logs.map((log, i) => (
                <div key={i} className="leading-5">
                  <span className="text-slate-500">{log.substring(0, 10)}</span>
                  <span className={
                    log.includes('[System]') ? 'text-cyan-400' :
                    log.includes('[Hermes Dispatcher]') ? 'text-indigo-400' :
                    log.includes('[Hermes Executor]') ? 'text-cyan-300' :
                    log.includes('[Hermes Corrector]') ? 'text-emerald-400' :
                    log.includes('[Operateur]') ? 'text-purple-400' : 'text-slate-300'
                  }>
                    {log.substring(10)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
