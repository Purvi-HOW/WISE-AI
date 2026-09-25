import React, { useState } from 'react';
import { X, BookOpen, Copy, Check } from 'lucide-react';

interface StudentToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertPrompt: (promptText: string) => void;
}

export const StudentToolkitModal: React.FC<StudentToolkitModalProps> = ({
  isOpen,
  onClose,
  onInsertPrompt
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ds' | 'latex' | 'sql'>('ds');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 1500);
  };

  const dsTable = [
    { name: 'Array / Vector', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
    { name: 'Hash Table', access: 'N/A', search: 'O(1)', insert: 'O(1)', delete: 'O(1)' },
    { name: 'Singly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    { name: 'Binary Search Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
    { name: 'Binary Heap (Priority Queue)', access: 'N/A', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)' },
    { name: 'Balanced AVL / Red-Black Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
  ];

  const latexSnippets = [
    { title: 'Big O Notation', code: 'O(n \\log n)' },
    { title: 'Summation Formula', code: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
    { title: 'Mathematical Induction Base Step', code: 'P(1) \\text{ holds true}' },
    { title: 'Matrix Multiplication Bounds', code: 'A \\in \\mathbb{R}^{m \\times n}, B \\in \\mathbb{R}^{n \\times p}' },
    { title: 'Limits & Asymptotics', code: '\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = c' },
  ];

  const sqlSnippets = [
    { title: 'Window Function Ranking', code: 'SELECT name, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) FROM employees;' },
    { title: 'INNER JOIN with Group By', code: 'SELECT c.name, COUNT(o.id) FROM customers c JOIN orders o ON c.id = o.cust_id GROUP BY c.name HAVING COUNT(o.id) > 5;' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#11121b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Wise CS Student Toolkit</h3>
              <p className="text-xs text-zinc-400">Reference sheets, complexity tables, & LaTeX math snippets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 px-6 py-2 bg-zinc-900/60 border-b border-zinc-800/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ds')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ds' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            Data Structures Complexity
          </button>
          <button
            onClick={() => setActiveTab('latex')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'latex' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            LaTeX Formulas
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'sql' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            SQL Reference
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'ds' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Data Structure Time Complexity (Average Case)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80">
                <table className="w-full text-xs text-left text-zinc-300">
                  <thead className="bg-zinc-900 text-purple-300 font-bold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Data Structure</th>
                      <th className="p-3">Access</th>
                      <th className="p-3">Search</th>
                      <th className="p-3">Insertion</th>
                      <th className="p-3">Deletion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {dsTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-sans font-semibold text-white">{row.name}</td>
                        <td className="p-3 text-emerald-400">{row.access}</td>
                        <td className="p-3 text-amber-400">{row.search}</td>
                        <td className="p-3 text-emerald-400">{row.insert}</td>
                        <td className="p-3 text-emerald-400">{row.delete}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'latex' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                LaTeX Formula Snippets for Math & Algorithm Proofs
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {latexSnippets.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <code className="text-xs text-purple-300 font-mono mt-1 block">{item.code}</code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(item.code, `latex-${idx}`)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded text-zinc-300 flex items-center space-x-1"
                      >
                        {copiedItem === `latex-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedItem === `latex-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onInsertPrompt(`Explain how to derive and prove: ${item.code}`);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-xs font-semibold rounded text-purple-200"
                      >
                        Ask Wise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                SQL Query Optimization Quick Reference
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {sqlSnippets.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                      <button
                        onClick={() => copyToClipboard(item.code, `sql-${idx}`)}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-xs rounded text-zinc-300 flex items-center space-x-1"
                      >
                        {copiedItem === `sql-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedItem === `sql-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 bg-[#08090d] p-2.5 rounded-lg overflow-x-auto">
                      <code>{item.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
