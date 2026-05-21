import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Receipt, 
  CornerDownRight, 
  Play, 
  Pause,
  RotateCcw, 
  Cpu, 
  FileText, 
  User, 
  Hash, 
  AlertCircle, 
  Search, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Coins,
  PhoneOff,
  Map,
  Check,
  Percent,
  Lock,
  Shield,
  Key,
  Terminal,
  Activity,
  AlertOctagon,
  TrendingUp,
  Mail,
  Globe,
  MessageSquare,
  Send,
  Volume2
} from 'lucide-react';
import { runTriage } from './triageEngine';
import './App.css';

// Mock presets database for Zomato
const ZOMATO_PRESETS = [
  {
    id: "preset-1",
    title: "Dietary Violation (P0)",
    shortDesc: "Non-Veg chicken sent instead of Veg paneer",
    text: "I ordered a pure vegetarian Paneer Butter Masala (Order ID: ZM-88912, User ID: U-4412), but they sent chicken curry instead! This is a violation of my religious beliefs. I'm furious!",
    category: "Wrong/Dietary Issue",
    priority: "P0"
  },
  {
    id: "preset-2",
    title: "Delivery Ruined (P0)",
    shortDesc: "Food spilled and box crushed",
    text: "My order ZM-10443 was delivered by the rider just now, but the food is completely ruined! The soup spilled all over the burger box and the box is crushed. It looks like it fell out of the bag. The food is un-eat-able! User ID is U-9921.",
    category: "Damaged/Missing Item",
    priority: "P0"
  },
  {
    id: "preset-3",
    title: "Severe Rider Delay (P1)",
    shortDesc: "Rider stuck and phone switched off",
    text: "The rider took my order and has been stuck in the same place for 45 minutes. I tried calling him but his phone is switched off. What is going on? Order ID: ZM-77112, User ID: U-5590",
    category: "Delayed Delivery",
    priority: "P1"
  },
  {
    id: "preset-4",
    title: "Missing Item (P2)",
    shortDesc: "Garlic bread and Pepsi missing",
    text: "I received my order ZM-99120, but the Pepsi and the garlic bread are completely missing from the bag. The pizza is cold too. Please refund my money. User ID: U-2289.",
    category: "Damaged/Missing Item",
    priority: "P2"
  },
  {
    id: "preset-5",
    title: "Gold Inquiry (P2)",
    shortDesc: "Zomato Gold discount inquiry",
    text: "Can you tell me if the Zomato Gold 50% discount applies to dining out at Pizza Hut? Or is it only for deliveries? Also my user ID is U-1102, no active order.",
    category: "General Inquiry",
    priority: "P2"
  },
  {
    id: "preset-6",
    title: "Ambiguous Guardrail",
    shortDesc: "Vague feedback about app latency",
    text: "Your application UI is lagging today. I don't know what is going on, but it is slow.",
    category: "General Inquiry",
    priority: "P2"
  },
  {
    id: "preset-7",
    title: "Missing Metadata Guardrail",
    shortDesc: "Complaint with no Order/User IDs",
    text: "My chicken biryani has hair in it, please refund!",
    category: "Wrong/Dietary Issue",
    priority: "P0"
  }
];

// Mock presets database for Ultimate Triage Architect (Platform/SaaS)
const SAAS_PRESETS = [
  {
    id: "preset-saas-1",
    title: "Account Hack Risk (P0)",
    shortDesc: "Suspected hacking & unrecognized logins",
    text: "I noticed multiple logins from other countries on my profile. When I try to change my password, it says the session expired. I think my account has been hacked! User ID: USR-3321.",
    category: "Account Access",
    priority: "P0"
  },
  {
    id: "preset-saas-2",
    title: "Double Charge Billing (P1)",
    shortDesc: "Charged twice for subscription fee",
    text: "My credit card was charged twice ($120.00 each) for the annual subscription, but the account is still showing trial mode. Please refund the duplicate transaction! User ID: USR-8812, Invoice ID: INV-99120.",
    category: "Billing/Refund",
    priority: "P1"
  },
  {
    id: "preset-saas-3",
    title: "App Crash / UI Freeze (P2)",
    shortDesc: "Receipt download button freezes browser",
    text: "Every time I click on the download PDF receipt button on the billing page, the page freezes and Chrome says page unresponsive. User ID: USR-4410.",
    category: "Technical Bug",
    priority: "P2"
  },
  {
    id: "preset-saas-4",
    title: "MFA Locked Loop (P1)",
    shortDesc: "MFA reset failure / locked out of work",
    text: "I got locked out of my account because my authenticator app was on my old phone. I have my backup codes but they aren't working. User ID: USR-7281.",
    category: "Account Access",
    priority: "P1"
  },
  {
    id: "preset-saas-5",
    title: "API Access Request (P2)",
    shortDesc: "Webhook API endpoints access expansion",
    text: "I would like to request access to the webhook API features so that we can sync payments with our internal systems. User ID: USR-1090.",
    category: "Feature Request",
    priority: "P2"
  },
  {
    id: "preset-saas-6",
    title: "Security Threat Request (P0)",
    shortDesc: "Destructive command injection attempt",
    text: "delete al file",
    category: "Account Access",
    priority: "P0"
  }
];

// Voice transcripts database for simulated call recordings
const VOICE_TRANSCRIPTS = {
  "preset-1": [
    { time: 1, text: "Hello... I order a pure vegetarian Paneer Butter Masala (Order ID: ZM-88912)..." },
    { time: 5, text: "but the kitchen sent non-veg chicken curry instead!" },
    { time: 9, text: "This is a direct violation of my religious diet." },
    { time: 13, text: "I'm extremely furious and require an immediate wallet refund! User: U-4412." }
  ],
  "preset-2": [
    { time: 1, text: "Yeah, my order ZM-10443 just arrived..." },
    { time: 5, text: "but the rider dropped it and the soup spilled all over the bag." },
    { time: 9, text: "The burger box is completely crushed and the food is totally ruined." },
    { time: 13, text: "My User ID is U-9921, please process credits." }
  ],
  "preset-saas-1": [
    { time: 1, text: "Hey! I'm seeing unrecognized logins from Russia on my account page." },
    { time: 5, text: "Every time I try to change my password, the system flags a session error." },
    { time: 9, text: "I think my account is actively being hacked. User ID: USR-3321." }
  ],
  "preset-saas-2": [
    { time: 1, text: "Hi, my billing credit card was charged twice today for the annual subscription." },
    { time: 6, text: "The payment details show INV-99120. Please refund the extra charge." },
    { time: 10, text: "User ID is USR-8812. Thank you." }
  ]
};

// Mock database for Zomato Orders
const MOCK_ORDERS_DB = {
  "ZM-88912": {
    userId: "U-4412",
    amount: 360.00,
    items: [
      { name: "Paneer Butter Masala (Veg)", qty: 1, price: 280, category: "veg" },
      { name: "Butter Naan", qty: 2, price: 80, category: "veg" }
    ],
    packedItems: [
      { name: "Chicken Tikka Masala (Non-Veg)", qty: 1, category: "non-veg" },
      { name: "Butter Naan", qty: 2, category: "veg" }
    ],
    riderName: "Ramesh Kumar",
    riderPhone: "+91 98765 43210",
    riderStatus: "Delivered"
  },
  "ZM-77112": {
    userId: "U-5590",
    amount: 360.00,
    items: [
      { name: "Chicken Biryani", qty: 1, price: 320, category: "non-veg" },
      { name: "Coca Cola 500ml", qty: 1, price: 40, category: "veg" }
    ],
    packedItems: [
      { name: "Chicken Biryani", qty: 1, category: "non-veg" },
      { name: "Coca Cola 500ml", qty: 1, category: "veg" }
    ],
    riderName: "Rahul Sharma",
    riderPhone: "+91 88877 66554",
    riderStatus: "Switched Off (Battery Dead)",
    riderGps: "28.5355° N, 77.3910° E",
    riderSpeed: "0 km/h (Stationary for 42 mins)",
    riderDistance: "3.2 km away"
  },
  "ZM-99120": {
    userId: "U-2289",
    amount: 640.00,
    items: [
      { name: "Farmhouse Pizza (Medium)", qty: 1, price: 450, category: "veg" },
      { name: "Stuffed Garlic Bread", qty: 1, price: 150, category: "veg" },
      { name: "Pepsi Black 500ml", qty: 1, price: 40, category: "veg" }
    ],
    packedItems: [
      { name: "Farmhouse Pizza (Medium)", qty: 1, category: "veg" }
    ],
    riderName: "Amit Patel",
    riderPhone: "+91 91234 56789",
    riderStatus: "Delivered"
  },
  "ZM-10443": {
    userId: "U-9921",
    amount: 450.00,
    items: [
      { name: "Gourmet Cheese Burger", qty: 1, price: 250, category: "veg" },
      { name: "Tomato Basil Soup", qty: 1, price: 150, category: "veg" },
      { name: "French Fries", qty: 1, price: 50, category: "veg" }
    ],
    packedItems: [
      { name: "Gourmet Cheese Burger", qty: 1, category: "veg" },
      { name: "Tomato Basil Soup", qty: 1, category: "veg" },
      { name: "French Fries", qty: 1, category: "veg" }
    ],
    riderName: "Vikram Singh",
    riderPhone: "+91 99887 76655",
    riderStatus: "Delivered (Reported drop)"
  }
};

