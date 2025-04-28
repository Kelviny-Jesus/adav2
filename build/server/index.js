import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Meta, Links, Outlet, ScrollRestoration, Scripts, RemixServer, useLoaderData, useNavigate, useLocation, Link, useSearchParams } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createHead, renderHeadToString } from 'remix-island';
import { useStore } from '@nanostores/react';
import { map, atom } from 'nanostores';
import Cookies from 'js-cookie';
import { Chalk } from 'chalk';
import * as React from 'react';
import React__default, { useEffect, useRef, useState, useCallback, memo, forwardRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { json } from '@remix-run/cloudflare';
import process from 'vite-plugin-node-polyfills/shims/process';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText as streamText$1, convertToCoreMessages, createDataStream, generateId as generateId$1 } from 'ai';
import { defaultSchema } from 'rehype-sanitize';
import ignore from 'ignore';
import crypto from 'crypto';
import { json as json$1 } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'react-toastify';
import { cva } from 'class-variance-authority';
import Buffer from 'vite-plugin-node-polyfills/shims/buffer';
import '@webcontainer/api';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web/index.js';
import * as Dialog$1 from '@radix-ui/react-dialog';
import { Root, Close } from '@radix-ui/react-dialog';
import 'path-browserify';
import 'jszip';
import fileSaver from 'file-saver';
import 'diff';
import { motion, cubicBezier, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

const tailwindReset = "/assets/tailwind-compat-Bwh-BmjE.css";

const chalk = new Chalk({ level: 3 });
let currentLevel = "info";
function createScopedLogger(scope) {
  return {
    trace: (...messages) => log("trace", scope, messages),
    debug: (...messages) => log("debug", scope, messages),
    info: (...messages) => log("info", scope, messages),
    warn: (...messages) => log("warn", scope, messages),
    error: (...messages) => log("error", scope, messages),
    setLevel
  };
}
function setLevel(level) {
  if ((level === "trace" || level === "debug") && true) {
    return;
  }
  currentLevel = level;
}
function log(level, scope, messages) {
  const levelOrder = ["trace", "debug", "info", "warn", "error"];
  if (levelOrder.indexOf(level) < levelOrder.indexOf(currentLevel)) {
    return;
  }
  const allMessages = messages.reduce((acc, current) => {
    if (acc.endsWith("\n")) {
      return acc + current;
    }
    if (!acc) {
      return current;
    }
    return `${acc} ${current}`;
  }, "");
  const labelBackgroundColor = getColorForLevel(level);
  const labelTextColor = level === "warn" ? "#000000" : "#FFFFFF";
  const labelStyles = getLabelStyles(labelBackgroundColor, labelTextColor);
  const scopeStyles = getLabelStyles("#77828D", "white");
  const styles = [labelStyles];
  if (typeof scope === "string") {
    styles.push("", scopeStyles);
  }
  let labelText = formatText(` ${level.toUpperCase()} `, labelTextColor, labelBackgroundColor);
  if (scope) {
    labelText = `${labelText} ${formatText(` ${scope} `, "#FFFFFF", "77828D")}`;
  }
  if (typeof window !== "undefined") {
    console.log(`%c${level.toUpperCase()}${scope ? `%c %c${scope}` : ""}`, ...styles, allMessages);
  } else {
    console.log(`${labelText}`, allMessages);
  }
}
function formatText(text, color, bg) {
  return chalk.bgHex(bg)(chalk.hex(color)(text));
}
function getLabelStyles(color, textColor) {
  return `background-color: ${color}; color: white; border: 4px solid ${color}; color: ${textColor};`;
}
function getColorForLevel(level) {
  switch (level) {
    case "trace":
    case "debug": {
      return "#77828D";
    }
    case "info": {
      return "#1389FD";
    }
    case "warn": {
      return "#FFDB6C";
    }
    case "error": {
      return "#EE4744";
    }
    default: {
      return "#000000";
    }
  }
}

const logger$8 = createScopedLogger("LogStore");
const MAX_LOGS = 1e3;
class LogStore {
  _logs = map({});
  showLogs = atom(true);
  _readLogs = /* @__PURE__ */ new Set();
  constructor() {
    this._loadLogs();
    if (typeof window !== "undefined") {
      this._loadReadLogs();
    }
  }
  // Expose the logs store for subscription
  get logs() {
    return this._logs;
  }
  _loadLogs() {
    const savedLogs = Cookies.get("eventLogs");
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        this._logs.set(parsedLogs);
      } catch (error) {
        logger$8.error("Failed to parse logs from cookies:", error);
      }
    }
  }
  _loadReadLogs() {
    if (typeof window === "undefined") {
      return;
    }
    const savedReadLogs = localStorage.getItem("bolt_read_logs");
    if (savedReadLogs) {
      try {
        const parsedReadLogs = JSON.parse(savedReadLogs);
        this._readLogs = new Set(parsedReadLogs);
      } catch (error) {
        logger$8.error("Failed to parse read logs:", error);
      }
    }
  }
  _saveLogs() {
    const currentLogs = this._logs.get();
    Cookies.set("eventLogs", JSON.stringify(currentLogs));
  }
  _saveReadLogs() {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem("bolt_read_logs", JSON.stringify(Array.from(this._readLogs)));
  }
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  _trimLogs() {
    const currentLogs = Object.entries(this._logs.get());
    if (currentLogs.length > MAX_LOGS) {
      const sortedLogs = currentLogs.sort(
        ([, a], [, b]) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const newLogs = Object.fromEntries(sortedLogs.slice(0, MAX_LOGS));
      this._logs.set(newLogs);
    }
  }
  // Base log method for general logging
  _addLog(message, level, category, details, metadata) {
    const id = this._generateId();
    const entry = {
      id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      details,
      category,
      metadata
    };
    this._logs.setKey(id, entry);
    this._trimLogs();
    this._saveLogs();
    return id;
  }
  // Specialized method for API logging
  _addApiLog(message, method, url, details) {
    const statusCode = details.statusCode;
    return this._addLog(message, statusCode >= 400 ? "error" : "info", "api", details, {
      component: "api",
      action: method
    });
  }
  // System events
  logSystem(message, details) {
    return this._addLog(message, "info", "system", details);
  }
  // Provider events
  logProvider(message, details) {
    return this._addLog(message, "info", "provider", details);
  }
  // User actions
  logUserAction(message, details) {
    return this._addLog(message, "info", "user", details);
  }
  // API Connection Logging
  logAPIRequest(endpoint, method, duration, statusCode, details) {
    const message = `${method} ${endpoint} - ${statusCode} (${duration}ms)`;
    const level = statusCode >= 400 ? "error" : statusCode >= 300 ? "warning" : "info";
    return this._addLog(message, level, "api", {
      ...details,
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  // Authentication Logging
  logAuth(action, success, details) {
    const message = `Auth ${action} - ${success ? "Success" : "Failed"}`;
    const level = success ? "info" : "error";
    return this._addLog(message, level, "auth", {
      ...details,
      action,
      success,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  // Network Status Logging
  logNetworkStatus(status, details) {
    const message = `Network ${status}`;
    const level = status === "offline" ? "error" : status === "reconnecting" ? "warning" : "info";
    return this._addLog(message, level, "network", {
      ...details,
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  // Database Operations Logging
  logDatabase(operation, success, duration, details) {
    const message = `DB ${operation} - ${success ? "Success" : "Failed"} (${duration}ms)`;
    const level = success ? "info" : "error";
    return this._addLog(message, level, "database", {
      ...details,
      operation,
      success,
      duration,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  // Error events
  logError(message, error, details) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...details
    } : { error, ...details };
    return this._addLog(message, "error", "error", errorDetails);
  }
  // Warning events
  logWarning(message, details) {
    return this._addLog(message, "warning", "system", details);
  }
  // Debug events
  logDebug(message, details) {
    return this._addLog(message, "debug", "system", details);
  }
  clearLogs() {
    this._logs.set({});
    this._saveLogs();
  }
  getLogs() {
    return Object.values(this._logs.get()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  getFilteredLogs(level, category, searchQuery) {
    return this.getLogs().filter((log) => {
      const matchesLevel = !level || level === "debug" || log.level === level;
      const matchesCategory = !category || log.category === category;
      const matchesSearch = !searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase()) || JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesCategory && matchesSearch;
    });
  }
  markAsRead(logId) {
    this._readLogs.add(logId);
    this._saveReadLogs();
  }
  isRead(logId) {
    return this._readLogs.has(logId);
  }
  clearReadLogs() {
    this._readLogs.clear();
    this._saveReadLogs();
  }
  // API interactions
  logApiCall(method, endpoint, statusCode, duration, requestData, responseData) {
    return this._addLog(
      `API ${method} ${endpoint}`,
      statusCode >= 400 ? "error" : "info",
      "api",
      {
        method,
        endpoint,
        statusCode,
        duration,
        request: requestData,
        response: responseData
      },
      {
        component: "api",
        action: method
      }
    );
  }
  // Network operations
  logNetworkRequest(method, url, statusCode, duration, requestData, responseData) {
    return this._addLog(
      `${method} ${url}`,
      statusCode >= 400 ? "error" : "info",
      "network",
      {
        method,
        url,
        statusCode,
        duration,
        request: requestData,
        response: responseData
      },
      {
        component: "network",
        action: method
      }
    );
  }
  // Authentication events
  logAuthEvent(event, success, details) {
    return this._addLog(
      `Auth ${event} ${success ? "succeeded" : "failed"}`,
      success ? "info" : "error",
      "auth",
      details,
      {
        component: "auth",
        action: event
      }
    );
  }
  // Performance tracking
  logPerformance(operation, duration, details) {
    return this._addLog(
      `Performance: ${operation}`,
      duration > 1e3 ? "warning" : "info",
      "performance",
      {
        operation,
        duration,
        ...details
      },
      {
        component: "performance",
        action: "metric"
      }
    );
  }
  // Error handling
  logErrorWithStack(error, category = "error", details) {
    return this._addLog(
      error.message,
      "error",
      category,
      {
        ...details,
        name: error.name,
        stack: error.stack
      },
      {
        component: category,
        action: "error"
      }
    );
  }
  // Refresh logs (useful for real-time updates)
  refreshLogs() {
    const currentLogs = this._logs.get();
    this._logs.set({ ...currentLogs });
  }
  // Enhanced logging methods
  logInfo(message, details) {
    return this._addLog(message, "info", "system", details);
  }
  logSuccess(message, details) {
    return this._addLog(message, "info", "system", { ...details, success: true });
  }
  logApiRequest(method, url, details) {
    return this._addApiLog(`API ${method} ${url}`, method, url, details);
  }
  logSettingsChange(component, setting, oldValue, newValue) {
    return this._addLog(
      `Settings changed in ${component}: ${setting}`,
      "info",
      "settings",
      {
        setting,
        previousValue: oldValue,
        newValue
      },
      {
        component,
        action: "settings_change",
        previousValue: oldValue,
        newValue
      }
    );
  }
  logFeatureToggle(featureId, enabled) {
    return this._addLog(
      `Feature ${featureId} ${enabled ? "enabled" : "disabled"}`,
      "info",
      "feature",
      { featureId, enabled },
      {
        component: "features",
        action: "feature_toggle"
      }
    );
  }
  logTaskOperation(taskId, operation, status, details) {
    return this._addLog(
      `Task ${taskId}: ${operation} - ${status}`,
      "info",
      "task",
      { taskId, operation, status, ...details },
      {
        component: "task-manager",
        action: "task_operation"
      }
    );
  }
  logProviderAction(provider, action, success, details) {
    return this._addLog(
      `Provider ${provider}: ${action} - ${success ? "Success" : "Failed"}`,
      success ? "info" : "error",
      "provider",
      { provider, action, success, ...details },
      {
        component: "providers",
        action: "provider_action"
      }
    );
  }
  logPerformanceMetric(component, operation, duration, details) {
    return this._addLog(
      `Performance: ${component} - ${operation} took ${duration}ms`,
      duration > 1e3 ? "warning" : "info",
      "performance",
      { component, operation, duration, ...details },
      {
        component,
        action: "performance_metric"
      }
    );
  }
}
const logStore = new LogStore();

const kTheme = "bolt_theme";
const DEFAULT_THEME = "light";
const themeStore = atom(initStore());
function initStore() {
  return DEFAULT_THEME;
}
function toggleTheme() {
  const currentTheme = themeStore.get();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  themeStore.set(newTheme);
  localStorage.setItem(kTheme, newTheme);
  document.querySelector("html")?.setAttribute("data-theme", newTheme);
  try {
    const userProfile = localStorage.getItem("bolt_user_profile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.theme = newTheme;
      localStorage.setItem("bolt_user_profile", JSON.stringify(profile));
    }
  } catch (error) {
    console.error("Error updating user profile theme:", error);
  }
  logStore.logSystem(`Theme changed to ${newTheme} mode`);
}

function stripIndents(arg0, ...values) {
  if (typeof arg0 !== "string") {
    const processedString = arg0.reduce((acc, curr, i) => {
      acc += curr + (values[i] ?? "");
      return acc;
    }, "");
    return _stripIndents(processedString);
  }
  return _stripIndents(arg0);
}
function _stripIndents(value) {
  return value.split("\n").map((line) => line.trim()).join("\n").trimStart().replace(/[\r\n]$/, "");
}

const reactToastifyStyles = "/assets/ReactToastify-Bh76j7cs.css";

const globalStyles = "/assets/index-u_rrtyil.css";

const xtermStyles = "/assets/xterm-LZoznX6r.css";

const links = () => [
  {
    rel: "icon",
    href: "/favicon.svg",
    type: "image/svg+xml"
  },
  { rel: "stylesheet", href: reactToastifyStyles },
  { rel: "stylesheet", href: tailwindReset },
  { rel: "stylesheet", href: globalStyles },
  { rel: "stylesheet", href: xtermStyles },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com"
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  }
];
const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;
const Head = createHead(() => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
  /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
  /* @__PURE__ */ jsx(Meta, {}),
  /* @__PURE__ */ jsx(Links, {}),
  /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: inlineThemeCode } })
] }));
function Layout({ children }) {
  const theme = useStore(themeStore);
  useEffect(() => {
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);
  return /* @__PURE__ */ jsxs(DndProvider, { backend: HTML5Backend, children: [
    children,
    /* @__PURE__ */ jsx(ScrollRestoration, {}),
    /* @__PURE__ */ jsx(Scripts, {})
  ] });
}
function App() {
  const theme = useStore(themeStore);
  useEffect(() => {
    logStore.logSystem("Application initialized", {
      theme,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, []);
  return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}

const route0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Head,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: 'Module' }));

async function handleRequest(request, responseStatusCode, responseHeaders, remixContext, _loadContext) {
  const readable = await renderToReadableStream(/* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }), {
    signal: request.signal,
    onError(error) {
      console.error(error);
      responseStatusCode = 500;
    }
  });
  const body = new ReadableStream({
    start(controller) {
      const head = renderHeadToString({ request, remixContext, Head });
      controller.enqueue(
        new Uint8Array(
          new TextEncoder().encode(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`
          )
        )
      );
      const reader = readable.getReader();
      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.enqueue(new Uint8Array(new TextEncoder().encode("</div></body></html>")));
            controller.close();
            return;
          }
          controller.enqueue(value);
          read();
        }).catch((error) => {
          controller.error(error);
          readable.cancel();
        });
      }
      read();
    },
    cancel() {
      readable.cancel();
    }
  });
  if (isbot(request.headers.get("user-agent") || "")) {
    await readable.allReady;
  }
  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  responseHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}

const entryServer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: 'Module' }));

const PREVIEW_CHANNEL = "preview-updates";
async function loader$9({ params }) {
  const previewId = params.id;
  if (!previewId) {
    throw new Response("Preview ID is required", { status: 400 });
  }
  return json({ previewId });
}
function WebContainerPreview() {
  const { previewId } = useLoaderData();
  const iframeRef = useRef(null);
  const broadcastChannelRef = useRef();
  const [previewUrl, setPreviewUrl] = useState("");
  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = "";
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.src = previewUrl;
        }
      });
    }
  }, [previewUrl]);
  const notifyPreviewReady = useCallback(() => {
    if (broadcastChannelRef.current && previewUrl) {
      broadcastChannelRef.current.postMessage({
        type: "preview-ready",
        previewId,
        url: previewUrl,
        timestamp: Date.now()
      });
    }
  }, [previewId, previewUrl]);
  useEffect(() => {
    broadcastChannelRef.current = new BroadcastChannel(PREVIEW_CHANNEL);
    broadcastChannelRef.current.onmessage = (event) => {
      if (event.data.previewId === previewId) {
        if (event.data.type === "refresh-preview" || event.data.type === "file-change") {
          handleRefresh();
        }
      }
    };
    const url = `https://${previewId}.local-credentialless.webcontainer-api.io`;
    setPreviewUrl(url);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    notifyPreviewReady();
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [previewId, handleRefresh, notifyPreviewReady]);
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: /* @__PURE__ */ jsx(
    "iframe",
    {
      ref: iframeRef,
      title: "WebContainer Preview",
      className: "w-full h-full border-none",
      sandbox: "allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin",
      allow: "cross-origin-isolated",
      loading: "eager",
      onLoad: notifyPreviewReady
    }
  ) });
}

const route1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: WebContainerPreview,
  loader: loader$9
}, Symbol.toStringTag, { value: 'Module' }));

async function resetPassword(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (!email || !password || !confirmPassword) {
    return { error: "Email and passwords are required" };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error: "Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    };
  }
  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/reset/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.status) {
      return { success: true, message: "Password reset successfully" };
    } else {
      return { error: data.msg };
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

const action$d = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const verificationCode = formData.get("code");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (!email || !verificationCode || !password || !confirmPassword) {
    return json({ error: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return json({ error: "Passwords do not match" });
  }
  try {
    const verifyResponse = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        code: verificationCode
      })
    });
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyData.status) {
      return json({ error: verifyData.msg || "Invalid verification code. Please try again." });
    }
    const resetFormData = new FormData();
    resetFormData.append("email", email);
    resetFormData.append("password", password);
    resetFormData.append("confirmPassword", confirmPassword);
    const result = await resetPassword(resetFormData);
    if (result.success) {
      return json({ success: true, message: "Password reset successfully" });
    } else {
      return json({ error: result.error });
    }
  } catch (error) {
    console.error("Error in reset process:", error);
    return json({ error: "An unexpected error occurred. Please try again." });
  }
};
function ResetCodeVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);
  const handleCodeChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    const newCode = [...code];
    if (value.length > 1 && index === 0) {
      if (value.length === 6 && /^\d+$/.test(value)) {
        const digits = value.split("");
        setCode(digits);
        const lastInput = document.getElementById(`code-input-5`);
        if (lastInput) {
          lastInput.focus();
        }
        return;
      }
    }
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const verifyResponse = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          code: verificationCode
        })
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || !verifyData.status) {
        setError(verifyData.msg || "Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      const result = await resetPassword(formData);
      if (result.success) {
        setSuccess("Password reset successfully. You will be redirected to login.");
        setTimeout(() => {
          navigate("/login");
        }, 3e3);
      } else {
        setError(result.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50" }),
    /* @__PURE__ */ jsx("header", { className: "p-4 relative", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "12", stroke: "white", strokeWidth: "1.5" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "3", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "9", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "23", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "9", cy: "16", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "23", cy: "16", r: "1.5", fill: "white" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-semibold", children: "Ada" })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center p-6 relative", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-white", children: "Verify Code" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-400", children: "Enter the 6-digit code sent to your email" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800", children: [
        error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
        success && /* @__PURE__ */ jsx("div", { className: "bg-green-500 text-white p-3 rounded-md mb-4", children: success }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "email", value: email }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-gray-200 block", children: "Verification Code" }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-2", children: code.map((digit, index) => /* @__PURE__ */ jsx(
              "input",
              {
                id: `code-input-${index}`,
                type: "text",
                maxLength: 1,
                className: "w-full aspect-square text-center px-0 py-2 bg-[#0a0a0c] border border-gray-800 text-white text-xl font-bold focus:border-blue-500 focus:ring-blue-500 rounded-md",
                value: digit,
                onChange: (e) => handleCodeChange(index, e.target.value),
                onKeyDown: (e) => handleKeyDown(index, e),
                autoFocus: index === 0
              },
              index
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-gray-200 block", children: "New Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "password",
                name: "password",
                type: "password",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", className: "text-gray-200 block", children: "Confirm New Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "confirmPassword",
                name: "confirmPassword",
                type: "password",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true,
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md",
              disabled: isLoading,
              children: isLoading ? "Resetting..." : "Reset Password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
          "Didn't receive a code?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-gray-200 hover:text-white", children: "Request again" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "py-4 relative", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto text-center text-gray-500 text-sm", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Ada. All rights reserved."
    ] }) })
  ] });
}

const route2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$d,
  default: ResetCodeVerificationPage
}, Symbol.toStringTag, { value: 'Module' }));

async function action$c({ request }) {
  try {
    const body = await request.json();
    const { projectId, token } = body;
    if (!projectId || !token) {
      return json({ error: "Project ID and token are required" }, { status: 400 });
    }
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      return json({ error: `Failed to fetch API keys: ${response.statusText}` }, { status: response.status });
    }
    const apiKeys = await response.json();
    return json({ apiKeys });
  } catch (error) {
    console.error("Error fetching project API keys:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error occurred" }, { status: 500 });
  }
}

const route3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$c
}, Symbol.toStringTag, { value: 'Module' }));

class BaseProvider {
  cachedDynamicModels;
  getApiKeyLink;
  labelForGetApiKey;
  icon;
  getProviderBaseUrlAndKey(options) {
    const { apiKeys, providerSettings, serverEnv, defaultBaseUrlKey, defaultApiTokenKey } = options;
    let settingsBaseUrl = providerSettings?.baseUrl;
    const manager = LLMManager.getInstance();
    if (settingsBaseUrl && settingsBaseUrl.length == 0) {
      settingsBaseUrl = void 0;
    }
    const baseUrlKey = this.config.baseUrlKey || defaultBaseUrlKey;
    let baseUrl = settingsBaseUrl || serverEnv?.[baseUrlKey] || process?.env?.[baseUrlKey] || manager.env?.[baseUrlKey] || this.config.baseUrl;
    if (baseUrl && baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const apiTokenKey = this.config.apiTokenKey || defaultApiTokenKey;
    const apiKey = apiKeys?.[this.name] || serverEnv?.[apiTokenKey] || process?.env?.[apiTokenKey] || manager.env?.[apiTokenKey];
    return {
      baseUrl,
      apiKey
    };
  }
  getModelsFromCache(options) {
    if (!this.cachedDynamicModels) {
      return null;
    }
    const cacheKey = this.cachedDynamicModels.cacheId;
    const generatedCacheKey = this.getDynamicModelsCacheKey(options);
    if (cacheKey !== generatedCacheKey) {
      this.cachedDynamicModels = void 0;
      return null;
    }
    return this.cachedDynamicModels.models;
  }
  getDynamicModelsCacheKey(options) {
    return JSON.stringify({
      apiKeys: options.apiKeys?.[this.name],
      providerSettings: options.providerSettings?.[this.name],
      serverEnv: options.serverEnv
    });
  }
  storeDynamicModels(options, models) {
    const cacheId = this.getDynamicModelsCacheKey(options);
    this.cachedDynamicModels = {
      cacheId,
      models
    };
  }
}

class AnthropicProvider extends BaseProvider {
  name = "Anthropic";
  getApiKeyLink = "https://console.anthropic.com/settings/keys";
  config = {
    apiTokenKey: "ANTHROPIC_API_KEY"
  };
  staticModels = [
    {
      name: "claude-3-7-sonnet-20250219",
      label: "Claude 3.7 Sonnet",
      provider: "Anthropic",
      maxTokenAllowed: 32768
    }
  ];
  async getDynamicModels(apiKeys, settings, serverEnv) {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: "",
      defaultApiTokenKey: "OPENAI_API_KEY"
    });
    if (!apiKey) {
      throw `Missing Api Key configuration for ${this.name} provider`;
    }
    const response = await fetch(`https://api.anthropic.com/v1/models`, {
      headers: {
        "x-api-key": `${apiKey}`,
        "anthropic-version": "2023-06-01"
      }
    });
    const res = await response.json();
    const staticModelIds = this.staticModels.map((m) => m.name);
    const data = res.data.filter((model) => model.type === "model" && !staticModelIds.includes(model.id));
    return data.map((m) => ({
      name: m.id,
      label: `${m.display_name}`,
      provider: this.name,
      maxTokenAllowed: 32e3
    }));
  }
  getModelInstance = (options) => {
    const { apiKeys, providerSettings, serverEnv, model } = options;
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings,
      serverEnv,
      defaultBaseUrlKey: "",
      defaultApiTokenKey: "ANTHROPIC_API_KEY"
    });
    const anthropic = createAnthropic({
      apiKey
    });
    return anthropic(model);
  };
}

const providers = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  AnthropicProvider
}, Symbol.toStringTag, { value: 'Module' }));

const logger$7 = createScopedLogger("LLMManager");
class LLMManager {
  static _instance;
  _providers = /* @__PURE__ */ new Map();
  _modelList = [];
  _env = {};
  constructor(_env) {
    this._registerProvidersFromDirectory();
    this._env = _env;
  }
  static getInstance(env = {}) {
    if (!LLMManager._instance) {
      LLMManager._instance = new LLMManager(env);
    }
    return LLMManager._instance;
  }
  get env() {
    return this._env;
  }
  async _registerProvidersFromDirectory() {
    try {
      for (const exportedItem of Object.values(providers)) {
        if (typeof exportedItem === "function" && exportedItem.prototype instanceof BaseProvider) {
          const provider = new exportedItem();
          try {
            this.registerProvider(provider);
          } catch (error) {
            logger$7.warn("Failed To Register Provider: ", provider.name, "error:", error.message);
          }
        }
      }
    } catch (error) {
      logger$7.error("Error registering providers:", error);
    }
  }
  registerProvider(provider) {
    if (this._providers.has(provider.name)) {
      logger$7.warn(`Provider ${provider.name} is already registered. Skipping.`);
      return;
    }
    logger$7.info("Registering Provider: ", provider.name);
    this._providers.set(provider.name, provider);
    this._modelList = [...this._modelList, ...provider.staticModels];
  }
  getProvider(name) {
    return this._providers.get(name);
  }
  getAllProviders() {
    return Array.from(this._providers.values());
  }
  getModelList() {
    return this._modelList;
  }
  async updateModelList(options) {
    const { apiKeys, providerSettings, serverEnv } = options;
    let enabledProviders = Array.from(this._providers.values()).map((p) => p.name);
    if (providerSettings && Object.keys(providerSettings).length > 0) {
      enabledProviders = enabledProviders.filter((p) => providerSettings[p].enabled);
    }
    const dynamicModels = await Promise.all(
      Array.from(this._providers.values()).filter((provider) => enabledProviders.includes(provider.name)).filter(
        (provider) => !!provider.getDynamicModels
      ).map(async (provider) => {
        const cachedModels = provider.getModelsFromCache(options);
        if (cachedModels) {
          return cachedModels;
        }
        const dynamicModels2 = await provider.getDynamicModels(apiKeys, providerSettings?.[provider.name], serverEnv).then((models) => {
          logger$7.info(`Caching ${models.length} dynamic models for ${provider.name}`);
          provider.storeDynamicModels(options, models);
          return models;
        }).catch((err) => {
          logger$7.error(`Error getting dynamic models ${provider.name} :`, err);
          return [];
        });
        return dynamicModels2;
      })
    );
    const staticModels = Array.from(this._providers.values()).flatMap((p) => p.staticModels || []);
    const dynamicModelsFlat = dynamicModels.flat();
    const dynamicModelKeys = dynamicModelsFlat.map((d) => `${d.name}-${d.provider}`);
    const filteredStaticModesl = staticModels.filter((m) => !dynamicModelKeys.includes(`${m.name}-${m.provider}`));
    const modelList = [...dynamicModelsFlat, ...filteredStaticModesl];
    modelList.sort((a, b) => a.name.localeCompare(b.name));
    this._modelList = modelList;
    return modelList;
  }
  getStaticModelList() {
    return [...this._providers.values()].flatMap((p) => p.staticModels || []);
  }
  async getModelListFromProvider(providerArg, options) {
    const provider = this._providers.get(providerArg.name);
    if (!provider) {
      throw new Error(`Provider ${providerArg.name} not found`);
    }
    const staticModels = provider.staticModels || [];
    if (!provider.getDynamicModels) {
      return staticModels;
    }
    const { apiKeys, providerSettings, serverEnv } = options;
    const cachedModels = provider.getModelsFromCache({
      apiKeys,
      providerSettings,
      serverEnv
    });
    if (cachedModels) {
      logger$7.info(`Found ${cachedModels.length} cached models for ${provider.name}`);
      return [...cachedModels, ...staticModels];
    }
    logger$7.info(`Getting dynamic models for ${provider.name}`);
    const dynamicModels = await provider.getDynamicModels?.(apiKeys, providerSettings?.[provider.name], serverEnv).then((models) => {
      logger$7.info(`Got ${models.length} dynamic models for ${provider.name}`);
      provider.storeDynamicModels(options, models);
      return models;
    }).catch((err) => {
      logger$7.error(`Error getting dynamic models ${provider.name} :`, err);
      return [];
    });
    const dynamicModelsName = dynamicModels.map((d) => d.name);
    const filteredStaticList = staticModels.filter((m) => !dynamicModelsName.includes(m.name));
    const modelList = [...dynamicModels, ...filteredStaticList];
    modelList.sort((a, b) => a.name.localeCompare(b.name));
    return modelList;
  }
  getStaticModelListFromProvider(providerArg) {
    const provider = this._providers.get(providerArg.name);
    if (!provider) {
      throw new Error(`Provider ${providerArg.name} not found`);
    }
    return [...provider.staticModels || []];
  }
  getDefaultProvider() {
    const firstProvider = this._providers.values().next().value;
    if (!firstProvider) {
      throw new Error("No providers registered");
    }
    return firstProvider;
  }
}

