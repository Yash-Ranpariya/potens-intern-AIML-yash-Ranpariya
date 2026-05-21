/**
 * Zomato AI Support & Platform SaaS Triage Engine
 * Deterministic classifier implementing support triage rules,
 * priority routing, and guardrail verification for both Zomato Food Support
 * and SaaS Platform Support.
 */

export function runTriage(complaintText, agentProfile = 'zomato') {
  if (!complaintText || complaintText.trim() === '') {
    return {
      category: "General Inquiry",
      priority: "P2",
      next_tool: null,
      tool_arguments: {},
      reasoning_trace: "Step 1: Analyzed text input.\nResult: Input text is empty. No triage can be performed.",
      why: "Empty input text provided.",
      confidence_score: 0
    };
  }

  const textLower = complaintText.toLowerCase();

  // Extract common identifiers
  const orderIdMatch = complaintText.match(/ZM-?\d+/i) || complaintText.match(/order\s*#?\s*(\d+)/i);
  const userIdMatch = complaintText.match(/U-?\d+/i) || complaintText.match(/user\s*#?\s*(\d+)/i) || complaintText.match(/USR-?\d+/i);
  const invoiceIdMatch = complaintText.match(/INV-?\d+/i) || complaintText.match(/invoice\s*#?\s*(\d+)/i) || complaintText.match(/TXN-?\d+/i);

  const orderId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;
  const userId = userIdMatch ? userIdMatch[0].toUpperCase() : null;
  const invoiceId = invoiceIdMatch ? invoiceIdMatch[0].toUpperCase() : null;

  // ----------------------------------------------------
  // PROFILE B: PLATFORM & SAAS SUPPORT (ULTIMATE TRIAGE ARCHITECT)
  // ----------------------------------------------------
  if (agentProfile === 'saas') {
    // 1. Ingestion Analysis & Entities
    const traceSteps = [
      `Step 1: Ingested raw ticket. Analyzed entities:\n   - User ID: ${userId || 'None'}\n   - Invoice ID: ${invoiceId || 'None'}`
    ];

    // 2. Explicit Security Threat Guardrail
    // Detect command injections, sql injections, file deletion requests, or login bypass attempts
    const securityThreatKeywords = [
      'delete al file', 'delete all file', 'delete all files', 'rm -rf', 'drop table', 
      'select * from', 'sql injection', 'eval(', 'exec(', 'shellcode', 'hack', 'exploit', 
      'bypass login', 'admin access', 'admin password', 'bypass mfa', 'sudo ', 'override system',
      'gain access', 'privilege escalation', 'injection payload'
    ];
    const hasSecurityRisk = securityThreatKeywords.some(keyword => textLower.includes(keyword));

    if (hasSecurityRisk) {
      traceSteps.push("Step 2: Applied real-time security guardrails.\nResult: EXPLICIT SECURITY THREAT DETECTED. Customer complaint contains a malicious instruction, system override command, or hacking signature.");
      traceSteps.push("Step 3: Triggered high-risk routing policy. Mapping category to 'Account Access' (Suspected Hacking) and priority to 'P0' (Critical Outage/Security Breach).");
      traceSteps.push("Step 4: Selected routing tool. Forcing tool trigger to 'human_in_the_loop_escalation' with target payload flags.");

      return {
        category: "Account Access",
        priority: "P0",
        next_tool: "human_in_the_loop_escalation",
        tool_arguments: {
          user_id: userId || "UNKNOWN",
          threat_type: "SYSTEM_COMMAND_INJECTION_OR_HACKING",
          payload_detected: textLower.substring(0, 100),
          client_ip: "198.51.100.42" // Simulated attacker IP
        },
        reasoning_trace: traceSteps.join("\n"),
        why: "An explicit security threat or injection payload was detected in the ticket. Routing immediately to human security supervisors (P0).",
        confidence_score: 99
      };
    }

    // 3. Ambiguity & Relevance Checks (Guardrails)
    const saasKeywords = [
      'billing', 'refund', 'charge', 'invoice', 'payment', 'card', 'cancel', 'subscription',
      'crash', 'bug', 'ui', 'error', 'sync', 'performance', 'lag', 'freeze', 'slow',
      'login', 'mfa', 'password', 'lock', 'hacked', 'security', 'profile', 'credential',
      'feature', 'request', 'enhance', 'api', 'webhook', 'theme', 'dark mode', 'support',
      'pricing', 'hours', 'policy', 'help', 'question', 'double check', 'receipt'
    ];
    const hasSaaSMatch = saasKeywords.some(keyword => textLower.includes(keyword));
    const isAmbiguous = textLower.split(' ').length < 3 || !hasSaaSMatch;

    if (isAmbiguous) {
      traceSteps.push("Step 2: Scanned text for SaaS support keywords.\nResult: Low query density or irrelevant keywords. Confidence score fell below 85%.");
      traceSteps.push("Step 3: Triggered low-confidence escalation policy. Escalating to human queue at P0 priority.");

      return {
        category: "General Inquiry",
        priority: "P0", // As per tool calling rules: below 85% confidence triages as P0 and escalates
        next_tool: "human_in_the_loop_escalation",
        tool_arguments: {
          reason: "Ticket text is ambiguous or lacks platform-specific identifiers."
        },
        reasoning_trace: traceSteps.join("\n"),
        why: "Complaint details are ambiguous and confidence score fell below 85%. Routed to human supervisor (P0) under escalation policies.",
        confidence_score: 42
      };
    }

    // 4. Classify Category
    let category = "General Inquiry";
    
    // Billing/Refund
    const billingKeywords = ['billing', 'refund', 'charge', 'charged', 'invoice', 'payment', 'card', 'cancel', 'subscription', 'price', 'transaction', 'overcharge', 'fee'];
    const hasBilling = billingKeywords.some(keyword => textLower.includes(keyword));

    // Technical Bug
    const bugKeywords = ['crash', 'bug', 'ui', 'error', 'sync', 'performance', 'lag', 'freeze', 'slow', 'unresponsive', 'broken', 'not working', 'failing', 'fails'];
    const hasBug = bugKeywords.some(keyword => textLower.includes(keyword));

    // Account Access
    const accountKeywords = ['login', 'mfa', 'password', 'lock', 'locked', 'hacked', 'security', 'profile', 'credential', 'sessions', 'auth', 'authenticator', 'hack'];
    const hasAccount = accountKeywords.some(keyword => textLower.includes(keyword));

    // Feature Request
    const featureKeywords = ['feature', 'request', 'enhance', 'api', 'webhook', 'theme', 'dark mode', 'add option', 'integration', 'developer access'];
    const hasFeature = featureKeywords.some(keyword => textLower.includes(keyword));

    // Determine category based on keyword flags
    if (hasAccount) {
      category = "Account Access";
    } else if (hasBilling) {
      category = "Billing/Refund";
    } else if (hasBug) {
      category = "Technical Bug";
    } else if (hasFeature) {
      category = "Feature Request";
    } else {
      category = "General Inquiry";
    }

    traceSteps.push(`Step 3: Classified ticket category as '${category}' based on semantic keyword triggers.`);

    // 5. Determine Priority
    let priority = "P2";
    let priorityReason = "Information request or minor feature enhancement.";

    if (category === "Account Access") {
      // Suspected hack is P0, locked out is P1
      if (textLower.includes('hack') || textLower.includes('unrecognized') || textLower.includes('breach') || textLower.includes('hacked')) {
        priority = "P0";
        priorityReason = "Severe security threat (potential data breach or account take-over).";
      } else {
        priority = "P1";
        priorityReason = "Active user locked out of core platform workflow with no current workaround.";
      }
    } else if (category === "Billing/Refund") {
      // Major billing error (subscription double charge / block) is P1, simple pricing question is P2
      if (textLower.includes('double') || textLower.includes('charged twice') || textLower.includes('incorrect charge') || textLower.includes('overcharge')) {
        priority = "P1";
        priorityReason = "Major transaction discrepancy requiring billing correction.";
      } else {
        priority = "P2";
        priorityReason = "Standard billing/refund request or price information query.";
      }
    } else if (category === "Technical Bug") {
      // Complete service outage / core crash is P0, UI lag / glitch is P1 or P2
      if (textLower.includes('outage') || textLower.includes('crash') || textLower.includes('unresponsive') || textLower.includes('entire system is down')) {
        priority = "P1"; // P1 if core functionality broken with no workaround
        priorityReason = "Application feature crash / unresponsive action with no immediate bypass.";
      } else {
        priority = "P2";
        priorityReason = "Minor interface latency or UI lag.";
      }
    }

    traceSteps.push(`Step 4: Evaluated priority as '${priority}' (${priorityReason}).`);

    // 6. ID Guardrail Checks
    // Billing requires user_id and invoice/transaction id. Technical Bug requires user_id. Account access requires user_id.
    const requiresUserId = ["Billing/Refund", "Technical Bug", "Account Access", "Feature Request"].includes(category);
    const requiresInvoiceId = (category === "Billing/Refund") && (textLower.includes('charge') || textLower.includes('invoice') || textLower.includes('refund'));

    if ((requiresUserId && !userId) || (requiresInvoiceId && !invoiceId)) {
      const missing = [];
      if (requiresUserId && !userId) missing.push("User ID");
      if (requiresInvoiceId && !invoiceId) missing.push("Invoice/Transaction ID");
      const missingStr = missing.join(" and ");

      traceSteps.push(`Step 5: Applied ID Guardrails.\nResult: Blocked automated tool call due to missing transaction identifier(s): ${missingStr}.`);

      return {
        category,
        priority,
        next_tool: null,
        tool_arguments: {},
        reasoning_trace: traceSteps.join("\n"),
        why: `Missing critical credentials (${missingStr}) required for tool operations. Blocked automated trigger.`,
        confidence_score: 65
      };
    }

    // 7. Tool Selection
    let next_tool = null;
    let tool_arguments = {};

    if (category === "Billing/Refund") {
      next_tool = "query_billing_system";
      tool_arguments = { user_id: userId, invoice_id: invoiceId || "N/A" };
    } else if (category === "Technical Bug") {
      next_tool = "check_system_logs";
      tool_arguments = { user_id: userId, log_level: "ERROR" };
    } else if (category === "Account Access") {
      if (priority === "P0") {
        next_tool = "human_in_the_loop_escalation";
        tool_arguments = { user_id: userId, security_level: "CRITICAL_THREAT" };
      } else {
        next_tool = "reset_mfa_credentials";
        tool_arguments = { user_id: userId };
      }
    } else if (category === "Feature Request") {
      next_tool = "escalate_feature_request";
      tool_arguments = { user_id: userId, request_summary: complaintText.substring(0, 100) };
    }

    traceSteps.push(`Step 6: Selected diagnostic tool '${next_tool || 'none'}' based on workflow definitions.`);

    return {
      category,
      priority,
      next_tool,
      tool_arguments,
      reasoning_trace: traceSteps.join("\n"),
      why: `SaaS ticket classified as ${category} (${priority}). Routing to tool: ${next_tool || 'None'}.`,
      confidence_score: 94
    };
  }

  // ----------------------------------------------------
  // PROFILE A: ZOMATO FOOD DELIVERY SUPPORT
  // ----------------------------------------------------
  // 1. Ambiguity & Relevance Checks (Guardrails)
  const foodKeywords = [
    'order', 'food', 'delivery', 'rider', 'driver', 'restaurant', 'veg', 'paneer', 'chicken', 
    'meat', 'allergy', 'allerg', 'peanut', 'egg', 'spilled', 'crushed', 'damaged', 'missing', 
    'forgot', 'beverage', 'drink', 'coke', 'pepsi', 'cold', 'coupon', 'gold', 'membership', 
    'payment', 'bill', 'receipt', 'refund', 'mismatch', 'late', 'delay', 'switched off',
    'unreachable', 'arrived', 'arriving', 'eat', 'spilt', 'ruined'
  ];

  const hasRelevantKeywords = foodKeywords.some(keyword => textLower.includes(keyword));
  const isAmbiguous = textLower.split(' ').length < 4 || !hasRelevantKeywords;

  if (isAmbiguous) {
    return {
      category: "General Inquiry",
      priority: "P2",
      next_tool: null,
      tool_arguments: {},
      reasoning_trace: "Step 1: Analyzed text input for order/delivery context.\nResult: The text lacks any specific delivery keywords or contains too few words to determine the issue.\nStep 2: Applied guardrails.\nResult: Input is classified as ambiguous. Setting tool to null to prevent execution on invalid complaints.",
      why: "Complaint is ambiguous and contains no reference to order details, delivery status, or food quality.",
      confidence_score: 38
    };
  }

  // 2. Classify Category
  let category = "General Inquiry";
  
  const wrongDietaryKeywords = [
    'veg', 'non-veg', 'vegetarian', 'non-vegetarian', 'chicken', 'paneer', 'allergen', 
    'allergic', 'allergy', 'peanut', 'egg', 'meat', 'pork', 'beef', 'instead of', 'sent me', 
    'wrong item', 'different food', 'different item'
  ];
  const hasWrongDietary = wrongDietaryKeywords.some(keyword => {
    if (keyword === 'veg' && (textLower.includes('non-veg') || textLower.includes('chicken') || textLower.includes('meat'))) return true;
    return textLower.includes(keyword);
  });

  const delayKeywords = [
    'late', 'delayed', 'delay', 'time', 'hour', 'hours', 'minute', 'minutes', 'rider', 
    'driver', 'delivery boy', 'unreachable', 'switched off', 'not responding', 'stuck', 
    'where is', 'not arrived'
  ];
  const hasDelay = delayKeywords.some(keyword => textLower.includes(keyword));

  const damagedMissingKeywords = [
    'spilled', 'spilt', 'crushed', 'damaged', 'ruined', 'missing', 'forgot', 'left out', 
    'beverage', 'drink', 'coke', 'pepsi', 'cold', 'bread', 'spill', 'crush'
  ];
  const hasDamagedMissing = damagedMissingKeywords.some(keyword => textLower.includes(keyword));

  const inquiryKeywords = [
    'coupon', 'gold', 'membership', 'payment', 'card', 'upi', 'refund', 'past bill', 
    'invoice', 'discount', 'how do i', 'can i'
  ];
  const hasInquiry = inquiryKeywords.some(keyword => textLower.includes(keyword));

  if (hasWrongDietary) {
    category = "Wrong/Dietary Issue";
  } else if (hasDamagedMissing) {
    category = "Damaged/Missing Item";
  } else if (hasDelay) {
    category = "Delayed Delivery";
  } else if (hasInquiry) {
    category = "General Inquiry";
  }

  // 3. Determine Priority (P0, P1, P2)
  let priority = "P2";
  let priorityReason = "";

  if (category === "Wrong/Dietary Issue") {
    priority = "P0";
    priorityReason = "Dietary or food safety violation (e.g. Non-Veg food sent instead of Veg, or allergens present).";
  } else if (category === "Damaged/Missing Item") {
    const ruinedKeywords = ['completely ruined', 'spilled everywhere', 'completely crushed', 'spilled all over', 'un-eat-able', 'uneatable', 'ruined', 'destroyed'];
    const isRuined = ruinedKeywords.some(keyword => textLower.includes(keyword));
    
    if (isRuined) {
      priority = "P0";
      priorityReason = "High-urgency delivery failure where food is completely ruined (spilled/crushed).";
    } else {
      priority = "P2";
      priorityReason = "Minor missing item (e.g. beverage, sauce) or cold food issue.";
    }
  } else if (category === "Delayed Delivery") {
    const delayTimeMatch = textLower.match(/(\d+)\s*(min|minute)/);
    const delayMinutes = delayTimeMatch ? parseInt(delayTimeMatch[1]) : null;
    
    const riderUnreachable = textLower.includes('switched off') || textLower.includes('not responding') || textLower.includes('unreachable') || textLower.includes('no response');
    
    if ((delayMinutes && delayMinutes > 30) || riderUnreachable) {
      priority = "P1";
      priorityReason = "Order delayed by more than 30 minutes, or rider is completely unresponsive mid-delivery.";
    } else {
      priority = "P2";
      priorityReason = "Minor delay (under 30 minutes) or general delivery inquiry.";
    }
  } else {
    priority = "P2";
    priorityReason = "General refund, coupon, membership or payment inquiry.";
  }

  // 4. Apply ID Guardrail
  if (!orderId || !userId) {
    const missing = [];
    if (!orderId) missing.push("Order ID");
    if (!userId) missing.push("User ID");
    const missingStr = missing.join(" and ");
    
    return {
      category,
      priority,
      next_tool: null,
      tool_arguments: {},
      reasoning_trace: `Step 1: Classified complaint category as '${category}' and priority as '${priority}'.\nStep 2: Checked for critical transaction identifiers.\nResult: Identified missing metadata parameter: ${missingStr}.\nStep 3: Applied guardrail rule - Never guess IDs or invoke tools without them.\nResult: Aborted tool invocation. Recommending operator to request ${missingStr} from the user.`,
      why: `Missing required transaction identifiers (${missingStr}) in complaint. Tool execution blocked.`,
      confidence_score: 72
    };
  }

  // 5. Tool Selection
  let next_tool = null;
  let tool_arguments = {};
  let toolReason = "";

  if (category === "Delayed Delivery") {
    next_tool = "get_delivery_partner_status";
    tool_arguments = { order_id: orderId };
    toolReason = `Invoked get_delivery_partner_status for order_id: ${orderId} to check current GPS coordinates and contact status.`;
  } else if (category === "Wrong/Dietary Issue") {
    next_tool = "verify_restaurant_bill";
    tool_arguments = { order_id: orderId };
    toolReason = `Invoked verify_restaurant_bill for order_id: ${orderId} to verify packed item logs against the customer's receipt.`;
  } else if (category === "Damaged/Missing Item") {
    const ruinedKeywords = ['completely ruined', 'spilled everywhere', 'completely crushed', 'spilled all over', 'un-eat-able', 'uneatable', 'ruined', 'destroyed'];
    const isRuined = ruinedKeywords.some(keyword => textLower.includes(keyword));

    if (isRuined) {
      next_tool = "issue_refund_or_coupon";
      tool_arguments = {
        user_id: userId,
        order_id: orderId,
        amount: 350.00,
        reason: "Food completely ruined/spilled during delivery."
      };
      toolReason = `Invoked issue_refund_or_coupon for user_id: ${userId}, order_id: ${orderId} since delivery failure and ruined food violation is confirmed.`;
    } else {
      next_tool = "verify_restaurant_bill";
      tool_arguments = { order_id: orderId };
      toolReason = `Invoked verify_restaurant_bill for order_id: ${orderId} to compare receipt with restaurant's packed item sheet to check for missing items.`;
    }
  } else {
    next_tool = null;
    tool_arguments = {};
    toolReason = "No backend tool execution needed for general inquiries.";
  }

  const traceSteps = [
    `Step 1: Parsed text input. Extracted Order ID: ${orderId}, User ID: ${userId}.`,
    `Step 2: Classified category as '${category}' based on complaint keyword triggers.`,
    `Step 3: Determined priority as '${priority}' (${priorityReason}).`,
    `Step 4: Checked tool routing. ${toolReason}`
  ];

  return {
    category,
    priority,
    next_tool,
    tool_arguments,
    reasoning_trace: traceSteps.join("\n"),
    why: `Complaint classified as ${category} (${priority}). Next step: ${next_tool ? `Trigger ${next_tool}` : 'No tool trigger required'}.`,
    confidence_score: 91
  };
}

export function baselineClassifier(text) {
  const t = text.toLowerCase();
  if (t.includes('late') || t.includes('delay') || t.includes('rider')) return { category: 'Delayed Delivery', priority: 'P2' };
  if (t.includes('wrong') || t.includes('veg') || t.includes('chicken') || t.includes('allerg')) return { category: 'Wrong/Dietary', priority: 'P1' };
  if (t.includes('missing') || t.includes('damaged') || t.includes('spilled') || t.includes('crushed')) return { category: 'Damaged/Missing', priority: 'P2' };
  if (t.includes('billing') || t.includes('charge') || t.includes('invoice') || t.includes('refund')) return { category: 'Billing/Refund', priority: 'P2' };
  if (t.includes('crash') || t.includes('bug') || t.includes('error') || t.includes('unresponsive')) return { category: 'Technical Bug', priority: 'P2' };
  if (t.includes('login') || t.includes('mfa') || t.includes('lock') || t.includes('password')) return { category: 'Account Access', priority: 'P2' };
  return { category: 'General Inquiry', priority: 'P2' };
}