// Mock database for SaaS / Platform
const MOCK_SAAS_DB = {
  "USR-8812": {
    email: "john.doe@enterprise.com",
    plan: "Growth Plan (Annual)",
    amount: 120.00,
    transactions: [
      { id: "TXN-99120-A", amount: 120.00, status: "SUCCESS", timestamp: "2026-05-21T14:30:00Z", card: "**** **** **** 4821" },
      { id: "TXN-99120-B", amount: 120.00, status: "SUCCESS", timestamp: "2026-05-21T14:30:05Z", card: "**** **** **** 4821" }
    ],
    invoice_id: "INV-99120"
  },
  "USR-7281": {
    email: "sarah.connor@cyberdyne.io",
    mfaEnabled: true,
    mfaType: "TOTP / Google Authenticator",
    lastLogin: "2026-05-18T10:15:32Z",
    backupCodesRemaining: 3,
    status: "LOCKED_OUT"
  },
  "USR-3321": {
    email: "victim.user@gmail.com",
    activeSessions: [
      { device: "Chrome / Windows (Delhi, IN)", ip: "103.45.12.98", lastActive: "Just now", status: "Active" },
      { device: "Firefox / Linux (St. Petersburg, RU)", ip: "185.220.101.44", lastActive: "2 mins ago", status: "Suspicious" },
      { device: "Safari / iPhone (Beijing, CN)", ip: "198.51.100.42", lastActive: "5 mins ago", status: "Suspicious" }
    ]
  },
  "USR-4410": {
    email: "developer.dev@test.org",
    lastLogs: [
      { timestamp: "15:05:32", level: "INFO", message: "User clicked download button" },
      { timestamp: "15:05:33", level: "ERROR", message: "Uncaught ReferenceError: pdfGenerator is not defined at HTMLButtonElement.onclick (billing.html:124:41)" },
      { timestamp: "15:05:33", level: "FATAL", message: "React rendering thread hung due to recursive DOM repaint exception" }
    ]
  },
  "USR-1090": {
    email: "partner@api-integrator.net",
    company: "SyncFlow Solutions",
    apiLevel: "Basic",
    featureVotes: 42
  }
};