function parseCookies$1(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) {
    return cookies;
  }
  const items = cookieHeader.split(";").map((cookie) => cookie.trim());
  items.forEach((item) => {
    const [name, ...rest] = item.split("=");
    if (name && rest.length > 0) {
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join("=").trim());
      cookies[decodedName] = decodedValue;
    }
  });
  return cookies;
}
function getApiKeysFromCookie(cookieHeader) {
  const cookies = parseCookies$1(cookieHeader);
  return cookies.apiKeys ? JSON.parse(cookies.apiKeys) : {};
}
function getProviderSettingsFromCookie(cookieHeader) {
  const cookies = parseCookies$1(cookieHeader);
  return cookies.providers ? JSON.parse(cookies.providers) : {};
}

let cachedProviders = null;
let cachedDefaultProvider = null;
function getProviderInfo(llmManager) {
  if (!cachedProviders) {
    cachedProviders = llmManager.getAllProviders().map((provider) => ({
      name: provider.name,
      staticModels: provider.staticModels,
      getApiKeyLink: provider.getApiKeyLink,
      labelForGetApiKey: provider.labelForGetApiKey,
      icon: provider.icon
    }));
  }
  if (!cachedDefaultProvider) {
    const defaultProvider = llmManager.getDefaultProvider();
    cachedDefaultProvider = {
      name: defaultProvider.name,
      staticModels: defaultProvider.staticModels,
      getApiKeyLink: defaultProvider.getApiKeyLink,
      labelForGetApiKey: defaultProvider.labelForGetApiKey,
      icon: defaultProvider.icon
    };
  }
  return { providers: cachedProviders, defaultProvider: cachedDefaultProvider };
}
async function loader$8({
  request,
  params,
  context
}) {
  const llmManager = LLMManager.getInstance(context.cloudflare?.env);
  const cookieHeader = request.headers.get("Cookie");
  const apiKeys = getApiKeysFromCookie(cookieHeader);
  const providerSettings = getProviderSettingsFromCookie(cookieHeader);
  const { providers} = getProviderInfo(llmManager);
  let modelList = [];
  if (params.provider) {
    const provider = llmManager.getProvider(params.provider);
    if (provider) {
      modelList = await llmManager.getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv: context.cloudflare?.env
      });
    }
  } else {
    modelList = await llmManager.updateModelList({
      apiKeys,
      providerSettings,
      serverEnv: context.cloudflare?.env
    });
  }
  const anthropicProvider = providers.find((p) => p.name === "Anthropic");
  const anthropicModels = modelList.filter((m) => m.provider === "Anthropic");
  if (!anthropicProvider) {
    throw new Error("Anthropic provider not found");
  }
  const filteredProviders = [anthropicProvider];
  return json({
    modelList: anthropicModels,
    providers: filteredProviders,
    defaultProvider: anthropicProvider
  });
}

const route17 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: 'Module' }));

const route4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: 'Module' }));

var define_PKG_DEPENDENCIES_default = { "@ai-sdk/amazon-bedrock": "1.0.6", "@ai-sdk/anthropic": "^0.0.39", "@ai-sdk/cohere": "^1.0.3", "@ai-sdk/deepseek": "^0.1.3", "@ai-sdk/google": "^0.0.52", "@ai-sdk/mistral": "^0.0.43", "@ai-sdk/openai": "^1.1.2", "@codemirror/autocomplete": "^6.18.3", "@codemirror/commands": "^6.7.1", "@codemirror/lang-cpp": "^6.0.2", "@codemirror/lang-css": "^6.3.1", "@codemirror/lang-html": "^6.4.9", "@codemirror/lang-javascript": "^6.2.2", "@codemirror/lang-json": "^6.0.1", "@codemirror/lang-markdown": "^6.3.1", "@codemirror/lang-python": "^6.1.6", "@codemirror/lang-sass": "^6.0.2", "@codemirror/lang-vue": "^0.1.3", "@codemirror/lang-wast": "^6.0.2", "@codemirror/language": "^6.10.6", "@codemirror/search": "^6.5.8", "@codemirror/state": "^6.4.1", "@codemirror/view": "^6.35.0", "@headlessui/react": "^2.2.0", "@iconify-json/svg-spinners": "^1.2.1", "@lezer/highlight": "^1.2.1", "@nanostores/react": "^0.7.3", "@octokit/rest": "^21.0.2", "@octokit/types": "^13.6.2", "@openrouter/ai-sdk-provider": "^0.0.5", "@phosphor-icons/react": "^2.1.7", "@radix-ui/react-collapsible": "^1.0.3", "@radix-ui/react-context-menu": "^2.2.2", "@radix-ui/react-dialog": "^1.1.5", "@radix-ui/react-dropdown-menu": "^2.1.6", "@radix-ui/react-label": "^2.1.1", "@radix-ui/react-popover": "^1.1.5", "@radix-ui/react-progress": "^1.0.3", "@radix-ui/react-scroll-area": "^1.2.2", "@radix-ui/react-separator": "^1.1.0", "@radix-ui/react-switch": "^1.1.1", "@radix-ui/react-tabs": "^1.1.2", "@radix-ui/react-tooltip": "^1.1.4", "@remix-run/cloudflare": "^2.15.2", "@remix-run/cloudflare-pages": "^2.15.2", "@remix-run/node": "^2.15.2", "@remix-run/react": "^2.15.2", "@tanstack/react-virtual": "^3.13.0", "@types/react-beautiful-dnd": "^13.1.8", "@uiw/codemirror-theme-vscode": "^4.23.6", "@unocss/reset": "^0.61.9", "@webcontainer/api": "1.3.0-internal.10", "@xterm/addon-fit": "^0.10.0", "@xterm/addon-web-links": "^0.11.0", "@xterm/xterm": "^5.5.0", ai: "^4.1.2", chalk: "^5.4.1", "chart.js": "^4.4.7", "class-variance-authority": "^0.7.0", clsx: "^2.1.0", "date-fns": "^3.6.0", diff: "^5.2.0", dotenv: "^16.4.7", "file-saver": "^2.0.5", "framer-motion": "^11.12.0", ignore: "^6.0.2", isbot: "^4.4.0", "isomorphic-git": "^1.27.2", istextorbinary: "^9.5.0", jose: "^5.9.6", "js-cookie": "^3.0.5", jspdf: "^2.5.2", jszip: "^3.10.1", nanostores: "^0.10.3", "ollama-ai-provider": "^0.15.2", "path-browserify": "^1.0.1", react: "^18.3.1", "react-beautiful-dnd": "^13.1.1", "react-chartjs-2": "^5.3.0", "react-dnd": "^16.0.1", "react-dnd-html5-backend": "^16.0.1", "react-dom": "^18.3.1", "react-hotkeys-hook": "^4.6.1", "react-icons": "^5.4.0", "react-markdown": "^9.0.1", "react-resizable-panels": "^2.1.7", "react-toastify": "^10.0.6", "rehype-raw": "^7.0.0", "rehype-sanitize": "^6.0.0", "remark-gfm": "^4.0.0", "remix-island": "^0.2.0", "remix-utils": "^7.7.0", shiki: "^1.24.0", "tailwind-merge": "^2.2.1", "unist-util-visit": "^5.0.0", zustand: "^5.0.3" };
var define_PKG_DEV_DEPENDENCIES_default = { "@blitz/eslint-plugin": "0.1.0", "@cloudflare/workers-types": "^4.20241127.0", "@iconify-json/ph": "^1.2.1", "@iconify/types": "^2.0.0", "@remix-run/dev": "^2.15.2", "@testing-library/jest-dom": "^6.6.3", "@testing-library/react": "^16.2.0", "@types/diff": "^5.2.3", "@types/dom-speech-recognition": "^0.0.4", "@types/file-saver": "^2.0.7", "@types/js-cookie": "^3.0.6", "@types/path-browserify": "^1.0.3", "@types/react": "^18.3.12", "@types/react-dom": "^18.3.1", "@vitejs/plugin-react": "^4.3.4", "fast-glob": "^3.3.2", husky: "9.1.7", "is-ci": "^3.0.1", jsdom: "^26.0.0", "node-fetch": "^3.3.2", pnpm: "^9.14.4", prettier: "^3.4.1", "sass-embedded": "^1.81.0", typescript: "^5.7.2", unified: "^11.0.5", unocss: "^0.61.9", vite: "^5.4.11", "vite-plugin-node-polyfills": "^0.22.0", "vite-plugin-optimize-css-modules": "^1.1.0", "vite-tsconfig-paths": "^4.3.2", vitest: "^2.1.7", wrangler: "^3.91.0", zod: "^3.24.1" };
var define_PKG_OPTIONAL_DEPENDENCIES_default = {};
var define_PKG_PEER_DEPENDENCIES_default = {};
const getGitInfo = () => ({
  commitHash: "unknown",
  branch: "unknown",
  commitTime: "unknown",
  author: "unknown",
  email: "unknown",
  remoteUrl: "unknown",
  repoName: "unknown"
});
const formatDependencies = (deps, type) => {
  return Object.entries(deps || {}).map(([name, version]) => ({
    name,
    version: version.replace(/^\^|~/, ""),
    type
  }));
};
const getAppResponse = () => {
  const gitInfo = getGitInfo();
  return {
    name: "ada",
    version: "0.0.7",
    description: "An AI Agent",
    license: "MIT",
    environment: process.env.NODE_ENV || "development",
    gitInfo,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    runtimeInfo: {
      nodeVersion: process.version || "unknown"
    },
    dependencies: {
      production: formatDependencies(define_PKG_DEPENDENCIES_default, "production"),
      development: formatDependencies(define_PKG_DEV_DEPENDENCIES_default, "development"),
      peer: formatDependencies(define_PKG_PEER_DEPENDENCIES_default, "peer"),
      optional: formatDependencies(define_PKG_OPTIONAL_DEPENDENCIES_default, "optional")
    }
  };
};
const loader$7 = async ({ request: _request }) => {
  try {
    return json(getAppResponse());
  } catch (error) {
    console.error("Failed to get webapp info:", error);
    return json(
      {
        name: "bolt.diy",
        version: "0.0.0",
        description: "Error fetching app info",
        license: "MIT",
        environment: "error",
        gitInfo: {
          commitHash: "error",
          branch: "unknown",
          commitTime: "unknown",
          author: "unknown",
          email: "unknown",
          remoteUrl: "unknown",
          repoName: "unknown"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        runtimeInfo: { nodeVersion: "unknown" },
        dependencies: {
          production: [],
          development: [],
          peer: [],
          optional: []
        }
      },
      { status: 500 }
    );
  }
};
const action$b = async ({ request: _request }) => {
  try {
    return json(getAppResponse());
  } catch (error) {
    console.error("Failed to get webapp info:", error);
    return json(
      {
        name: "bolt.diy",
        version: "0.0.0",
        description: "Error fetching app info",
        license: "MIT",
        environment: "error",
        gitInfo: {
          commitHash: "error",
          branch: "unknown",
          commitTime: "unknown",
          author: "unknown",
          email: "unknown",
          remoteUrl: "unknown",
          repoName: "unknown"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        runtimeInfo: { nodeVersion: "unknown" },
        dependencies: {
          production: [],
          development: [],
          peer: [],
          optional: []
        }
      },
      { status: 500 }
    );
  }
};

const route5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$b,
  loader: loader$7
}, Symbol.toStringTag, { value: 'Module' }));

const getLocalGitInfo = () => ({
  commitHash: "unknown",
  branch: "unknown",
  commitTime: "unknown",
  author: "unknown",
  email: "unknown",
  remoteUrl: "unknown",
  repoName: "unknown"
});
const getGitHubInfo = async (repoFullName) => {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json"
    };
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }
    console.log("Fetching GitHub info for:", repoFullName);
    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers
    });
    if (!response.ok) {
      console.error("GitHub API error:", {
        status: response.status,
        statusText: response.statusText,
        repoFullName
      });
      if (response.status === 404 && repoFullName !== "stackblitz-labs/bolt.diy") {
        return getGitHubInfo("stackblitz-labs/bolt.diy");
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("GitHub API response:", data);
    return data;
  } catch (error) {
    console.error("Failed to get GitHub info:", error);
    return null;
  }
};
const loader$6 = async ({ request: _request }) => {
  const localInfo = getLocalGitInfo();
  console.log("Local git info:", localInfo);
  let githubInfo = null;
  if (localInfo?.repoName) {
    githubInfo = await getGitHubInfo(localInfo.repoName);
  }
  if (!githubInfo) {
    githubInfo = await getGitHubInfo("stackblitz-labs/bolt.diy");
  }
  const response = {
    local: localInfo || {
      commitHash: "unknown",
      branch: "unknown",
      commitTime: "unknown",
      author: "unknown",
      email: "unknown",
      remoteUrl: "unknown",
      repoName: "unknown"
    },
    github: githubInfo ? {
      currentRepo: {
        fullName: githubInfo.full_name,
        defaultBranch: githubInfo.default_branch,
        stars: githubInfo.stargazers_count,
        forks: githubInfo.forks_count,
        openIssues: githubInfo.open_issues_count
      },
      upstream: githubInfo.parent ? {
        fullName: githubInfo.parent.full_name,
        defaultBranch: githubInfo.parent.default_branch,
        stars: githubInfo.parent.stargazers_count,
        forks: githubInfo.parent.forks_count
      } : null
    } : null,
    isForked: Boolean(githubInfo?.parent),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.log("Final response:", response);
  return json(response);
};

const route6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$6
}, Symbol.toStringTag, { value: 'Module' }));

async function action$a({ request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return new Response("No authorization token provided", { status: 401 });
  }
  try {
    const { projectId, query } = await request.json();
    console.log("Executing query:", { projectId, query });
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.log(e);
        errorData = { message: errorText };
      }
      console.error(
        "Supabase API error:",
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
      );
      return new Response(
        JSON.stringify({
          error: {
            status: response.status,
            statusText: response.statusText,
            message: errorData.message || errorData.error || errorText,
            details: errorData
          }
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Query execution error:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : "Query execution failed",
          stack: error instanceof Error ? error.stack : void 0
        }
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}

const route7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$a
}, Symbol.toStringTag, { value: 'Module' }));

const __vite_import_meta_env__$1 = {"BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true};
const WORK_DIR_NAME = "project";
const WORK_DIR = `/home/${WORK_DIR_NAME}`;
const MODIFICATIONS_TAG_NAME = "bolt_file_modifications";
const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
const DEFAULT_MODEL = "claude-3-7-sonnet-20250219";
const llmManager = LLMManager.getInstance(__vite_import_meta_env__$1);
const PROVIDER_LIST = llmManager.getAllProviders();
const DEFAULT_PROVIDER = llmManager.getDefaultProvider();
const providerBaseUrlEnvKeys = {};
PROVIDER_LIST.forEach((provider) => {
  providerBaseUrlEnvKeys[provider.name] = {
    baseUrlKey: provider.config.baseUrlKey,
    apiTokenKey: provider.config.apiTokenKey
  };
});
const STARTER_TEMPLATES = [
  {
    name: "bolt-astro-basic",
    label: "Astro Basic",
    description: "Lightweight Astro starter template for building fast static websites",
    githubRepo: "thecodacus/bolt-astro-basic-template",
    tags: ["astro", "blog", "performance"],
    icon: "i-bolt:astro"
  },
  {
    name: "bolt-nextjs-shadcn",
    label: "Next.js with shadcn/ui",
    description: "Next.js starter fullstack template integrated with shadcn/ui components and styling system",
    githubRepo: "thecodacus/bolt-nextjs-shadcn-template",
    tags: ["nextjs", "react", "typescript", "shadcn", "tailwind"],
    icon: "i-bolt:nextjs"
  },
  {
    name: "bolt-qwik-ts",
    label: "Qwik TypeScript",
    description: "Qwik framework starter with TypeScript for building resumable applications",
    githubRepo: "thecodacus/bolt-qwik-ts-template",
    tags: ["qwik", "typescript", "performance", "resumable"],
    icon: "i-bolt:qwik"
  },
  {
    name: "bolt-remix-ts",
    label: "Remix TypeScript",
    description: "Remix framework starter with TypeScript for full-stack web applications",
    githubRepo: "thecodacus/bolt-remix-ts-template",
    tags: ["remix", "typescript", "fullstack", "react"],
    icon: "i-bolt:remix"
  },
  {
    name: "bolt-slidev",
    label: "Slidev Presentation",
    description: "Slidev starter template for creating developer-friendly presentations using Markdown",
    githubRepo: "thecodacus/bolt-slidev-template",
    tags: ["slidev", "presentation", "markdown"],
    icon: "i-bolt:slidev"
  },
  {
    name: "bolt-sveltekit",
    label: "SvelteKit",
    description: "SvelteKit starter template for building fast, efficient web applications",
    githubRepo: "bolt-sveltekit-template",
    tags: ["svelte", "sveltekit", "typescript"],
    icon: "i-bolt:svelte"
  },
  {
    name: "vanilla-vite",
    label: "Vanilla + Vite",
    description: "Minimal Vite starter template for vanilla JavaScript projects",
    githubRepo: "thecodacus/vanilla-vite-template",
    tags: ["vite", "vanilla-js", "minimal"],
    icon: "i-bolt:vite"
  },
  {
    name: "bolt-vite-react",
    label: "React + Vite + typescript",
    description: "React starter template powered by Vite for fast development experience",
    githubRepo: "thecodacus/bolt-vite-react-ts-template",
    tags: ["react", "vite", "frontend"],
    icon: "i-bolt:react"
  },
  {
    name: "bolt-vite-ts",
    label: "Vite + TypeScript",
    description: "Vite starter template with TypeScript configuration for type-safe development",
    githubRepo: "thecodacus/bolt-vite-ts-template",
    tags: ["vite", "typescript", "minimal"],
    icon: "i-bolt:typescript"
  },
  {
    name: "bolt-vue",
    label: "Vue.js",
    description: "Vue.js starter template with modern tooling and best practices",
    githubRepo: "thecodacus/bolt-vue-template",
    tags: ["vue", "typescript", "frontend"],
    icon: "i-bolt:vue"
  },
  {
    name: "bolt-angular",
    label: "Angular Starter",
    description: "A modern Angular starter template with TypeScript support and best practices configuration",
    githubRepo: "thecodacus/bolt-angular-template",
    tags: ["angular", "typescript", "frontend", "spa"],
    icon: "i-bolt:angular"
  }
];

const loader$5 = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (provider === "Anthropic") {
    return Response.json({ isSet: true });
  }
  return Response.json({ isSet: false });
};

const route8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$5
}, Symbol.toStringTag, { value: 'Module' }));

async function action$9({ request, params }) {
  return handleProxyRequest(request, params["*"]);
}
async function loader$4({ request, params }) {
  return handleProxyRequest(request, params["*"]);
}
async function handleProxyRequest(request, path) {
  try {
    if (!path) {
      return json({ error: "Invalid proxy URL format" }, { status: 400 });
    }
    const url = new URL(request.url);
    const targetURL = `https://${path}${url.search}`;
    const response = await fetch(targetURL, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        // Override host header with the target host
        host: new URL(targetURL).host
      },
      body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer()
    });
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
        status: 204
      });
    }
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Git proxy error:", error);
    return json({ error: "Proxy error" }, { status: 500 });
  }
}

const route9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$9,
  loader: loader$4
}, Symbol.toStringTag, { value: 'Module' }));

const VerificationCodePopup = ({
  isOpen,
  onClose,
  email,
  onVerifySuccess
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  if (!isOpen) return null;
  const handleCodeChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    const newCode = [...code];
    if (value.length > 1 && index === 0) {
      if (value.length === 6 && /^\d+$/.test(value)) {
        const digits = value.split("");
        setCode(digits);
        const lastInput = document.getElementById(`code-input-5`);
        if (lastInput) {
          lastInput.focus();
        }
        return;
      }
    }
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  const handleVerifyCode = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          code: verificationCode
        })
      });
      const data = await response.json();
      if (!response.ok || !data.status) {
        setError(data.msg || "Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }
      onVerifySuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0",
        children: /* @__PURE__ */ jsx("div", { className: "i-ph:x text-xl" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Verify Code" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
        "Enter the 6-digit code sent to ",
        email
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-gray-200 block", children: "Verification Code" }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-2", children: code.map((digit, index) => /* @__PURE__ */ jsx(
          "input",
          {
            id: `code-input-${index}`,
            type: "text",
            maxLength: 1,
            className: "w-full aspect-square text-center px-0 py-2 bg-[#0a0a0c] border border-gray-800 text-white text-xl font-bold focus:border-blue-500 focus:ring-blue-500 rounded-md",
            value: digit,
            onChange: (e) => handleCodeChange(index, e.target.value),
            onKeyDown: (e) => handleKeyDown(index, e),
            autoFocus: index === 0
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleVerifyCode,
          className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md",
          disabled: isLoading,
          children: isLoading ? "Verifying..." : "Verify Code"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0",
          children: "Cancel"
        }
      ) })
    ] })
  ] }) });
};

const PasswordResetPopup = ({
  isOpen,
  onClose,
  email,
  onResetSuccess
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  if (!isOpen) return null;
  const validatePassword = (password2) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password2);
  };
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/reset/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      const data = await response.json();
      if (!response.ok || !data.status) {
        setError(data.msg || "Failed to reset password. Please try again.");
        setIsLoading(false);
        return;
      }
      onResetSuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-white",
        children: /* @__PURE__ */ jsx("div", { className: "i-ph:x text-xl" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Reset Password" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300", children: [
        "Create a new password for ",
        email
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-gray-200 block", children: "New Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            type: "password",
            className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-md",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", className: "text-gray-200 block", children: "Confirm New Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "confirmPassword",
            type: "password",
            className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-md",
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleResetPassword,
          className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md",
          disabled: isLoading,
          children: isLoading ? "Resetting..." : "Reset Password"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 hover:text-white",
          children: "Cancel"
        }
      ) })
    ] })
  ] }) });
};

const action$8 = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  if (!email) {
    return json({ error: "Email is required" });
  }
  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/send-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (response.status === 201 && data.status) {
      return json({ success: true, message: data.msg, email });
    } else {
      return json({ error: data.msg });
    }
  } catch (error) {
    console.error("Error sending reset code:", error);
    return json({ error: "Failed to send reset code. Please try again." });
  }
};
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.status === 201 && data.status) {
        setSuccess("Reset code sent successfully. Please check your email.");
        setShowVerificationPopup(true);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerificationSuccess = () => {
    setShowVerificationPopup(false);
    setShowPasswordResetPopup(true);
  };
  const handleResetSuccess = () => {
    setShowPasswordResetPopup(false);
    setSuccess("Password reset successfully. You will be redirected to login.");
    setTimeout(() => {
      navigate("/login");
    }, 3e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50" }),
    /* @__PURE__ */ jsx("header", { className: "p-4 relative", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "12", stroke: "white", strokeWidth: "1.5" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "3", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "9", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "23", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "9", cy: "16", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "23", cy: "16", r: "1.5", fill: "white" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-semibold", children: "Ada" })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center p-6 relative", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-white", children: "Reset Password" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-400", children: "Enter your email to receive a password reset code" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800", children: [
        error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
        success && /* @__PURE__ */ jsx("div", { className: "bg-green-500 text-white p-3 rounded-md mb-4", children: success }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-gray-200 block", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                placeholder: "your@email.com",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md",
              disabled: isLoading,
              children: isLoading ? "Sending..." : "Send Reset Code"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
            "Remember your password?",
            " ",
            /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-gray-200 hover:text-white", children: "Sign in" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-4 text-gray-400", children: [
            "Already have a code?",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowVerificationPopup(true),
                className: "text-gray-200 hover:text-white bg-transparent border-none p-0 cursor-pointer",
                children: "Enter verification code"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "py-4 relative", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto text-center text-gray-500 text-sm", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Ada. All rights reserved."
    ] }) }),
    /* @__PURE__ */ jsx(
      VerificationCodePopup,
      {
        isOpen: showVerificationPopup,
        onClose: () => setShowVerificationPopup(false),
        email,
        onVerifySuccess: handleVerificationSuccess
      }
    ),
    /* @__PURE__ */ jsx(
      PasswordResetPopup,
      {
        isOpen: showPasswordResetPopup,
        onClose: () => setShowPasswordResetPopup(false),
        email,
        onResetSuccess: handleResetSuccess
      }
    )
  ] });
}

const route10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$8,
  default: ForgotPasswordPage
}, Symbol.toStringTag, { value: 'Module' }));

const MAX_TOKENS = 8e3;
const MAX_RESPONSE_SEGMENTS = 2;
const IGNORE_PATTERNS$2 = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
  ".cache/**",
  ".vscode/**",
  ".idea/**",
  "**/*.log",
  "**/.DS_Store",
  "**/npm-debug.log*",
  "**/yarn-debug.log*",
  "**/yarn-error.log*",
  "**/*lock.json",
  "**/*lock.yml"
];

const allowedHTMLElements = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "dd",
  "del",
  "details",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "ins",
  "kbd",
  "li",
  "ol",
  "p",
  "pre",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "source",
  "span",
  "strike",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
  "var",
  "think"
];
({
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...defaultSchema.attributes?.div ?? [],
      "data*",
      ["className", "__boltArtifact__", "__boltThought__"]
      // ['className', '__boltThought__']
    ]
  }});

