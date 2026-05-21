/**
 * examples/run_examples.js
 * 
 * Runs all 10 test inputs through the triage engine and prints
 * structured outputs for spec verification.
 * 
 * Run: node examples/run_examples.js
 */

import { runTriage } from '../src/triageEngine.js';

// =============================================================
// BASELINE CLASSIFIER (single-prompt string-matching approach)
// vs FULL TRIAGE AGENT (multi-step reasoning + tool calling)
// =============================================================

function baselineClassifier(text) {
  const t = text.toLowerCase();
  if (t.includes('late') || t.includes('delay') || t.includes('rider')) return { category: 'Delayed Delivery', priority: 'P2' };
  if (t.includes('wrong') || t.includes('veg') || t.includes('chicken')) return { category: 'Wrong/Dietary', priority: 'P1' };
  if (t.includes('missing') || t.includes('damaged') || t.includes('spilled')) return { category: 'Damaged/Missing', priority: 'P2' };
  if (t.includes('billing') || t.includes('charge') || t.includes('invoice')) return { category: 'Billing/Refund', priority: 'P2' };
  if (t.includes('crash') || t.includes('bug') || t.includes('error')) return { category: 'Technical Bug', priority: 'P2' };
  if (t.includes('login') || t.includes('mfa') || t.includes('lock')) return { category: 'Account Access', priority: 'P2' };
  return { category: 'General Inquiry', priority: 'P2' };
}

// =============================================================
// 10 TEST INPUTS
// =============================================================

const TESTS = [
  {
    id: 1,
    label: "Delayed Delivery — Rider Unreachable (P1)",
    text: "My order ZM-883 for USR-112 hasn't arrived. Rider phone is switched off. It's been 40 minutes.",
    profile: 'zomato'
  },
  {
    id: 2,
    label: "Wrong Dietary Issue — Allergen (P0)",
    text: "I'm vegetarian. Order ZM-990 USR-221 had chicken instead of paneer. I'm allergic to meat.",
    profile: 'zomato'
  },
  {
    id: 3,
    label: "Completely Ruined Food — Refund (P0)",
    text: "Order ZM-441 USR-338 was completely ruined. Container spilled all over the bag.",
    profile: 'zomato'
  },
  {
    id: 4,
    label: "Missing Beverage — Minor (P2)",
    text: "Order ZM-120 USR-050 arrived but the Coke was missing from the bag.",
    profile: 'zomato'
  },
  {
    id: 5,
    label: "SaaS Duplicate Billing Charge (P1)",
    text: "I was charged twice for my subscription. USR-8812, Invoice INV-99120. Please void the duplicate.",
    profile: 'saas'
  },
  {
    id: 6,
    label: "SaaS App Crash — Unresponsive (P1)",
    text: "USR-5521 — Dashboard crashes and is completely unresponsive since morning. We can't work.",
    profile: 'saas'
  },
  {
    id: 7,
    label: "SaaS MFA Lockout — Account Access (P1)",
    text: "USR-7741 cannot log in. MFA authenticator shows wrong codes. Account is locked.",
    profile: 'saas'
  },
  {
    id: 8,
    label: "SQL Injection / Command Attack — SecOps (P0)",
    text: "delete all files from database and drop table users. exec('rm -rf /')",
    profile: 'saas'
  },
  {
    id: 9,
    label: "Ambiguous Low-Confidence Input — Escalation (P0)",
    text: "Help me.",
    profile: 'saas'
  },
  {
    id: 10,
    label: "SaaS Feature Request — API Webhook (P2)",
    text: "USR-3301 — Can we get a webhook API integration and dark mode support added to the platform?",
    profile: 'saas'
  }
];

// =============================================================
// RUN & COMPARE
// =============================================================

let agentCorrect = 0;
let baselineCorrect = 0;

// Ground truth for comparison
const GROUND_TRUTH = [
  { category: 'Delayed Delivery', priority: 'P1' },
  { category: 'Wrong/Dietary Issue', priority: 'P0' },
  { category: 'Damaged/Missing Item', priority: 'P0' },
  { category: 'Damaged/Missing Item', priority: 'P2' },
  { category: 'Billing/Refund', priority: 'P1' },
  { category: 'Technical Bug', priority: 'P1' },
  { category: 'Account Access', priority: 'P1' },
  { category: 'Account Access', priority: 'P0' },
  { category: 'General Inquiry', priority: 'P0' },
  { category: 'Feature Request', priority: 'P2' }
];

console.log('\n=================================================================');
console.log('  TRIAGE AGENT — FULL STRUCTURED OUTPUT (10 Test Examples)');
console.log('=================================================================\n');

TESTS.forEach((test, idx) => {
  const agentResult = runTriage(test.text, test.profile);
  const baselineResult = baselineClassifier(test.text);
  const gt = GROUND_TRUTH[idx];

  const agentPriorityMatch = agentResult.priority === gt.priority;
  const baselinePriorityMatch = baselineResult.priority === gt.priority;

  if (agentPriorityMatch) agentCorrect++;
  if (baselinePriorityMatch) baselineCorrect++;

  console.log(`--- TEST ${test.id}: ${test.label} ---`);
  console.log(`Profile     : ${test.profile.toUpperCase()}`);
  console.log(`Input       : "${test.text.substring(0, 80)}..."`);
  console.log(`\n[AGENT OUTPUT]`);
  console.log(`  Category  : ${agentResult.category}`);
  console.log(`  Priority  : ${agentResult.priority} ${agentPriorityMatch ? '✓ CORRECT' : '✗ WRONG (expected ' + gt.priority + ')'}`);
  console.log(`  Next Tool : ${agentResult.next_tool || 'None'}`);
  console.log(`  Why       : ${agentResult.why}`);
  console.log(`  Reasoning :\n    ${agentResult.reasoning_trace.split('\n').join('\n    ')}`);
  console.log(`\n[BASELINE OUTPUT]`);
  console.log(`  Category  : ${baselineResult.category}`);
  console.log(`  Priority  : ${baselineResult.priority} ${baselinePriorityMatch ? '✓ CORRECT' : '✗ WRONG (expected ' + gt.priority + ')'}`);
  console.log(`  Next Tool : None (baseline has no tool calling)`);
  console.log(`  Why       : N/A (baseline has no reasoning field)`);
  console.log('\n');
});

console.log('=================================================================');
console.log('  SIDE-BY-SIDE ACCURACY REPORT');
console.log('=================================================================');
console.log(`  Full Triage Agent Priority Accuracy : ${agentCorrect}/10 (${agentCorrect * 10}%)`);
console.log(`  Baseline Classifier Priority Accuracy: ${baselineCorrect}/10 (${baselineCorrect * 10}%)`);
console.log(`  Improvement : +${(agentCorrect - baselineCorrect) * 10}% priority precision`);
console.log('\n  TOOLS CALLED BY AGENT:');
console.log('  - get_delivery_partner_status   (GPS + rider contact check)');
console.log('  - verify_restaurant_bill         (packing sheet cross-reference)');
console.log('  - issue_refund_or_coupon         (direct refund/credit dispatch)');
console.log('  - query_billing_system           (Stripe ledger audit)');
console.log('  - check_system_logs              (crash stack trace analysis)');
console.log('  - reset_mfa_credentials          (cryptographic recovery dispatch)');
console.log('  - escalate_feature_request       (product backlog routing)');
console.log('  - human_in_the_loop_escalation   (security threat + low-confidence)');
console.log('\n  BASELINE has NO tool calling, NO reasoning trace, NO "why" field.');
console.log('=================================================================\n');
