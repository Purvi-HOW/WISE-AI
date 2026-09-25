import type { Message, ProviderId } from '../../../types';

export function generateSandboxResponse(
  provider: ProviderId,
  messages: Message[],
  _systemPrompt: string
): { text: string; model: string; tokens: number } {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || 'Hello';
  const lowercase = lastUserMsg.toLowerCase();

  let codeSnippet = '';
  let explanation = '';

  if (lowercase.includes('sort') || lowercase.includes('algo') || lowercase.includes('quicksort')) {
    codeSnippet = `\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test execution
arr = [3, 6, 8, 10, 1, 2, 1]
print("Sorted Array:", quicksort(arr))
\`\`\``;
    explanation = `### Time & Space Complexity Analysis
- **Best / Average Case:** $O(n \\log n)$ - Balanced pivot partitioning.
- **Worst Case:** $O(n^2)$ - Occurs when array is already sorted and worst pivot is picked.
- **Space Complexity:** $O(\\log n)$ recursive stack space.`;
  } else if (lowercase.includes('react') || lowercase.includes('component') || lowercase.includes('hook')) {
    codeSnippet = `\`\`\`tsx
import React, { useState, useEffect } from 'react';

export const WiseDataFetcher: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load data:", err);
      } font-medium {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint]);

  if (loading) return <div className="animate-pulse">Loading Wise insights...</div>;

  return (
    <ul className="space-y-2">
      {data.map((item, idx) => (
        <li key={idx} className="p-3 bg-zinc-800 rounded-lg">{item.title}</li>
      ))}
    </ul>
  );
};
\`\`\``;
    explanation = `### Wise React Best Practices
1. **Strong Typing:** Use React.FC with defined prop interfaces.
2. **Cleanup & Safety:** Ensure state updates only occur when mounted.
3. **Skeleton Loading:** Always indicate UI loading states for better UX.`;
  } else if (lowercase.includes('sql') || lowercase.includes('query') || lowercase.includes('database')) {
    codeSnippet = `\`\`\`sql
SELECT 
    u.id AS student_id,
    u.name AS student_name,
    COUNT(c.id) AS completed_courses,
    AVG(c.grade) AS average_grade,
    RANK() OVER (ORDER BY AVG(c.grade) DESC) AS academic_rank
FROM users u
JOIN enrollments e ON u.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE e.status = 'COMPLETED'
GROUP BY u.id, u.name
HAVING COUNT(c.id) >= 3
ORDER BY academic_rank ASC;
\`\`\``;
    explanation = `### Query Optimization Note
- Added \`INDEX idx_enrollments_student_status\` on \`(student_id, status)\` to ensure $O(\\log N)$ lookup performance.`;
  } else {
    codeSnippet = `Here is how we address your query for **Wise AI**:

1. **Analytical Decomposition**: Breaking down the input logic into core modules.
2. **Optimal Architecture**: Implementing clean separation of concerns.
3. **Performance Metric**: Expected latency sub-100ms with asymptotic bounds $O(N)$.`;
  }

  const providerNames: Record<ProviderId, string> = {
    'alibaba-grok': 'Alibaba Grok (Qwen-Max)',
    'gemini': 'Google Gemini 2.5 Flash',
    'openrouter': 'OpenRouter DeepSeek-Chat'
  };

  const responseText = `> 💡 *Responded via ${providerNames[provider]} (wise-ai sandbox)*

${explanation}

${codeSnippet}

Feel free to ask follow-up questions, debug this snippet, or test another query!`;

  return {
    text: responseText,
    model: `${provider}-sandbox-v1`,
    tokens: Math.floor(Math.random() * 300) + 150
  };
}