const getSystemPrompt = (cwd = WORK_DIR) => `
You are Ada, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser. It does come with a shell that emulates zsh. The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.

  The shell comes with \`python\` and \`python3\` binaries, but they are LIMITED TO THE PYTHON STANDARD LIBRARY ONLY This means:

    - There is NO \`pip\` support! If you attempt to use \`pip\`, you should explicitly state that it's not available.
    - CRITICAL: Third-party libraries cannot be installed or imported.
    - Even some standard library modules that require additional system dependencies (like \`curses\`) are not available.
    - Only modules from the core Python standard library can be used.

  Additionally, there is no \`g++\` or any C/C++ compiler available. WebContainer CANNOT run native binaries or compile C/C++ code!

  Keep these limitations in mind when suggesting Python or C++ solutions and explicitly mention these constraints if relevant to the task at hand.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.

  IMPORTANT: Git is NOT available.

  IMPORTANT: ALWAYS thoroughly review React or Vite projects before running them to ensure all required files are present and properly configured.

  IMPORTANT: WebContainer CANNOT execute diff or patch editing so always write your code in full no partial/diff update

  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!

  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.

  Available shell commands:
    File Operations:
      - cat: Display file contents
      - cp: Copy files/directories
      - ls: List directory contents
      - mkdir: Create directory
      - mv: Move/rename files
      - rm: Remove files
      - rmdir: Remove empty directories
      - touch: Create empty file/update timestamp
    
    System Information:
      - hostname: Show system name
      - ps: Display running processes
      - pwd: Print working directory
      - uptime: Show system uptime
      - env: Environment variables
    
    Development Tools:
      - node: Execute Node.js code
      - python3: Run Python scripts
      - code: VSCode operations
      - jq: Process JSON
    
    Other Utilities:
      - curl, head, sort, tail, clear, which, export, chmod, scho, hostname, kill, ln, xxd, alias, false,  getconf, true, loadenv, wasm, xdg-open, command, exit, source
</system_constraints>

<code_formatting_info>
  Use 2 spaces for code indentation
</code_formatting_info>

<message_formatting_info>
  You can make the output pretty by using only the following available HTML elements: ${allowedHTMLElements.map((tagName) => `<${tagName}>`).join(", ")}
</message_formatting_info>

<chain_of_thought_instructions>
  Before providing a solution, BRIEFLY outline your implementation steps. This helps ensure systematic thinking and clear communication. Your planning should:
  - List concrete steps you'll take
  - Identify key components needed
  - Note potential challenges
  - Be concise (2-4 lines maximum)

  Example responses:

  User: "Create a todo list app with local storage"
  Assistant: "Sure. I'll start by:
  1. Set up Vite + React
  2. Create TodoList and TodoItem components
  3. Implement localStorage for persistence
  4. Add CRUD operations
  
  Let's start now.

  [Rest of response...]"

  User: "Help debug why my API calls aren't working"
  Assistant: "Great. My first steps will be:
  1. Check network requests
  2. Verify API endpoint format
  3. Examine error handling
  
  [Rest of response...]"

</chain_of_thought_instructions>

<code_review_instructions>
  ALWAYS review code before execution. For any code that will be executed (whether in shell commands, file creation, or other contexts), perform these checks:
  
  1. Syntax Check:
     - Verify correct syntax for the language/framework
     - Check for missing brackets, semicolons, or other syntax elements
     - Ensure proper indentation and formatting
  
  2. Logic Review:
     - Identify potential logical errors or bugs
     - Check for edge cases that might cause issues
     - Verify that the code will accomplish its intended purpose
  
  3. Security Analysis:
     - Look for potential security vulnerabilities
     - Check for unsafe practices (e.g., unsanitized inputs)
     - Identify any permissions or access issues
  
  4. Best Practices:
     - Ensure code follows language/framework best practices
     - Check for inefficient patterns or anti-patterns
     - Verify proper error handling
  
  5. React and Vite Projects:
     - Verify all required configuration files are present (vite.config.js, index.html)
     - Check that all necessary dependencies are included in package.json
     - Ensure proper component structure and file organization
     - Verify entry points and imports are correctly configured
  
  Only after completing this review should you proceed with executing or suggesting the execution of code. If issues are found, fix them before proceeding.
</code_review_instructions>

<artifact_info>
  Ada creates a SINGLE, comprehensive artifact for each project. The artifact contains all necessary steps and components, including:

  - Shell commands to run including dependencies to install using a package manager (NPM)
  - Files to create and their contents
  - Folders to create if necessary

  <artifact_instructions>
    1. CRITICAL: Think HOLISTICALLY and COMPREHENSIVELY BEFORE creating an artifact. This means:

      - Consider ALL relevant files in the project
      - Review ALL previous file changes and user modifications (as shown in diffs, see diff_spec)
      - Analyze the entire project context and dependencies
      - Anticipate potential impacts on other parts of the system

      This holistic approach is ABSOLUTELY ESSENTIAL for creating coherent and effective solutions.

    2. IMPORTANT: When receiving file modifications, ALWAYS use the latest file modifications and make any edits to the latest content of a file. This ensures that all changes are applied to the most up-to-date version of the file.

    3. The current working directory is \`${cwd}\`.

    4. Wrap the content in opening and closing \`<boltArtifact>\` tags. These tags contain more specific \`<boltAction>\` elements.

    5. Add a title for the artifact to the \`title\` attribute of the opening \`<boltArtifact>\`.

    6. Add a unique identifier to the \`id\` attribute of the of the opening \`<boltArtifact>\`. For updates, reuse the prior identifier. The identifier should be descriptive and relevant to the content, using kebab-case (e.g., "example-code-snippet"). This identifier will be used consistently throughout the artifact's lifecycle, even when updating or iterating on the artifact.

    7. Use \`<boltAction>\` tags to define specific actions to perform.

    8. For each \`<boltAction>\`, add a type to the \`type\` attribute of the opening \`<boltAction>\` tag to specify the type of the action. Assign one of the following values to the \`type\` attribute:

      - shell: For running shell commands.

        - When Using \`npx\`, ALWAYS provide the \`--yes\` flag.
        - When running multiple shell commands, use \`&&\` to run them sequentially.
        - ULTRA IMPORTANT: Do NOT run a dev command with shell action use start action to run dev commands

      - file: For writing new files or updating existing files. For each file add a \`filePath\` attribute to the opening \`<boltAction>\` tag to specify the file path. The content of the file artifact is the file contents. All file paths MUST BE relative to the current working directory.

      - start: For starting a development server.
        - Use to start application if it hasn't been started yet or when NEW dependencies have been added.
        - Only use this action when you need to run a dev server or start the application
        - ULTRA IMPORTANT: For React or Vite projects, ALWAYS thoroughly review the project structure and files before starting the server to ensure all required files are present and properly configured
        - ULTRA IMPORTANT: do NOT re-run a dev server if files are updated. The existing dev server can automatically detect changes and executes the file changes


    9. The order of the actions is VERY IMPORTANT. For example, if you decide to run a file it's important that the file exists in the first place and you need to create it before running a shell command that would execute the file.

    10. ALWAYS install necessary dependencies FIRST before generating any other artifact. If that requires a \`package.json\` then you should create that first!

      IMPORTANT: Add all required dependencies to the \`package.json\` already and try to avoid \`npm i <pkg>\` if possible!

    11. CRITICAL: Always provide the FULL, updated content of the artifact. This means:

      - Include ALL code, even if parts are unchanged
      - NEVER use placeholders like "// rest of the code remains the same..." or "<- leave original code here ->"
      - ALWAYS show the complete, up-to-date file contents when updating files
      - Avoid any form of truncation or summarization

    12. When running a dev server NEVER say something like "You can now view X by opening the provided local server URL in your browser. The preview will be opened automatically or by the user manually!

    13. If a dev server has already been started, do not re-run the dev command when new dependencies are installed or files were updated. Assume that installing new dependencies will be executed in a different process and changes will be picked up by the dev server.

    14. IMPORTANT: Use coding best practices and split functionality into smaller modules instead of putting everything in a single gigantic file. Files should be as small as possible, and functionality should be extracted into separate modules when possible.

      - Ensure code is clean, readable, and maintainable.
      - Adhere to proper naming conventions and consistent formatting.
      - Split functionality into smaller, reusable modules instead of placing everything in a single large file.
      - Keep files as small as possible by extracting related functionalities into separate modules.
      - Use imports to connect these modules together effectively.
  </artifact_instructions>
</artifact_info>

NEVER use the word "artifact". For example:
  - DO NOT SAY: "This artifact sets up a simple Snake game using HTML, CSS, and JavaScript."
  - INSTEAD SAY: "We set up a simple Snake game using HTML, CSS, and JavaScript."

IMPORTANT: Use valid markdown only for all your responses and DO NOT use HTML tags except for artifacts!

ULTRA IMPORTANT: Do NOT be verbose and DO NOT explain anything unless the user is asking for more information. That is VERY important.

ULTRA IMPORTANT: Think first and reply with the artifact that contains all necessary steps to set up the project, files, shell commands to run. It is SUPER IMPORTANT to respond with this first.

Here are some examples of correct usage of artifacts:

<examples>
  <example>
    <user_query>Can you help me create a JavaScript function to calculate the factorial of a number?</user_query>

    <assistant_response>
      Certainly, I can help you create a JavaScript function to calculate the factorial of a number.

      <boltArtifact id="factorial-function" title="JavaScript Factorial Function">
        <boltAction type="file" filePath="index.js">function factorial(n) {
  ...
}
...</boltAction>

        <boltAction type="shell">node index.js</boltAction>
      </boltArtifact>
    </assistant_response>
  </example>

  <example>
    <user_query>Build a snake game</user_query>

    <assistant_response>
      Certainly! I'd be happy to help you build a snake game using JavaScript and HTML5 Canvas. This will be a basic implementation that you can later expand upon. Let's create the game step by step.

      <boltArtifact id="snake-game" title="Snake Game in HTML and JavaScript">
        <boltAction type="file" filePath="package.json">{
  "name": "snake",
  "scripts": {
    "dev": "vite"
  }
  ...
}</boltAction>

        <boltAction type="shell">npm install --save-dev vite</boltAction>

        <boltAction type="file" filePath="index.html">...</boltAction>

        <boltAction type="start">npm run dev</boltAction>
      </boltArtifact>

      Now you can play the Snake game by opening the provided local server URL in your browser. Use the arrow keys to control the snake. Eat the red food to grow and increase your score. The game ends if you hit the wall or your own tail.
    </assistant_response>
  </example>

  <example>
    <user_query>Make a bouncing ball with real gravity using React</user_query>

    <assistant_response>
      Certainly! I'll create a bouncing ball with real gravity using React. We'll use the react-spring library for physics-based animations.

      <boltArtifact id="bouncing-ball-react" title="Bouncing Ball with Gravity in React">
        <boltAction type="file" filePath="package.json">{
  "name": "bouncing-ball",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-spring": "^9.7.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0"
  }
}</boltAction>

        <boltAction type="file" filePath="index.html">...</boltAction>

        <boltAction type="file" filePath="src/main.jsx">...</boltAction>

        <boltAction type="file" filePath="src/index.css">...</boltAction>

        <boltAction type="file" filePath="src/App.jsx">...</boltAction>

        <boltAction type="start">npm run dev</boltAction>
      </boltArtifact>

      You can now view the bouncing ball animation in the preview. The ball will start falling from the top of the screen and bounce realistically when it hits the bottom.
    </assistant_response>
  </example>
</examples>
`;
const CONTINUE_PROMPT = stripIndents`
  Continue your prior response. IMPORTANT: Immediately begin from where you left off without any interruptions.
  Do not repeat any content, including artifact and action tags.
`;

const optimized = (options) => {
  const { cwd, allowedHtmlElements } = options;
  return `
You are Ada, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  - Operating in WebContainer, an in-browser Node.js runtime
  - Limited Python support: standard library only, no pip
  - No C/C++ compiler, native binaries, or Git
  - Prefer Node.js scripts over shell scripts
  - Use Vite for web servers
  - Databases: prefer libsql, sqlite, or non-native solutions
  - When for react dont forget to write vite config and index.html to the project
  - ALWAYS thoroughly review React or Vite projects before running them to ensure all required files are present and properly configured
  - WebContainer CANNOT execute diff or patch editing so always write your code in full no partial/diff update

  Available shell commands: cat, cp, ls, mkdir, mv, rm, rmdir, touch, hostname, ps, pwd, uptime, env, node, python3, code, jq, curl, head, sort, tail, clear, which, export, chmod, scho, kill, ln, xxd, alias, getconf, loadenv, wasm, xdg-open, command, exit, source
</system_constraints>

<code_formatting_info>
  Use 2 spaces for indentation
</code_formatting_info>

<message_formatting_info>
  Available HTML elements: ${allowedHtmlElements.join(", ")}
</message_formatting_info>

<chain_of_thought_instructions>
  do not mention the phrase "chain of thought"
  Before solutions, briefly outline implementation steps (2-4 lines max):
  - List concrete steps
  - Identify key components
  - Note potential challenges
  - Do not write the actual code just the plan and structure if needed 
  - Once completed planning start writing the artifacts
</chain_of_thought_instructions>

<artifact_info>
  Create a single, comprehensive artifact for each project:
  - Use \`<boltArtifact>\` tags with \`title\` and \`id\` attributes
  - Use \`<boltAction>\` tags with \`type\` attribute:
    - shell: Run commands
    - file: Write/update files (use \`filePath\` attribute)
    - start: Start dev server (only when necessary)
  - Order actions logically
  - Install dependencies first
  - Provide full, updated content for all files
  - Use coding best practices: modular, clean, readable code
</artifact_info>


# CRITICAL RULES - NEVER IGNORE

## File and Command Handling
1. ALWAYS use artifacts for file contents and commands - NO EXCEPTIONS
2. When writing a file, INCLUDE THE ENTIRE FILE CONTENT - NO PARTIAL UPDATES
3. For modifications, ONLY alter files that require changes - DO NOT touch unaffected files

## Response Format
4. Use markdown EXCLUSIVELY - HTML tags are ONLY allowed within artifacts
5. Be concise - Explain ONLY when explicitly requested
6. NEVER use the word "artifact" in responses

## Development Process
7. ALWAYS think and plan comprehensively before providing a solution
8. Current working directory: \`${cwd} \` - Use this for all file paths
9. Don't use cli scaffolding to steup the project, use cwd as Root of the project
11. For nodejs projects ALWAYS install dependencies after writing package.json file

## Coding Standards
10. ALWAYS create smaller, atomic components and modules
11. Modularity is PARAMOUNT - Break down functionality into logical, reusable parts
12. IMMEDIATELY refactor any file exceeding 250 lines
13. ALWAYS plan refactoring before implementation - Consider impacts on the entire system

## Artifact Usage
22. Use \`<boltArtifact>\` tags with \`title\` and \`id\` attributes for each project
23. Use \`<boltAction>\` tags with appropriate \`type\` attribute:
    - \`shell\`: For running commands
    - \`file\`: For writing/updating files (include \`filePath\` attribute)
    - \`start\`: For starting dev servers (use only when necessary/ or new dependencies are installed)
24. Order actions logically - dependencies MUST be installed first
25. For Vite project must include vite config and index.html for entry point
26. Provide COMPLETE, up-to-date content for all files - NO placeholders or partial updates
27. WebContainer CANNOT execute diff or patch editing so always write your code in full no partial/diff update

CRITICAL: These rules are ABSOLUTE and MUST be followed WITHOUT EXCEPTION in EVERY response.

Examples:
<examples>
  <example>
    <user_query>Can you help me create a JavaScript function to calculate the factorial of a number?</user_query>
    <assistant_response>
      Certainly, I can help you create a JavaScript function to calculate the factorial of a number.

      <boltArtifact id="factorial-function" title="JavaScript Factorial Function">
        <boltAction type="file" filePath="index.js">function factorial(n) {
  ...
}

...</boltAction>
        <boltAction type="shell">node index.js</boltAction>
      </boltArtifact>
    </assistant_response>
  </example>

  <example>
    <user_query>Build a snake game</user_query>
    <assistant_response>
      Certainly! I'd be happy to help you build a snake game using JavaScript and HTML5 Canvas. This will be a basic implementation that you can later expand upon. Let's create the game step by step.

      <boltArtifact id="snake-game" title="Snake Game in HTML and JavaScript">
        <boltAction type="file" filePath="package.json">{
  "name": "snake",
  "scripts": {
    "dev": "vite"
  }
  ...
}</boltAction>
        <boltAction type="shell">npm install --save-dev vite</boltAction>
        <boltAction type="file" filePath="index.html">...</boltAction>
        <boltAction type="start">npm run dev</boltAction>
      </boltArtifact>

      Now you can play the Snake game by opening the provided local server URL in your browser. Use the arrow keys to control the snake. Eat the red food to grow and increase your score. The game ends if you hit the wall or your own tail.
    </assistant_response>
  </example>

  <example>
    <user_query>Make a bouncing ball with real gravity using React</user_query>
    <assistant_response>
      Certainly! I'll create a bouncing ball with real gravity using React. We'll use the react-spring library for physics-based animations.

      <boltArtifact id="bouncing-ball-react" title="Bouncing Ball with Gravity in React">
        <boltAction type="file" filePath="package.json">{
  "name": "bouncing-ball",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-spring": "^9.7.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0"
  }
}</boltAction>
        <boltAction type="file" filePath="index.html">...</boltAction>
        <boltAction type="file" filePath="src/main.jsx">...</boltAction>
        <boltAction type="file" filePath="src/index.css">...</boltAction>
        <boltAction type="file" filePath="src/App.jsx">...</boltAction>
        <boltAction type="start">npm run dev</boltAction>
      </boltArtifact>

      You can now view the bouncing ball animation in the preview. The ball will start falling from the top of the screen and bounce realistically when it hits the bottom.
    </assistant_response>
  </example>
</examples>
Always use artifacts for file contents and commands, following the format shown in these examples.
`;
};

class PromptLibrary {
  static library = {
    default: {
      label: "Default Prompt",
      description: "This is the battle tested default system Prompt",
      get: (options) => getSystemPrompt(options.cwd)
    },
    optimized: {
      label: "Optimized Prompt (experimental)",
      description: "an Experimental version of the prompt for lower token usage",
      get: (options) => optimized(options)
    }
  };
  static getList() {
    return Object.entries(this.library).map(([key, value]) => {
      const { label, description } = value;
      return {
        id: key,
        label,
        description
      };
    });
  }
  static getPropmtFromLibrary(promptId, options) {
    const prompt = this.library[promptId];
    if (!prompt) {
      throw "Prompt Now Found";
    }
    return this.library[promptId]?.get(options);
  }
}

function extractPropertiesFromMessage(message) {
  const textContent = Array.isArray(message.content) ? message.content.find((item) => item.type === "text")?.text || "" : message.content;
  const modelMatch = textContent.match(MODEL_REGEX);
  const providerMatch = textContent.match(PROVIDER_REGEX);
  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER.name;
  const cleanedContent = Array.isArray(message.content) ? message.content.map((item) => {
    if (item.type === "text") {
      return {
        type: "text",
        text: item.text?.replace(MODEL_REGEX, "").replace(PROVIDER_REGEX, "")
      };
    }
    return item;
  }) : textContent.replace(MODEL_REGEX, "").replace(PROVIDER_REGEX, "");
  return { model, provider, content: cleanedContent };
}
function simplifyBoltActions(input) {
  const regex = /(<boltAction[^>]*type="file"[^>]*>)([\s\S]*?)(<\/boltAction>)/g;
  return input.replace(regex, (_0, openingTag, _2, closingTag) => {
    return `${openingTag}
          ...
        ${closingTag}`;
  });
}
function createFilesContext(files, useRelativePath) {
  const ig = ignore().add(IGNORE_PATTERNS$2);
  let filePaths = Object.keys(files);
  filePaths = filePaths.filter((x) => {
    const relPath = x.replace("/home/project/", "");
    return !ig.ignores(relPath);
  });
  const fileContexts = filePaths.filter((x) => files[x] && files[x].type == "file").map((path) => {
    const dirent = files[path];
    if (!dirent || dirent.type == "folder") {
      return "";
    }
    const codeWithLinesNumbers = dirent.content.split("\n").join("\n");
    let filePath = path;
    if (useRelativePath) {
      filePath = path.replace("/home/project/", "");
    }
    return `<boltAction type="file" filePath="${filePath}">${codeWithLinesNumbers}</boltAction>`;
  });
  return `<boltArtifact id="code-content" title="Code Content" >
${fileContexts.join("\n")}
</boltArtifact>`;
}
function extractCurrentContext(messages) {
  const lastAssistantMessage = messages.filter((x) => x.role == "assistant").slice(-1)[0];
  if (!lastAssistantMessage) {
    return { summary: void 0, codeContext: void 0 };
  }
  let summary;
  let codeContext;
  if (!lastAssistantMessage.annotations?.length) {
    return { summary: void 0, codeContext: void 0 };
  }
  for (let i = 0; i < lastAssistantMessage.annotations.length; i++) {
    const annotation = lastAssistantMessage.annotations[i];
    if (!annotation || typeof annotation !== "object") {
      continue;
    }
    if (!annotation.type) {
      continue;
    }
    const annotationObject = annotation;
    if (annotationObject.type === "codeContext") {
      codeContext = annotationObject;
      break;
    } else if (annotationObject.type === "chatSummary") {
      summary = annotationObject;
      break;
    }
  }
  return { summary, codeContext };
}

const ig$2 = ignore().add(IGNORE_PATTERNS$2);
const logger$6 = createScopedLogger("select-context");
async function selectContext(props) {
  const { messages, env: serverEnv, apiKeys, files, providerSettings, summary, onFinish } = props;
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER.name;
  const processedMessages = messages.map((message) => {
    if (message.role === "user") {
      const { model, provider: provider2, content } = extractPropertiesFromMessage(message);
      currentModel = model;
      currentProvider = provider2;
      return { ...message, content };
    } else if (message.role == "assistant") {
      let content = message.content;
      content = simplifyBoltActions(content);
      content = content.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, "");
      content = content.replace(/<think>.*?<\/think>/s, "");
      return { ...message, content };
    }
    return message;
  });
  const provider = PROVIDER_LIST.find((p) => p.name === currentProvider) || DEFAULT_PROVIDER;
  const staticModels = LLMManager.getInstance().getStaticModelListFromProvider(provider);
  let modelDetails = staticModels.find((m) => m.name === currentModel);
  if (!modelDetails) {
    const modelsList = [
      ...provider.staticModels || [],
      ...await LLMManager.getInstance().getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv
      })
    ];
    if (!modelsList.length) {
      throw new Error(`No models found for provider ${provider.name}`);
    }
    modelDetails = modelsList.find((m) => m.name === currentModel);
    if (!modelDetails) {
      logger$6.warn(
        `MODEL [${currentModel}] not found in provider [${provider.name}]. Falling back to first model. ${modelsList[0].name}`
      );
      modelDetails = modelsList[0];
    }
  }
  const { codeContext } = extractCurrentContext(processedMessages);
  let filePaths = getFilePaths(files || {});
  filePaths = filePaths.filter((x) => {
    const relPath = x.replace("/home/project/", "");
    return !ig$2.ignores(relPath);
  });
  let context = "";
  const currrentFiles = [];
  const contextFiles = {};
  if (codeContext?.type === "codeContext") {
    const codeContextFiles = codeContext.files;
    Object.keys(files || {}).forEach((path) => {
      let relativePath = path;
      if (path.startsWith("/home/project/")) {
        relativePath = path.replace("/home/project/", "");
      }
      if (codeContextFiles.includes(relativePath)) {
        contextFiles[relativePath] = files[path];
        currrentFiles.push(relativePath);
      }
    });
    context = createFilesContext(contextFiles);
  }
  const summaryText = `Here is the summary of the chat till now: ${summary}`;
  const extractTextContent = (message) => Array.isArray(message.content) ? message.content.find((item) => item.type === "text")?.text || "" : message.content;
  const lastUserMessage = processedMessages.filter((x) => x.role == "user").pop();
  if (!lastUserMessage) {
    throw new Error("No user message found");
  }
  const resp = await generateText({
    system: `
        You are a software engineer. You are working on a project. You have access to the following files:

        AVAILABLE FILES PATHS
        ---
        ${filePaths.map((path) => `- ${path}`).join("\n")}
        ---

        You have following code loaded in the context buffer that you can refer to:

        CURRENT CONTEXT BUFFER
        ---
        ${context}
        ---

        Now, you are given a task. You need to select the files that are relevant to the task from the list of files above.

        RESPONSE FORMAT:
        your response should be in following format:
---
<updateContextBuffer>
    <includeFile path="path/to/file"/>
    <excludeFile path="path/to/file"/>
</updateContextBuffer>
---
        * Your should start with <updateContextBuffer> and end with </updateContextBuffer>.
        * You can include multiple <includeFile> and <excludeFile> tags in the response.
        * You should not include any other text in the response.
        * You should not include any file that is not in the list of files above.
        * You should not include any file that is already in the context buffer.
        * If no changes are needed, you can leave the response empty updateContextBuffer tag.
        `,
    prompt: `
        ${summaryText}

        Users Question: ${extractTextContent(lastUserMessage)}

        update the context buffer with the files that are relevant to the task from the list of files above.

        CRITICAL RULES:
        * Only include relevant files in the context buffer.
        * context buffer should not include any file that is not in the list of files above.
        * context buffer is extremlly expensive, so only include files that are absolutely necessary.
        * If no changes are needed, you can leave the response empty updateContextBuffer tag.
        * Only 5 files can be placed in the context buffer at a time.
        * if the buffer is full, you need to exclude files that is not needed and include files that is relevent.

        `,
    model: provider.getModelInstance({
      model: currentModel,
      serverEnv,
      apiKeys,
      providerSettings
    })
  });
  const response = resp.text;
  const updateContextBuffer = response.match(/<updateContextBuffer>([\s\S]*?)<\/updateContextBuffer>/);
  if (!updateContextBuffer) {
    throw new Error("Invalid response. Please follow the response format");
  }
  const includeFiles = updateContextBuffer[1].match(/<includeFile path="(.*?)"/gm)?.map((x) => x.replace('<includeFile path="', "").replace('"', "")) || [];
  const excludeFiles = updateContextBuffer[1].match(/<excludeFile path="(.*?)"/gm)?.map((x) => x.replace('<excludeFile path="', "").replace('"', "")) || [];
  const filteredFiles = {};
  excludeFiles.forEach((path) => {
    delete contextFiles[path];
  });
  includeFiles.forEach((path) => {
    let fullPath = path;
    if (!path.startsWith("/home/project/")) {
      fullPath = `/home/project/${path}`;
    }
    if (!filePaths.includes(fullPath)) {
      logger$6.error(`File ${path} is not in the list of files above.`);
      return;
    }
    if (currrentFiles.includes(path)) {
      return;
    }
    filteredFiles[path] = files[fullPath];
  });
  if (onFinish) {
    onFinish(resp);
  }
  const totalFiles = Object.keys(filteredFiles).length;
  logger$6.info(`Total files: ${totalFiles}`);
  if (totalFiles == 0) {
    throw new Error(`Ada failed to select files`);
  }
  return filteredFiles;
}
function getFilePaths(files) {
  let filePaths = Object.keys(files);
  filePaths = filePaths.filter((x) => {
    const relPath = x.replace("/home/project/", "");
    return !ig$2.ignores(relPath);
  });
  return filePaths;
}

const logger$5 = createScopedLogger("stream-text");
async function streamText(props) {
  const {
    messages,
    env: serverEnv,
    options,
    apiKeys,
    files,
    providerSettings,
    promptId,
    contextOptimization,
    contextFiles,
    summary
  } = props;
  let currentModel = DEFAULT_MODEL;
  DEFAULT_PROVIDER.name;
  let processedMessages = messages.map((message) => {
    if (message.role === "user") {
      const { model, content } = extractPropertiesFromMessage(message);
      currentModel = model;
      return { ...message, content };
    } else if (message.role == "assistant") {
      let content = message.content;
      content = content.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, "");
      content = content.replace(/<think>.*?<\/think>/s, "");
      return { ...message, content };
    }
    return message;
  });
  const provider = PROVIDER_LIST.find((p) => p.name === "Anthropic") || DEFAULT_PROVIDER;
  const staticModels = LLMManager.getInstance().getStaticModelListFromProvider(provider);
  let modelDetails = staticModels.find((m) => m.name === currentModel);
  if (!modelDetails) {
    const modelsList = [
      ...provider.staticModels || [],
      ...await LLMManager.getInstance().getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv
      })
    ];
    if (!modelsList.length) {
      throw new Error(`No models found for provider ${provider.name}`);
    }
    modelDetails = modelsList.find((m) => m.name === currentModel);
    if (!modelDetails) {
      logger$5.warn(
        `MODEL [${currentModel}] not found in provider [${provider.name}]. Falling back to first model. ${modelsList[0].name}`
      );
      modelDetails = modelsList[0];
    }
  }
  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;
  let systemPrompt = PromptLibrary.getPropmtFromLibrary(promptId || "default", {
    cwd: WORK_DIR,
    allowedHtmlElements: allowedHTMLElements,
    modificationTagName: MODIFICATIONS_TAG_NAME
  }) ?? getSystemPrompt();
  if (files && contextFiles && contextOptimization) {
    const codeContext = createFilesContext(contextFiles, true);
    const filePaths = getFilePaths(files);
    systemPrompt = `${systemPrompt}
Below are all the files present in the project:
---
${filePaths.join("\n")}
---

Below is the artifact containing the context loaded into context buffer for you to have knowledge of and might need changes to fullfill current user request.
CONTEXT BUFFER:
---
${codeContext}
---
`;
    if (summary) {
      systemPrompt = `${systemPrompt}
      below is the chat history till now
CHAT SUMMARY:
---
${props.summary}
---
`;
      if (props.messageSliceId) {
        processedMessages = processedMessages.slice(props.messageSliceId);
      } else {
        const lastMessage = processedMessages.pop();
        if (lastMessage) {
          processedMessages = [lastMessage];
        }
      }
    }
  }
  logger$5.info(`Sending llm call to ${provider.name} with model ${modelDetails.name}`);
  try {
    const result = await streamText$1({
      model: provider.getModelInstance({
        model: modelDetails.name,
        serverEnv,
        apiKeys,
        providerSettings
      }),
      system: systemPrompt,
      maxTokens: dynamicMaxTokens,
      messages: convertToCoreMessages(processedMessages),
      ...options
    });
    result.usage.then((usage) => {
      logger$5.info(`Raw usage from stream: ${JSON.stringify(usage)}`);
      if (usage) {
        const tokenUsage = {
          promptTokens: usage.promptTokens || 0,
          completionTokens: usage.completionTokens || 0,
          totalTokens: usage.totalTokens || 0
        };
        if (provider.name === "OpenAI" && (tokenUsage.promptTokens === 0 || tokenUsage.completionTokens === 0)) {
          const promptChars = systemPrompt.length + processedMessages.reduce((sum, msg) => sum + (typeof msg.content === "string" ? msg.content.length : 0), 0);
          const estimatedResponseChars = 1e3;
          tokenUsage.promptTokens = tokenUsage.promptTokens || Math.ceil(promptChars / 4);
          tokenUsage.completionTokens = tokenUsage.completionTokens || Math.ceil(estimatedResponseChars / 4);
          tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
          logger$5.info(`Estimated token usage for OpenAI stream: ${JSON.stringify(tokenUsage)}`);
        }
        logger$5.info(`Stream completed. Token usage: ${JSON.stringify(tokenUsage)}`);
      }
    }).catch((err) => {
      logger$5.warn(`Failed to get token usage: ${err.message}`);
    });
    return result;
  } catch (error) {
    if (error.message?.includes("rate limit") || error.statusCode === 429) {
      logger$5.error(`Rate limit exceeded: ${error.message}`);
      const encoder = new TextEncoder();
      const errorMessage = "ERROR: Rate limit exceeded. Please try again later or switch to a different model.";
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      });
      return {
        textStream: stream,
        usage: Promise.resolve({ promptTokens: 0, completionTokens: 0, totalTokens: 0 })
      };
    }
    throw error;
  }
}

