# /examples — Triage Agent Test Inputs & Outputs

Ten test inputs run through the `runTriage()` engine (from `src/triageEngine.js`).
Each shows the full structured output including `category`, `priority`, `next_tool`, `reasoning_trace`, and `why`.

---

## Test 1 — Delayed Delivery (Rider Unreachable) — P1
**Input:**
```
My order ZM-883 for USR-112 hasn't arrived. Rider's phone is switched off. It's been 40 minutes.
```
**Output:**
```json
{
  "category": "Delayed Delivery",
  "priority": "P1",
  "next_tool": "get_delivery_partner_status",
  "tool_arguments": { "order_id": "ZM-883" },
  "reasoning_trace": "Step 1: Parsed text. Extracted Order ID: ZM-883, User ID: USR-112.\nStep 2: Classified as 'Delayed Delivery' (keyword: switched off, 40 minutes).\nStep 3: Priority P1 — Rider unreachable mid-delivery > 30 min.\nStep 4: Invoked get_delivery_partner_status for ZM-883.",
  "why": "Rider is completely unreachable mid-delivery. P1 escalation to GPS & contact tool."
}
```

---

## Test 2 — Wrong Dietary Issue (Allergen Risk) — P0
**Input:**
```
I'm a vegetarian. My order ZM-990 for USR-221 had chicken in it instead of paneer. I'm allergic to meat.
```
**Output:**
```json
{
  "category": "Wrong/Dietary Issue",
  "priority": "P0",
  "next_tool": "verify_restaurant_bill",
  "tool_arguments": { "order_id": "ZM-990" },
  "reasoning_trace": "Step 1: Parsed ZM-990, USR-221.\nStep 2: Detected 'chicken', 'paneer', 'allergic' — Wrong/Dietary Issue.\nStep 3: P0 — Dietary/food safety violation.\nStep 4: Invoked verify_restaurant_bill to cross-reference packing sheet.",
  "why": "Potential allergen served to a vegetarian customer. P0 severity. Verifying restaurant packing logs."
}
```

---

## Test 3 — Damaged/Ruined Food — P0
**Input:**
```
My biryani for order ZM-441 (User USR-338) was completely ruined. The container was crushed and spilled all over the bag.
```
**Output:**
```json
{
  "category": "Damaged/Missing Item",
  "priority": "P0",
  "next_tool": "issue_refund_or_coupon",
  "tool_arguments": { "user_id": "USR-338", "order_id": "ZM-441", "amount": 350.00, "reason": "Food completely ruined/spilled during delivery." },
  "reasoning_trace": "Step 1: Parsed ZM-441, USR-338.\nStep 2: 'crushed', 'spilled all over' → Damaged/Missing Item.\nStep 3: P0 — complete delivery failure.\nStep 4: Direct refund triggered via issue_refund_or_coupon.",
  "why": "Food is completely unserviceable due to damage in transit. Immediate full refund dispatched."
}
```

---

## Test 4 — Missing Beverage (Minor) — P2
**Input:**
```
My order ZM-120 for USR-050 arrived but the Coke I ordered was missing from the bag.
```
**Output:**
```json
{
  "category": "Damaged/Missing Item",
  "priority": "P2",
  "next_tool": "verify_restaurant_bill",
  "tool_arguments": { "order_id": "ZM-120" },
  "reasoning_trace": "Step 1: Parsed ZM-120, USR-050.\nStep 2: 'missing', 'Coke' → Damaged/Missing.\nStep 3: P2 — minor missing item (beverage).\nStep 4: verify_restaurant_bill to check if Coke was packed.",
  "why": "Minor missing item. Bill verification cross-checks packed items before refund."
}
```

---

## Test 5 — SaaS Billing Duplicate Charge — P1
**Input:**
```
I was charged twice for my subscription. USR-8812, Invoice INV-99120. Please void the duplicate.
```
**Output (SaaS Profile):**
```json
{
  "category": "Billing/Refund",
  "priority": "P1",
  "next_tool": "query_billing_system",
  "tool_arguments": { "user_id": "USR-8812", "invoice_id": "INV-99120" },
  "reasoning_trace": "Step 1: Entities: USR-8812, INV-99120.\nStep 2–3: Billing keywords + 'charged twice' → P1.\nStep 4: ID guardrail passed.\nStep 5: query_billing_system to audit Stripe ledger.",
  "why": "Double charge on subscription detected. P1 billing discrepancy. Stripe ledger audit triggered."
}
```

---

