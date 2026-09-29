import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { WiseMark } from './brand/WiseLogo';

interface StudentToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertPrompt: (promptText: string) => void;
}

const TABS = [
  { id: 'ds' as const, label: 'Complexity' },
  { id: 'latex' as const, label: 'LaTeX' },
  { id: 'sql' as const, label: 'SQL' }
];

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
    { name: 'Hash Table', access: '—', search: 'O(1)', insert: 'O(1)', delete: 'O(1)' },
    { name: 'Singly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    { name: 'Binary Search Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
    { name: 'Binary Heap', access: '—', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)' },
    { name: 'AVL / Red-Black Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' }
  ];

  const latexSnippets = [
    { title: 'Big O notation', code: 'O(n \\log n)' },
    { title: 'Summation formula', code: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
    { title: 'Induction base step', code: 'P(1) \\text{ holds true}' },
    { title: 'Matrix bounds', code: 'A \\in \\mathbb{R}^{m \\times n}, B \\in \\mathbb{R}^{n \\times p}' },
    { title: 'Limits and asymptotics', code: '\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = c' }
  ];

  const sqlSnippets = [
    { title: 'Window function ranking', code: 'SELECT name, salary, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) FROM employees;' },
    { title: 'Inner join with group by', code: 'SELECT c.name, COUNT(o.id) FROM customers c JOIN orders o ON c.id = o.cust_id GROUP BY c.name HAVING COUNT(o.id) > 5;' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-lg">
      <div className="wise-dialog relative w-full max-w-2xl max-h-[86vh] flex flex-col rounded-[26px] overflow-hidden wise-fade-in">

        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-5">
          <div className="flex items-center gap-3 min-w-0">
            <WiseMark className="h-6" />
            <div className="min-w-0">
              <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">Toolkit</h2>
              <p className="text-[12px] text-ink-muted mt-0.5">
                Reference sheets you can copy or hand straight to Wise AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink rounded-xl hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Close toolkit"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-7 pb-5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-white/[0.08] text-ink'
                  : 'text-ink-muted hover:text-ink hover:bg-white/[0.04]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 overflow-y-auto px-7 pb-7">
          {activeTab === 'ds' && (
            <div className="space-y-4">
              <p className="text-[12px] text-ink-faint px-1">Average case.</p>
              <div className="overflow-x-auto rounded-2xl bg-white/[0.025]">
                <table className="w-full text-[13px] text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      <th className="px-4 py-3.5 font-medium">Structure</th>
                      <th className="px-4 py-3.5 font-medium">Access</th>
                      <th className="px-4 py-3.5 font-medium">Search</th>
                      <th className="px-4 py-3.5 font-medium">Insert</th>
                      <th className="px-4 py-3.5 font-medium">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px] text-ink-soft">
                    {dsTable.map((row, idx) => (
                      <tr key={idx} className="border-t border-hairline">
                        <td className="px-4 py-3.5 font-sans text-ink">{row.name}</td>
                        <td className="px-4 py-3.5">{row.access}</td>
                        <td className="px-4 py-3.5">{row.search}</td>
                        <td className="px-4 py-3.5">{row.insert}</td>
                        <td className="px-4 py-3.5">{row.delete}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'latex' && (
            <div className="space-y-2">
              {latexSnippets.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-2xl wise-panel-flat">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{item.title}</p>
                    <code className="block mt-1.5 text-[12px] text-accent-soft font-mono truncate">
                      {item.code}
                    </code>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(item.code, `latex-${idx}`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-ink-muted hover:text-ink hover:bg-white/[0.07] transition-colors"
                    >
                      {copiedItem === `latex-${idx}`
                        ? <Check className="w-3.5 h-3.5 text-accent-soft" />
                        : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === `latex-${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onInsertPrompt(`Explain how to derive and prove: ${item.code}`);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-ink bg-accent/[0.16] hover:bg-accent/[0.26] transition-colors"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-2">
              {sqlSnippets.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.025] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-medium text-ink">{item.title}</span>
                    <button
                      onClick={() => copyToClipboard(item.code, `sql-${idx}`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-ink-muted hover:text-ink hover:bg-white/[0.07] transition-colors shrink-0"
                    >
                      {copiedItem === `sql-${idx}`
                        ? <Check className="w-3.5 h-3.5 text-accent-soft" />
                        : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedItem === `sql-${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[12px] font-mono text-ink-soft wise-well p-3.5 rounded-xl overflow-x-auto leading-relaxed">
                    <code>{item.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