async function action$7(args) {
  return enhancerAction(args);
}
const logger$4 = createScopedLogger("api.enhancher");
async function enhancerAction({ context, request }) {
  const { message, model, provider } = await request.json();
  const { name: providerName } = provider;
  if (!model || typeof model !== "string") {
    throw new Response("Invalid or missing model", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  if (!providerName || typeof providerName !== "string") {
    throw new Response("Invalid or missing provider", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  const cookieHeader = request.headers.get("Cookie");
  const apiKeys = getApiKeysFromCookie(cookieHeader);
  const providerSettings = getProviderSettingsFromCookie(cookieHeader);
  try {
    const result = await streamText({
      messages: [
        {
          role: "user",
          content: `[Model: ${model}]

[Provider: ${providerName}]

` + stripIndents`
            You are a professional prompt engineer specializing in crafting precise, effective prompts.
            Your task is to enhance prompts by making them more specific, actionable, and effective.

            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            For valid prompts:
            - Make instructions explicit and unambiguous
            - Add relevant context and constraints
            - Remove redundant information
            - Maintain the core intent
            - Ensure the prompt is self-contained
            - Use professional language

            For invalid or unclear prompts:
            - Respond with clear, professional guidance
            - Keep responses concise and actionable
            - Maintain a helpful, constructive tone
            - Focus on what the user should provide
            - Use a standard template for consistency

            IMPORTANT: Your response must ONLY contain the enhanced prompt text.
            Do not include any explanations, metadata, or wrapper tags.

            <original_prompt>
              ${message}
            </original_prompt>
          `
        }
      ],
      env: context.cloudflare?.env,
      apiKeys,
      providerSettings,
      options: {
        system: "You are a senior software principal architect, you should help the user analyse the user query and enrich it with the necessary context and constraints to make it more specific, actionable, and effective. You should also ensure that the prompt is self-contained and uses professional language. Your response should ONLY contain the enhanced prompt text. Do not include any explanations, metadata, or wrapper tags."
        /*
         * onError: (event) => {
         *   throw new Response(null, {
         *     status: 500,
         *     statusText: 'Internal Server Error',
         *   });
         * }
         */
      }
    });
    (async () => {
      for await (const part of result.fullStream) {
        if (part.type === "error") {
          const error = part.error;
          logger$4.error(error);
          return;
        }
      }
    })();
    return new Response(result.textStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        "Text-Encoding": "chunked"
      }
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.message?.includes("API key")) {
      throw new Response("Invalid or missing API key", {
        status: 401,
        statusText: "Unauthorized"
      });
    }
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}

const route11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$7
}, Symbol.toStringTag, { value: 'Module' }));

const action$6 = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { token } = await request.json();
    const projectsResponse = await fetch("https://api.supabase.com/v1/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!projectsResponse.ok) {
      const errorText = await projectsResponse.text();
      console.error("Projects fetch failed:", errorText);
      return json({ error: "Failed to fetch projects" }, { status: 401 });
    }
    const projects = await projectsResponse.json();
    const uniqueProjectsMap = /* @__PURE__ */ new Map();
    for (const project of projects) {
      if (!uniqueProjectsMap.has(project.id)) {
        uniqueProjectsMap.set(project.id, project);
      }
    }
    const uniqueProjects = Array.from(uniqueProjectsMap.values());
    uniqueProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return json({
      user: { email: "Connected", role: "Admin" },
      stats: {
        projects: uniqueProjects,
        totalProjects: uniqueProjects.length
      }
    });
  } catch (error) {
    console.error("Supabase API error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Authentication failed"
      },
      { status: 401 }
    );
  }
};

const route12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: 'Module' }));

const __vite_import_meta_env__ = {"BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true};
async function action$5(args) {
  return llmCallAction(args);
}
async function getModelList(options) {
  const llmManager = LLMManager.getInstance(__vite_import_meta_env__);
  return llmManager.updateModelList(options);
}
const logger$3 = createScopedLogger("api.llmcall");
async function llmCallAction({ context, request }) {
  const { system, message, model, provider, streamOutput } = await request.json();
  const { name: providerName } = provider;
  if (!model || typeof model !== "string") {
    throw new Response("Invalid or missing model", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  if (!providerName || typeof providerName !== "string") {
    throw new Response("Invalid or missing provider", {
      status: 400,
      statusText: "Bad Request"
    });
  }
  const cookieHeader = request.headers.get("Cookie");
  const apiKeys = getApiKeysFromCookie(cookieHeader);
  const providerSettings = getProviderSettingsFromCookie(cookieHeader);
  if (streamOutput) {
    try {
      const result = await streamText({
        options: {
          system
        },
        messages: [
          {
            role: "user",
            content: `${message}`
          }
        ],
        env: context.cloudflare?.env,
        apiKeys,
        providerSettings
      });
      return new Response(result.textStream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message?.includes("API key")) {
        throw new Response("Invalid or missing API key", {
          status: 401,
          statusText: "Unauthorized"
        });
      }
      throw new Response(null, {
        status: 500,
        statusText: "Internal Server Error"
      });
    }
  } else {
    try {
      const models = await getModelList({ apiKeys, providerSettings, serverEnv: context.cloudflare?.env });
      const modelDetails = models.find((m) => m.name === model);
      if (!modelDetails) {
        throw new Error("Model not found");
      }
      const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;
      const providerInfo = PROVIDER_LIST.find((p) => p.name === "Anthropic");
      if (!providerInfo) {
        throw new Error("Anthropic provider not found");
      }
      logger$3.info(`Generating response Provider: ${provider.name}, Model: ${modelDetails.name}`);
      try {
        const result = await generateText({
          system,
          messages: [
            {
              role: "user",
              content: `${message}`
            }
          ],
          model: providerInfo.getModelInstance({
            model: modelDetails.name,
            serverEnv: context.cloudflare?.env,
            apiKeys,
            providerSettings
          }),
          maxTokens: dynamicMaxTokens,
          toolChoice: "none"
        });
        logger$3.info(`Raw result: ${JSON.stringify(result)}`);
        logger$3.info(`Raw usage: ${JSON.stringify(result.usage)}`);
        const tokenUsage = {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0
        };
        if (provider.name === "OpenAI" && (tokenUsage.promptTokens === 0 || tokenUsage.completionTokens === 0)) {
          const promptChars = (system?.length || 0) + (message?.length || 0);
          const responseChars = result.text?.length || 0;
          tokenUsage.promptTokens = tokenUsage.promptTokens || Math.ceil(promptChars / 4);
          tokenUsage.completionTokens = tokenUsage.completionTokens || Math.ceil(responseChars / 4);
          tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
          logger$3.info(`Estimated token usage for OpenAI: ${JSON.stringify(tokenUsage)}`);
        }
        logger$3.info(`Final token usage: ${JSON.stringify(tokenUsage)}`);
        return new Response(JSON.stringify({
          ...result,
          usage: tokenUsage
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        if (error.message?.includes("rate limit") || error.statusCode === 429) {
          logger$3.error(`Rate limit exceeded: ${error.message}`);
          return new Response(JSON.stringify({
            error: "Rate limit exceeded",
            message: "You have exceeded the rate limit for this model. Please try again later or switch to a different model.",
            details: error.message
          }), {
            status: 429,
            headers: {
              "Content-Type": "application/json"
            }
          });
        }
        throw error;
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message?.includes("API key")) {
        throw new Response("Invalid or missing API key", {
          status: 401,
          statusText: "Unauthorized"
        });
      }
      throw new Response(null, {
        status: 500,
        statusText: "Internal Server Error"
      });
    }
  }
}

const route13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: 'Module' }));

function VerifyCodeRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  useEffect(() => {
    navigate(`/reset-code-verification?email=${encodeURIComponent(email)}`);
  }, [navigate, email]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c]", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl text-white mb-4", children: "Redirecting..." }),
    /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
      "If you are not redirected automatically, click",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/reset-code-verification?email=${encodeURIComponent(email)}`,
          className: "text-blue-500 hover:text-blue-400",
          children: "here"
        }
      )
    ] })
  ] });
}

const route14 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: VerifyCodeRedirect
}, Symbol.toStringTag, { value: 'Module' }));

async function action$4({ request }) {
  try {
    const { siteId, files, token, chatId } = await request.json();
    if (!token) {
      return json({ error: "Not connected to Netlify" }, { status: 401 });
    }
    let targetSiteId = siteId;
    let siteInfo;
    if (!targetSiteId) {
      const siteName = `bolt-diy-${chatId}-${Date.now()}`;
      const createSiteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: siteName,
          custom_domain: null
        })
      });
      if (!createSiteResponse.ok) {
        return json({ error: "Failed to create site" }, { status: 400 });
      }
      const newSite = await createSiteResponse.json();
      targetSiteId = newSite.id;
      siteInfo = {
        id: newSite.id,
        name: newSite.name,
        url: newSite.url,
        chatId
      };
    } else {
      if (targetSiteId) {
        const siteResponse = await fetch(`https://api.netlify.com/api/v1/sites/${targetSiteId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (siteResponse.ok) {
          const existingSite = await siteResponse.json();
          siteInfo = {
            id: existingSite.id,
            name: existingSite.name,
            url: existingSite.url,
            chatId
          };
        } else {
          targetSiteId = void 0;
        }
      }
      if (!targetSiteId) {
        const siteName = `bolt-diy-${chatId}-${Date.now()}`;
        const createSiteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: siteName,
            custom_domain: null
          })
        });
        if (!createSiteResponse.ok) {
          return json({ error: "Failed to create site" }, { status: 400 });
        }
        const newSite = await createSiteResponse.json();
        targetSiteId = newSite.id;
        siteInfo = {
          id: newSite.id,
          name: newSite.name,
          url: newSite.url,
          chatId
        };
      }
    }
    const fileDigests = {};
    for (const [filePath, content] of Object.entries(files)) {
      const normalizedPath = filePath.startsWith("/") ? filePath : "/" + filePath;
      const hash = crypto.createHash("sha1").update(content).digest("hex");
      fileDigests[normalizedPath] = hash;
    }
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${targetSiteId}/deploys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: fileDigests,
        async: true,
        skip_processing: false,
        draft: false,
        // Change this to false for production deployments
        function_schedules: [],
        required: Object.keys(fileDigests),
        // Add this line
        framework: null
      })
    });
    if (!deployResponse.ok) {
      return json({ error: "Failed to create deployment" }, { status: 400 });
    }
    const deploy = await deployResponse.json();
    let retryCount = 0;
    const maxRetries = 60;
    while (retryCount < maxRetries) {
      const statusResponse = await fetch(`https://api.netlify.com/api/v1/sites/${targetSiteId}/deploys/${deploy.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const status = await statusResponse.json();
      if (status.state === "prepared" || status.state === "uploaded") {
        for (const [filePath, content] of Object.entries(files)) {
          const normalizedPath = filePath.startsWith("/") ? filePath : "/" + filePath;
          let uploadSuccess = false;
          let uploadRetries = 0;
          while (!uploadSuccess && uploadRetries < 3) {
            try {
              const uploadResponse = await fetch(
                `https://api.netlify.com/api/v1/deploys/${deploy.id}/files${normalizedPath}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/octet-stream"
                  },
                  body: content
                }
              );
              uploadSuccess = uploadResponse.ok;
              if (!uploadSuccess) {
                console.error("Upload failed:", await uploadResponse.text());
                uploadRetries++;
                await new Promise((resolve) => setTimeout(resolve, 2e3));
              }
            } catch (error) {
              console.error("Upload error:", error);
              uploadRetries++;
              await new Promise((resolve) => setTimeout(resolve, 2e3));
            }
          }
          if (!uploadSuccess) {
            return json({ error: `Failed to upload file ${filePath}` }, { status: 500 });
          }
        }
      }
      if (status.state === "ready") {
        if (Object.keys(files).length === 0 || status.summary?.status === "ready") {
          return json({
            success: true,
            deploy: {
              id: status.id,
              state: status.state,
              url: status.ssl_url || status.url
            },
            site: siteInfo
          });
        }
      }
      if (status.state === "error") {
        return json({ error: status.error_message || "Deploy preparation failed" }, { status: 500 });
      }
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
    if (retryCount >= maxRetries) {
      return json({ error: "Deploy preparation timed out" }, { status: 500 });
    }
    return json({
      success: true,
      deploy: {
        id: deploy.id,
        state: deploy.state
      },
      site: siteInfo
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return json({ error: "Deployment failed" }, { status: 500 });
  }
}

const route15 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$4
}, Symbol.toStringTag, { value: 'Module' }));

const loader$3 = async ({ request: _request }) => {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};

const route16 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$3
}, Symbol.toStringTag, { value: 'Module' }));

const action$3 = async () => {
  return json$1({ error: "Not available in this environment." }, { status: 501 });
};

const route18 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: 'Module' }));

class SwitchableStream extends TransformStream {
  _controller = null;
  _currentReader = null;
  _switches = 0;
  constructor() {
    let controllerRef;
    super({
      start(controller) {
        controllerRef = controller;
      }
    });
    if (controllerRef === void 0) {
      throw new Error("Controller not properly initialized");
    }
    this._controller = controllerRef;
  }
  async switchSource(newStream) {
    if (this._currentReader) {
      await this._currentReader.cancel();
    }
    this._currentReader = newStream.getReader();
    this._pumpStream();
    this._switches++;
  }
  async _pumpStream() {
    if (!this._currentReader || !this._controller) {
      throw new Error("Stream is not properly initialized");
    }
    try {
      while (true) {
        const { done, value } = await this._currentReader.read();
        if (done) {
          break;
        }
        this._controller.enqueue(value);
      }
    } catch (error) {
      console.log(error);
      this._controller.error(error);
    }
  }
  close() {
    if (this._currentReader) {
      this._currentReader.cancel();
    }
    this._controller?.terminate();
  }
  get switches() {
    return this._switches;
  }
}

const logger$2 = createScopedLogger("create-summary");
async function createSummary(props) {
  const { messages, env: serverEnv, apiKeys, providerSettings, onFinish } = props;
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER.name;
  const processedMessages = messages.map((message) => {
    if (message.role === "user") {
      const { model, provider: provider2, content } = extractPropertiesFromMessage(message);
      currentModel = model;
      currentProvider = provider2;
      return { ...message, content };
    } else if (message.role == "assistant") {
      let content = message.content;
      content = simplifyBoltActions(content);
      content = content.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, "");
      content = content.replace(/<think>.*?<\/think>/s, "");
      return { ...message, content };
    }
    return message;
  });
  const provider = PROVIDER_LIST.find((p) => p.name === currentProvider) || DEFAULT_PROVIDER;
  const staticModels = LLMManager.getInstance().getStaticModelListFromProvider(provider);
  let modelDetails = staticModels.find((m) => m.name === currentModel);
  if (!modelDetails) {
    const modelsList = [
      ...provider.staticModels || [],
      ...await LLMManager.getInstance().getModelListFromProvider(provider, {
        apiKeys,
        providerSettings,
        serverEnv
      })
    ];
    if (!modelsList.length) {
      throw new Error(`No models found for provider ${provider.name}`);
    }
    modelDetails = modelsList.find((m) => m.name === currentModel);
    if (!modelDetails) {
      logger$2.warn(
        `MODEL [${currentModel}] not found in provider [${provider.name}]. Falling back to first model. ${modelsList[0].name}`
      );
      modelDetails = modelsList[0];
    }
  }
  let slicedMessages = processedMessages;
  const { summary } = extractCurrentContext(processedMessages);
  let summaryText = void 0;
  let chatId = void 0;
  if (summary && summary.type === "chatSummary") {
    chatId = summary.chatId;
    summaryText = `Below is the Chat Summary till now, this is chat summary before the conversation provided by the user 
you should also use this as historical message while providing the response to the user.        
${summary.summary}`;
    if (chatId) {
      let index = 0;
      for (let i = 0; i < processedMessages.length; i++) {
        if (processedMessages[i].id === chatId) {
          index = i;
          break;
        }
      }
      slicedMessages = processedMessages.slice(index + 1);
    }
  }
  logger$2.debug("Sliced Messages:", slicedMessages.length);
  const extractTextContent = (message) => Array.isArray(message.content) ? message.content.find((item) => item.type === "text")?.text || "" : message.content;
  const resp = await generateText({
    system: `
        You are a software engineer. You are working on a project. you need to summarize the work till now and provide a summary of the chat till now.

        Please only use the following format to generate the summary:
---
# Project Overview
- **Project**: {project_name} - {brief_description}
- **Current Phase**: {phase}
- **Tech Stack**: {languages}, {frameworks}, {key_dependencies}
- **Environment**: {critical_env_details}

# Conversation Context
- **Last Topic**: {main_discussion_point}
- **Key Decisions**: {important_decisions_made}
- **User Context**:
  - Technical Level: {expertise_level}
  - Preferences: {coding_style_preferences}
  - Communication: {preferred_explanation_style}

# Implementation Status
## Current State
- **Active Feature**: {feature_in_development}
- **Progress**: {what_works_and_what_doesn't}
- **Blockers**: {current_challenges}

## Code Evolution
- **Recent Changes**: {latest_modifications}
- **Working Patterns**: {successful_approaches}
- **Failed Approaches**: {attempted_solutions_that_failed}

# Requirements
- **Implemented**: {completed_features}
- **In Progress**: {current_focus}
- **Pending**: {upcoming_features}
- **Technical Constraints**: {critical_constraints}

# Critical Memory
- **Must Preserve**: {crucial_technical_context}
- **User Requirements**: {specific_user_needs}
- **Known Issues**: {documented_problems}

# Next Actions
- **Immediate**: {next_steps}
- **Open Questions**: {unresolved_issues}

---
Note:
4. Keep entries concise and focused on information needed for continuity


---
        
        RULES:
        * Only provide the whole summary of the chat till now.
        * Do not provide any new information.
        * DO not need to think too much just start writing imidiately
        * do not write any thing other that the summary with with the provided structure
        `,
    prompt: `

Here is the previous summary of the chat:
<old_summary>
${summaryText} 
</old_summary>

Below is the chat after that:
---
<new_chats>
${slicedMessages.map((x) => {
      return `---
[${x.role}] ${extractTextContent(x)}
---`;
    }).join("\n")}
</new_chats>
---

Please provide a summary of the chat till now including the hitorical summary of the chat.
`,
    model: provider.getModelInstance({
      model: currentModel,
      serverEnv,
      apiKeys,
      providerSettings
    })
  });
  const response = resp.text;
  if (onFinish) {
    onFinish(resp);
  }
  return response;
}

async function action$2(args) {
  return chatAction(args);
}
const logger$1 = createScopedLogger("api.chat");
function parseCookies(cookieHeader) {
  const cookies = {};
  const items = cookieHeader.split(";").map((cookie) => cookie.trim());
  items.forEach((item) => {
    const [name, ...rest] = item.split("=");
    if (name && rest) {
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join("=").trim());
      cookies[decodedName] = decodedValue;
    }
  });
  return cookies;
}
async function chatAction({ context, request }) {
  const { messages, files, promptId, contextOptimization } = await request.json();
  const cookieHeader = request.headers.get("Cookie");
  const apiKeys = JSON.parse(parseCookies(cookieHeader || "").apiKeys || "{}");
  const providerSettings = JSON.parse(
    parseCookies(cookieHeader || "").providers || "{}"
  );
  const stream = new SwitchableStream();
  const cumulativeUsage = {
    completionTokens: 0,
    promptTokens: 0,
    totalTokens: 0
  };
  const encoder = new TextEncoder();
  let progressCounter = 1;
  try {
    const totalMessageContent = messages.reduce((acc, message) => acc + message.content, "");
    logger$1.debug(`Total message length: ${totalMessageContent.split(" ").length}, words`);
    let lastChunk = void 0;
    const dataStream = createDataStream({
      async execute(dataStream2) {
        const filePaths = getFilePaths(files || {});
        let filteredFiles = void 0;
        let summary = void 0;
        let messageSliceId = 0;
        if (messages.length > 3) {
          messageSliceId = messages.length - 3;
        }
        if (filePaths.length > 0 && contextOptimization) {
          logger$1.debug("Generating Chat Summary");
          dataStream2.writeData({
            type: "progress",
            label: "summary",
            status: "in-progress",
            order: progressCounter++,
            message: "Analysing Request"
          });
          console.log(`Messages count: ${messages.length}`);
          summary = await createSummary({
            messages: [...messages],
            env: context.cloudflare?.env,
            apiKeys,
            providerSettings,
            promptId,
            contextOptimization,
            onFinish(resp) {
              if (resp.usage) {
                logger$1.debug("createSummary token usage", JSON.stringify(resp.usage));
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            }
          });
          dataStream2.writeData({
            type: "progress",
            label: "summary",
            status: "complete",
            order: progressCounter++,
            message: "Analysis Complete"
          });
          dataStream2.writeMessageAnnotation({
            type: "chatSummary",
            summary,
            chatId: messages.slice(-1)?.[0]?.id
          });
          logger$1.debug("Updating Context Buffer");
          dataStream2.writeData({
            type: "progress",
            label: "context",
            status: "in-progress",
            order: progressCounter++,
            message: "Determining Files to Read"
          });
          console.log(`Messages count: ${messages.length}`);
          filteredFiles = await selectContext({
            messages: [...messages],
            env: context.cloudflare?.env,
            apiKeys,
            files,
            providerSettings,
            promptId,
            contextOptimization,
            summary,
            onFinish(resp) {
              if (resp.usage) {
                logger$1.debug("selectContext token usage", JSON.stringify(resp.usage));
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            }
          });
          if (filteredFiles) {
            logger$1.debug(`files in context : ${JSON.stringify(Object.keys(filteredFiles))}`);
          }
          dataStream2.writeMessageAnnotation({
            type: "codeContext",
            files: Object.keys(filteredFiles).map((key) => {
              let path = key;
              if (path.startsWith(WORK_DIR)) {
                path = path.replace(WORK_DIR, "");
              }
              return path;
            })
          });
          dataStream2.writeData({
            type: "progress",
            label: "context",
            status: "complete",
            order: progressCounter++,
            message: "Code Files Selected"
          });
        }
        const options = {
          toolChoice: "none",
          onFinish: async ({ text: content, finishReason, usage }) => {
            logger$1.debug("usage", JSON.stringify(usage));
            if (usage) {
              cumulativeUsage.completionTokens += usage.completionTokens || 0;
              cumulativeUsage.promptTokens += usage.promptTokens || 0;
              cumulativeUsage.totalTokens += usage.totalTokens || 0;
            }
            if (finishReason !== "length") {
              dataStream2.writeMessageAnnotation({
                type: "usage",
                value: {
                  completionTokens: cumulativeUsage.completionTokens,
                  promptTokens: cumulativeUsage.promptTokens,
                  totalTokens: cumulativeUsage.totalTokens
                }
              });
              dataStream2.writeData({
                type: "progress",
                label: "response",
                status: "complete",
                order: progressCounter++,
                message: "Response Generated"
              });
              await new Promise((resolve) => setTimeout(resolve, 0));
              return;
            }
            if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
              throw Error("Cannot continue message: Maximum segments reached");
            }
            const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;
            logger$1.info(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);
            const lastUserMessage = messages.filter((x) => x.role == "user").slice(-1)[0];
            const { model, provider } = extractPropertiesFromMessage(lastUserMessage);
            messages.push({ id: generateId$1(), role: "assistant", content });
            messages.push({
              id: generateId$1(),
              role: "user",
              content: `[Model: ${model}]

[Provider: ${provider}]

${CONTINUE_PROMPT}`
            });
            const result2 = await streamText({
              messages,
              env: context.cloudflare?.env,
              options,
              apiKeys,
              files,
              providerSettings,
              promptId,
              contextOptimization,
              contextFiles: filteredFiles,
              summary,
              messageSliceId
            });
            result2.mergeIntoDataStream(dataStream2);
            (async () => {
              for await (const part of result2.fullStream) {
                if (part.type === "error") {
                  const error = part.error;
                  logger$1.error(`${error}`);
                  return;
                }
              }
            })();
            return;
          }
        };
        dataStream2.writeData({
          type: "progress",
          label: "response",
          status: "in-progress",
          order: progressCounter++,
          message: "Generating Response"
        });
        const result = await streamText({
          messages,
          env: context.cloudflare?.env,
          options,
          apiKeys,
          files,
          providerSettings,
          promptId,
          contextOptimization,
          contextFiles: filteredFiles,
          summary,
          messageSliceId
        });
        (async () => {
          for await (const part of result.fullStream) {
            if (part.type === "error") {
              const error = part.error;
              logger$1.error(`${error}`);
              return;
            }
          }
        })();
        result.mergeIntoDataStream(dataStream2);
      },
      onError: (error) => `Custom error: ${error.message}`
    }).pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          if (!lastChunk) {
            lastChunk = " ";
          }
          if (typeof chunk === "string") {
            if (chunk.startsWith("g") && !lastChunk.startsWith("g")) {
              controller.enqueue(encoder.encode(`0: "<div class=\\"__boltThought__\\">"
`));
            }
            if (lastChunk.startsWith("g") && !chunk.startsWith("g")) {
              controller.enqueue(encoder.encode(`0: "</div>\\n"
`));
            }
          }
          lastChunk = chunk;
          let transformedChunk = chunk;
          if (typeof chunk === "string" && chunk.startsWith("g")) {
            let content = chunk.split(":").slice(1).join(":");
            if (content.endsWith("\n")) {
              content = content.slice(0, content.length - 1);
            }
            transformedChunk = `0:${content}
`;
          }
          const str = typeof transformedChunk === "string" ? transformedChunk : JSON.stringify(transformedChunk);
          controller.enqueue(encoder.encode(str));
        }
      })
    );
    return new Response(dataStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        "Text-Encoding": "chunked"
      }
    });
  } catch (error) {
    logger$1.error(error);
    if (error.message?.includes("API key")) {
      throw new Response("Invalid or missing API key", {
        status: 401,
        statusText: "Unauthorized"
      });
    }
    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}

const route19 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: 'Module' }));

const MESSAGE_LIMITS = {
  free: 10,
  starter: 100,
  pro: 300,
  default: 10
  // Default limit for unknown plans
};
function useMessageLimit(isAuthenticated, user) {
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        setMonthlyLimit(Infinity);
        return;
      }
      const plan = user.plan?.toLowerCase() || "free";
      setMonthlyLimit(
        plan in MESSAGE_LIMITS ? MESSAGE_LIMITS[plan] : MESSAGE_LIMITS.default
      );
    } else {
      setMonthlyLimit(1);
    }
  }, [isAuthenticated, user]);
  useEffect(() => {
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + "-" + (/* @__PURE__ */ new Date()).getFullYear();
    const storedMonthKey = localStorage.getItem("messageCountMonth");
    if (storedMonthKey !== currentMonth) {
      localStorage.setItem("messageCountMonth", currentMonth);
      localStorage.setItem("messageCount", "0");
      setMessageCount(0);
      return;
    }
    const storedCount = localStorage.getItem("messageCount");
    if (storedCount) {
      setMessageCount(parseInt(storedCount, 10));
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);
  const incrementMessageCount = () => {
    if (isAuthenticated && user?.role === "admin") {
      return true;
    }
    const newCount = messageCount + 1;
    if (!isAuthenticated && newCount > 1) {
      setShowLoginPrompt(true);
      return false;
    }
    if (isAuthenticated && newCount > monthlyLimit) {
      setShowSubscriptionPlans(true);
      return false;
    }
    setMessageCount(newCount);
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + "-" + (/* @__PURE__ */ new Date()).getFullYear();
    localStorage.setItem("messageCountMonth", currentMonth);
    localStorage.setItem("messageCount", newCount.toString());
    return true;
  };
  const resetMessageCount = () => {
    setMessageCount(0);
    localStorage.setItem("messageCount", "0");
  };
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };
  const closeSubscriptionPlans = () => {
    setShowSubscriptionPlans(false);
  };
  return {
    messageCount,
    monthlyLimit,
    showLoginPrompt,
    showSubscriptionPlans,
    incrementMessageCount,
    resetMessageCount,
    closeLoginPrompt,
    closeSubscriptionPlans,
    canSendMessage: isAuthenticated ? user?.role === "admin" || messageCount < monthlyLimit : messageCount < 1
  };
}

const EXPORT_LIMITS = {
  free: 0,
  // Free users cannot export
  starter: 4,
  // Starter users can export up to 4 conversations
  pro: 20,
  // Pro users can export up to 20 conversations
  admin: Infinity,
  // Admin users have unlimited exports
  default: 0
  // Default limit for unknown plans
};
function useExportLimit(isAuthenticated, user) {
  const [exportCount, setExportCount] = useState(0);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        setMonthlyLimit(Infinity);
        return;
      }
      const plan = user.plan?.toLowerCase() || "free";
      setMonthlyLimit(
        plan in EXPORT_LIMITS ? EXPORT_LIMITS[plan] : EXPORT_LIMITS.default
      );
    } else {
      setMonthlyLimit(0);
    }
  }, [isAuthenticated, user]);
  useEffect(() => {
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + "-" + (/* @__PURE__ */ new Date()).getFullYear();
    const storedMonthKey = localStorage.getItem("exportCountMonth");
    if (storedMonthKey !== currentMonth) {
      localStorage.setItem("exportCountMonth", currentMonth);
      localStorage.setItem("exportCount", "0");
      setExportCount(0);
      return;
    }
    const storedCount = localStorage.getItem("exportCount");
    if (storedCount) {
      setExportCount(parseInt(storedCount, 10));
    }
  }, [isAuthenticated]);
  const incrementExportCount = () => {
    if (isAuthenticated && user?.role === "admin") {
      return true;
    }
    if (isAuthenticated && user?.plan?.toLowerCase() === "free") {
      setShowSubscriptionPlans(true);
      return false;
    }
    const newCount = exportCount + 1;
    if (isAuthenticated && newCount > monthlyLimit) {
      setShowSubscriptionPlans(true);
      return false;
    }
    setExportCount(newCount);
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + "-" + (/* @__PURE__ */ new Date()).getFullYear();
    localStorage.setItem("exportCountMonth", currentMonth);
    localStorage.setItem("exportCount", newCount.toString());
    return true;
  };
  const resetExportCount = () => {
    setExportCount(0);
    localStorage.setItem("exportCount", "0");
  };
  const closeSubscriptionPlans = () => {
    setShowSubscriptionPlans(false);
  };
  return {
    exportCount,
    monthlyLimit,
    showSubscriptionPlans,
    incrementExportCount,
    resetExportCount,
    closeSubscriptionPlans,
    canExport: isAuthenticated ? user?.role === "admin" || user?.plan?.toLowerCase() !== "free" && exportCount < monthlyLimit : false
  };
}

const SubscriptionPlansPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] rounded-lg p-8 w-full max-w-5xl relative overflow-auto max-h-[90vh]", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-gray-300 bg-transparent border-0 outline-none p-0",
        children: /* @__PURE__ */ jsx("div", { className: "i-ph:x text-xl" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "Acabou as mensagens?" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-300", children: "Volte mês que vem ou assine um dos nossos planos para ter mais mensagens!" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0a0c] rounded-lg p-6 flex flex-col h-full", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: "Starter" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 mb-6", children: "Ideal para uso pessoal" }),
        /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold text-white mb-6", children: [
          "R$149,99",
          /* @__PURE__ */ jsx("span", { className: "text-lg font-normal text-gray-400", children: "/mês" })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://buy.stripe.com/8wMdSa5kfaH83GU6ou",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-3 rounded-md mb-8 font-medium text-center",
            children: "Assinar Agora"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "100 mensagens por mês" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "4 exportações de chat" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Acesso a todos os modelos" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Suporte por email" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0a0c] rounded-lg p-6 flex flex-col h-full relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0", children: /* @__PURE__ */ jsx("div", { className: "bg-blue-600 text-white px-4 py-1 font-medium", children: "Popular" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: "Pro" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 mb-6", children: "Para profissionais e equipes" }),
        /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold text-white mb-6", children: [
          "R$349,99",
          /* @__PURE__ */ jsx("span", { className: "text-lg font-normal text-gray-400", children: "/mês" })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://buy.stripe.com/3cs6pIh2XbLcfpCbIP",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md mb-8 font-medium text-center",
            children: "Assinar Agora"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "300 mensagens por mês" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "20 exportações de chat" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Acesso prioritário a novos recursos" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Acesso a todos os modelos" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Suporte prioritário" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mr-3 mt-1", children: /* @__PURE__ */ jsx("div", { className: "i-ph:check-circle-fill text-lg" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: "Recursos avançados de personalização" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
};

const Menu = undefined;

function classNames(...args) {
  let classes = "";
  for (const arg of args) {
    classes = appendClass(classes, parseValue(arg));
  }
  return classes;
}
function parseValue(arg) {
  if (typeof arg === "string" || typeof arg === "number") {
    return arg;
  }
  if (typeof arg !== "object") {
    return "";
  }
  if (Array.isArray(arg)) {
    return classNames(...arg);
  }
  let classes = "";
  for (const key in arg) {
    if (arg[key]) {
      classes = appendClass(classes, key);
    }
  }
  return classes;
}
function appendClass(value, newClass) {
  if (!newClass) {
    return value;
  }
  if (value) {
    return value + " " + newClass;
  }
  return value + newClass;
}

const IconButton = memo(
  forwardRef(
    ({
      icon,
      size = "xl",
      className,
      iconClassName,
      disabledClassName,
      disabled = false,
      title,
      onClick,
      children
    }, ref) => {
      return /* @__PURE__ */ jsx(
        "button",
        {
          ref,
          className: classNames(
            "flex items-center text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md p-1 enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed",
            {
              [classNames("opacity-30", disabledClassName)]: disabled
            },
            className
          ),
          title,
          disabled,
          onClick: (event) => {
            if (disabled) {
              return;
            }
            onClick?.(event);
          },
          children: children ? children : /* @__PURE__ */ jsx("div", { className: classNames(icon, getIconSize(size), iconClassName) })
        }
      );
    }
  )
);
function getIconSize(size) {
  if (size === "sm") {
    return "text-sm";
  } else if (size === "md") {
    return "text-md";
  } else if (size === "lg") {
    return "text-lg";
  } else if (size === "xl") {
    return "text-xl";
  } else {
    return "text-2xl";
  }
}

const Workbench = undefined;

const Messages = undefined;

const SendButton = undefined;

const BaseChat$1 = "s";
const Chat$1 = "t";
const PromptEffectContainer = "u";
const PromptEffectLine = "v";
const PromptShine = "w";
const styles$1 = {
	BaseChat: BaseChat$1,
	Chat: Chat$1,
	PromptEffectContainer: PromptEffectContainer,
	PromptEffectLine: PromptEffectLine,
	PromptShine: PromptShine
};

const WithTooltip = forwardRef(
  ({
    tooltip,
    children,
    sideOffset = 5,
    className = "",
    arrowClassName = "",
    tooltipStyle = {},
    position = "top",
    maxWidth = 250,
    delay = 0
  }, _ref) => {
    return /* @__PURE__ */ jsxs(Tooltip.Root, { delayDuration: delay, children: [
      /* @__PURE__ */ jsx(Tooltip.Trigger, { asChild: true, children }),
      /* @__PURE__ */ jsx(Tooltip.Portal, { children: /* @__PURE__ */ jsxs(
        Tooltip.Content,
        {
          side: position,
          className: `
              z-[2000]
              px-2.5
              py-1.5
              max-h-[300px]
              select-none
              rounded-md
              bg-bolt-elements-background-depth-3
              text-bolt-elements-textPrimary
              text-sm
              leading-tight
              shadow-lg
              animate-in
              fade-in-0
              zoom-in-95
              data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0
              data-[state=closed]:zoom-out-95
              ${className}
            `,
          sideOffset,
          style: {
            maxWidth,
            ...tooltipStyle
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "break-words", children: tooltip }),
            /* @__PURE__ */ jsx(
              Tooltip.Arrow,
              {
                className: `
                fill-bolt-elements-background-depth-3
                ${arrowClassName}
              `,
                width: 12,
                height: 6
              }
            )
          ]
        }
      ) })
    ] });
  }
);

const ExportChatButton = ({ exportChat }) => {
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user;
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, []);
  const {
    exportCount,
    monthlyLimit,
    showSubscriptionPlans,
    incrementExportCount,
    closeSubscriptionPlans,
    canExport
  } = useExportLimit(isAuthenticated, user);
  const handleExport = () => {
    if (!canExport) {
      incrementExportCount();
      return;
    }
    const canExportNow = incrementExportCount();
    if (!canExportNow) {
      return;
    }
    exportChat?.();
    const remaining = monthlyLimit - exportCount - 1;
    if (remaining > 0) {
      toast.success(`Chat exported! You have ${remaining} exports remaining this month.`);
    } else if (remaining === 0) {
      toast.warning(`Chat exported! This was your last export for this month.`);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(WithTooltip, { tooltip: canExport ? "Export Chat" : "Export limit reached", children: /* @__PURE__ */ jsx(
      IconButton,
      {
        title: "Export Chat",
        onClick: handleExport,
        disabled: !canExport,
        className: !canExport ? "opacity-50 cursor-not-allowed" : "",
        children: /* @__PURE__ */ jsx("div", { className: "i-ph:download-simple text-xl" })
      }
    ) }),
    /* @__PURE__ */ jsx(
      SubscriptionPlansPopup,
      {
        isOpen: showSubscriptionPlans,
        onClose: closeSubscriptionPlans
      }
    )
  ] });
};

const IGNORE_PATTERNS$1 = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
  ".cache/**",
  ".vscode/**",
  ".idea/**",
  "**/*.log",
  "**/.DS_Store",
  "**/npm-debug.log*",
  "**/yarn-debug.log*",
  "**/yarn-error.log*"
];
const MAX_FILES = 1e3;
const ig$1 = ignore().add(IGNORE_PATTERNS$1);
const generateId = () => Math.random().toString(36).substring(2, 15);
const isBinaryFile = async (file) => {
  const chunkSize = 1024;
  const buffer = new Uint8Array(await file.slice(0, chunkSize).arrayBuffer());
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte === 0 || byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      return true;
    }
  }
  return false;
};
const shouldIncludeFile = (path) => {
  return !ig$1.ignores(path);
};

async function detectProjectCommands(files) {
  const hasFile = (name) => files.some((f) => f.path.endsWith(name));
  if (hasFile("package.json")) {
    const packageJsonFile = files.find((f) => f.path.endsWith("package.json"));
    if (!packageJsonFile) {
      return { type: "", setupCommand: "", followupMessage: "" };
    }
    try {
      const packageJson = JSON.parse(packageJsonFile.content);
      const scripts = packageJson?.scripts || {};
      const preferredCommands = ["dev", "start", "preview"];
      const availableCommand = preferredCommands.find((cmd) => scripts[cmd]);
      if (availableCommand) {
        return {
          type: "Node.js",
          setupCommand: `npm install`,
          startCommand: `npm run ${availableCommand}`,
          followupMessage: `Found "${availableCommand}" script in package.json. Running "npm run ${availableCommand}" after installation.`
        };
      }
      return {
        type: "Node.js",
        setupCommand: "npm install",
        followupMessage: "Would you like me to inspect package.json to determine the available scripts for running this project?"
      };
    } catch (error) {
      console.error("Error parsing package.json:", error);
      return { type: "", setupCommand: "", followupMessage: "" };
    }
  }
  if (hasFile("index.html")) {
    return {
      type: "Static",
      startCommand: "npx --yes serve",
      followupMessage: ""
    };
  }
  return { type: "", setupCommand: "", followupMessage: "" };
}
function createCommandsMessage(commands) {
  if (!commands.setupCommand && !commands.startCommand) {
    return null;
  }
  let commandString = "";
  if (commands.setupCommand) {
    commandString += `
<boltAction type="shell">${commands.setupCommand}</boltAction>`;
  }
  if (commands.startCommand) {
    commandString += `
<boltAction type="start">${commands.startCommand}</boltAction>
`;
  }
  return {
    role: "assistant",
    content: `
<boltArtifact id="project-setup" title="Project Setup">
${commandString}
</boltArtifact>${commands.followupMessage ? `

${commands.followupMessage}` : ""}`,
    id: generateId(),
    createdAt: /* @__PURE__ */ new Date()
  };
}
function escapeBoltArtifactTags(input) {
  const regex = /(<boltArtifact[^>]*>)([\s\S]*?)(<\/boltArtifact>)/g;
  return input.replace(regex, (match, openTag, content, closeTag) => {
    const escapedOpenTag = openTag.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedCloseTag = closeTag.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `${escapedOpenTag}${content}${escapedCloseTag}`;
  });
}
function escapeBoltAActionTags(input) {
  const regex = /(<boltAction[^>]*>)([\s\S]*?)(<\/boltAction>)/g;
  return input.replace(regex, (match, openTag, content, closeTag) => {
    const escapedOpenTag = openTag.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedCloseTag = closeTag.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `${escapedOpenTag}${content}${escapedCloseTag}`;
  });
}
function escapeBoltTags(input) {
  return escapeBoltArtifactTags(escapeBoltAActionTags(input));
}

const createChatFromFolder = async (files, binaryFiles, folderName) => {
  const fileArtifacts = await Promise.all(
    files.map(async (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          const relativePath = file.webkitRelativePath.split("/").slice(1).join("/");
          resolve({
            content,
            path: relativePath
          });
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    })
  );
  const commands = await detectProjectCommands(fileArtifacts);
  const commandsMessage = createCommandsMessage(commands);
  const binaryFilesMessage = binaryFiles.length > 0 ? `

Skipped ${binaryFiles.length} binary files:
${binaryFiles.map((f) => `- ${f}`).join("\n")}` : "";
  const filesMessage = {
    role: "assistant",
    content: `I've imported the contents of the "${folderName}" folder.${binaryFilesMessage}

<boltArtifact id="imported-files" title="Imported Files" type="bundled" >
${fileArtifacts.map(
      (file) => `<boltAction type="file" filePath="${file.path}">
${escapeBoltTags(file.content)}
</boltAction>`
    ).join("\n\n")}
</boltArtifact>`,
    id: generateId(),
    createdAt: /* @__PURE__ */ new Date()
  };
  const userMessage = {
    role: "user",
    id: generateId(),
    content: `Import the "${folderName}" folder`,
    createdAt: /* @__PURE__ */ new Date()
  };
  const messages = [userMessage, filesMessage];
  if (commandsMessage) {
    messages.push({
      role: "user",
      id: generateId(),
      content: "Setup the codebase and Start the application"
    });
    messages.push(commandsMessage);
  }
  return messages;
};

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bolt-elements-borderColor disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-bolt-elements-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-input bg-transparent hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary",
        secondary: "bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2",
        ghost: "hover:bg-bolt-elements-background-depth-1 hover:text-bolt-elements-textPrimary",
        link: "text-bolt-elements-textPrimary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button$1 = React.forwardRef(
  ({ className, variant, size, _asChild = false, ...props }, ref) => {
    return /* @__PURE__ */ jsx("button", { className: classNames(buttonVariants({ variant, size }), className), ref, ...props });
  }
);
Button$1.displayName = "Button";

const ImportFolderButton = ({ className, importChat }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = async (e) => {
    const allFiles = Array.from(e.target.files || []);
    const filteredFiles = allFiles.filter((file) => {
      const path = file.webkitRelativePath.split("/").slice(1).join("/");
      const include = shouldIncludeFile(path);
      return include;
    });
    if (filteredFiles.length === 0) {
      const error = new Error("No valid files found");
      logStore.logError("File import failed - no valid files", error, { folderName: "Unknown Folder" });
      toast.error("No files found in the selected folder");
      return;
    }
    if (filteredFiles.length > MAX_FILES) {
      const error = new Error(`Too many files: ${filteredFiles.length}`);
      logStore.logError("File import failed - too many files", error, {
        fileCount: filteredFiles.length,
        maxFiles: MAX_FILES
      });
      toast.error(
        `This folder contains ${filteredFiles.length.toLocaleString()} files. This product is not yet optimized for very large projects. Please select a folder with fewer than ${MAX_FILES.toLocaleString()} files.`
      );
      return;
    }
    const folderName = filteredFiles[0]?.webkitRelativePath.split("/")[0] || "Unknown Folder";
    setIsLoading(true);
    const loadingToast = toast.loading(`Importing ${folderName}...`);
    try {
      const fileChecks = await Promise.all(
        filteredFiles.map(async (file) => ({
          file,
          isBinary: await isBinaryFile(file)
        }))
      );
      const textFiles = fileChecks.filter((f) => !f.isBinary).map((f) => f.file);
      const binaryFilePaths = fileChecks.filter((f) => f.isBinary).map((f) => f.file.webkitRelativePath.split("/").slice(1).join("/"));
      if (textFiles.length === 0) {
        const error = new Error("No text files found");
        logStore.logError("File import failed - no text files", error, { folderName });
        toast.error("No text files found in the selected folder");
        return;
      }
      if (binaryFilePaths.length > 0) {
        logStore.logWarning(`Skipping binary files during import`, {
          folderName,
          binaryCount: binaryFilePaths.length
        });
        toast.info(`Skipping ${binaryFilePaths.length} binary files`);
      }
      const messages = await createChatFromFolder(textFiles, binaryFilePaths, folderName);
      if (importChat) {
        await importChat(folderName, [...messages]);
      }
      logStore.logSystem("Folder imported successfully", {
        folderName,
        textFileCount: textFiles.length,
        binaryFileCount: binaryFilePaths.length
      });
      toast.success("Folder imported successfully");
    } catch (error) {
      logStore.logError("Failed to import folder", error, { folderName });
      console.error("Failed to import folder:", error);
      toast.error("Failed to import folder");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
      e.target.value = "";
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        id: "folder-import",
        className: "hidden",
        webkitdirectory: "",
        directory: "",
        onChange: handleFileChange,
        ...{}
      }
    ),
    /* @__PURE__ */ jsxs(
      Button$1,
      {
        onClick: () => {
          const input = document.getElementById("folder-import");
          input?.click();
        },
        title: "Import Folder",
        variant: "outline",
        size: "lg",
        className: classNames(
          "gap-2 bg-[#F5F5F5] dark:bg-[#252525]",
          "text-bolt-elements-textPrimary dark:text-white",
          "hover:bg-[#E5E5E5] dark:hover:bg-[#333333]",
          "border-[#E5E5E5] dark:border-[#333333]",
          "h-10 px-4 py-2 min-w-[120px] justify-center",
          "transition-all duration-200 ease-in-out",
          className
        ),
        disabled: isLoading,
        children: [
          /* @__PURE__ */ jsx("span", { className: "i-ph:upload-simple w-4 h-4" }),
          isLoading ? "Importing..." : "Import Folder"
        ]
      }
    )
  ] });
};

function ImportButtons(importChat) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center w-auto", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        id: "chat-import",
        className: "hidden",
        accept: ".json",
        onChange: async (e) => {
          const file = e.target.files?.[0];
          if (file && importChat) {
            try {
              const reader = new FileReader();
              reader.onload = async (e2) => {
                try {
                  const content = e2.target?.result;
                  const data = JSON.parse(content);
                  if (Array.isArray(data.messages)) {
                    await importChat(data.description || "Imported Chat", data.messages);
                    toast.success("Chat imported successfully");
                    return;
                  }
                  toast.error("Invalid chat file format");
                } catch (error) {
                  if (error instanceof Error) {
                    toast.error("Failed to parse chat file: " + error.message);
                  } else {
                    toast.error("Failed to parse chat file");
                  }
                }
              };
              reader.onerror = () => toast.error("Failed to read chat file");
              reader.readAsText(file);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to import chat");
            }
            e.target.value = "";
          } else {
            toast.error("Something went wrong");
          }
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-4 max-w-2xl text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(
        Button$1,
        {
          onClick: () => {
            const input = document.getElementById("chat-import");
            input?.click();
          },
          variant: "outline",
          size: "lg",
          className: classNames(
            "gap-2 bg-[#F5F5F5] dark:bg-[#252525]",
            "text-bolt-elements-textPrimary dark:text-white",
            "hover:bg-[#E5E5E5] dark:hover:bg-[#333333]",
            "border-[#E5E5E5] dark:border-[#333333]",
            "h-10 px-4 py-2 min-w-[120px] justify-center",
            "transition-all duration-200 ease-in-out"
          ),
          children: [
            /* @__PURE__ */ jsx("span", { className: "i-ph:upload-simple w-4 h-4" }),
            "Import Chat"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        ImportFolderButton,
        {
          importChat,
          className: classNames(
            "gap-2 bg-[#F5F5F5] dark:bg-[#252525]",
            "text-bolt-elements-textPrimary dark:text-white",
            "hover:bg-[#E5E5E5] dark:hover:bg-[#333333]",
            "border border-[#E5E5E5] dark:border-[#333333]",
            "h-10 px-4 py-2 min-w-[120px] justify-center",
            "transition-all duration-200 ease-in-out rounded-lg"
          )
        }
      )
    ] }) })
  ] });
}

const EXAMPLE_PROMPTS = [
  { text: "Build a todo app in React using Tailwind" },
  { text: "Build a simple blog using Astro" },
  { text: "Create a cookie consent form using Material UI" },
  { text: "Make a space invaders game" },
  { text: "Make a Tic Tac Toe game in html, css and js only" }
];
function ExamplePrompts(sendMessage) {
  return /* @__PURE__ */ jsx("div", { id: "examples", className: "relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex flex-wrap justify-center gap-2",
      style: {
        animation: ".25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards"
      },
      children: EXAMPLE_PROMPTS.map((examplePrompt, index) => {
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (event) => {
              sendMessage?.(event, examplePrompt.text);
            },
            className: "border border-bolt-elements-borderColor rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary px-3 py-1 text-xs transition-theme",
            children: examplePrompt.text
          },
          index
        );
      })
    }
  ) });
}

let webcontainer = new Promise(() => {
});

