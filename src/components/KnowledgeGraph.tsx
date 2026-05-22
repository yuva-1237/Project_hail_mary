import React, { useMemo } from "react";
import { Network, X, CheckCircle, XCircle } from "lucide-react";
import { getAllLearningExperiences } from "../ai/learningEngine";

interface KnowledgeGraphProps {
  onClose: () => void;
}

interface EventNode {
  title: string;
  actions: Record<string, ActionNode>;
}

interface ActionNode {
  name: string;
  count: number;
  totalSuccessImpact: number;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onClose }) => {
  const experiences = useMemo(() => getAllLearningExperiences(), []);

  const graphData = useMemo(() => {
    const events: Record<string, EventNode> = {};

    experiences.forEach(exp => {
      if (!events[exp.eventTitle]) {
        events[exp.eventTitle] = { title: exp.eventTitle, actions: {} };
      }
      const evNode = events[exp.eventTitle];
      if (!evNode.actions[exp.selectedAction]) {
        evNode.actions[exp.selectedAction] = { name: exp.selectedAction, count: 0, totalSuccessImpact: 0 };
      }
      evNode.actions[exp.selectedAction].count += 1;
      evNode.actions[exp.selectedAction].totalSuccessImpact += exp.successImpact;
    });

    return Object.values(events);
  }, [experiences]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl shadow-purple-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-500/30 flex justify-between items-center bg-purple-900/20">
          <div className="flex flex-col">
            <h3 className="text-xl font-orbitron font-bold text-purple-400 flex items-center gap-2">
              <Network className="w-5 h-5" />
              Mission Knowledge Graph
            </h3>
            <span className="text-xs font-mono text-slate-400">Continuous Learning & Strategic Evaluation</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Graph Area */}
        <div className="flex-1 overflow-auto p-8 bg-[#0a0f18] relative">
          {graphData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-slate-500 font-mono">No learning experiences recorded yet. Run a simulation to build the knowledge graph.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {graphData.map((eventNode, i) => (
                <div key={i} className="flex gap-16 items-center">
                  
                  {/* Event Node */}
                  <div className="w-64 shrink-0 bg-slate-800 border border-purple-500/50 p-4 rounded-xl shadow-lg relative z-10">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Anomaly Detected</span>
                    <h4 className="font-bold text-slate-200">{eventNode.title}</h4>
                  </div>

                  {/* Actions / Outcomes */}
                  <div className="flex flex-col gap-4 flex-1 relative">
                    {/* Connecting line behind */}
                    <div className="absolute left-[-4rem] top-1/2 bottom-1/2 w-16 border-t-2 border-slate-700/50 z-0"></div>

                    {Object.values(eventNode.actions).sort((a, b) => b.totalSuccessImpact - a.totalSuccessImpact).map((actionNode, j) => {
                      const avgImpact = actionNode.totalSuccessImpact / actionNode.count;
                      const isPositive = avgImpact >= 0;

                      return (
                        <div key={j} className="flex items-center gap-16 relative">
                          {/* Branching line */}
                          <div className="absolute left-[-4rem] top-1/2 w-16 border-t-2 border-slate-700/50 z-0"></div>
                          
                          {/* Decision Node */}
                          <div className="w-64 shrink-0 bg-slate-800 border border-cyan-500/30 p-4 rounded-xl relative z-10">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">Decision Executed</span>
                            <h4 className="font-bold text-slate-200">{actionNode.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">Times selected: {actionNode.count}</span>
                          </div>

                          {/* Outcome Node */}
                          <div className={`w-48 shrink-0 bg-slate-800 border p-3 rounded-xl relative z-10 flex items-center gap-3 ${isPositive ? 'border-cyber-green/40' : 'border-cyber-red/40'}`}>
                            {/* Branching line */}
                            <div className="absolute left-[-4rem] top-1/2 w-16 border-t-2 border-slate-700/50 z-0"></div>
                            
                            {isPositive ? <CheckCircle className="w-5 h-5 text-cyber-green" /> : <XCircle className="w-5 h-5 text-cyber-red" />}
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Average Impact</span>
                              <span className={`font-bold font-mono ${isPositive ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                {isPositive ? '+' : ''}{avgImpact.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