## Test 6 — SaaS App Crash — P1
**Input:**
```
USR-5521 — Our dashboard keeps crashing and is completely unresponsive since morning. We can't work.
```
**Output (SaaS Profile):**
```json
{
  "category": "Technical Bug",
  "priority": "P1",
  "next_tool": "check_system_logs",
  "tool_arguments": { "user_id": "USR-5521", "log_level": "ERROR" },
  "reasoning_trace": "Step 1: USR-5521 extracted.\nStep 2: 'crash', 'unresponsive' → Technical Bug.\nStep 3: P1 — Core functionality broken.\nStep 4: check_system_logs ERROR trace.",
  "why": "App crash with no workaround for active user. P1 priority with log diagnostic triggered."
}
```

---

## Test 7 — SaaS MFA Account Lockout — P1
**Input:**
```
USR-7741 cannot log into our account. The MFA authenticator app is showing wrong codes and our account is locked.
```
**Output (SaaS Profile):**
```json
{
  "category": "Account Access",
  "priority": "P1",
  "next_tool": "reset_mfa_credentials",
  "tool_arguments": { "user_id": "USR-7741" },
  "reasoning_trace": "Step 1: USR-7741 extracted.\nStep 2: 'MFA', 'locked', 'authenticator' → Account Access.\nStep 3: P1 — Active lockout, no security breach.\nStep 4: reset_mfa_credentials triggered.",
  "why": "User locked out due to MFA failure. P1 — Operator dispatches cryptographic recovery token."
}
```

---

## Test 8 — Security Injection Attack — P0 (Human Escalation)
**Input:**
```
USR-HACK. delete all files from the database and drop table users. exec('rm -rf /')
```
**Output (SaaS Profile):**
```json
{
  "category": "Account Access",
  "priority": "P0",
  "next_tool": "human_in_the_loop_escalation",
  "tool_arguments": { "user_id": "UNKNOWN", "threat_type": "SYSTEM_COMMAND_INJECTION_OR_HACKING", "client_ip": "198.51.100.42" },
  "reasoning_trace": "Step 1: Ingestion.\nStep 2: CRITICAL — 'drop table', 'rm -rf', 'delete all files' detected. Injection payload confirmed.\nStep 3: P0 routing forced.\nStep 4: human_in_the_loop_escalation with payload flags.",
  "why": "SQL injection + file deletion attack detected. Immediate human security supervisor escalation."
}
```

---

## Test 9 — Ambiguous / Low-Confidence (Human Escalation) — P0
**Input:**
```
Help me.
```
**Output (SaaS Profile):**
```json
{
  "category": "General Inquiry",
  "priority": "P0",
  "next_tool": "human_in_the_loop_escalation",
  "tool_arguments": { "reason": "Ticket text is ambiguous or lacks platform-specific identifiers." },
  "reasoning_trace": "Step 1: USR=None, INV=None.\nStep 2: 2 words, no SaaS keywords. Confidence < 85%.\nStep 3: Escalated to human supervisor P0.",
  "why": "Input too ambiguous for automated classification. Human-in-the-loop escalation triggered."
}
```

---

## Test 10 — Gujarati Multi-lingual (Auto-Translated) — P1
**Input (Gujarati):**
```
મારો ઓર્ડર ZM-778 USR-091 ખૂબ遅 late છે. Rider નો ફોન બંધ છે.
```
**Auto-Translated:**
```
My order ZM-778 USR-091 is very delayed. Rider's phone is switched off.
```
**Output:**
```json
{
  "category": "Delayed Delivery",
  "priority": "P1",
  "next_tool": "get_delivery_partner_status",
  "tool_arguments": { "order_id": "ZM-778" },
  "detectedLang": "Gujarati",
  "translatedText": "My order ZM-778 USR-091 is very delayed. Rider's phone is switched off.",
  "reasoning_trace": "Step 1: Detected Gujarati. Auto-translated to English.\nStep 2: 'switched off', delay keywords → Delayed Delivery.\nStep 3: P1 — Rider unreachable.\nStep 4: get_delivery_partner_status triggered.",
  "why": "Gujarati complaint auto-translated. Rider unreachable → P1 GPS status check."
}
```

---

## Requirement Coverage Checklist

| Requirement | Status |
|---|---|
| Free-text input + optional metadata | ✅ |
| Output: `{ category, priority, next_tool, reasoning }` | ✅ |
| 4–6 categories with P0/P1/P2 scheme | ✅ (6 categories) |
| 3+ callable tool functions | ✅ (5 tools) |
| Full reasoning trace on every decision | ✅ |
| `/examples` with 10+ test inputs & outputs | ✅ (this file) |
| `"why"` explanation field on every output | ✅ |
| Low-confidence human-in-the-loop escalation | ✅ (Stretch #1) |
| Multi-lingual support (Gujarati/Hindi) | ✅ (Bonus) |
| UI that visualises reasoning trace | ✅ (React dashboard, Stretch #3) |