const lookupSavedPassword = (url) => {
  const domain = url.split("/")[2];
  const gitCreds = Cookies.get(`git:${domain}`);
  if (!gitCreds) {
    return null;
  }
  try {
    const { username, password } = JSON.parse(gitCreds || "{}");
    return { username, password };
  } catch (error) {
    console.log(`Failed to parse Git Cookie ${error}`);
    return null;
  }
};
const saveGitAuth = (url, auth) => {
  const domain = url.split("/")[2];
  Cookies.set(`git:${domain}`, JSON.stringify(auth));
};
function useGit() {
  const [ready, setReady] = useState(false);
  const [webcontainer$1, setWebcontainer] = useState();
  const [fs, setFs] = useState();
  const fileData = useRef({});
  useEffect(() => {
    webcontainer.then((container) => {
      fileData.current = {};
      setWebcontainer(container);
      setFs(getFs(container, fileData));
      setReady(true);
    });
  }, []);
  const gitClone = useCallback(
    async (url) => {
      if (!webcontainer$1 || !fs || !ready) {
        throw "Webcontainer not initialized";
      }
      fileData.current = {};
      const headers = {
        "User-Agent": "bolt.diy"
      };
      const auth = lookupSavedPassword(url);
      if (auth) {
        headers.Authorization = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString("base64")}`;
      }
      try {
        await git.clone({
          fs,
          http,
          dir: webcontainer$1.workdir,
          url,
          depth: 1,
          singleBranch: true,
          corsProxy: "/api/git-proxy",
          headers,
          onAuth: (url2) => {
            let auth2 = lookupSavedPassword(url2);
            if (auth2) {
              return auth2;
            }
            if (confirm("This repo is password protected. Ready to enter a username & password?")) {
              auth2 = {
                username: prompt("Enter username"),
                password: prompt("Enter password")
              };
              return auth2;
            } else {
              return { cancel: true };
            }
          },
          onAuthFailure: (url2, _auth) => {
            toast.error(`Error Authenticating with ${url2.split("/")[2]}`);
            throw `Error Authenticating with ${url2.split("/")[2]}`;
          },
          onAuthSuccess: (url2, auth2) => {
            saveGitAuth(url2, auth2);
          }
        });
        const data = {};
        for (const [key, value] of Object.entries(fileData.current)) {
          data[key] = value;
        }
        return { workdir: webcontainer$1.workdir, data };
      } catch (error) {
        console.error("Git clone error:", error);
        throw error;
      }
    },
    [webcontainer$1, fs, ready]
  );
  return { ready, gitClone };
}
const getFs = (webcontainer, record) => ({
  promises: {
    readFile: async (path, options) => {
      const encoding = options?.encoding;
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        const result = await webcontainer.fs.readFile(relativePath, encoding);
        return result;
      } catch (error) {
        throw error;
      }
    },
    writeFile: async (path, data, options) => {
      const encoding = options.encoding;
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      if (record.current) {
        record.current[relativePath] = { data, encoding };
      }
      try {
        const result = await webcontainer.fs.writeFile(relativePath, data, { ...options, encoding });
        return result;
      } catch (error) {
        throw error;
      }
    },
    mkdir: async (path, options) => {
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        const result = await webcontainer.fs.mkdir(relativePath, { ...options, recursive: true });
        return result;
      } catch (error) {
        throw error;
      }
    },
    readdir: async (path, options) => {
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        const result = await webcontainer.fs.readdir(relativePath, options);
        return result;
      } catch (error) {
        throw error;
      }
    },
    rm: async (path, options) => {
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        const result = await webcontainer.fs.rm(relativePath, { ...options || {} });
        return result;
      } catch (error) {
        throw error;
      }
    },
    rmdir: async (path, options) => {
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        const result = await webcontainer.fs.rm(relativePath, { recursive: true, ...options });
        return result;
      } catch (error) {
        throw error;
      }
    },
    unlink: async (path) => {
      const relativePath = pathUtils.relative(webcontainer.workdir, path);
      try {
        return await webcontainer.fs.rm(relativePath, { recursive: false });
      } catch (error) {
        throw error;
      }
    },
    stat: async (path) => {
      try {
        const relativePath = pathUtils.relative(webcontainer.workdir, path);
        const resp = await webcontainer.fs.readdir(pathUtils.dirname(relativePath), { withFileTypes: true });
        const name = pathUtils.basename(relativePath);
        const fileInfo = resp.find((x) => x.name == name);
        if (!fileInfo) {
          throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
        }
        return {
          isFile: () => fileInfo.isFile(),
          isDirectory: () => fileInfo.isDirectory(),
          isSymbolicLink: () => false,
          size: 1,
          mode: 438,
          // Default permissions
          mtimeMs: Date.now(),
          uid: 1e3,
          gid: 1e3
        };
      } catch (error) {
        console.log(error?.message);
        const err = new Error(`ENOENT: no such file or directory, stat '${path}'`);
        err.code = "ENOENT";
        err.errno = -2;
        err.syscall = "stat";
        err.path = path;
        throw err;
      }
    },
    lstat: async (path) => {
      return await getFs(webcontainer, record).promises.stat(path);
    },
    readlink: async (path) => {
      throw new Error(`EINVAL: invalid argument, readlink '${path}'`);
    },
    symlink: async (target, path) => {
      throw new Error(`EPERM: operation not permitted, symlink '${target}' -> '${path}'`);
    },
    chmod: async (_path, _mode) => {
      return await Promise.resolve();
    }
  }
});
const pathUtils = {
  dirname: (path) => {
    if (!path || !path.includes("/")) {
      return ".";
    }
    path = path.replace(/\/+$/, "");
    return path.split("/").slice(0, -1).join("/") || "/";
  },
  basename: (path, ext) => {
    path = path.replace(/\/+$/, "");
    const base = path.split("/").pop() || "";
    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }
    return base;
  },
  relative: (from, to) => {
    if (!from || !to) {
      return ".";
    }
    const normalizePathParts = (p) => p.replace(/\/+$/, "").split("/").filter(Boolean);
    const fromParts = normalizePathParts(from);
    const toParts = normalizePathParts(to);
    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);
    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] !== toParts[i]) {
        break;
      }
      commonLength++;
    }
    const upCount = fromParts.length - commonLength;
    const remainingPath = toParts.slice(commonLength);
    const relativeParts = [...Array(upCount).fill(".."), ...remainingPath];
    return relativeParts.length === 0 ? "." : relativeParts.join("/");
  }
};

const LoadingOverlay = ({
  message = "Loading...",
  progress,
  progressText
}) => {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center gap-4 p-8 rounded-lg bg-bolt-elements-background-depth-2 shadow-lg", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress",
        style: { fontSize: "2rem" }
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "text-lg text-bolt-elements-textTertiary", children: message }),
    progress !== void 0 && /* @__PURE__ */ jsxs("div", { className: "w-64 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-bolt-elements-background-depth-1 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-bolt-elements-loader-progress transition-all duration-300 ease-out rounded-full",
          style: { width: `${Math.min(100, Math.max(0, progress))}%` }
        }
      ) }),
      progressText && /* @__PURE__ */ jsx("p", { className: "text-sm text-bolt-elements-textTertiary text-center", children: progressText })
    ] })
  ] }) });
};

const isClient = typeof window !== "undefined" && typeof localStorage !== "undefined";
function getLocalStorage(key) {
  if (!isClient) {
    return null;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

const logger = createScopedLogger("ChatHistory");
async function openDatabase() {
  if (typeof indexedDB === "undefined") {
    console.error("indexedDB is not available in this environment.");
    return void 0;
  }
  return new Promise((resolve) => {
    const request = indexedDB.open("boltHistory", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("chats")) {
        const store = db.createObjectStore("chats", { keyPath: "id" });
        store.createIndex("id", "id", { unique: true });
        store.createIndex("urlId", "urlId", { unique: true });
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      resolve(void 0);
      logger.error(event.target.error);
    };
  });
}

const { saveAs } = fileSaver;

await openDatabase() ;
const chatId = atom(void 0);
atom(void 0);
atom(void 0);

function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      className: classNames(
        "flex h-10 w-full rounded-md border border-bolt-elements-border bg-bolt-elements-background px-3 py-2 text-sm ring-offset-bolt-elements-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-bolt-elements-textSecondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-elements-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";

function StatsDialog({ isOpen, onClose, onConfirm, stats, isLargeRepo }) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxs(Dialog$1.Portal, { children: [
    /* @__PURE__ */ jsx(Dialog$1.Overlay, { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" }),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center z-[9999]", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.2 },
        className: "w-[90vw] md:w-[500px]",
        children: /* @__PURE__ */ jsxs(Dialog$1.Content, { className: "bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E5E5E5] dark:border-[#333333] shadow-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "p-6 space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-[#111111] dark:text-white", children: "Repository Overview" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-[#666666] dark:text-[#999999]", children: "Repository Statistics:" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-[#111111] dark:text-white", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:files text-blue-500 w-4 h-4" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Total Files: ",
                    stats.totalFiles
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:database text-blue-500 w-4 h-4" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Total Size: ",
                    formatSize(stats.totalSize)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:code text-blue-500 w-4 h-4" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Languages:",
                    " ",
                    Object.entries(stats.languages).sort(([, a], [, b]) => b - a).slice(0, 3).map(([lang, size]) => `${lang} (${formatSize(size)})`).join(", ")
                  ] })
                ] }),
                stats.hasPackageJson && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:package text-blue-500 w-4 h-4" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { children: "Has package.json" })
                ] }),
                stats.hasDependencies && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:tree-structure text-blue-500 w-4 h-4" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { children: "Has dependencies" })
                ] })
              ] })
            ] }),
            isLargeRepo && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-sm flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "i-ph:warning text-yellow-600 dark:text-yellow-500 w-4 h-4 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { className: "text-yellow-800 dark:text-yellow-500", children: [
                "This repository is quite large (",
                formatSize(stats.totalSize),
                "). Importing it might take a while and could impact performance."
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-[#E5E5E5] dark:border-[#333333] p-4 flex justify-end gap-3 bg-[#F9F9F9] dark:bg-[#252525] rounded-b-lg", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "px-4 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#333333] text-[#666666] hover:text-[#111111] dark:text-[#999999] dark:hover:text-white transition-colors",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onConfirm,
                className: "px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors",
                children: "OK"
              }
            )
          ] })
        ] })
      }
    ) })
  ] }) });
}
function RepositorySelectionDialog({ isOpen, onClose, onSelect }) {
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("my-repos");
  const [customUrl, setCustomUrl] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [currentStats, setCurrentStats] = useState(null);
  const [pendingGitUrl, setPendingGitUrl] = useState("");
  useEffect(() => {
    if (isOpen && activeTab === "my-repos") {
      fetchUserRepos();
    }
  }, [isOpen, activeTab]);
  const fetchUserRepos = async () => {
    const connection = getLocalStorage("github_connection");
    if (!connection?.token) {
      toast.error("Please connect your GitHub account first");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=all", {
        headers: {
          Authorization: `Bearer ${connection.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.every((item) => typeof item === "object" && item !== null && "full_name" in item)) {
        setRepositories(data);
      } else {
        throw new Error("Invalid repository data format");
      }
    } catch (error) {
      console.error("Error fetching repos:", error);
      toast.error("Failed to fetch your repositories");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearch = async (query) => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      let searchQuery2 = query;
      if (filters.language) {
        searchQuery2 += ` language:${filters.language}`;
      }
      if (filters.stars) {
        searchQuery2 += ` stars:>${filters.stars}`;
      }
      if (filters.forks) {
        searchQuery2 += ` forks:>${filters.forks}`;
      }
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery2)}&sort=stars&order=desc`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json"
          }
        }
      );
      if (!response.ok) {
        throw new Error("Failed to search repositories");
      }
      const data = await response.json();
      if (typeof data === "object" && data !== null && "items" in data && Array.isArray(data.items)) {
        setSearchResults(data.items);
      } else {
        throw new Error("Invalid search results format");
      }
    } catch (error) {
      console.error("Error searching repos:", error);
      toast.error("Failed to search repositories");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchBranches = async (repo) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${repo.full_name}/branches`, {
        headers: {
          Authorization: `Bearer ${getLocalStorage("github_connection")?.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.every((item) => typeof item === "object" && item !== null && "name" in item)) {
        setBranches(
          data.map((branch) => ({
            name: branch.name,
            default: branch.name === repo.default_branch
          }))
        );
      } else {
        throw new Error("Invalid branch data format");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRepoSelect = async (repo) => {
    setSelectedRepository(repo);
    await fetchBranches(repo);
  };
  const formatGitUrl = (url) => {
    const baseUrl = url.replace(/\/tree\/[^/]+/, "").replace(/\/$/, "").replace(/\.git$/, "");
    return `${baseUrl}.git`;
  };
  const verifyRepository = async (repoUrl) => {
    try {
      const [owner, repo] = repoUrl.replace(/\.git$/, "").split("/").slice(-2);
      const connection = getLocalStorage("github_connection");
      const headers = connection?.token ? { Authorization: `Bearer ${connection.token}` } : {};
      const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
        headers
      });
      if (!treeResponse.ok) {
        throw new Error("Failed to fetch repository structure");
      }
      const treeData = await treeResponse.json();
      let totalSize = 0;
      let totalFiles = 0;
      const languages = {};
      let hasPackageJson = false;
      let hasDependencies = false;
      for (const file of treeData.tree) {
        if (file.type === "blob") {
          totalFiles++;
          if (file.size) {
            totalSize += file.size;
          }
          if (file.path === "package.json") {
            hasPackageJson = true;
            const contentResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
              headers
            });
            if (contentResponse.ok) {
              const content = await contentResponse.json();
              const packageJson = JSON.parse(Buffer.from(content.content, "base64").toString());
              hasDependencies = !!(packageJson.dependencies || packageJson.devDependencies || packageJson.peerDependencies);
            }
          }
          const ext = file.path.split(".").pop()?.toLowerCase();
          if (ext) {
            languages[ext] = (languages[ext] || 0) + (file.size || 0);
          }
        }
      }
      const stats2 = {
        totalFiles,
        totalSize,
        languages,
        hasPackageJson,
        hasDependencies
      };
      setStats(stats2);
      return stats2;
    } catch (error) {
      console.error("Error verifying repository:", error);
      toast.error("Failed to verify repository");
      return null;
    }
  };
  const handleImport = async () => {
    try {
      let gitUrl;
      if (activeTab === "url" && customUrl) {
        gitUrl = formatGitUrl(customUrl);
      } else if (selectedRepository) {
        gitUrl = formatGitUrl(selectedRepository.html_url);
        if (selectedBranch) {
          gitUrl = `${gitUrl}#${selectedBranch}`;
        }
      } else {
        return;
      }
      const stats2 = await verifyRepository(gitUrl);
      if (!stats2) {
        return;
      }
      setCurrentStats(stats2);
      setPendingGitUrl(gitUrl);
      setShowStatsDialog(true);
    } catch (error) {
      console.error("Error preparing repository:", error);
      toast.error("Failed to prepare repository. Please try again.");
    }
  };
  const handleStatsConfirm = () => {
    setShowStatsDialog(false);
    if (pendingGitUrl) {
      onSelect(pendingGitUrl);
      onClose();
    }
  };
  const handleFilterChange = (key, value) => {
    let parsedValue = value;
    if (key === "stars" || key === "forks") {
      parsedValue = value ? parseInt(value, 10) : void 0;
    }
    setFilters((prev) => ({ ...prev, [key]: parsedValue }));
    handleSearch(searchQuery);
  };
  const handleClose = () => {
    setIsLoading(false);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };
  return /* @__PURE__ */ jsxs(
    Dialog$1.Root,
    {
      open: isOpen,
      onOpenChange: (open) => {
        if (!open) {
          handleClose();
        }
      },
      children: [
        /* @__PURE__ */ jsxs(Dialog$1.Portal, { children: [
          /* @__PURE__ */ jsx(Dialog$1.Overlay, { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50" }),
          /* @__PURE__ */ jsxs(Dialog$1.Content, { className: "fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[600px] max-h-[85vh] overflow-hidden bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl z-[51] border border-[#E5E5E5] dark:border-[#333333]", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-[#E5E5E5] dark:border-[#333333] flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Dialog$1.Title, { className: "text-lg font-semibold text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark", children: "Import GitHub Repository" }),
              /* @__PURE__ */ jsxs(
                Dialog$1.Close,
                {
                  onClick: handleClose,
                  className: classNames(
                    "p-2 rounded-lg transition-all duration-200 ease-in-out",
                    "text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary",
                    "dark:text-bolt-elements-textTertiary-dark dark:hover:text-bolt-elements-textPrimary-dark",
                    "hover:bg-bolt-elements-background-depth-2 dark:hover:bg-bolt-elements-background-depth-3",
                    "focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColor dark:focus:ring-bolt-elements-borderColor-dark"
                  ),
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "i-ph:x block w-5 h-5", "aria-hidden": "true" }),
                    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close dialog" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
                /* @__PURE__ */ jsxs(TabButton, { active: activeTab === "my-repos", onClick: () => setActiveTab("my-repos"), children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:book-bookmark" }),
                  "My Repos"
                ] }),
                /* @__PURE__ */ jsxs(TabButton, { active: activeTab === "search", onClick: () => setActiveTab("search"), children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:magnifying-glass" }),
                  "Search"
                ] }),
                /* @__PURE__ */ jsxs(TabButton, { active: activeTab === "url", onClick: () => setActiveTab("url"), children: [
                  /* @__PURE__ */ jsx("span", { className: "i-ph:link" }),
                  "URL"
                ] })
              ] }),
              activeTab === "url" ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Enter repository URL",
                    value: customUrl,
                    onChange: (e) => setCustomUrl(e.target.value),
                    className: classNames("w-full", {
                      "border-red-500": false
                    })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleImport,
                    disabled: !customUrl,
                    className: "w-full h-10 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 justify-center",
                    children: "Import Repository"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                activeTab === "search" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "Search repositories...",
                        value: searchQuery,
                        onChange: (e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        },
                        className: "flex-1 px-4 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333] text-bolt-elements-textPrimary"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setFilters({}),
                        className: "px-3 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#252525] text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary",
                        children: /* @__PURE__ */ jsx("span", { className: "i-ph:funnel-simple" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "Filter by language...",
                        value: filters.language || "",
                        onChange: (e) => {
                          setFilters({ ...filters, language: e.target.value });
                          handleSearch(searchQuery);
                        },
                        className: "px-3 py-1.5 text-sm rounded-lg bg-[#F5F5F5] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333]"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        placeholder: "Min stars...",
                        value: filters.stars || "",
                        onChange: (e) => handleFilterChange("stars", e.target.value),
                        className: "px-3 py-1.5 text-sm rounded-lg bg-[#F5F5F5] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333]"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      placeholder: "Min forks...",
                      value: filters.forks || "",
                      onChange: (e) => handleFilterChange("forks", e.target.value),
                      className: "px-3 py-1.5 text-sm rounded-lg bg-[#F5F5F5] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333]"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar", children: selectedRepository ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setSelectedRepository(null),
                        className: "p-1.5 rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#252525]",
                        children: /* @__PURE__ */ jsx("span", { className: "i-ph:arrow-left w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx("h3", { className: "font-medium", children: selectedRepository.full_name })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-sm text-bolt-elements-textSecondary", children: "Select Branch" }),
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        value: selectedBranch,
                        onChange: (e) => setSelectedBranch(e.target.value),
                        className: "w-full px-3 py-2 rounded-lg bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor dark:border-bolt-elements-borderColor-dark text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-bolt-elements-borderColor dark:focus:ring-bolt-elements-borderColor-dark",
                        children: branches.map((branch) => /* @__PURE__ */ jsxs(
                          "option",
                          {
                            value: branch.name,
                            className: "bg-bolt-elements-background-depth-2 dark:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary-dark",
                            children: [
                              branch.name,
                              " ",
                              branch.default ? "(default)" : ""
                            ]
                          },
                          branch.name
                        ))
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: handleImport,
                        className: "w-full h-10 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 justify-center",
                        children: "Import Selected Branch"
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsx(
                  RepositoryList,
                  {
                    repos: activeTab === "my-repos" ? repositories : searchResults,
                    isLoading,
                    onSelect: handleRepoSelect,
                    activeTab
                  }
                ) })
              ] })
            ] })
          ] })
        ] }),
        currentStats && /* @__PURE__ */ jsx(
          StatsDialog,
          {
            isOpen: showStatsDialog,
            onClose: handleStatsConfirm,
            onConfirm: handleStatsConfirm,
            stats: currentStats,
            isLargeRepo: currentStats.totalSize > 50 * 1024 * 1024
          }
        )
      ]
    }
  );
}
function TabButton({ active, onClick, children }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: classNames(
        "px-4 py-2 h-10 rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center",
        active ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-[#F5F5F5] dark:bg-[#252525] text-bolt-elements-textPrimary dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#333333] border border-[#E5E5E5] dark:border-[#333333]"
      ),
      children
    }
  );
}
function RepositoryList({
  repos,
  isLoading,
  onSelect,
  activeTab
}) {
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-8 text-bolt-elements-textSecondary", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph:spinner animate-spin mr-2" }),
      "Loading repositories..."
    ] });
  }
  if (repos.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-bolt-elements-textSecondary", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph:folder-simple-dashed w-12 h-12 mb-2 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: activeTab === "my-repos" ? "No repositories found" : "Search for repositories" })
    ] });
  }
  return repos.map((repo) => /* @__PURE__ */ jsx(RepositoryCard, { repo, onSelect: () => onSelect(repo) }, repo.full_name));
}
function RepositoryCard({ repo, onSelect }) {
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-[#F5F5F5] dark:bg-[#252525] border border-[#E5E5E5] dark:border-[#333333] hover:border-blue-500/50 transition-colors", children: [
    " ",
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph:git-repository text-bolt-elements-textTertiary" }),
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-bolt-elements-textPrimary dark:text-white", children: repo.name })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onSelect,
          className: "px-4 py-2 h-10 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center",
          children: [
            /* @__PURE__ */ jsx("span", { className: "i-ph:download-simple w-4 h-4" }),
            "Import"
          ]
        }
      )
    ] }),
    repo.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-bolt-elements-textSecondary mb-3", children: repo.description }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-bolt-elements-textTertiary", children: [
      repo.language && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph:code" }),
        repo.language
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph:star" }),
        repo.stargazers_count.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph:clock" }),
        new Date(repo.updated_at).toLocaleDateString()
      ] })
    ] })
  ] });
}

const IGNORE_PATTERNS = [
  "node_modules/**",
  ".git/**",
  ".github/**",
  ".vscode/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
  ".cache/**",
  ".idea/**",
  "**/*.log",
  "**/.DS_Store",
  "**/npm-debug.log*",
  "**/yarn-debug.log*",
  "**/yarn-error.log*",
  "**/*lock.json",
  "**/*lock.yaml"
];
const ig = ignore().add(IGNORE_PATTERNS);
const MAX_FILE_SIZE = 100 * 1024;
const MAX_TOTAL_SIZE = 500 * 1024;
function GitCloneButton({ importChat, className }) {
  const { ready, gitClone } = useGit();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleClone = async (repoUrl) => {
    if (!ready) {
      return;
    }
    setLoading(true);
    try {
      const { workdir, data } = await gitClone(repoUrl);
      if (importChat) {
        const filePaths = Object.keys(data).filter((filePath) => !ig.ignores(filePath));
        const textDecoder = new TextDecoder("utf-8");
        let totalSize = 0;
        const skippedFiles = [];
        const fileContents = [];
        for (const filePath of filePaths) {
          const { data: content, encoding } = data[filePath];
          if (content instanceof Uint8Array && !filePath.match(/\.(txt|md|astro|mjs|js|jsx|ts|tsx|json|html|css|scss|less|yml|yaml|xml|svg)$/i)) {
            skippedFiles.push(filePath);
            continue;
          }
          try {
            const textContent = encoding === "utf8" ? content : content instanceof Uint8Array ? textDecoder.decode(content) : "";
            if (!textContent) {
              continue;
            }
            const fileSize = new TextEncoder().encode(textContent).length;
            if (fileSize > MAX_FILE_SIZE) {
              skippedFiles.push(`${filePath} (too large: ${Math.round(fileSize / 1024)}KB)`);
              continue;
            }
            if (totalSize + fileSize > MAX_TOTAL_SIZE) {
              skippedFiles.push(`${filePath} (would exceed total size limit)`);
              continue;
            }
            totalSize += fileSize;
            fileContents.push({
              path: filePath,
              content: textContent
            });
          } catch (e) {
            skippedFiles.push(`${filePath} (error: ${e.message})`);
          }
        }
        const commands = await detectProjectCommands(fileContents);
        const commandsMessage = createCommandsMessage(commands);
        const filesMessage = {
          role: "assistant",
          content: `Cloning the repo ${repoUrl} into ${workdir}
${skippedFiles.length > 0 ? `
Skipped files (${skippedFiles.length}):
${skippedFiles.map((f) => `- ${f}`).join("\n")}` : ""}

<boltArtifact id="imported-files" title="Git Cloned Files" type="bundled">
${fileContents.map(
            (file) => `<boltAction type="file" filePath="${file.path}">
${escapeBoltTags(file.content)}
</boltAction>`
          ).join("\n")}
</boltArtifact>`,
          id: generateId(),
          createdAt: /* @__PURE__ */ new Date()
        };
        const messages = [filesMessage];
        if (commandsMessage) {
          messages.push(commandsMessage);
        }
        await importChat(`Git Project:${repoUrl.split("/").slice(-1)[0]}`, messages);
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast.error("Failed to import repository");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      Button$1,
      {
        onClick: () => setIsDialogOpen(true),
        title: "Clone a Git Repo",
        variant: "outline",
        size: "lg",
        className: classNames(
          "gap-2 bg-[#F5F5F5] dark:bg-[#252525]",
          "text-bolt-elements-textPrimary dark:text-white",
          "hover:bg-[#E5E5E5] dark:hover:bg-[#333333]",
          "border-[#E5E5E5] dark:border-[#333333]",
          "h-10 px-4 py-2 min-w-[120px] justify-center",
          "transition-all duration-200 ease-in-out",
          className
        ),
        disabled: !ready || loading,
        children: [
          /* @__PURE__ */ jsx("span", { className: "i-ph:git-branch w-4 h-4" }),
          "Clone a Git Repo"
        ]
      }
    ),
    /* @__PURE__ */ jsx(RepositorySelectionDialog, { isOpen: isDialogOpen, onClose: () => setIsDialogOpen(false), onSelect: handleClone }),
    loading && /* @__PURE__ */ jsx(LoadingOverlay, { message: "Please wait while we clone the repository..." })
  ] });
}

const FilePreview = ({ files, imageDataList, onRemove }) => {
  if (!files || files.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "flex flex-row overflow-x-auto -mt-2", children: files.map((file, index) => /* @__PURE__ */ jsx("div", { className: "mr-2 relative", children: imageDataList[index] && /* @__PURE__ */ jsxs("div", { className: "relative pt-4 pr-4", children: [
    /* @__PURE__ */ jsx("img", { src: imageDataList[index], alt: file.name, className: "max-h-20" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onRemove(index),
        className: "absolute top-1 right-1 z-10 bg-black rounded-full w-5 h-5 shadow-md hover:bg-gray-900 transition-colors flex items-center justify-center",
        children: /* @__PURE__ */ jsx("div", { className: "i-ph:x w-3 h-3 text-gray-200" })
      }
    )
  ] }) }, file.name + file.size)) });
};

const SpeechRecognitionButton = ({
  isListening,
  onStart,
  onStop,
  disabled
}) => {
  return /* @__PURE__ */ jsx(
    IconButton,
    {
      title: isListening ? "Stop listening" : "Start speech recognition",
      disabled,
      className: classNames("transition-all", {
        "text-bolt-elements-item-contentAccent": isListening
      }),
      onClick: isListening ? onStop : onStart,
      children: isListening ? /* @__PURE__ */ jsx("div", { className: "i-ph:microphone-slash text-xl" }) : /* @__PURE__ */ jsx("div", { className: "i-ph:microphone text-xl" })
    }
  );
};

const savedConnection = typeof localStorage !== "undefined" ? localStorage.getItem("supabase_connection") : null;
const savedCredentials = typeof localStorage !== "undefined" ? localStorage.getItem("supabaseCredentials") : null;
const initialState = savedConnection ? JSON.parse(savedConnection) : {
  user: null,
  token: "",
  stats: void 0,
  selectedProjectId: void 0,
  isConnected: false,
  project: void 0
};
if (savedCredentials && !initialState.credentials) {
  try {
    initialState.credentials = JSON.parse(savedCredentials);
  } catch (e) {
    console.error("Failed to parse saved credentials:", e);
  }
}
const supabaseConnection = atom(initialState);
if (initialState.token && !initialState.stats) {
  fetchSupabaseStats(initialState.token).catch(console.error);
}
const isConnecting = atom(false);
const isFetchingStats = atom(false);
const isFetchingApiKeys = atom(false);
function updateSupabaseConnection(connection) {
  const currentState = supabaseConnection.get();
  if (connection.user !== void 0 || connection.token !== void 0) {
    const newUser = connection.user !== void 0 ? connection.user : currentState.user;
    const newToken = connection.token !== void 0 ? connection.token : currentState.token;
    connection.isConnected = !!(newUser && newToken);
  }
  if (connection.selectedProjectId !== void 0) {
    if (connection.selectedProjectId && currentState.stats?.projects) {
      const selectedProject = currentState.stats.projects.find(
        (project) => project.id === connection.selectedProjectId
      );
      if (selectedProject) {
        connection.project = selectedProject;
      } else {
        connection.project = {
          id: connection.selectedProjectId,
          name: `Project ${connection.selectedProjectId.substring(0, 8)}...`,
          region: "unknown",
          organization_id: "",
          status: "active",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    } else if (connection.selectedProjectId === "") {
      connection.project = void 0;
      connection.credentials = void 0;
    }
  }
  const newState = { ...currentState, ...connection };
  supabaseConnection.set(newState);
  if (connection.user || connection.token || connection.selectedProjectId !== void 0 || connection.credentials) {
    localStorage.setItem("supabase_connection", JSON.stringify(newState));
    if (newState.credentials) {
      localStorage.setItem("supabaseCredentials", JSON.stringify(newState.credentials));
    } else {
      localStorage.removeItem("supabaseCredentials");
    }
  } else {
    localStorage.removeItem("supabase_connection");
    localStorage.removeItem("supabaseCredentials");
  }
}
async function fetchSupabaseStats(token) {
  isFetchingStats.set(true);
  try {
    const response = await fetch("/api/supabase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token
      })
    });
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();
    updateSupabaseConnection({
      user: data.user,
      stats: data.stats
    });
  } catch (error) {
    console.error("Failed to fetch Supabase stats:", error);
    throw error;
  } finally {
    isFetchingStats.set(false);
  }
}
async function fetchProjectApiKeys(projectId, token) {
  isFetchingApiKeys.set(true);
  try {
    const response = await fetch("/api/supabase/variables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId,
        token
      })
    });
    if (!response.ok) {
      throw new Error("Failed to fetch API keys");
    }
    const data = await response.json();
    const apiKeys = data.apiKeys;
    const anonKey = apiKeys.find((key) => key.name === "anon" || key.name === "public");
    if (anonKey) {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      updateSupabaseConnection({
        credentials: {
          anonKey: anonKey.api_key,
          supabaseUrl
        }
      });
      return { anonKey: anonKey.api_key, supabaseUrl };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch project API keys:", error);
    throw error;
  } finally {
    isFetchingApiKeys.set(false);
  }
}

function useSupabaseConnection() {
  const connection = useStore(supabaseConnection);
  const connecting = useStore(isConnecting);
  const fetchingStats = useStore(isFetchingStats);
  const fetchingApiKeys = useStore(isFetchingApiKeys);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  useEffect(() => {
    const savedConnection = localStorage.getItem("supabase_connection");
    const savedCredentials = localStorage.getItem("supabaseCredentials");
    if (savedConnection) {
      const parsed = JSON.parse(savedConnection);
      if (savedCredentials && !parsed.credentials) {
        parsed.credentials = JSON.parse(savedCredentials);
      }
      updateSupabaseConnection(parsed);
      if (parsed.token && parsed.selectedProjectId && !parsed.credentials) {
        fetchProjectApiKeys(parsed.selectedProjectId, parsed.token).catch(console.error);
      }
    }
  }, []);
  const handleConnect = async () => {
    isConnecting.set(true);
    try {
      const cleanToken = connection.token.trim();
      const response = await fetch("/api/supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: cleanToken
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }
      updateSupabaseConnection({
        user: data.user,
        token: connection.token,
        stats: data.stats
      });
      toast.success("Successfully connected to Supabase");
      setIsProjectsExpanded(true);
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to Supabase");
      updateSupabaseConnection({ user: null, token: "" });
      return false;
    } finally {
      isConnecting.set(false);
    }
  };
  const handleDisconnect = () => {
    updateSupabaseConnection({ user: null, token: "" });
    toast.success("Disconnected from Supabase");
    setIsDropdownOpen(false);
  };
  const selectProject = async (projectId) => {
    const currentState = supabaseConnection.get();
    let projectData = void 0;
    if (projectId && currentState.stats?.projects) {
      projectData = currentState.stats.projects.find((project) => project.id === projectId);
    }
    updateSupabaseConnection({
      selectedProjectId: projectId,
      project: projectData
    });
    if (projectId && currentState.token) {
      try {
        await fetchProjectApiKeys(projectId, currentState.token);
        toast.success("Project selected successfully");
      } catch (error) {
        console.error("Failed to fetch API keys:", error);
        toast.error("Selected project but failed to fetch API keys");
      }
    } else {
      toast.success("Project selected successfully");
    }
    setIsDropdownOpen(false);
  };
  const handleCreateProject = async () => {
    window.open("https://app.supabase.com/new/new-project", "_blank");
  };
  return {
    connection,
    connecting,
    fetchingStats,
    fetchingApiKeys,
    isProjectsExpanded,
    setIsProjectsExpanded,
    isDropdownOpen,
    setIsDropdownOpen,
    handleConnect,
    handleDisconnect,
    selectProject,
    handleCreateProject,
    updateToken: (token) => updateSupabaseConnection({ ...connection, token }),
    isConnected: !!(connection.user && connection.token),
    fetchProjectApiKeys: (projectId) => {
      if (connection.token) {
        return fetchProjectApiKeys(projectId, connection.token);
      }
      return Promise.reject(new Error("No token available"));
    }
  };
}

const cubicEasingFn = cubicBezier(0.4, 0, 0.2, 1);

const DialogButton = memo(({ type, children, onClick, disabled }) => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: classNames("inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors", {
        "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600": type === "primary",
        // Ajustado de purple-500 para blue-500 e purple-600 para blue-600
        "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100": type === "secondary",
        "bg-transparent text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10": type === "danger"
      }),
      onClick,
      disabled,
      children
    }
  );
});
const DialogTitle = memo(({ className, children, ...props }) => {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      className: classNames("text-lg font-medium text-bolt-elements-textPrimary", "flex items-center gap-2", className),
      ...props,
      children
    }
  );
});
memo(({ className, children, ...props }) => {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      className: classNames("text-sm text-bolt-elements-textSecondary", "mt-1", className),
      ...props,
      children
    }
  );
});
const transition = {
  duration: 0.15,
  ease: cubicEasingFn
};
const dialogBackdropVariants = {
  closed: {
    opacity: 0,
    transition
  },
  open: {
    opacity: 1,
    transition
  }
};
const dialogVariants = {
  closed: {
    x: "-50%",
    y: "-40%",
    scale: 0.96,
    opacity: 0,
    transition
  },
  open: {
    x: "-50%",
    y: "-50%",
    scale: 1,
    opacity: 1,
    transition
  }
};
const Dialog = memo(({ children, className, showCloseButton = true, onClose, onBackdrop }) => {
  return /* @__PURE__ */ jsxs(Dialog$1.Portal, { children: [
    /* @__PURE__ */ jsx(Dialog$1.Overlay, { asChild: true, children: /* @__PURE__ */ jsx(
      motion.div,
      {
        className: classNames(
          "fixed inset-0 z-[9999]",
          "bg-[#FAFAFA]/80 dark:bg-[#0A0A0A]/80",
          "backdrop-blur-[2px]"
        ),
        initial: "closed",
        animate: "open",
        exit: "closed",
        variants: dialogBackdropVariants,
        onClick: onBackdrop
      }
    ) }),
    /* @__PURE__ */ jsx(Dialog$1.Content, { asChild: true, children: /* @__PURE__ */ jsx(
      motion.div,
      {
        className: classNames(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-[#FAFAFA] dark:bg-[#0A0A0A]",
          "rounded-lg shadow-lg",
          "border border-[#E5E5E5] dark:border-[#1A1A1A]",
          "z-[9999] w-[520px]",
          className
        ),
        initial: "closed",
        animate: "open",
        exit: "closed",
        variants: dialogVariants,
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          children,
          showCloseButton && /* @__PURE__ */ jsx(Dialog$1.Close, { asChild: true, onClick: onClose, children: /* @__PURE__ */ jsx(
            IconButton,
            {
              icon: "i-ph:x",
              className: "absolute top-3 right-3 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
            }
          ) })
        ] })
      }
    ) })
  ] });
});