function App() {
  const [agentProfile, setAgentProfile] = useState("saas");
  const [selectedPreset, setSelectedPreset] = useState("preset-saas-1");
  const [workspaceMode, setWorkspaceMode] = useState("chat"); // 'chat', 'audio', or 'text'

  // Chat interface state
  const [chatHistory, setChatHistory] = useState([
    { sender: "customer", text: SAAS_PRESETS[0].text }
  ]);
  const [chatInputValue, setChatInputValue] = useState("");

  // Write manual ticket state
  const [customText, setCustomText] = useState(SAAS_PRESETS[0].text);

  // Audio interface state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioTranscriptText, setAudioTranscriptText] = useState("");
  const audioIntervalRef = useRef(null);
  const audioDuration = 15; // fixed duration for demo

  // Telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  
  // Running SLA Counter (P0, P1, P2)
  const [slaSeconds, setSlaSeconds] = useState(0);

  // Identifiers extracted
  const [extractedOrderId, setExtractedOrderId] = useState("");
  const [extractedUserId, setExtractedUserId] = useState("");
  const [extractedInvoiceId, setExtractedInvoiceId] = useState("");

  // Statistics counters
  const [stats, setStats] = useState({
    total: 2108,
    p0: 42,
    p1: 124,
    p2: 1942,
    refunds: 48500
  });

  // Triage state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [triageOutput, setTriageOutput] = useState(null);
  
  // Tool state
  const [activeToolName, setActiveToolName] = useState(null);
  const [toolResult, setToolResult] = useState(null);
  const [isToolExecuting, setIsToolExecuting] = useState(false);
  const [actionStatus, setActionStatus] = useState("idle");

  // Parallax background offset
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  // Handle 3D Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setParallaxOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Selected text query based on active mode
  const lastCustomerText = workspaceMode === "text" 
    ? customText 
    : chatHistory.filter(c => c.sender === "customer").map(c => c.text).join(" ");
  
  useEffect(() => {
    const orderIdMatch = lastCustomerText.match(/ZM-?\d+/i) || lastCustomerText.match(/order\s*#?\s*(\d+)/i);
    const userIdMatch = lastCustomerText.match(/U-?\d+/i) || lastCustomerText.match(/user\s*#?\s*(\d+)/i) || lastCustomerText.match(/USR-?\d+/i);
    const invoiceIdMatch = lastCustomerText.match(/INV-?\d+/i) || lastCustomerText.match(/invoice\s*#?\s*(\d+)/i) || lastCustomerText.match(/TXN-?\d+/i);

    setExtractedOrderId(orderIdMatch ? orderIdMatch[0].toUpperCase() : "");
    setExtractedUserId(userIdMatch ? userIdMatch[0].toUpperCase() : "");
    setExtractedInvoiceId(invoiceIdMatch ? invoiceIdMatch[0].toUpperCase() : "");
  }, [chatHistory, lastCustomerText, workspaceMode]);

  // SLA ticking countdown
  useEffect(() => {
    if (slaSeconds <= 0) return;
    const interval = setInterval(() => {
      setSlaSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [slaSeconds]);

  // Telemetry log helper
  const addTelemetryLog = (line) => {
    const stamp = new Date().toLocaleTimeString();
    setTelemetryLogs(prev => [...prev, `[${stamp}] ${line}`]);
  };

  // Run initial triage once on start
  useEffect(() => {
    handleTriage();
  }, [agentProfile]);

  const handleTriage = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setTriageOutput(null);
    setActiveToolName(null);
    setToolResult(null);
    setActionStatus("idle");
    setTelemetryLogs([]);

    addTelemetryLog("INIT: Connecting to NLP triage pipeline...");
    
    const timer1 = setTimeout(() => {
      setAnalysisStep(1);
      addTelemetryLog("NLP: Scanning text payload for identifiers...");
    }, 300);

    const timer2 = setTimeout(() => {
      setAnalysisStep(2);
      addTelemetryLog(`METADATA: Found IDs [User: ${extractedUserId || 'None'}, Order: ${extractedOrderId || 'None'}, Invoice: ${extractedInvoiceId || 'None'}].`);
    }, 600);

    const timer3 = setTimeout(() => {
      setAnalysisStep(3);
      addTelemetryLog("GUARDRAIL: Running threat signatures & SQL injection validations...");
    }, 900);

    const timer4 = setTimeout(() => {
      const output = runTriage(lastCustomerText, agentProfile);
      setTriageOutput(output);
      setIsAnalyzing(false);
      
      // SLA allocation based on priority
      if (output.priority === "P0") setSlaSeconds(15 * 60); // 15 mins
      else if (output.priority === "P1") setSlaSeconds(60 * 60); // 1 hour
      else setSlaSeconds(4 * 60 * 60); // 4 hours

      addTelemetryLog(`ROUTER: Successfully triaged as ${output.category} (${output.priority}). Next step: ${output.next_tool ? `Execute ${output.next_tool}` : 'No tool required'}.`);

      // Update statistics
      setStats(prev => {
        const next = { ...prev, total: prev.total + 1 };
        if (output.priority === "P0") next.p0 += 1;
        else if (output.priority === "P1") next.p1 += 1;
        else next.p2 += 1;
        return next;
      });
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setChatHistory([{ sender: "customer", text: preset.text }]);
    setCustomText(preset.text);
    setAudioTranscriptText("");
    setAudioCurrentTime(0);
    setIsAudioPlaying(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  };

  const toggleProfile = (profile) => {
    setAgentProfile(profile);
    const defaults = profile === 'saas' ? SAAS_PRESETS : ZOMATO_PRESETS;
    setSelectedPreset(defaults[0].id);
    setChatHistory([{ sender: "customer", text: defaults[0].text }]);
    setCustomText(defaults[0].text);
    setAudioTranscriptText("");
    setAudioCurrentTime(0);
    setIsAudioPlaying(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  };

  // Audio Playback simulation
  const handleAudioPlayToggle = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      addTelemetryLog("AUDIO: Call recording playback paused.");
    } else {
      setIsAudioPlaying(true);
      addTelemetryLog("AUDIO: Initiating speech-to-text call playback...");
      
      const transcriptLines = VOICE_TRANSCRIPTS[selectedPreset] || [
        { time: 1, text: chatHistory[0]?.text || "Hello... calling for support." }
      ];

      audioIntervalRef.current = setInterval(() => {
        setAudioCurrentTime(prev => {
          const next = prev + 1;
          
          // Check for active transcript text to reveal
          const activeLine = [...transcriptLines].reverse().find(line => next >= line.time);
          if (activeLine) {
            setAudioTranscriptText(activeLine.text);
          }

          if (next >= audioDuration) {
            clearInterval(audioIntervalRef.current);
            setIsAudioPlaying(false);
            addTelemetryLog("SPEECH_TEXT: Call transcript completed. Auto-routing to AI Triage...");
            
            // Build full transcript complaint
            const fullTranscript = transcriptLines.map(l => l.text).join(" ");
            setChatHistory([{ sender: "customer", text: fullTranscript }]);
            setCustomText(fullTranscript);
            
            // Force triage
            setTimeout(() => handleTriage(), 300);
            return audioDuration;
          }
          return next;
        });
      }, 1000);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInputValue.trim()) return;

    const newMsgs = [...chatHistory, { sender: "customer", text: chatInputValue }];
    setChatHistory(newMsgs);
    setChatInputValue("");
    addTelemetryLog("CHAT: Customer added follow-up message.");

    // Simulate AI Agent replying in chat
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { sender: "agent", text: "Triage Engine: Processing query inputs. Standby..." }
      ]);
      handleTriage();
    }, 800);
  };

  const executeTool = () => {
    if (!triageOutput || !triageOutput.next_tool) return;
    
    setIsToolExecuting(true);
    setToolResult(null);
    addTelemetryLog(`EXEC: Invoking backend tool API ${triageOutput.next_tool}()...`);
    
    setTimeout(() => {
      const toolName = triageOutput.next_tool;
      const orderId = triageOutput.tool_arguments.order_id || extractedOrderId;
      const userId = triageOutput.tool_arguments.user_id || extractedUserId;
      const invId = triageOutput.tool_arguments.invoice_id || extractedInvoiceId;
      
      let result = null;

      if (toolName === "get_delivery_partner_status") {
        const dbInfo = MOCK_ORDERS_DB[orderId] || {};
        result = {
          order_id: orderId,
          rider_name: dbInfo.riderName || "Rahul Kumar (Gen)",
          contact_number: dbInfo.riderPhone || "+91 98765 43210",
          gps_coordinates: dbInfo.riderGps || "28.5355° N, 77.3910° E",
          rider_status: dbInfo.riderStatus || "Unreachable (Phone Switched Off)",
          speed: dbInfo.riderSpeed || "0 km/h (Stationary)",
          distance_remaining: dbInfo.riderDistance || "2.8 km away",
          last_ping_time: "42 minutes ago"
        };
      } else if (toolName === "verify_restaurant_bill") {
        const dbInfo = MOCK_ORDERS_DB[orderId] || {
          items: [{ name: "Standard Veg Thali", qty: 1, price: 180 }],
          packedItems: [{ name: "Standard Veg Thali", qty: 1 }],
          amount: 180.00
        };
        const hasMismatch = JSON.stringify(dbInfo.items.map(i=>i.name)) !== JSON.stringify(dbInfo.packedItems.map(i=>i.name));
        result = {
          order_id: orderId,
          billed_items: dbInfo.items,
          packed_items: dbInfo.packedItems,
          order_total: dbInfo.amount,
          receipt_status: hasMismatch ? "DISCREPANCY_DETECTED" : "VERIFIED_MATCH",
          restaurant_signature: "RST-MUM-8921"
        };
      } else if (toolName === "issue_refund_or_coupon") {
        const amt = triageOutput.tool_arguments.amount || 350.00;
        result = {
          order_id: orderId,
          user_id: userId,
          amount_refunded: amt,
          method: "Zomato Credits Wallet",
          reference_id: "REF-" + Math.floor(Math.random() * 9000000 + 1000000),
          status: "SUCCESS",
          timestamp: new Date().toISOString()
        };
        setActionStatus("success");
        setStats(prev => ({ ...prev, refunds: prev.refunds + amt }));
      } else if (toolName === "query_billing_system") {
        const dbInfo = MOCK_SAAS_DB[userId] || {
          email: "customer@domain.com",
          plan: "Pro Plan",
          amount: 120.00,
          transactions: [{ id: "TXN-99120-A", amount: 120.00, status: "SUCCESS", timestamp: new Date().toISOString(), card: "**** 4821" }]
        };
        result = {
          user_id: userId,
          billing_details: {
            email: dbInfo.email,
            active_plan: dbInfo.plan,
            invoice_reference: invId || dbInfo.invoice_id || "INV-N/A"
          },
          transactions: dbInfo.transactions,
          discrepancy_found: dbInfo.transactions.length > 1,
          recommended_action: "REFUND_DUPLICATE"
        };
      } else if (toolName === "check_system_logs") {
        const dbInfo = MOCK_SAAS_DB[userId] || {
          email: "unknown@domain.com",
          lastLogs: [{ timestamp: "12:00:00", level: "ERROR", message: "Internal server error occurred on request" }]
        };
        result = {
          user_id: userId,
          log_signature: "LOG-FAIL-4021-UI",
          log_history: dbInfo.lastLogs,
          system_status: "CRASH_DETECTED",
          active_errors: dbInfo.lastLogs.filter(l => l.level === "ERROR" || l.level === "FATAL").length
        };
      } else if (toolName === "reset_mfa_credentials") {
        const dbInfo = MOCK_SAAS_DB[userId] || {
          email: "user@domain.com",
          mfaEnabled: true,
          mfaType: "TOTP",
          status: "LOCKED"
        };
        result = {
          user_id: userId,
          email: dbInfo.email,
          mfa_config: {
            enabled: dbInfo.mfaEnabled,
            method: dbInfo.mfaType,
            backup_codes_left: dbInfo.backupCodesRemaining || 0
          },
          lockout_status: dbInfo.status,
          verification_token: "MFA-RESET-TOK-" + Math.floor(Math.random() * 900000 + 100000)
        };
      } else if (toolName === "escalate_feature_request") {
        const dbInfo = MOCK_SAAS_DB[userId] || { company: "Self", featureVotes: 1 };
        result = {
          user_id: userId,
          client_company: dbInfo.company,
          feature_votes: dbInfo.featureVotes,
          ticket_summary: triageOutput.tool_arguments.request_summary || "Enhancement request",
          roadmap_status: "BACKLOG",
          developer_queue: "Frontend Core Team"
        };
      } else if (toolName === "human_in_the_loop_escalation") {
        result = {
          incident_id: "INC-SEC-" + Math.floor(Math.random() * 900000 + 100000),
          threat_level: triageOutput.tool_arguments.threat_type ? "CRITICAL_THREAT" : "AMBIGUITY_ESCALATION",
          details: triageOutput.tool_arguments.threat_type ? "Malicious instruction string pattern matched in support request." : "Ambiguous support context, confidence score below 85%.",
          escalated_by: "Ultimate Triage Architect v1.2",
          target_payload: triageOutput.tool_arguments.payload_detected || "None",
          attacker_origin: {
            ip: triageOutput.tool_arguments.client_ip || "198.51.100.42",
            geolocation: "Beijing, CN",
            network_isp: "China Telecom"
          },
          timestamp: new Date().toISOString()
        };
      }

      setToolResult(result);
      setActiveToolName(toolName);
      setIsToolExecuting(false);
      addTelemetryLog(`EXEC: Tool call completed. Status payload parsed successfully.`);
    }, 1000);
  };

  const processFollowUpAction = (type, amt = 0) => {
    setIsToolExecuting(true);
    addTelemetryLog(`MITIGATE: Applying administrative mitigation for category ${type}...`);
    
    setTimeout(() => {
      if (type === 'refund') {
        const orderId = triageOutput.tool_arguments.order_id || extractedOrderId;
        const userId = triageOutput.tool_arguments.user_id || extractedUserId;
        const refundAmt = amt || 300.00;
        
        setToolResult({
          order_id: orderId,
          user_id: userId,
          amount_refunded: refundAmt,
          method: "Zomato Credits Wallet / Stripe Ledger",
          reference_id: "REF-" + Math.floor(Math.random() * 9000000 + 1000000),
          status: "SUCCESS",
          timestamp: new Date().toISOString()
        });
        setActiveToolName("issue_refund_or_coupon");
        setActionStatus("success");
        setStats(prev => ({ ...prev, refunds: prev.refunds + refundAmt }));
      } else if (type === 'hotfix') {
        setActionStatus("patched");
        setToolResult(prev => ({
          ...prev,
          system_status: "PATCHED_SUCCESSFULLY",
          active_errors: 0,
          resolution: "Production bundle updated. JS module ReferenceError resolved."
        }));
      } else if (type === 'mfa_reset') {
        setActionStatus("mfa_reset");
        setToolResult(prev => ({
          ...prev,
          lockout_status: "MFA_DISABLED_BY_ADMIN",
          mfa_config: { ...prev.mfa_config, enabled: false },
          action_status: "RECOVERY_EMAIL_DISPATCHED"
        }));
      } else if (type === 'feature_log') {
        setActionStatus("feature_logged");
        setToolResult(prev => ({
          ...prev,
          roadmap_status: "SCHEDULED_SPRINT_42",
          assigned_pm: "Sarah Jenkins (Director of Platform Product)"
        }));
      } else if (type === 'threat_lockout') {
        setActionStatus("threat_locked");
        setToolResult(prev => ({
          ...prev,
          mitigation_status: "IP_BLOCKED_IN_CLOUDFLARE_FIREWALL",
          user_security: "ACCOUNT_LOCKED_COMPROMISE_FLAGGED",
          active_sessions_revoked: 3,
          incident_status: "RESOLVED_CLOSED"
        }));
      }
      setIsToolExecuting(false);
      addTelemetryLog(`MITIGATE: Administrative correction applied and active ledger updated.`);
    }, 800);
  };

  const highlightJSON = (obj) => {
    if (!obj) return '';
    const jsonStr = JSON.stringify(obj, null, 2);
    
    return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  // Sentiment score analysis based on text content
  const getSentiment = (text) => {
    const textLower = (text || "").toLowerCase();
    if (textLower.includes('hack') || textLower.includes('violation') || textLower.includes('religious') || textLower.includes('angry') || textLower.includes('ruined') || textLower.includes('double charged') || textLower.includes('delete al file')) {
      return { score: 92, label: "Furious", color: "#ef4444", emoji: "😡" };
    }
    if (textLower.includes('missing') || textLower.includes('delay') || textLower.includes('stuck') || textLower.includes('error') || textLower.includes('lag') || textLower.includes('slow') || textLower.includes('locked')) {
      return { score: 65, label: "Frustrated", color: "#fb923c", emoji: "😟" };
    }
    if (textLower.includes('coupon') || textLower.includes('gold') || textLower.includes('price') || textLower.includes('how to') || textLower.includes('api') || textLower.includes('request')) {
      return { score: 30, label: "Neutral", color: "#3b82f6", emoji: "😐" };
    }
    return { score: 10, label: "Satisfied / Calm", color: "#10b981", emoji: "😊" };
  };

  const formatSLA = (secs) => {
    if (secs <= 0) return "00:00:00";
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentPresets = agentProfile === 'saas' ? SAAS_PRESETS : ZOMATO_PRESETS;
  const activeSentiment = getSentiment(lastCustomerText);

  return (
    <div className="app-container">
      {/* 3D Parallax Background elements */}
      <div className="parallax-bg">
        <div 
          className="parallax-bubble" 
          style={{
            width: '200px',
            height: '200px',
            top: '15%',
            left: '5%',
            transform: `translate3d(${parallaxOffset.x * 25}px, ${parallaxOffset.y * 25}px, 0)`
          }}
        />
        <div 
          className="parallax-bubble" 
          style={{
            width: '350px',
            height: '350px',
            bottom: '10%',
            right: '8%',
            transform: `translate3d(${parallaxOffset.x * -40}px, ${parallaxOffset.y * -40}px, 0)`
          }}
        />
        {agentProfile === 'zomato' ? (
          <>
            <div className="food-3d-shape" style={{ top: '8%', right: '15%', fontSize: '56px', transform: `translate3d(${parallaxOffset.x * 45}px, ${parallaxOffset.y * 45}px, 0) rotate(${parallaxOffset.x * 12}deg)` }}>🍕</div>
            <div className="food-3d-shape" style={{ bottom: '25%', left: '7%', fontSize: '64px', transform: `translate3d(${parallaxOffset.x * -30}px, ${parallaxOffset.y * -30}px, 0) rotate(${parallaxOffset.y * -15}deg)` }}>🥤</div>
          </>
        ) : (
          <>
            <div className="food-3d-shape" style={{ top: '8%', right: '15%', fontSize: '56px', transform: `translate3d(${parallaxOffset.x * 45}px, ${parallaxOffset.y * 45}px, 0) rotate(${parallaxOffset.x * 12}deg)` }}>💻</div>
            <div className="food-3d-shape" style={{ bottom: '25%', left: '7%', fontSize: '64px', transform: `translate3d(${parallaxOffset.x * -30}px, ${parallaxOffset.y * -30}px, 0) rotate(${parallaxOffset.y * -15}deg)` }}>🛡️</div>
          </>
        )}
      </div>

      {/* Header bar */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-badge" style={{ backgroundColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }}>
            {agentProfile === 'saas' ? 'U' : 'Z'}
          </div>
          <div className="logo-text">
            <h1 className="dashboard-title-glow">
              {agentProfile === 'saas' ? 'Ultimate Triage Architect Portal' : 'Zomato AI Support Triage'}
            </h1>
            <p>
              {agentProfile === 'saas' 
                ? 'High-Throughput Autonomous SaaS Classification Console' 
                : 'Lead AI Support Triage Agent Portal (3D Console)'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'white',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <button
              onClick={() => toggleProfile('zomato')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                background: agentProfile === 'zomato' ? '#ef4f5f' : 'transparent',
                color: agentProfile === 'zomato' ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              🍕 Zomato Food Support
            </button>
            <button
              onClick={() => toggleProfile('saas')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                background: agentProfile === 'saas' ? '#10b981' : 'transparent',
                color: agentProfile === 'saas' ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              🛡️ SaaS Platform Triage
            </button>
          </div>

          <div className="badge badge-neutral" style={{ fontSize: '12px', padding: '6px 12px', background: 'white' }}>
            <Cpu size={14} style={{ marginRight: '4px', color: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />
            Gemini 3.5 Connected
          </div>
        </div>
      </header>

      {/* Statistics dashboard */}
      <section className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <h3>Total Analyzed</h3>
            <p>{stats.total.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ffebeb', color: '#dc2626' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="stat-info">
            <h3>P0 Critical</h3>
            <p>{stats.p0}</p>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <h3>P1 High</h3>
            <p>{stats.p1}</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Coins size={22} />
          </div>
          <div className="stat-info">
            <h3>{agentProfile === 'saas' ? 'Refunded / Credited' : 'Total Refunded'}</h3>
            <p>{agentProfile === 'saas' ? `$${(stats.refunds / 80).toFixed(0)}` : `₹${stats.refunds.toLocaleString()}`}</p>
          </div>
        </div>
      </section>

      {/* Preset Scenarios Selector */}
      <section style={{ textAlign: 'left' }}>
        <h2 className="section-title">
          <Sparkles size={18} style={{ color: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />
          Select a Test Complaint Scenario ({agentProfile === 'saas' ? 'Platform Triage' : 'Food Support'})
        </h2>
        <div className="presets-container" style={{ flexDirection: 'row', overflowX: 'auto', paddingBottom: '8px' }}>
          {currentPresets.map((preset) => (
            <div 
              key={preset.id}
              className={`preset-card ${selectedPreset === preset.id ? 'active' : ''}`}
              style={{ 
                minWidth: '240px', 
                maxWidth: '240px', 
                flexShrink: 0,
                borderColor: selectedPreset === preset.id ? (agentProfile === 'saas' ? '#10b981' : '#ef4f5f') : '',
                backgroundColor: selectedPreset === preset.id ? (agentProfile === 'saas' ? '#ecfdf5' : '#fff0f1') : ''
              }}
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="preset-header">
                <span className="preset-title" style={{ fontSize: '13px', fontWeight: '700' }}>{preset.title}</span>
                <span className={`badge ${
                  preset.priority === 'P0' ? 'badge-p0' : preset.priority === 'P1' ? 'badge-p1' : 'badge-p2'
                }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {preset.priority}
                </span>
              </div>
              <span className="preset-text">{preset.shortDesc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Workspace (Split Grid) */}
      <main className="workspace-grid">
        
        {/* Left Side: Input Workspace Tabs */}
        <section className="glass-panel input-panel" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <FileText size={18} style={{ color: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />
              Triage Input Workspace
            </h2>
            
            {/* Mode Toggles */}
            <div style={{
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              display: 'flex',
              gap: '2px'
            }}>
              <button
                onClick={() => setWorkspaceMode("chat")}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: workspaceMode === "chat" ? 'white' : 'transparent',
                  color: workspaceMode === "chat" ? 'black' : '#64748b',
                  boxShadow: workspaceMode === "chat" ? '0 1px 3px rgba(0,0,0,0.1)' : ''
                }}
              >
                ✉️ Chat
              </button>
              <button
                onClick={() => setWorkspaceMode("audio")}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: workspaceMode === "audio" ? 'white' : 'transparent',
                  color: workspaceMode === "audio" ? 'black' : '#64748b',
                  boxShadow: workspaceMode === "audio" ? '0 1px 3px rgba(0,0,0,0.1)' : ''
                }}
              >
                📞 Voice
              </button>
              <button
                onClick={() => setWorkspaceMode("text")}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: workspaceMode === "text" ? 'white' : 'transparent',
                  color: workspaceMode === "text" ? 'black' : '#64748b',
                  boxShadow: workspaceMode === "text" ? '0 1px 3px rgba(0,0,0,0.1)' : ''
                }}
              >
                ✍️ Write Ticket
              </button>
            </div>
          </div>
          
          {/* MODE 1: CHAT SYSTEM SIMULATOR */}
          {workspaceMode === "chat" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="chat-container">
                <div className="chat-messages">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.sender}`}>
                      <span className="chat-sender">{msg.sender === "customer" ? "Customer" : "Triage System"}</span>
                      <div className="chat-bubble">{msg.text}</div>
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="chat-message agent">
                      <span className="chat-sender">Triage System</span>
                      <div className="chat-bubble" style={{ background: '#f1f5f9', color: '#64748b' }}>
                        Processing ticket routing telemetry...
                      </div>
                    </div>
                  )}
                </div>
                
                <form className="chat-input-bar" onSubmit={handleSendChatMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a follow-up support query or reply..."
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODE 2: VOICE CALL SIMULATOR */}
          {workspaceMode === "audio" && (
            <div className="voice-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleAudioPlayToggle}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: 'none',
                    background: agentProfile === 'saas' ? '#10b981' : '#ef4f5f',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {isAudioPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />}
                </button>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>Simulated Voice Ticket Playback</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Playback time: 00:{audioCurrentTime.toString().padStart(2, '0')} / 00:{audioDuration}
                  </div>
                </div>
                <Volume2 size={20} style={{ color: '#64748b' }} />
              </div>

              {/* Waveform Visualization */}
              <div className="waveform-animation-box">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const isActive = isAudioPlaying;
                  const randomDelay = (idx * 0.05).toFixed(2);
                  const randomHeight = Math.floor(Math.random() * 60 + 20) + "%";
                  return (
                    <div
                      key={idx}
                      className={`waveform-bar ${isActive ? 'active' : ''}`}
                      style={{
                        animationDelay: `${randomDelay}s`,
                        height: isActive ? undefined : randomHeight
                      }}
                    />
                  );
                })}
              </div>

              {/* Dynamic Transcript Reveal */}
              <div style={{
                background: '#fafafa',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '60px'
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Speech-to-Text Live Transcript
                </div>
                <p style={{ fontSize: '13px', color: '#0f172a', margin: 0, fontStyle: 'italic' }}>
                  {audioTranscriptText || "[Click Play button above to start speaker voice decoding...]"}
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: WRITE MANUAL TICKET TEXT AREA */}
          {workspaceMode === "text" && (
            <div className="textarea-wrapper" style={{ marginTop: '8px' }}>
              <textarea
                className="complaint-textarea"
                placeholder="Type or paste any unique support query here (e.g. My order ZM-99120 is missing items, user U-2289)..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{
                  height: '140px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: agentProfile === 'saas' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            {agentProfile === 'zomato' && (
              <div>
                <label className="textarea-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Hash size={14} /> Order ID (Extracted)
                </label>
                <input 
                  type="text" 
                  value={extractedOrderId} 
                  onChange={(e) => setExtractedOrderId(e.target.value.toUpperCase())}
                  placeholder="No Order ID found"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: extractedOrderId ? '#f0fdf4' : '#fffbeb',
                    fontWeight: '600',
                    color: extractedOrderId ? '#16a34a' : '#d97706'
                  }}
                />
              </div>
            )}
            
            <div>
              <label className="textarea-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <User size={14} /> User ID (Extracted)
              </label>
              <input 
                type="text" 
                value={extractedUserId} 
                onChange={(e) => setExtractedUserId(e.target.value.toUpperCase())}
                placeholder="No User ID found"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: extractedUserId ? '#f0fdf4' : '#fffbeb',
                  fontWeight: '600',
                  color: extractedUserId ? '#16a34a' : '#d97706'
                }}
              />
            </div>

            {agentProfile === 'saas' && (
              <div>
                <label className="textarea-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Receipt size={14} /> Invoice ID (Extracted)
                </label>
                <input 
                  type="text" 
                  value={extractedInvoiceId} 
                  onChange={(e) => setExtractedInvoiceId(e.target.value.toUpperCase())}
                  placeholder="No Invoice ID"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: extractedInvoiceId ? '#f0fdf4' : '#fffbeb',
                    fontWeight: '600',
                    color: extractedInvoiceId ? '#16a34a' : '#d97706'
                  }}
                />
              </div>
            )}
          </div>

          <div className="input-actions">
            <button 
              className="btn-3d btn-3d-secondary"
              onClick={() => {
                setChatHistory([{ sender: "customer", text: "" }]);
                setCustomText("");
                setExtractedOrderId("");
                setExtractedUserId("");
                setExtractedInvoiceId("");
                setSelectedPreset(null);
                setTriageOutput(null);
                setActiveToolName(null);
                setToolResult(null);
                setSlaSeconds(0);
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              className="btn-3d" 
              onClick={handleTriage}
              disabled={isAnalyzing}
              style={{
                background: agentProfile === 'saas' ? '#10b981' : '#ef4f5f',
                boxShadow: agentProfile === 'saas' ? '0px 4px 0px #047857, 0px 8px 15px rgba(16, 185, 129, 0.3)' : ''
              }}
            >
              <Cpu size={16} /> {isAnalyzing ? "Triage Processing..." : "Process AI Triage"}
            </button>
          </div>
        </section>

        {/* Right Side: Process Thinking & Strict Output */}
        <section className="glass-panel output-panel" style={{ textAlign: 'left' }}>
          
          {/* Header containing the SLA countdown ticking timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <Cpu size={18} style={{ color: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />
              Triage Console Output
            </h2>
            
            {/* 2. SLA Ticking Timer */}
            {slaSeconds > 0 && (
              <div className="sla-timer-card">
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', marginRight: '8px' }}>
                  SLA COUNTDOWN
                </span>
                <span className={`sla-digits ${slaSeconds < 120 ? 'imminent' : ''}`}>
                  {formatSLA(slaSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* 1. Sentiment Emoji Meter */}
          {lastCustomerText && (
            <div className="sentiment-gauge-wrapper">
              <div className="sentiment-header-info">
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Customer Sentiment Analysis
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: activeSentiment.color }}>
                  {activeSentiment.emoji} {activeSentiment.label} ({activeSentiment.score}%)
                </span>
              </div>
              <div className="sentiment-bar-bg">
                <div 
                  className="sentiment-bar-fill"
                  style={{
                    width: `${activeSentiment.score}%`,
                    backgroundColor: activeSentiment.color
                  }}
                />
              </div>
            </div>
          )}

          {isAnalyzing ? (
            <div className="thinking-container" style={{ borderColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }}>
              <div className={`thinking-step ${analysisStep >= 0 ? 'completed' : ''}`}>
                <div className="thinking-indicator">
                  {analysisStep > 0 ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <div className="step-spinner" style={{ borderTopColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />}
                </div>
                <span>Scanning input text for IDs and entity metadata...</span>
              </div>
              <div className={`thinking-step ${analysisStep >= 1 ? 'completed' : ''} ${analysisStep === 1 ? 'active' : ''}`} style={{ color: analysisStep === 1 ? (agentProfile === 'saas' ? '#10b981' : '#ef4f5f') : '' }}>
                <div className="thinking-indicator">
                  {analysisStep > 1 ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : analysisStep === 1 ? <div className="step-spinner" style={{ borderTopColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} /> : null}
                </div>
                <span>Determining incident category and priority taxonomy...</span>
              </div>
              <div className={`thinking-step ${analysisStep >= 2 ? 'completed' : ''} ${analysisStep === 2 ? 'active' : ''}`} style={{ color: analysisStep === 2 ? (agentProfile === 'saas' ? '#10b981' : '#ef4f5f') : '' }}>
                <div className="thinking-indicator">
                  {analysisStep > 2 ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : analysisStep === 2 ? <div className="step-spinner" style={{ borderTopColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} /> : null}
                </div>
                <span>Validating identifiers against system security guardrails...</span>
              </div>
            </div>
          ) : triageOutput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
              
              {/* Classification Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #cbd5e1', 
                   borderRadius: '8px', 
                   padding: '10px 14px' 
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CLASSIFIED CATEGORY</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Receipt size={15} style={{ color: agentProfile === 'saas' ? '#10b981' : 'var(--primary)' }} />
                    {triageOutput.category}
                  </div>
                </div>

                <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #cbd5e1', 
                   borderRadius: '8px', 
                   padding: '10px 14px' 
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>INCIDENT PRIORITY</div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge ${
                      triageOutput.priority === 'P0' ? 'badge-p0' : triageOutput.priority === 'P1' ? 'badge-p1' : 'badge-p2'
                    }`} style={{ fontSize: '12px', padding: '2px 10px' }}>
                      {triageOutput.priority === 'P0' ? '🔥 P0 (Critical)' : triageOutput.priority === 'P1' ? '⚡ P1 (High)' : '🌱 P2 (Medium)'}
                    </span>
                  </div>
                </div>
              </div>


              {/* 5. Telemetry Live Logs Console */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                  <Terminal size={12} />
                  <span>AGENT PROCESSING TELEMETRY</span>
                </div>
                <div className="telemetry-logs-terminal">
                  {telemetryLogs.map((log, idx) => (
                    <div key={idx} className="telemetry-line">{log}</div>
                  ))}
                  {isAnalyzing && (
                    <div className="telemetry-line" style={{ color: '#fb923c' }}>[PROCESSING] Analysing text tokens...</div>
                  )}
                  {telemetryLogs.length === 0 && !isAnalyzing && (
                    <div className="telemetry-line" style={{ color: '#64748b' }}>No telemetry trace logs generated. Click Process AI Triage.</div>
                  )}
                </div>
              </div>

              {/* Why Panel */}
              <div style={{ 
                padding: '10px 14px', 
                backgroundColor: agentProfile === 'saas' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 79, 95, 0.04)', 
                borderLeft: `4px solid ${agentProfile === 'saas' ? '#10b981' : 'var(--primary)'}`, 
                borderRadius: '0 8px 8px 0',
                fontSize: '12.5px'
              }}>
                <strong>Operator Summary:</strong> {triageOutput.why}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '40px', color: 'var(--text-muted)', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
              <Cpu size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Execute triage analysis to generate agent response payload.</p>
            </div>
          )}
        </section>
      </main>

      {/* Recommended Action / Tool Canvas */}
      {triageOutput && !isAnalyzing && (
        <section className="tool-visualizer-container" style={{ textAlign: 'left' }}>
          <h2 className="section-title">
            <CornerDownRight size={18} style={{ color: agentProfile === 'saas' ? '#10b981' : 'var(--primary)' }} />
            Agent Tool Call Router
          </h2>
          
          <div className="visualizer-card">
            <div className="visualizer-header">
              <div className="visualizer-title">
                <Cpu size={16} style={{ color: agentProfile === 'saas' ? '#10b981' : 'var(--primary)' }} />
                {triageOutput.next_tool ? (
                  <span>Recommended Action: Trigger <code>{triageOutput.next_tool}()</code></span>
                ) : (
                  <span>No automated tool call recommended</span>
                )}
              </div>
              <div>
                {triageOutput.next_tool && (
                  <button 
                    className="btn-3d" 
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px',
                      background: agentProfile === 'saas' ? '#10b981' : '#ef4f5f',
                      boxShadow: agentProfile === 'saas' ? '0px 4px 0px #047857, 0px 8px 15px rgba(16, 185, 129, 0.3)' : ''
                    }}
                    onClick={executeTool}
                    disabled={isToolExecuting}
                  >
                    <Play size={12} fill="white" /> {isToolExecuting ? "Invoking..." : "Execute Tool API"}
                  </button>
                )}
              </div>
            </div>
            
            <div className="visualizer-body">
              {isToolExecuting ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  <div className="step-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', marginBottom: '12px', borderTopColor: agentProfile === 'saas' ? '#10b981' : '#ef4f5f' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Executing transaction API fetch for identifier {extractedOrderId || extractedUserId}...</p>
                </div>
              ) : toolResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* ==================== get_delivery_partner_status ==================== */}
                  {activeToolName === "get_delivery_partner_status" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rider Status Card</h4>
                          <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{toolResult.rider_name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Contact: {toolResult.contact_number}</div>
                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                            <span style={{ fontWeight: '600', color: '#dc2626' }}>{toolResult.rider_status}</span>
                          </div>
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
                            <span>{toolResult.speed}</span>
                          </div>
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Distance:</span>
                            <span>{toolResult.distance_remaining}</span>
                          </div>
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>GPS:</span>
                            <span style={{ fontFamily: 'monospace' }}>{toolResult.gps_coordinates}</span>
                          </div>
                        </div>

                        {/* Visual Map */}
                        <div className="map-canvas-container">
                          <div className="map-grid-overlay"></div>
                          <div className="map-marker" style={{ top: '35%', left: '20%' }}>
                            <span className="marker-label">🏪 Restaurant</span>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#e23744', borderRadius: '50%', border: '2px solid white' }} />
                          </div>
                          <div className="map-marker" style={{ top: '65%', left: '80%' }}>
                            <span className="marker-label">🏠 Customer</span>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '50%', border: '2px solid white' }} />
                          </div>
                          <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <path 
                              d="M 160 80 Q 280 120, 360 80 T 550 140" 
                              fill="none" 
                              stroke="#cbd5e1" 
                              strokeWidth="4" 
                              strokeDasharray="6"
                            />
                            <path 
                              d="M 160 80 Q 280 120, 310 94" 
                              fill="none" 
                              stroke="var(--primary)" 
                              strokeWidth="4" 
                            />
                          </svg>
                          <div className="map-marker" style={{ top: '47%', left: '44%' }}>
                            <span className="marker-label" style={{ backgroundColor: '#fffbeb', borderColor: '#fef3c7', color: '#d97706' }}>
                              🏍️ Rider Stuck (Switched Off)
                            </span>
                            <div style={{ width: '16px', height: '16px', backgroundColor: '#d97706', borderRadius: '50%', border: '2px solid white', animation: 'ping 1.5s infinite' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <span style={{ fontSize: '13.5px', color: '#1e40af' }}>
                          <strong>Verification complete:</strong> Delivery partner status confirms rider has been stuck and phone is switched off for 42 minutes (P1 violation confirmed).
                        </span>
                        <button className="btn-3d" onClick={() => processFollowUpAction('refund')}>
                          Issue Full Refund <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== verify_restaurant_bill ==================== */}
                  {activeToolName === "verify_restaurant_bill" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="receipt-grid">
                        <div className="receipt-column">
                          <div className="receipt-title">Customer Receipt (Billed)</div>
                          {toolResult.billed_items.map((item, idx) => {
                            const matchItem = toolResult.packed_items.find(pi => pi.name === item.name);
                            const isMissing = !matchItem;
                            return (
                              <div key={idx} className={`receipt-item-row ${isMissing ? 'mismatch' : ''}`}>
                                <span>{item.qty}x {item.name}</span>
                                <span>₹{item.price} {isMissing && " (Missing!)"}</span>
                              </div>
                            );
                          })}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontWeight: '800', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                            <span>Total Billed</span>
                            <span>₹{toolResult.order_total}</span>
                          </div>
                        </div>

                        <div className="receipt-column">
                          <div className="receipt-title">Restaurant Packing Sheet Log</div>
                          {toolResult.packed_items.map((item, idx) => {
                            const billedItem = toolResult.billed_items.find(bi => bi.name === item.name);
                            const isMismatch = !billedItem;
                            return (
                              <div key={idx} className={`receipt-item-row ${isMismatch ? 'mismatch' : 'match'}`}>
                                <span>{item.qty}x {item.name}</span>
                                <span>{isMismatch ? "Mismatch sent" : "Packed ✓"}</span>
                              </div>
                            );
                          })}
                          {toolResult.packed_items.length < toolResult.billed_items.length && (
                            <div className="receipt-item-row mismatch" style={{ marginTop: '6px' }}>
                              <span>[MISSING ITEMS DETECTED]</span>
                              <span>Failed Packing Check</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontWeight: '800', borderTop: '1px solid #cbd5e1', paddingTop: '8px', color: 'var(--text-muted)' }}>
                            <span>Pack Signature</span>
                            <span style={{ fontFamily: 'monospace' }}>{toolResult.restaurant_signature}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <span style={{ fontSize: '13.5px', color: '#1e40af' }}>
                          <strong>Verification complete:</strong> {toolResult.receipt_status === "DISCREPANCY_DETECTED" 
                            ? "Kitchen logs confirm mismatch packing / missing items. Discrepancy verified." 
                            : "Kitchen items match order. Damage or spill occurred in-transit."
                          }
                        </span>
                        <button className="btn-3d" onClick={() => processFollowUpAction('refund')}>
                          Refund Order Items <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== query_billing_system ==================== */}
                  {activeToolName === "query_billing_system" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account & Plan</h4>
                          <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '4px' }}>{toolResult.billing_details.email}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Plan: <strong>{toolResult.billing_details.active_plan}</strong></div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reference: {toolResult.billing_details.invoice_reference}</div>
                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Duplicate Charge:</span>
                            <span className="badge badge-p0" style={{ padding: '2px 8px', fontSize: '11px' }}>
                              {toolResult.discrepancy_found ? "DETECTED" : "NONE"}
                            </span>
                          </div>
                        </div>

                        {/* Transaction Ledger */}
                        <div style={{ background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Stripe Transaction Ledger</h4>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '6px' }}>TXN ID</th>
                                <th style={{ padding: '6px' }}>Amount</th>
                                <th style={{ padding: '6px' }}>Date</th>
                                <th style={{ padding: '6px' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {toolResult.transactions.map((txn, idx) => (
                                <tr key={idx} style={{ 
                                  borderBottom: '1px solid #e2e8f0',
                                  backgroundColor: idx === 1 ? '#fff5f5' : ''
                                }}>
                                  <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontWeight: '600' }}>{txn.id}</td>
                                  <td style={{ padding: '8px 6px' }}>${txn.amount.toFixed(2)}</td>
                                  <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '11px' }}>{txn.timestamp}</td>
                                  <td style={{ padding: '8px 6px' }}>
                                    <span style={{ 
                                      color: idx === 1 ? '#dc2626' : '#059669', 
                                      fontWeight: '700',
                                      fontSize: '11px' 
                                    }}>
                                      {idx === 1 ? 'DUPLICATE' : txn.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {toolResult.discrepancy_found && actionStatus !== "success" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', padding: '12px 18px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                          <span style={{ fontSize: '13.5px', color: '#047857' }}>
                            <strong>Diagnostic Audit:</strong> Stripe API returned two successful transactions charged within 5 seconds for the same invoice. Discrepancy confirmed.
                          </span>
                          <button className="btn-3d" style={{ background: '#10b981', boxShadow: '0px 4px 0px #047857' }} onClick={() => processFollowUpAction('refund', 120.00)}>
                            Void & Refund Duplicate Charge <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== check_system_logs ==================== */}
                  {activeToolName === "check_system_logs" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crash Analytics</h4>
                          <div style={{ fontSize: '13px', marginTop: '4px' }}>Log Signature: <strong>{toolResult.log_signature}</strong></div>
                          <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700' }}>Status: {toolResult.system_status}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target User: {toolResult.user_id}</div>
                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Active Errors:</span>
                            <span style={{ color: '#dc2626', fontWeight: '800' }}>{toolResult.active_errors}</span>
                          </div>
                        </div>

                        {/* Interactive Server Logs Terminal */}
                        <div className="terminal-container" style={{ minHeight: '150px' }}>
                          <div className="terminal-header" style={{ padding: '6px 12px' }}>
                            <div className="terminal-title">server_stack_trace.log</div>
                          </div>
                          <div className="terminal-body" style={{ padding: '10px', fontSize: '11px', lineHeight: '1.4' }}>
                            {toolResult.log_history.map((log, idx) => (
                              <div key={idx} style={{ 
                                color: log.level === 'FATAL' || log.level === 'ERROR' ? '#f43f5e' : '#10b981',
                                marginBottom: '4px',
                                fontFamily: 'monospace'
                              }}>
                                [{log.timestamp}] {log.level}: {log.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {actionStatus !== "patched" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '13.5px', color: '#1e40af' }}>
                            <strong>AI Diagnostics:</strong> Client-side browser thread crashed due to undefined dependency <code>pdfGenerator</code>.
                          </span>
                          <button className="btn-3d" onClick={() => processFollowUpAction('hotfix')}>
                            Deploy Hotfix Bundle <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== reset_mfa_credentials ==================== */}
                  {activeToolName === "reset_mfa_credentials" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Settings</h4>
                          <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '4px' }}>{toolResult.email}</div>
                          <div style={{ fontSize: '13px' }}>MFA Status: <span style={{ color: '#059669', fontWeight: '700' }}>{toolResult.mfa_config.enabled ? "ENABLED" : "DISABLED"}</span></div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Method: {toolResult.mfa_config.method}</div>
                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Account Lock:</span>
                            <span style={{ color: '#d97706', fontWeight: '700' }}>{toolResult.lockout_status}</span>
                          </div>
                        </div>

                        {/* Reset Details */}
                        <div style={{ background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MFA Reset Token Validation</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <Key size={18} style={{ color: '#10b981' }} />
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GENERATED DISPATCH TOKEN</div>
                              <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>{toolResult.verification_token}</div>
                            </div>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Disabling MFA requires triggering a cryptographic recovery link to the user's registered inbox.
                          </p>
                        </div>
                      </div>

                      {actionStatus !== "mfa_reset" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbeb', padding: '12px 18px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                          <span style={{ fontSize: '13.5px', color: '#b45309' }}>
                            <strong>Security Protocol:</strong> Validated backup code failures. Identity verification completed.
                          </span>
                          <button className="btn-3d" style={{ background: '#d97706', boxShadow: '0px 4px 0px #b45309' }} onClick={() => processFollowUpAction('mfa_reset')}>
                            Reset MFA & Send recovery email <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== escalate_feature_request ==================== */}
                  {activeToolName === "escalate_feature_request" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feature Registry</h4>
                          <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '4px' }}>{toolResult.client_company}</div>
                          <div style={{ fontSize: '13px' }}>Current Votes: <strong>{toolResult.feature_votes}</strong></div>
                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Roadmap Status:</span>
                            <span style={{ color: '#2563eb', fontWeight: '700' }}>{toolResult.roadmap_status}</span>
                          </div>
                        </div>

                        {/* Feature Summary */}
                        <div style={{ background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Request Details</h4>
                          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-main)' }}>
                            "{toolResult.ticket_summary}..."
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px' }}>
                            <TrendingUp size={14} style={{ color: '#2563eb' }} />
                            <span>Assigned Developer Squad: <strong>{toolResult.developer_queue}</strong></span>
                          </div>
                        </div>
                      </div>

                      {actionStatus !== "feature_logged" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '12px 18px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                          <span style={{ fontSize: '13.5px', color: '#1e40af' }}>
                            <strong>Product Backlog Check:</strong> API access expansion request has high customer interest.
                          </span>
                          <button className="btn-3d" style={{ background: '#2563eb', boxShadow: '0px 4px 0px #1d4ed8' }} onClick={() => processFollowUpAction('feature_log')}>
                            Schedule in Sprint Plan <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== human_in_the_loop_escalation ==================== */}
                  {activeToolName === "human_in_the_loop_escalation" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff5f5', padding: '16px', borderRadius: '12px', border: '1px solid #feb2b2' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
                            <AlertOctagon size={18} />
                            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SecOps Intrusion Alert</h4>
                          </div>
                          <div style={{ fontSize: '13px', marginTop: '6px' }}>ID: <strong>{toolResult.incident_id}</strong></div>
                          <div style={{ fontSize: '12px', color: '#9b2c2c', fontWeight: '600' }}>Threat Class: {toolResult.threat_level}</div>
                          <hr style={{ border: 'none', borderTop: '1px solid #feb2b2', margin: '8px 0' }} />
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Origin IP: <strong style={{ color: 'black' }}>{toolResult.attacker_origin.ip}</strong></div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location: <strong>{toolResult.attacker_origin.geolocation}</strong></div>
                        </div>

                        {/* Incident Payload */}
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: 'white' }}>
                          <h4 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Intercepted Payload log</h4>
                          <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#f43f5e', whiteSpace: 'pre-wrap' }}>
                            {toolResult.target_payload}
                          </pre>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                            <Globe size={14} />
                            <span>ISP Node: {toolResult.attacker_origin.network_isp}</span>
                          </div>
                        </div>
                      </div>

                      {actionStatus !== "threat_locked" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffebeb', padding: '12px 18px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                          <span style={{ fontSize: '13.5px', color: '#dc2626' }}>
                            <strong>Security mitigation recommended:</strong> Trigger instant Cloudflare IP blocking and freeze victim account sessions to prevent command execution.
                          </span>
                          <button className="btn-3d" style={{ background: '#ef4444', boxShadow: '0px 4px 0px #b91c1c' }} onClick={() => processFollowUpAction('threat_lockout')}>
                            Deploy Shield & Lockout Attacker <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== SUCCESS / COMPLETED STATES ==================== */}
                  {actionStatus === "success" && activeToolName === "issue_refund_or_coupon" && (
                    <div className="refund-card-ui animate-fadeIn">
                      <div className="refund-success-icon">
                        <Check size={28} strokeWidth={3} />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>TRANSACTION SUCCESSFUL</div>
                        <div className="refund-amount-tag">
                          {agentProfile === 'saas' ? `$${toolResult.amount_refunded.toFixed(2)}` : `₹${toolResult.amount_refunded.toFixed(2)}`}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669', marginTop: '4px' }}>
                          Refund Dispatched to Credits Wallet / Original Payment Method
                        </div>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        maxWidth: '450px', 
                        background: '#fafafa', 
                        border: '1px dashed #cbd5e1', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div>REF ID: {toolResult.reference_id}</div>
                        <div>ORDER / TRANSACTION ID: {toolResult.order_id || "N/A"}</div>
                        <div>USER ID: {toolResult.user_id}</div>
                        <div>STATUS: SUCCESS</div>
                        <div>TIMESTAMP: {toolResult.timestamp}</div>
                      </div>
                    </div>
                  )}

                  {actionStatus === "patched" && (
                    <div className="refund-card-ui animate-fadeIn">
                      <div className="refund-success-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb', boxShadow: '0 0 0 6px #eff6ff' }}>
                        <CheckCircle size={28} strokeWidth={2} />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700' }}>HOTFIX BUNDLE DEPLOYED</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
                          Production Hotfix <strong>v1.24.89-patch1</strong> is Live.
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {toolResult.resolution}
                        </p>
                      </div>
                    </div>
                  )}

                  {actionStatus === "mfa_reset" && (
                    <div className="refund-card-ui animate-fadeIn">
                      <div className="refund-success-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706', boxShadow: '0 0 0 6px #fffbeb' }}>
                        <Shield size={28} strokeWidth={2} />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#d97706', fontWeight: '700' }}>MFA DEACTIVATED & PASSWORDS RESET</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
                          Account Locked for Security Recovery.
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Sent MFA disabling email with a secure link to reset account authentication.
                        </p>
                      </div>
                    </div>
                  )}

                  {actionStatus === "feature_logged" && (
                    <div className="refund-card-ui animate-fadeIn">
                      <div className="refund-success-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', boxShadow: '0 0 0 6px #f0f9ff' }}>
                        <TrendingUp size={28} strokeWidth={2} />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: '700' }}>FEATURE LOGGED & SCHEDULED</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
                          Target Sprint: <strong>Sprint 42 Backlog</strong>
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Feature ticket escalated to Product Manager: <strong>{toolResult.assigned_pm}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {actionStatus === "threat_locked" && (
                    <div className="refund-card-ui animate-fadeIn">
                      <div className="refund-success-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626', boxShadow: '0 0 0 6px #fef2f2' }}>
                        <ShieldAlert size={28} strokeWidth={2} />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700' }}>SECOPS LOCKOUT COMPLETED</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
                          Threat Attacker IP Blocked and Victim Credentials Frozen.
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          CF Rule deployed: <code>Block IP {toolResult.attacker_origin?.ip || '198.51.100.42'}</code>. User sessions terminated.
                        </p>
                      </div>
                    </div>
                  )}


                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0' }}>
                  Click "Execute Tool API" to run diagnostic verification on order/user <strong>{extractedOrderId || extractedUserId || "N/A"}</strong>.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Guardrail logic details */}
      <footer style={{ marginTop: '40px', borderTop: '1px solid var(--border-card)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
        <p>© 2026 Zomato AI & Ultimate Triage Architect Routing Guardrails System. All automated decisions follow data safety and customer support SLAs.</p>
      </footer>
    </div>
  );
}

export default App;