function SupabaseConnection() {
  const {
    connection: supabaseConn,
    connecting,
    fetchingStats,
    isProjectsExpanded,
    setIsProjectsExpanded,
    isDropdownOpen: isDialogOpen,
    setIsDropdownOpen: setIsDialogOpen,
    handleConnect,
    handleDisconnect,
    selectProject,
    handleCreateProject,
    updateToken,
    isConnected,
    fetchProjectApiKeys
  } = useSupabaseConnection();
  const currentChatId = useStore(chatId);
  useEffect(() => {
    const handleOpenConnectionDialog = () => {
      setIsDialogOpen(true);
    };
    document.addEventListener("open-supabase-connection", handleOpenConnectionDialog);
    return () => {
      document.removeEventListener("open-supabase-connection", handleOpenConnectionDialog);
    };
  }, [setIsDialogOpen]);
  useEffect(() => {
    if (isConnected && currentChatId) {
      const savedProjectId = localStorage.getItem(`supabase-project-${currentChatId}`);
      if (!savedProjectId && supabaseConn.selectedProjectId) {
        localStorage.setItem(`supabase-project-${currentChatId}`, supabaseConn.selectedProjectId);
      } else if (savedProjectId && savedProjectId !== supabaseConn.selectedProjectId) {
        selectProject(savedProjectId);
      }
    }
  }, [isConnected, currentChatId]);
  useEffect(() => {
    if (currentChatId && supabaseConn.selectedProjectId) {
      localStorage.setItem(`supabase-project-${currentChatId}`, supabaseConn.selectedProjectId);
    } else if (currentChatId && !supabaseConn.selectedProjectId) {
      localStorage.removeItem(`supabase-project-${currentChatId}`);
    }
  }, [currentChatId, supabaseConn.selectedProjectId]);
  useEffect(() => {
    if (isConnected && supabaseConn.token) {
      fetchSupabaseStats(supabaseConn.token).catch(console.error);
    }
  }, [isConnected, supabaseConn.token]);
  useEffect(() => {
    if (isConnected && supabaseConn.selectedProjectId && supabaseConn.token && !supabaseConn.credentials) {
      fetchProjectApiKeys(supabaseConn.selectedProjectId).catch(console.error);
    }
  }, [isConnected, supabaseConn.selectedProjectId, supabaseConn.token, supabaseConn.credentials]);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("div", { className: "flex border border-bolt-elements-borderColor rounded-md overflow-hidden mr-2 text-sm", children: /* @__PURE__ */ jsxs(
      Button,
      {
        active: true,
        disabled: connecting,
        onClick: () => setIsDialogOpen(!isDialogOpen),
        className: "hover:bg-bolt-elements-item-backgroundActive !text-white flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              className: "w-4 h-4",
              height: "20",
              width: "20",
              crossOrigin: "anonymous",
              src: "https://cdn.simpleicons.org/supabase"
            }
          ),
          isConnected && supabaseConn.project && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs max-w-[100px] truncate", children: supabaseConn.project.name })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Root, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: isDialogOpen && /* @__PURE__ */ jsx(Dialog, { className: "max-w-[520px] p-6", children: !isConnected ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(DialogTitle, { children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            className: "w-5 h-5",
            height: "24",
            width: "24",
            crossOrigin: "anonymous",
            src: "https://cdn.simpleicons.org/supabase"
          }
        ),
        "Connect to Supabase"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-bolt-elements-textSecondary mb-2", children: "Access Token" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            value: supabaseConn.token,
            onChange: (e) => updateToken(e.target.value),
            disabled: connecting,
            placeholder: "Enter your Supabase access token",
            className: classNames(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-[#F8F8F8] dark:bg-[#1A1A1A]",
              "border border-[#E5E5E5] dark:border-[#333333]",
              "text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary",
              "focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]",
              "disabled:opacity-50"
            )
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-bolt-elements-textSecondary", children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://app.supabase.com/account/tokens",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-[#3ECF8E] hover:underline inline-flex items-center gap-1",
            children: [
              "Get your token",
              /* @__PURE__ */ jsx("div", { className: "i-ph:arrow-square-out w-4 h-4" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
        /* @__PURE__ */ jsx(Close, { asChild: true, children: /* @__PURE__ */ jsx(DialogButton, { type: "secondary", children: "Cancel" }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleConnect,
            disabled: connecting || !supabaseConn.token,
            className: classNames(
              "px-4 py-2 rounded-lg text-sm flex items-center gap-2",
              "bg-[#3ECF8E] text-white",
              "hover:bg-[#3BBF84]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            ),
            children: connecting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "i-ph:spinner-gap animate-spin" }),
              "Connecting..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "i-ph:plug-charging w-4 h-4" }),
              "Connect"
            ] })
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            className: "w-5 h-5",
            height: "24",
            width: "24",
            crossOrigin: "anonymous",
            src: "https://cdn.simpleicons.org/supabase"
          }
        ),
        "Supabase Connection"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 p-3 bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-lg", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-bolt-elements-textPrimary", children: supabaseConn.user?.email }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-bolt-elements-textSecondary", children: [
          "Role: ",
          supabaseConn.user?.role
        ] })
      ] }) }),
      fetchingStats ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-bolt-elements-textSecondary", children: [
        /* @__PURE__ */ jsx("div", { className: "i-ph:spinner-gap w-4 h-4 animate-spin" }),
        "Fetching projects..."
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsProjectsExpanded(!isProjectsExpanded),
              className: "bg-transparent text-left text-sm font-medium text-bolt-elements-textPrimary flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx("div", { className: "i-ph:database w-4 h-4" }),
                "Your Projects (",
                supabaseConn.stats?.totalProjects || 0,
                ")",
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: classNames(
                      "i-ph:caret-down w-4 h-4 transition-transform",
                      isProjectsExpanded ? "rotate-180" : ""
                    )
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => fetchSupabaseStats(supabaseConn.token),
                className: "px-2 py-1 rounded-md text-xs bg-[#F0F0F0] dark:bg-[#252525] text-bolt-elements-textSecondary hover:bg-[#E5E5E5] dark:hover:bg-[#333333] flex items-center gap-1",
                title: "Refresh projects list",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "i-ph:arrows-clockwise w-3 h-3" }),
                  "Refresh"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleCreateProject(),
                className: "px-2 py-1 rounded-md text-xs bg-[#3ECF8E] text-white hover:bg-[#3BBF84] flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "i-ph:plus w-3 h-3" }),
                  "New Project"
                ]
              }
            )
          ] })
        ] }),
        isProjectsExpanded && /* @__PURE__ */ jsxs(Fragment, { children: [
          !supabaseConn.selectedProjectId && /* @__PURE__ */ jsx("div", { className: "mb-2 p-3 bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-lg text-sm text-bolt-elements-textSecondary", children: "Select a project or create a new one for this chat" }),
          supabaseConn.stats?.projects?.length ? /* @__PURE__ */ jsx("div", { className: "grid gap-2 max-h-60 overflow-y-auto", children: supabaseConn.stats.projects.map((project) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "block p-3 rounded-lg border border-[#E5E5E5] dark:border-[#1A1A1A] hover:border-[#3ECF8E] dark:hover:border-[#3ECF8E] transition-colors",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h5", { className: "text-sm font-medium text-bolt-elements-textPrimary flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("div", { className: "i-ph:database w-3 h-3 text-[#3ECF8E]" }),
                    project.name
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-bolt-elements-textSecondary mt-1", children: project.region })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => selectProject(project.id),
                    className: classNames(
                      "px-3 py-1 rounded-md text-xs",
                      supabaseConn.selectedProjectId === project.id ? "bg-[#3ECF8E] text-white" : "bg-[#F0F0F0] dark:bg-[#252525] text-bolt-elements-textSecondary hover:bg-[#3ECF8E] hover:text-white"
                    ),
                    children: supabaseConn.selectedProjectId === project.id ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx("div", { className: "i-ph:check w-3 h-3" }),
                      "Selected"
                    ] }) : "Select"
                  }
                )
              ] })
            },
            project.id
          )) }) : /* @__PURE__ */ jsxs("div", { className: "text-sm text-bolt-elements-textSecondary flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "i-ph:info w-4 h-4" }),
            "No projects found"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
        /* @__PURE__ */ jsx(Close, { asChild: true, children: /* @__PURE__ */ jsx(DialogButton, { type: "secondary", children: "Close" }) }),
        /* @__PURE__ */ jsxs(DialogButton, { type: "danger", onClick: handleDisconnect, children: [
          /* @__PURE__ */ jsx("div", { className: "i-ph:plug-x w-4 h-4" }),
          "Disconnect"
        ] })
      ] })
    ] }) }) })
  ] });
}
function Button({ active = false, disabled = false, children, onClick, className }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: classNames(
        "flex items-center p-1.5",
        {
          "bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary": !active,
          "bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentAccent": active && !disabled,
          "bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed": disabled
        },
        className
      ),
      onClick,
      children
    }
  );
}

function SupabaseAlert() {
  const connection = useStore(supabaseConnection);
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    setShowAlert(!!connection.selectedProjectId && !connection.credentials);
  }, [connection.selectedProjectId, connection.credentials]);
  if (!showAlert) {
    return null;
  }
  const handleOpenConnectionDialog = () => {
    const event = new CustomEvent("open-supabase-connection");
    document.dispatchEvent(event);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: classNames(
        "flex items-center gap-3 p-3 mb-4 rounded-lg border",
        "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "i-ph:warning-circle text-amber-500 dark:text-amber-400 w-5 h-5 flex-shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-amber-800 dark:text-amber-300", children: "Supabase Connection Issue" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400 mt-1", children: "Your Supabase project is selected, but API credentials are missing. Please reconnect to fetch the API keys." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleOpenConnectionDialog,
            className: "px-3 py-1.5 text-xs font-medium rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors",
            children: "Reconnect"
          }
        )
      ]
    }
  );
}

const ScreenshotStateManager = ({
  setUploadedFiles,
  setImageDataList,
  uploadedFiles,
  imageDataList
}) => {
  useEffect(() => {
    if (setUploadedFiles && setImageDataList) {
      window.__BOLT_SET_UPLOADED_FILES__ = setUploadedFiles;
      window.__BOLT_SET_IMAGE_DATA_LIST__ = setImageDataList;
      window.__BOLT_UPLOADED_FILES__ = uploadedFiles;
      window.__BOLT_IMAGE_DATA_LIST__ = imageDataList;
    }
    return () => {
      delete window.__BOLT_SET_UPLOADED_FILES__;
      delete window.__BOLT_SET_IMAGE_DATA_LIST__;
      delete window.__BOLT_UPLOADED_FILES__;
      delete window.__BOLT_IMAGE_DATA_LIST__;
    };
  }, [setUploadedFiles, setImageDataList, uploadedFiles, imageDataList]);
  return null;
};

const FrameworkLink = ({ template }) => /* @__PURE__ */ jsx(
  "a",
  {
    href: `/git?url=https://github.com/${template.githubRepo}.git`,
    "data-state": "closed",
    "data-discover": "true",
    className: "items-center justify-center",
    children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `inline-block ${template.icon} w-8 h-8 text-4xl transition-theme opacity-25 hover:opacity-100 hover:text-blue-500 dark:text-white dark:opacity-50 dark:hover:opacity-100 dark:hover:text-blue-400 transition-all`,
        title: template.label
      }
    )
  }
);
const StarterTemplates = () => {
  React__default.useEffect(() => {
    console.log(
      "Available templates:",
      STARTER_TEMPLATES.map((t) => ({ name: t.name, icon: t.icon }))
    );
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "or start a blank app with your favorite stack" }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex w-70 flex-wrap items-center justify-center gap-4", children: STARTER_TEMPLATES.map((template) => /* @__PURE__ */ jsx(FrameworkLink, { template }, template.name)) }) })
  ] });
};

function ChatAlert({ alert, clearAlert, postMessage }) {
  const { description, content, source } = alert;
  const isPreview = source === "preview";
  const title = isPreview ? "Preview Error" : "Terminal Error";
  const message = isPreview ? "We encountered an error while running the preview. Would you like Ada to analyze and help resolve this issue?" : "We encountered an error while running terminal commands. Would you like Ada to analyze and help resolve this issue?";
  return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
      className: `rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 mb-2`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "flex-shrink-0",
            initial: { scale: 0 },
            animate: { scale: 1 },
            transition: { delay: 0.2 },
            children: /* @__PURE__ */ jsx("div", { className: `i-ph:warning-duotone text-xl text-bolt-elements-button-danger-text` })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "ml-3 flex-1", children: [
          /* @__PURE__ */ jsx(
            motion.h3,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.1 },
              className: `text-sm font-medium text-bolt-elements-textPrimary`,
              children: title
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.2 },
              className: `mt-2 text-sm text-bolt-elements-textSecondary`,
              children: [
                /* @__PURE__ */ jsx("p", { children: message }),
                description && /* @__PURE__ */ jsxs("div", { className: "text-xs text-bolt-elements-textSecondary p-2 bg-bolt-elements-background-depth-3 rounded mt-4 mb-4", children: [
                  "Error: ",
                  description
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "mt-4",
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.3 },
              children: /* @__PURE__ */ jsxs("div", { className: classNames(" flex gap-2"), children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => postMessage(
                      `*Fix this ${isPreview ? "preview" : "terminal"} error* 
\`\`\`${isPreview ? "js" : "sh"}
${content}
\`\`\`
`
                    ),
                    className: classNames(
                      `px-2 py-1.5 rounded-md text-sm font-medium`,
                      "bg-bolt-elements-button-primary-background",
                      "hover:bg-bolt-elements-button-primary-backgroundHover",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-danger-background",
                      "text-bolt-elements-button-primary-text",
                      "flex items-center gap-1.5"
                    ),
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "i-ph:chat-circle-duotone" }),
                      "Ask Ada"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: clearAlert,
                    className: classNames(
                      `px-2 py-1.5 rounded-md text-sm font-medium`,
                      "bg-bolt-elements-button-secondary-background",
                      "hover:bg-bolt-elements-button-secondary-backgroundHover",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-secondary-background",
                      "text-bolt-elements-button-secondary-text"
                    ),
                    children: "Dismiss"
                  }
                )
              ] })
            }
          )
        ] })
      ] })
    }
  ) });
}

function ProgressCompilation({ data }) {
  const [progressList, setProgressList] = React__default.useState([]);
  const [expanded, setExpanded] = useState(false);
  React__default.useEffect(() => {
    if (!data || data.length == 0) {
      setProgressList([]);
      return;
    }
    const progressMap = /* @__PURE__ */ new Map();
    data.forEach((x) => {
      const existingProgress = progressMap.get(x.label);
      if (existingProgress && existingProgress.status === "complete") {
        return;
      }
      progressMap.set(x.label, x);
    });
    const newData = Array.from(progressMap.values());
    newData.sort((a, b) => a.order - b.order);
    setProgressList(newData);
  }, [data]);
  if (progressList.length === 0) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsx(
    "div",
    {
      className: classNames(
        "bg-bolt-elements-background-depth-2",
        "border border-bolt-elements-borderColor",
        "shadow-lg rounded-lg  relative w-full max-w-chat mx-auto z-prompt",
        "p-1"
      ),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: classNames(
            "bg-bolt-elements-item-backgroundAccent",
            "p-1 rounded-lg text-bolt-elements-item-contentAccent",
            "flex "
          ),
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(AnimatePresence, { children: expanded ? /* @__PURE__ */ jsx(
              motion.div,
              {
                className: "actions",
                initial: { height: 0 },
                animate: { height: "auto" },
                exit: { height: "0px" },
                transition: { duration: 0.15 },
                children: progressList.map((x, i) => {
                  return /* @__PURE__ */ jsx(ProgressItem, { progress: x }, i);
                })
              }
            ) : /* @__PURE__ */ jsx(ProgressItem, { progress: progressList.slice(-1)[0] }) }) }),
            /* @__PURE__ */ jsx(
              motion.button,
              {
                initial: { width: 0 },
                animate: { width: "auto" },
                exit: { width: 0 },
                transition: { duration: 0.15, ease: cubicEasingFn },
                className: " p-1 rounded-lg bg-bolt-elements-item-backgroundAccent hover:bg-bolt-elements-artifacts-backgroundHover",
                onClick: () => setExpanded((v) => !v),
                children: /* @__PURE__ */ jsx("div", { className: expanded ? "i-ph:caret-up-bold" : "i-ph:caret-down-bold" })
              }
            )
          ]
        }
      )
    }
  ) });
}
const ProgressItem = ({ progress }) => {
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: classNames("flex text-sm gap-3"),
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 ", children: /* @__PURE__ */ jsx("div", { children: progress.status === "in-progress" ? /* @__PURE__ */ jsx("div", { className: "i-svg-spinners:90-ring-with-bg" }) : progress.status === "complete" ? /* @__PURE__ */ jsx("div", { className: "i-ph:check" }) : null }) }),
        progress.message
      ]
    }
  );
};

const DEFAULT_TAB_CONFIG = [
  // User Window Tabs (Always visible by default)
  { id: "features", visible: true, window: "user", order: 0 },
  { id: "data", visible: true, window: "user", order: 1 },
  { id: "cloud-providers", visible: true, window: "user", order: 2 },
  { id: "local-providers", visible: true, window: "user", order: 3 },
  { id: "connection", visible: true, window: "user", order: 4 },
  { id: "notifications", visible: true, window: "user", order: 5 },
  { id: "event-logs", visible: true, window: "user", order: 6 },
  // User Window Tabs (In dropdown, initially hidden)
  { id: "profile", visible: false, window: "user", order: 7 },
  { id: "settings", visible: false, window: "user", order: 8 },
  { id: "task-manager", visible: false, window: "user", order: 9 },
  { id: "service-status", visible: false, window: "user", order: 10 },
  // User Window Tabs (Hidden, controlled by TaskManagerTab)
  { id: "debug", visible: false, window: "user", order: 11 },
  { id: "update", visible: false, window: "user", order: 12 },
  // Developer Window Tabs (All visible by default)
  { id: "features", visible: true, window: "developer", order: 0 },
  { id: "data", visible: true, window: "developer", order: 1 },
  { id: "cloud-providers", visible: true, window: "developer", order: 2 },
  { id: "local-providers", visible: true, window: "developer", order: 3 },
  { id: "connection", visible: true, window: "developer", order: 4 },
  { id: "notifications", visible: true, window: "developer", order: 5 },
  { id: "event-logs", visible: true, window: "developer", order: 6 },
  { id: "profile", visible: true, window: "developer", order: 7 },
  { id: "settings", visible: true, window: "developer", order: 8 },
  { id: "task-manager", visible: true, window: "developer", order: 9 },
  { id: "service-status", visible: true, window: "developer", order: 10 },
  { id: "debug", visible: true, window: "developer", order: 11 },
  { id: "update", visible: true, window: "developer", order: 12 }
];

const LOCAL_PROVIDERS = ["OpenAILike", "LMStudio", "Ollama"];
map({
  toggleTheme: {
    key: "d",
    metaKey: true,
    altKey: true,
    shiftKey: true,
    action: () => toggleTheme(),
    description: "Toggle theme",
    isPreventDefault: true
  },
  toggleTerminal: {
    key: "`",
    ctrlOrMetaKey: true,
    action: () => {
    },
    description: "Toggle terminal",
    isPreventDefault: true
  }
});
const PROVIDER_SETTINGS_KEY = "provider_settings";
const isBrowser = typeof window !== "undefined";
const getInitialProviderSettings = () => {
  const initialSettings2 = {};
  PROVIDER_LIST.forEach((provider) => {
    initialSettings2[provider.name] = {
      ...provider,
      settings: {
        // Local providers should be disabled by default
        enabled: !LOCAL_PROVIDERS.includes(provider.name)
      }
    };
  });
  if (isBrowser) {
    const savedSettings = localStorage.getItem(PROVIDER_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        Object.entries(parsed).forEach(([key, value]) => {
          if (initialSettings2[key]) {
            initialSettings2[key].settings = value.settings;
          }
        });
      } catch (error) {
        console.error("Error parsing saved provider settings:", error);
      }
    }
  }
  return initialSettings2;
};
map(getInitialProviderSettings());
atom(false);
const SETTINGS_KEYS = {
  LATEST_BRANCH: "isLatestBranch",
  AUTO_SELECT_TEMPLATE: "autoSelectTemplate",
  CONTEXT_OPTIMIZATION: "contextOptimizationEnabled",
  EVENT_LOGS: "isEventLogsEnabled",
  PROMPT_ID: "promptId",
  DEVELOPER_MODE: "isDeveloperMode"
};
const getInitialSettings = () => {
  const getStoredBoolean = (key, defaultValue) => {
    if (!isBrowser) {
      return defaultValue;
    }
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };
  return {
    latestBranch: getStoredBoolean(SETTINGS_KEYS.LATEST_BRANCH, false),
    autoSelectTemplate: getStoredBoolean(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, true),
    contextOptimization: getStoredBoolean(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, true),
    eventLogs: getStoredBoolean(SETTINGS_KEYS.EVENT_LOGS, true),
    promptId: isBrowser ? localStorage.getItem(SETTINGS_KEYS.PROMPT_ID) || "default" : "default",
    developerMode: getStoredBoolean(SETTINGS_KEYS.DEVELOPER_MODE, false)
  };
};
const initialSettings = getInitialSettings();
atom(initialSettings.latestBranch);
atom(initialSettings.autoSelectTemplate);
atom(initialSettings.contextOptimization);
atom(initialSettings.eventLogs);
atom(initialSettings.promptId);
const getInitialTabConfiguration = () => {
  const defaultConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab) => tab.window === "user"),
    developerTabs: DEFAULT_TAB_CONFIG.filter((tab) => tab.window === "developer")
  };
  if (!isBrowser) {
    return defaultConfig;
  }
  try {
    const saved = localStorage.getItem("bolt_tab_configuration");
    if (!saved) {
      return defaultConfig;
    }
    const parsed = JSON.parse(saved);
    if (!parsed?.userTabs || !parsed?.developerTabs) {
      return defaultConfig;
    }
    return {
      userTabs: parsed.userTabs.filter((tab) => tab.window === "user"),
      developerTabs: parsed.developerTabs.filter(
        (tab) => tab.window === "developer"
      )
    };
  } catch (error) {
    console.warn("Failed to parse tab configuration:", error);
    return defaultConfig;
  }
};
map(getInitialTabConfiguration());
atom(initialSettings.developerMode);
create((set) => ({
  isOpen: false,
  selectedTab: "user",
  // Default tab
  openSettings: () => {
    set({
      isOpen: true,
      selectedTab: "user"
      // Always open to user tab
    });
  },
  closeSettings: () => {
    set({
      isOpen: false,
      selectedTab: "user"
      // Reset to user tab when closing
    });
  },
  setSelectedTab: (tab) => {
    set({ selectedTab: tab });
  }
}));

const storedProfile = typeof window !== "undefined" ? localStorage.getItem("bolt_profile") : null;
const initialProfile = storedProfile ? JSON.parse(storedProfile) : {
  username: "",
  bio: "",
  avatar: ""
};
const profileStore = atom(initialProfile);
const updateProfile = (updates) => {
  profileStore.set({ ...profileStore.get(), ...updates });
  if (typeof window !== "undefined") {
    localStorage.setItem("bolt_profile", JSON.stringify(profileStore.get()));
  }
};

function initializeProfileFromAuth() {
  if (typeof window !== "undefined") {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        updateProfile({
          username: user.name || "",
          bio: user.email || "",
          avatar: ""
          // No avatar in our auth system yet
        });
      }
    } catch (error) {
      console.error("Error initializing profile from auth:", error);
    }
  }
}
if (typeof window !== "undefined") {
  setTimeout(() => {
    initializeProfileFromAuth();
  }, 0);
}

const TEXTAREA_MIN_HEIGHT = 76;
const BaseChat = React__default.forwardRef(
  ({
    textareaRef,
    messageRef,
    scrollRef,
    showChat = true,
    chatStarted = false,
    isStreaming = false,
    onStreamingChange,
    model,
    setModel,
    provider,
    setProvider,
    providerList,
    input = "",
    enhancingPrompt,
    handleInputChange,
    // promptEnhanced,
    enhancePrompt,
    sendMessage,
    handleStop,
    importChat,
    exportChat,
    uploadedFiles = [],
    setUploadedFiles,
    imageDataList = [],
    setImageDataList,
    messages,
    actionAlert,
    clearAlert,
    data,
    actionRunner
  }, ref) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const FIXED_API_KEYS = {
      Anthropic: "api_here"
    };
    const [apiKeys, setApiKeys] = useState(FIXED_API_KEYS);
    const [modelList, setModelList] = useState([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [transcript, setTranscript] = useState("");
    const [isModelLoading, setIsModelLoading] = useState("all");
    const [progressAnnotations, setProgressAnnotations] = useState([]);
    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === "object" && x.type === "progress"
        );
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);
    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);
    useEffect(() => {
      if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition2 = new SpeechRecognition();
        recognition2.continuous = true;
        recognition2.interimResults = true;
        recognition2.onresult = (event) => {
          const transcript2 = Array.from(event.results).map((result) => result[0]).map((result) => result.transcript).join("");
          setTranscript(transcript2);
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript2 }
            };
            handleInputChange(syntheticEvent);
          }
        };
        recognition2.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
        setRecognition(recognition2);
      }
    }, []);
    useEffect(() => {
      const anthropicProvider = providerList?.find((p) => p.name === "Anthropic");
      if (anthropicProvider && setProvider) {
        setProvider(anthropicProvider);
      }
      if (setModel) {
        setModel("claude-3-7-sonnet-20250219");
      }
    }, [providerList, setProvider, setModel]);
    useEffect(() => {
      setApiKeys(FIXED_API_KEYS);
      if (typeof window !== "undefined") {
        Cookies.set("apiKeys", JSON.stringify(FIXED_API_KEYS), { path: "/" });
        setIsModelLoading("all");
        fetch("/api/models").then((response) => response.json()).then((data2) => {
          const typedData = data2;
          setModelList(typedData.modelList);
        }).catch((error) => {
          console.error("Error fetching model list:", error);
        }).finally(() => {
          setIsModelLoading(void 0);
        });
      }
    }, [providerList, provider]);
    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };
    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };
    const [user, setUser] = useState(null);
    const isAuthenticated = !!user;
    useEffect(() => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    }, []);
    const {
      monthlyLimit: messageMonthlyLimit,
      showLoginPrompt,
      showSubscriptionPlans: showMessageSubscriptionPlans,
      incrementMessageCount,
      resetMessageCount,
      closeLoginPrompt,
      closeSubscriptionPlans: closeMessageSubscriptionPlans,
      canSendMessage
    } = useMessageLimit(isAuthenticated, user);
    useExportLimit(isAuthenticated, user);
    const showSubscriptionPlans = showMessageSubscriptionPlans;
    const closeSubscriptionPlans = () => {
      closeMessageSubscriptionPlans();
    };
    const handleSendMessage = (event, messageInput) => {
      if (!canSendMessage) {
        incrementMessageCount();
        return;
      }
      const canSend = incrementMessageCount();
      if (!canSend) {
        return;
      }
      if (sendMessage) {
        sendMessage(event, messageInput);
        if (recognition) {
          recognition.abort();
          setTranscript("");
          setIsListening(false);
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: "" }
            };
            handleInputChange(syntheticEvent);
          }
        }
      }
    };
    const handleFileUpload = () => {
      const input2 = document.createElement("input");
      input2.type = "file";
      input2.accept = "image/*";
      input2.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e2) => {
            const base64Image = e2.target?.result;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };
      input2.click();
    };
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e2) => {
              const base64Image = e2.target?.result;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    const baseChat = /* @__PURE__ */ jsxs(
      "div",
      {
        ref,
        className: classNames(styles$1.BaseChat, "relative flex h-full w-full overflow-hidden"),
        "data-chat-visible": showChat,
        children: [
          /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(Menu, {}) }),
          /* @__PURE__ */ jsx(
            SubscriptionPlansPopup,
            {
              isOpen: showSubscriptionPlans,
              onClose: closeSubscriptionPlans
            }
          ),
          showLoginPrompt && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: closeLoginPrompt,
                className: "absolute top-2 right-2 text-gray-400 hover:text-white",
                children: /* @__PURE__ */ jsx("div", { className: "i-ph:x text-xl" })
              }
            ),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white mb-4", children: "Message Limit Reached" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-6", children: isAuthenticated ? `You've reached the limit of ${messageMonthlyLimit} messages for your current plan (${user?.plan || "Free"}).
                  Upgrade your plan to send more messages this month.` : `You've reached the limit of messages for non-registered users. 
                  Sign in or create an account to continue using Ada without limitations.` }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => window.location.href = "/login",
                  className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md",
                  children: "Sign In"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => window.location.href = "/register",
                  className: "w-full bg-transparent hover:bg-gray-800 text-white border border-gray-700 py-2 rounded-md",
                  children: "Create Account"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: closeLoginPrompt,
                  className: "w-full bg-transparent text-gray-400 hover:text-white py-2",
                  children: "Continue with Limited Access"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "flex flex-col lg:flex-row overflow-y-auto w-full h-full", children: [
            /* @__PURE__ */ jsxs("div", { className: classNames(styles$1.Chat, "flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full"), children: [
              !chatStarted && /* @__PURE__ */ jsxs("div", { id: "intro", className: "mt-[16vh] max-w-chat mx-auto text-center px-4 lg:px-0", children: [
                /* @__PURE__ */ jsx("h1", { className: "text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in", children: "Create your world" }),
                /* @__PURE__ */ jsx("p", { className: "text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200", children: "Bring ideas to life in seconds or get help on existing projects." })
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: classNames("pt-6 px-2 sm:px-6", {
                    "h-full flex flex-col": chatStarted
                  }),
                  ref: scrollRef,
                  children: [
                    /* @__PURE__ */ jsx(ClientOnly, { children: () => {
                      return chatStarted ? /* @__PURE__ */ jsx(
                        Messages,
                        {
                          ref: messageRef,
                          className: "flex flex-col w-full flex-1 max-w-chat pb-6 mx-auto z-1",
                          messages,
                          isStreaming
                        }
                      ) : null;
                    } }),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: classNames("flex flex-col gap-4 w-full max-w-chat mx-auto z-prompt mb-6", {
                          "sticky bottom-2": chatStarted
                        }),
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "bg-bolt-elements-background-depth-2", children: [
                            actionAlert && /* @__PURE__ */ jsx(
                              ChatAlert,
                              {
                                alert: actionAlert,
                                clearAlert: () => clearAlert?.(),
                                postMessage: (message) => {
                                  sendMessage?.({}, message);
                                  clearAlert?.();
                                }
                              }
                            ),
                            /* @__PURE__ */ jsx(SupabaseAlert, {})
                          ] }),
                          progressAnnotations && /* @__PURE__ */ jsx(ProgressCompilation, { data: progressAnnotations }),
                          /* @__PURE__ */ jsxs(
                            "div",
                            {
                              className: classNames(
                                "bg-bolt-elements-background-depth-2 p-3 rounded-lg border border-bolt-elements-borderColor relative w-full max-w-chat mx-auto z-prompt"
                                /*
                                 * {
                                 *   'sticky bottom-2': chatStarted,
                                 * },
                                 */
                              ),
                              children: [
                                /* @__PURE__ */ jsxs("svg", { className: classNames(styles$1.PromptEffectContainer), children: [
                                  /* @__PURE__ */ jsxs("defs", { children: [
                                    /* @__PURE__ */ jsxs(
                                      "linearGradient",
                                      {
                                        id: "line-gradient",
                                        x1: "20%",
                                        y1: "0%",
                                        x2: "-14%",
                                        y2: "10%",
                                        gradientUnits: "userSpaceOnUse",
                                        gradientTransform: "rotate(-45)",
                                        children: [
                                          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#1E40AF", stopOpacity: "0%" }),
                                          " ",
                                          /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "#1E40AF", stopOpacity: "80%" }),
                                          /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "#3B82F6", stopOpacity: "80%" }),
                                          " ",
                                          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#3B82F6", stopOpacity: "0%" })
                                        ]
                                      }
                                    ),
                                    /* @__PURE__ */ jsxs("linearGradient", { id: "shine-gradient", children: [
                                      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#60A5FA", stopOpacity: "0%" }),
                                      " ",
                                      /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "#60A5FA", stopOpacity: "80%" }),
                                      /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "#60A5FA", stopOpacity: "80%" }),
                                      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#60A5FA", stopOpacity: "0%" })
                                    ] })
                                  ] }),
                                  /* @__PURE__ */ jsx("rect", { className: classNames(styles$1.PromptEffectLine), pathLength: "100", strokeLinecap: "round" }),
                                  /* @__PURE__ */ jsx("rect", { className: classNames(styles$1.PromptShine), x: "48", y: "24", width: "70", height: "1" })
                                ] }),
                                /* @__PURE__ */ jsx(
                                  FilePreview,
                                  {
                                    files: uploadedFiles,
                                    imageDataList,
                                    onRemove: (index) => {
                                      setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
                                      setImageDataList?.(imageDataList.filter((_, i) => i !== index));
                                    }
                                  }
                                ),
                                /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(
                                  ScreenshotStateManager,
                                  {
                                    setUploadedFiles,
                                    setImageDataList,
                                    uploadedFiles,
                                    imageDataList
                                  }
                                ) }),
                                /* @__PURE__ */ jsxs(
                                  "div",
                                  {
                                    className: classNames(
                                      "relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg"
                                    ),
                                    children: [
                                      /* @__PURE__ */ jsx(
                                        "textarea",
                                        {
                                          ref: textareaRef,
                                          className: classNames(
                                            "w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm",
                                            "transition-all duration-200",
                                            "hover:border-bolt-elements-focus"
                                          ),
                                          onDragEnter: (e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.border = "2px solid #1488fc";
                                          },
                                          onDragOver: (e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.border = "2px solid #1488fc";
                                          },
                                          onDragLeave: (e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.border = "1px solid var(--bolt-elements-borderColor)";
                                          },
                                          onDrop: (e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.border = "1px solid var(--bolt-elements-borderColor)";
                                            const files = Array.from(e.dataTransfer.files);
                                            files.forEach((file) => {
                                              if (file.type.startsWith("image/")) {
                                                const reader = new FileReader();
                                                reader.onload = (e2) => {
                                                  const base64Image = e2.target?.result;
                                                  setUploadedFiles?.([...uploadedFiles, file]);
                                                  setImageDataList?.([...imageDataList, base64Image]);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            });
                                          },
                                          onKeyDown: (event) => {
                                            if (event.key === "Enter") {
                                              if (event.shiftKey) {
                                                return;
                                              }
                                              event.preventDefault();
                                              if (isStreaming) {
                                                handleStop?.();
                                                return;
                                              }
                                              if (event.nativeEvent.isComposing) {
                                                return;
                                              }
                                              handleSendMessage?.(event);
                                            }
                                          },
                                          value: input,
                                          onChange: (event) => {
                                            handleInputChange?.(event);
                                          },
                                          onPaste: handlePaste,
                                          style: {
                                            minHeight: TEXTAREA_MIN_HEIGHT,
                                            maxHeight: TEXTAREA_MAX_HEIGHT
                                          },
                                          placeholder: "How can Ada help you today?",
                                          translate: "no"
                                        }
                                      ),
                                      /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(
                                        SendButton,
                                        {
                                          show: input.length > 0 || isStreaming || uploadedFiles.length > 0,
                                          isStreaming,
                                          disabled: !providerList || providerList.length === 0,
                                          onClick: (event) => {
                                            if (isStreaming) {
                                              handleStop?.();
                                              return;
                                            }
                                            if (input.length > 0 || uploadedFiles.length > 0) {
                                              handleSendMessage?.(event);
                                            }
                                          }
                                        }
                                      ) }),
                                      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm p-4 pt-2", children: [
                                        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 items-center", children: [
                                          /* @__PURE__ */ jsx(IconButton, { title: "Upload file", className: "transition-all", onClick: () => handleFileUpload(), children: /* @__PURE__ */ jsx("div", { className: "i-ph:paperclip text-xl" }) }),
                                          /* @__PURE__ */ jsx(
                                            IconButton,
                                            {
                                              title: "Enhance prompt",
                                              disabled: input.length === 0 || enhancingPrompt,
                                              className: classNames("transition-all", enhancingPrompt ? "opacity-100" : ""),
                                              onClick: () => {
                                                enhancePrompt?.();
                                                toast.success("Prompt enhanced!");
                                              },
                                              children: enhancingPrompt ? /* @__PURE__ */ jsx("div", { className: "i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl animate-spin" }) : /* @__PURE__ */ jsx("div", { className: "i-bolt:stars text-xl" })
                                            }
                                          ),
                                          /* @__PURE__ */ jsx(
                                            SpeechRecognitionButton,
                                            {
                                              isListening,
                                              onStart: startListening,
                                              onStop: stopListening,
                                              disabled: isStreaming
                                            }
                                          ),
                                          chatStarted && /* @__PURE__ */ jsx(ClientOnly, { children: () => {
                                            const userData = localStorage.getItem("userData");
                                            let userPlan = "free";
                                            if (userData) {
                                              try {
                                                const parsedUserData = JSON.parse(userData);
                                                userPlan = parsedUserData.plan?.toLowerCase() || "free";
                                              } catch (error) {
                                                console.error("Error parsing user data:", error);
                                              }
                                            }
                                            return userPlan !== "free" ? /* @__PURE__ */ jsx(ExportChatButton, { exportChat }) : null;
                                          } }),
                                          /* @__PURE__ */ jsx(SupabaseConnection, {})
                                        ] }),
                                        input.length > 3 ? /* @__PURE__ */ jsxs("div", { className: "text-xs text-bolt-elements-textTertiary", children: [
                                          "Use ",
                                          /* @__PURE__ */ jsx("kbd", { className: "kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2", children: "Shift" }),
                                          " ",
                                          "+ ",
                                          /* @__PURE__ */ jsx("kbd", { className: "kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2", children: "Return" }),
                                          " ",
                                          "a new line"
                                        ] }) : null
                                      ] })
                                    ]
                                  }
                                )
                              ]
                            }
                          )
                        ]
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center gap-5", children: [
                !chatStarted && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
                  ImportButtons(importChat),
                  /* @__PURE__ */ jsx(GitCloneButton, { importChat })
                ] }),
                !chatStarted && ExamplePrompts((event, messageInput) => {
                  if (isStreaming) {
                    handleStop?.();
                    return;
                  }
                  handleSendMessage?.(event, messageInput);
                }),
                !chatStarted && /* @__PURE__ */ jsx(StarterTemplates, {})
              ] })
            ] }),
            /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(
              Workbench,
              {
                actionRunner: actionRunner ?? {},
                chatStarted,
                isStreaming
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50", children: isAuthenticated ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                localStorage.removeItem("userData");
                setUser(null);
                resetMessageCount();
                localStorage.removeItem("messageCount");
                localStorage.removeItem("bolt_profile");
                window.location.href = "/";
              },
              className: "bg-[#1a2b4c] hover:bg-[#1f3461] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg",
              children: [
                /* @__PURE__ */ jsx("div", { className: "i-ph:arrow-right text-sm" }),
                /* @__PURE__ */ jsx("span", { children: "Logout" })
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => window.location.href = "/login",
              className: "bg-[#1a2b4c] hover:bg-[#1f3461] text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg",
              children: [
                /* @__PURE__ */ jsx("div", { className: "i-ph:sign-in text-sm" }),
                /* @__PURE__ */ jsx("span", { children: "Login" })
              ]
            }
          ) })
        ]
      }
    );
    return /* @__PURE__ */ jsx(Tooltip.Provider, { delayDuration: 200, children: baseChat });
  }
);

const Chat = undefined;

const chatStore = map({
  started: false,
  aborted: false,
  showChat: true
});

const HeaderActionButtons = undefined;

const ChatDescription = undefined;

function Header() {
  const chat = useStore(chatStore);
  return /* @__PURE__ */ jsxs(
    "header",
    {
      className: classNames("flex items-center p-5 border-b h-[var(--header-height)]", {
        "border-transparent": !chat.started,
        "border-bolt-elements-borderColor": chat.started
      }),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer", children: [
          /* @__PURE__ */ jsx("div", { className: "i-ph:sidebar-simple-duotone text-xl" }),
          /* @__PURE__ */ jsxs("a", { href: "/", className: "text-2xl font-semibold text-accent flex items-center", children: [
            /* @__PURE__ */ jsx("img", { src: "/logo-light-styled.png", alt: "logo", className: "w-[90px] inline-block dark:hidden" }),
            /* @__PURE__ */ jsx("img", { src: "/logo-dark-styled.png", alt: "logo", className: "w-[90px] inline-block hidden dark:block" })
          ] })
        ] }),
        chat.started && // Display ChatDescription and HeaderActionButtons only when the chat has started.
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "flex-1 px-4 truncate text-center text-bolt-elements-textPrimary", children: /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(ChatDescription, {}) }) }),
          /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx("div", { className: "mr-1", children: /* @__PURE__ */ jsx(HeaderActionButtons, {}) }) })
        ] })
      ]
    }
  );
}

const rayContainer = "_";
const lightRay = "b";
const ray1 = "c";
const ray2 = "e";
const ray3 = "g";
const ray4 = "i";
const ray5 = "k";
const ray6 = "m";
const ray7 = "o";
const ray8 = "q";
const styles = {
	rayContainer: rayContainer,
	lightRay: lightRay,
	ray1: ray1,
	ray2: ray2,
	ray3: ray3,
	ray4: ray4,
	ray5: ray5,
	ray6: ray6,
	ray7: ray7,
	ray8: ray8};

const BackgroundRays = () => {
  return /* @__PURE__ */ jsxs("div", { className: `${styles.rayContainer} `, children: [
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray1}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray2}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray3}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray4}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray5}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray6}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray7}` }),
    /* @__PURE__ */ jsx("div", { className: `${styles.lightRay} ${styles.ray8}` })
  ] });
};

const meta$1 = () => {
  return [{ title: "Ada" }, { name: "description", content: "Talk with Ada, an AI assistant from StackBlitz" }];
};
const loader$2 = () => json({});
function Index$1() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full bg-bolt-elements-background-depth-1", children: [
    /* @__PURE__ */ jsx(BackgroundRays, {}),
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(ClientOnly, { fallback: /* @__PURE__ */ jsx(BaseChat, {}), children: () => /* @__PURE__ */ jsx(Chat, {}) })
  ] });
}

const route22 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index$1,
  loader: loader$2,
  meta: meta$1
}, Symbol.toStringTag, { value: 'Module' }));

async function loader$1(args) {
  return json({ id: args.params.id });
}

const route20 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index$1,
  loader: loader$1
}, Symbol.toStringTag, { value: 'Module' }));

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const action$1 = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  if (!name || !email || !password) {
    return json({ error: "All fields are required" });
  }
  if (!passwordRegex.test(password)) {
    return json({ error: "Password does not meet complexity requirements" });
  }
  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/create/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (data.status) {
      return json({ success: true, message: "Account created successfully. Please log in." });
    } else {
      return json({ error: data.msg });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return json({ error: "Failed to register user. Please try again." });
  }
};
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const validatePassword = (value) => {
    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password must contain at least 8 characters including uppercase, lowercase, number, and special character."
      );
    } else {
      setPasswordError("");
    }
    setPassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, value);
    }
  };
  const validateConfirmPassword = (value, pass = password) => {
    if (value !== pass) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
    setConfirmPassword(value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwordError || confirmPasswordError) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/create/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (data.status) {
        navigate("/login?registered=true");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50" }),
    /* @__PURE__ */ jsx("header", { className: "p-4 relative", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "12", stroke: "white", strokeWidth: "1.5" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "3", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "9", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "23", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "9", cy: "16", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "23", cy: "16", r: "1.5", fill: "white" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-semibold", children: "Ada" })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center p-6 relative", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-white", children: "Create Account" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-400", children: "Register to start using the platform" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800", children: [
        error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "text-gray-200 block", children: "Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "name",
                name: "name",
                type: "text",
                autoComplete: "name",
                placeholder: "Your full name",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true,
                value: name,
                onChange: (e) => setName(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-gray-200 block", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                placeholder: "your@email.com",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-gray-200 block", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  name: "password",
                  type: showPassword ? "text" : "password",
                  autoComplete: "new-password",
                  placeholder: "••••••••",
                  className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md",
                  required: true,
                  value: password,
                  onChange: (e) => validatePassword(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0",
                  onClick: () => setShowPassword(!showPassword),
                  children: /* @__PURE__ */ jsx("div", { className: showPassword ? "i-ph:eye-slash text-lg" : "i-ph:eye text-lg" })
                }
              )
            ] }),
            passwordError && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm mt-1", children: passwordError })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "confirm-password", className: "text-gray-200 block", children: "Confirm Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "confirm-password",
                  name: "confirm-password",
                  type: showConfirmPassword ? "text" : "password",
                  autoComplete: "new-password",
                  placeholder: "••••••••",
                  className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md",
                  required: true,
                  value: confirmPassword,
                  onChange: (e) => validateConfirmPassword(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0",
                  onClick: () => setShowConfirmPassword(!showConfirmPassword),
                  children: /* @__PURE__ */ jsx("div", { className: showConfirmPassword ? "i-ph:eye-slash text-lg" : "i-ph:eye text-lg" })
                }
              )
            ] }),
            confirmPasswordError && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm mt-1", children: confirmPasswordError })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white flex items-center justify-center gap-2 py-2 rounded-md",
              disabled: isLoading || !!passwordError || !!confirmPasswordError,
              children: [
                /* @__PURE__ */ jsx("div", { className: "i-ph:user-plus text-lg" }),
                isLoading ? "Creating Account..." : "Create Account"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-gray-200 hover:text-white", children: "Sign in" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "py-4 relative", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto text-center text-gray-500 text-sm", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Ada. All rights reserved."
    ] }) })
  ] });
}

const route21 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: RegisterPage
}, Symbol.toStringTag, { value: 'Module' }));

const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return json({ error: "Email and password are required" });
  }
  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      return json({ error: "Invalid credentials" });
    }
    const userData = await response.json();
    if (!userData.session_token) {
      return json({ error: "Error to proceed to login" });
    }
    return json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at,
        session_token: userData.session_token
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Error to proceed to login. Please try again." });
  }
};
function LoginPage() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      navigate("/");
    }
  }, [navigate]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });
      if (!response.ok) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }
      const userData = await response.json();
      if (!userData.session_token) {
        setError("Error to proceed to login");
        setIsLoading(false);
        return;
      }
      const userDataForStorage = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at,
        session_token: userData.session_token,
        role: userData.role || "user",
        plan_status: userData.plan_status || "active",
        plan: userData.plan || "free"
      };
      localStorage.setItem("userData", JSON.stringify(userDataForStorage));
      updateProfile({
        username: userDataForStorage.name || "",
        bio: userDataForStorage.email || "",
        avatar: ""
      });
      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50" }),
    /* @__PURE__ */ jsx("header", { className: "p-4 relative", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "12", stroke: "white", strokeWidth: "1.5" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "3", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "9", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "16", cy: "23", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "9", cy: "16", r: "1.5", fill: "white" }),
        /* @__PURE__ */ jsx("circle", { cx: "23", cy: "16", r: "1.5", fill: "white" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-white text-xl font-semibold", children: "Ada" })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center p-6 relative", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-white", children: "Login" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-400", children: "Sign in to your account to access the platform" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800", children: [
        error && /* @__PURE__ */ jsx("div", { className: "bg-red-500 text-white p-3 rounded-md mb-4", children: error }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-gray-200 block", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                placeholder: "your@email.com",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-gray-200 block", children: "Password" }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
              "input",
              {
                id: "password",
                name: "password",
                type: "password",
                autoComplete: "current-password",
                placeholder: "••••••••",
                className: "w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md",
                required: true
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-sm text-gray-400 hover:text-white", children: "Forgot your password?" }) })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              className: "w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white flex items-center justify-center gap-2 py-2 rounded-md",
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsx("div", { className: "i-ph:sign-in text-lg" }),
                isLoading ? "Signing in..." : "Sign in"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/register", className: "text-gray-200 hover:text-white", children: "Register" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "py-4 relative", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto text-center text-gray-500 text-sm", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Ada. All rights reserved."
    ] }) })
  ] });
}

const route23 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action,
  default: LoginPage
}, Symbol.toStringTag, { value: 'Module' }));

const GitUrlImport = undefined;

const meta = () => {
  return [{ title: "Ada" }, { name: "description", content: "Talk with Ada, an AI assistant from StackBlitz" }];
};
async function loader(args) {
  return json({ url: args.params.url });
}
function Index() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full bg-bolt-elements-background-depth-1", children: [
    /* @__PURE__ */ jsx(BackgroundRays, {}),
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(ClientOnly, { fallback: /* @__PURE__ */ jsx(BaseChat, {}), children: () => /* @__PURE__ */ jsx(GitUrlImport, {}) })
  ] });
}

const route24 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index,
  loader,
  meta
}, Symbol.toStringTag, { value: 'Module' }));

const serverManifest = {'entry':{'module':'/assets/entry.client-C7-M-CS0.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js'],'css':[]},'routes':{'root':{'id':'root','parentId':undefined,'path':'','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/root-CL6FcWz9.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js','/assets/index-BoFGafk4.js','/assets/index-DgoachrA.js'],'css':['/assets/root-at6U2ugR.css']},'routes/webcontainer.preview.$id':{'id':'routes/webcontainer.preview.$id','parentId':'root','path':'webcontainer/preview/:id','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/webcontainer.preview._id-WqT1lCio.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js'],'css':[]},'routes/reset-code-verification':{'id':'routes/reset-code-verification','parentId':'root','path':'reset-code-verification','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/reset-code-verification-DzNlk2IF.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js'],'css':[]},'routes/api.supabase.variables':{'id':'routes/api.supabase.variables','parentId':'routes/api.supabase','path':'variables','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.supabase.variables-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.models.$provider':{'id':'routes/api.models.$provider','parentId':'routes/api.models','path':':provider','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.models._provider-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.system.app-info':{'id':'routes/api.system.app-info','parentId':'root','path':'api/system/app-info','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.system.app-info-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.system.git-info':{'id':'routes/api.system.git-info','parentId':'root','path':'api/system/git-info','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.system.git-info-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.supabase.query':{'id':'routes/api.supabase.query','parentId':'routes/api.supabase','path':'query','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.supabase.query-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.check-env-key':{'id':'routes/api.check-env-key','parentId':'root','path':'api/check-env-key','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.check-env-key-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.git-proxy.$':{'id':'routes/api.git-proxy.$','parentId':'root','path':'api/git-proxy/*','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.git-proxy._-l0sNRNKZ.js','imports':[],'css':[]},'routes/forgot-password':{'id':'routes/forgot-password','parentId':'root','path':'forgot-password','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/forgot-password-DMfCBzsO.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js'],'css':[]},'routes/api.enhancer':{'id':'routes/api.enhancer','parentId':'root','path':'api/enhancer','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.enhancer-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.supabase':{'id':'routes/api.supabase','parentId':'root','path':'api/supabase','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.supabase-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.llmcall':{'id':'routes/api.llmcall','parentId':'root','path':'api/llmcall','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.llmcall-l0sNRNKZ.js','imports':[],'css':[]},'routes/verify-code':{'id':'routes/verify-code','parentId':'root','path':'verify-code','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/verify-code-yjgAd3GG.js','imports':['/assets/index-4MufcReh.js'],'css':[]},'routes/api.deploy':{'id':'routes/api.deploy','parentId':'root','path':'api/deploy','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.deploy-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.health':{'id':'routes/api.health','parentId':'root','path':'api/health','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.health-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.models':{'id':'routes/api.models','parentId':'root','path':'api/models','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.models-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.update':{'id':'routes/api.update','parentId':'root','path':'api/update','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.update-l0sNRNKZ.js','imports':[],'css':[]},'routes/api.chat':{'id':'routes/api.chat','parentId':'root','path':'api/chat','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/api.chat-l0sNRNKZ.js','imports':[],'css':[]},'routes/chat.$id':{'id':'routes/chat.$id','parentId':'root','path':'chat/:id','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/chat._id-BGkKKePU.js','imports':['/assets/_index-Dn136vkS.js','/assets/index-4MufcReh.js','/assets/Header-D61-KTtz.js','/assets/index-BoFGafk4.js','/assets/index-DgoachrA.js','/assets/profile-BYW5p1bK.js','/assets/components-ki2z-XRs.js'],'css':['/assets/Header-DeXKFCkm.css']},'routes/register':{'id':'routes/register','parentId':'root','path':'register','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/register-DEIABTFe.js','imports':['/assets/index-4MufcReh.js','/assets/profile-BYW5p1bK.js','/assets/components-ki2z-XRs.js','/assets/index-DgoachrA.js'],'css':[]},'routes/_index':{'id':'routes/_index','parentId':'root','path':undefined,'index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/_index-Dn136vkS.js','imports':['/assets/index-4MufcReh.js','/assets/Header-D61-KTtz.js','/assets/index-BoFGafk4.js','/assets/index-DgoachrA.js','/assets/profile-BYW5p1bK.js','/assets/components-ki2z-XRs.js'],'css':['/assets/Header-DeXKFCkm.css']},'routes/login':{'id':'routes/login','parentId':'root','path':'login','index':undefined,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/login-Bi5mdEmO.js','imports':['/assets/index-4MufcReh.js','/assets/components-ki2z-XRs.js','/assets/profile-BYW5p1bK.js','/assets/index-DgoachrA.js'],'css':[]},'routes/git':{'id':'routes/git','parentId':'root','path':'git','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/git-DXesxvRo.js','imports':['/assets/index-4MufcReh.js','/assets/Header-D61-KTtz.js','/assets/index-BoFGafk4.js','/assets/index-DgoachrA.js','/assets/profile-BYW5p1bK.js','/assets/components-ki2z-XRs.js'],'css':['/assets/Header-DeXKFCkm.css']}},'url':'/assets/manifest-20f51569.js','version':'20f51569'};

/**
       * `mode` is only relevant for the old Remix compiler but
       * is included here to satisfy the `ServerBuild` typings.
       */
      const mode = "production";
      const assetsBuildDirectory = "build/client";
      const basename = "/";
      const future = {"v3_fetcherPersist":true,"v3_relativeSplatPath":true,"v3_throwAbortReason":true,"v3_routeConfig":false,"v3_singleFetch":false,"v3_lazyRouteDiscovery":true,"unstable_optimizeDeps":false};
      const isSpaMode = false;
      const publicPath = "/";
      const entry = { module: entryServer };
      const routes = {
        "root": {
          id: "root",
          parentId: undefined,
          path: "",
          index: undefined,
          caseSensitive: undefined,
          module: route0
        },
  "routes/webcontainer.preview.$id": {
          id: "routes/webcontainer.preview.$id",
          parentId: "root",
          path: "webcontainer/preview/:id",
          index: undefined,
          caseSensitive: undefined,
          module: route1
        },
  "routes/reset-code-verification": {
          id: "routes/reset-code-verification",
          parentId: "root",
          path: "reset-code-verification",
          index: undefined,
          caseSensitive: undefined,
          module: route2
        },
  "routes/api.supabase.variables": {
          id: "routes/api.supabase.variables",
          parentId: "routes/api.supabase",
          path: "variables",
          index: undefined,
          caseSensitive: undefined,
          module: route3
        },
  "routes/api.models.$provider": {
          id: "routes/api.models.$provider",
          parentId: "routes/api.models",
          path: ":provider",
          index: undefined,
          caseSensitive: undefined,
          module: route4
        },
  "routes/api.system.app-info": {
          id: "routes/api.system.app-info",
          parentId: "root",
          path: "api/system/app-info",
          index: undefined,
          caseSensitive: undefined,
          module: route5
        },
  "routes/api.system.git-info": {
          id: "routes/api.system.git-info",
          parentId: "root",
          path: "api/system/git-info",
          index: undefined,
          caseSensitive: undefined,
          module: route6
        },
  "routes/api.supabase.query": {
          id: "routes/api.supabase.query",
          parentId: "routes/api.supabase",
          path: "query",
          index: undefined,
          caseSensitive: undefined,
          module: route7
        },
  "routes/api.check-env-key": {
          id: "routes/api.check-env-key",
          parentId: "root",
          path: "api/check-env-key",
          index: undefined,
          caseSensitive: undefined,
          module: route8
        },
  "routes/api.git-proxy.$": {
          id: "routes/api.git-proxy.$",
          parentId: "root",
          path: "api/git-proxy/*",
          index: undefined,
          caseSensitive: undefined,
          module: route9
        },
  "routes/forgot-password": {
          id: "routes/forgot-password",
          parentId: "root",
          path: "forgot-password",
          index: undefined,
          caseSensitive: undefined,
          module: route10
        },
  "routes/api.enhancer": {
          id: "routes/api.enhancer",
          parentId: "root",
          path: "api/enhancer",
          index: undefined,
          caseSensitive: undefined,
          module: route11
        },
  "routes/api.supabase": {
          id: "routes/api.supabase",
          parentId: "root",
          path: "api/supabase",
          index: undefined,
          caseSensitive: undefined,
          module: route12
        },
  "routes/api.llmcall": {
          id: "routes/api.llmcall",
          parentId: "root",
          path: "api/llmcall",
          index: undefined,
          caseSensitive: undefined,
          module: route13
        },
  "routes/verify-code": {
          id: "routes/verify-code",
          parentId: "root",
          path: "verify-code",
          index: undefined,
          caseSensitive: undefined,
          module: route14
        },
  "routes/api.deploy": {
          id: "routes/api.deploy",
          parentId: "root",
          path: "api/deploy",
          index: undefined,
          caseSensitive: undefined,
          module: route15
        },
  "routes/api.health": {
          id: "routes/api.health",
          parentId: "root",
          path: "api/health",
          index: undefined,
          caseSensitive: undefined,
          module: route16
        },
  "routes/api.models": {
          id: "routes/api.models",
          parentId: "root",
          path: "api/models",
          index: undefined,
          caseSensitive: undefined,
          module: route17
        },
  "routes/api.update": {
          id: "routes/api.update",
          parentId: "root",
          path: "api/update",
          index: undefined,
          caseSensitive: undefined,
          module: route18
        },
  "routes/api.chat": {
          id: "routes/api.chat",
          parentId: "root",
          path: "api/chat",
          index: undefined,
          caseSensitive: undefined,
          module: route19
        },
  "routes/chat.$id": {
          id: "routes/chat.$id",
          parentId: "root",
          path: "chat/:id",
          index: undefined,
          caseSensitive: undefined,
          module: route20
        },
  "routes/register": {
          id: "routes/register",
          parentId: "root",
          path: "register",
          index: undefined,
          caseSensitive: undefined,
          module: route21
        },
  "routes/_index": {
          id: "routes/_index",
          parentId: "root",
          path: undefined,
          index: true,
          caseSensitive: undefined,
          module: route22
        },
  "routes/login": {
          id: "routes/login",
          parentId: "root",
          path: "login",
          index: undefined,
          caseSensitive: undefined,
          module: route23
        },
  "routes/git": {
          id: "routes/git",
          parentId: "root",
          path: "git",
          index: undefined,
          caseSensitive: undefined,
          module: route24
        }
      };

export { serverManifest as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, mode, publicPath, routes };
