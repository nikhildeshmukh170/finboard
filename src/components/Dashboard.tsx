"use client";
import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableWidget } from "@/components/widgets/SortableWidget";
import { AddWidgetModal } from "@/components/widgets/AddWidgetModal";
import { WidgetConfigModal } from "@/components/widgets/WidgetConfigModal";
import { WidgetDetailModal } from "@/components/widgets/WidgetDetailModal";
import { TemplateModal } from "@/components/widgets/TemplateModal";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { useDashboardStore } from "@/stores/dashboard";
import { Widget } from "@/types";
import {
  Plus,
  BarChart3,
  Moon,
  Sun,
  RotateCcw,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Layout,
  Menu,
  X,
} from "lucide-react";
import { clearDashboardStorage } from "@/lib/clearStorage";
import {
  exportDashboard,
  importDashboard,
  downloadDashboard,
  uploadDashboard,
} from "@/lib/dashboardExport";
import { dashboardTemplates } from "@/lib/dashboardTemplates";

const DashboardContent: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
  const [configuringWidget, setConfiguringWidget] = useState<Widget | null>(
    null
  );
  const [detailWidget, setDetailWidget] = useState<Widget | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addToast } = useToast();

  const {
    widgets,
    layout,
    theme,
    isLoading,
    error,
    setTheme,
    addWidget,
    updateWidget,
    refreshWidget,
    removeWidget,
    reorderWidgets,
    clearError,
  } = useDashboardStore();

  // --- theme init ---
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
      }
      document.documentElement.style.setProperty(
        "--background",
        theme === "dark" ? "#0f172a" : "#ffffff"
      );
      document.documentElement.style.setProperty(
        "--foreground",
        theme === "dark" ? "#f8fafc" : "#1a1a1a"
      );
    }
  }, [theme]);

  // --- auto refresh ---
  useEffect(() => {
    const intervals = widgets.map((widget) =>
      setInterval(() => {
        refreshWidget(widget.id);
      }, widget.refreshInterval * 1000)
    );
    return () => intervals.forEach((i) => clearInterval(i));
  }, [widgets, refreshWidget]);

  // --- drag handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const widget = widgets.find((w) => w.id === event.active.id);
    setActiveWidget(widget || null);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, movedWidget);
      reorderWidgets(newWidgets.map((w) => w.id));
    }
    setActiveWidget(null);
  };

  // --- widget actions ---
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const handleClearStorage = () => {
    if (confirm("This will clear all your dashboard data. Are you sure?")) {
      clearDashboardStorage();
      window.location.reload();
    }
  };
  const handleExportDashboard = () => {
    try {
      const config = exportDashboard(widgets, layout, theme);
      downloadDashboard(
        config,
        `finboard-dashboard-${new Date().toISOString().split("T")[0]}.json`
      );
      addToast({
        type: "success",
        title: "Dashboard exported",
        message: "Your dashboard configuration has been downloaded",
      });
    } catch {
      addToast({
        type: "error",
        title: "Export failed",
        message: "Failed to export dashboard configuration",
      });
    }
  };
  const handleImportDashboard = async () => {
    try {
      const configString = await uploadDashboard();
      const config = importDashboard(configString);
      if (!config) {
        addToast({
          type: "error",
          title: "Import failed",
          message: "Invalid dashboard configuration file",
        });
        return;
      }
      widgets.forEach((w) => removeWidget(w.id));
      for (const w of config.widgets) await addWidget(w);
      if (config.theme !== theme) setTheme(config.theme);
      addToast({
        type: "success",
        title: "Dashboard imported",
        message: "Your dashboard configuration has been loaded successfully",
      });
    } catch {
      addToast({
        type: "error",
        title: "Import failed",
        message: "Failed to import dashboard configuration",
      });
    }
  };
  const handleLoadTemplate = async (template: typeof dashboardTemplates[0]) => {
    if (
      widgets.length > 0 &&
      !confirm("This will replace your current dashboard. Are you sure?")
    ) {
      return;
    }
    widgets.forEach((w) => removeWidget(w.id));
    for (const w of template.widgets) await addWidget(w);
    addToast({
      type: "success",
      title: "Template loaded",
      message: `${template.name} template has been applied to your dashboard`,
    });
    setIsTemplateModalOpen(false);
  };

  // --- error state ---
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--destructive)" }}
          >
            Error
          </h2>
          <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
            {error}
          </p>
          <Button onClick={clearError}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 shadow-sm"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg
                width="300"
                height="40"
                viewBox="0 0 620 90"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="320" height="90" fill="#0f172a" rx="12" />
                <rect x="35" y="30" width="10" height="30" fill="#10b981" rx="2" />
                <line
                  x1="40"
                  y1="20"
                  x2="40"
                  y2="30"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="60"
                  x2="40"
                  y2="70"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect x="55" y="20" width="10" height="40" fill="#ffffff" rx="2" />
                <line
                  x1="60"
                  y1="10"
                  x2="60"
                  y2="20"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="60"
                  y1="60"
                  x2="60"
                  y2="75"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect x="75" y="25" width="10" height="35" fill="#10b981" rx="2" />
                <line
                  x1="80"
                  y1="15"
                  x2="80"
                  y2="25"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="80"
                  y1="60"
                  x2="80"
                  y2="70"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text
                  x="120"
                  y="55"
                  fontFamily="Inter, sans-serif"
                  fontSize="30"
                  fill="#ffffff"
                  fontWeight="700"
                >
                  FinBoard
                </text>
              </svg>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                {widgets.length} active widget{widgets.length !== 1 ? "s" : ""} •
                Real-time data
              </div>
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExportDashboard} className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleImportDashboard} className="h-8 w-8 p-0">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsTemplateModalOpen(true)} className="h-8 w-8 p-0">
                <Layout className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearStorage} className="h-8 w-8 p-0 text-red-600">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Widget
              </Button>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-8 w-8 p-0"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-[var(--card)] px-4 py-3 space-y-2">
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              {widgets.length} active widget{widgets.length !== 1 ? "s" : ""} •
              Real-time data
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme
              </Button>
              <Button variant="outline" onClick={handleExportDashboard}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button variant="outline" onClick={handleImportDashboard}>
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
              <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
                <Layout className="h-4 w-4 mr-2" /> Load Template
              </Button>
              <Button variant="outline" onClick={handleClearStorage} className="text-red-600">
                <RotateCcw className="h-4 w-4 mr-2" /> Clear Storage
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Widget
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Widgets grid */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 auto-rows-fr items-stretch">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex flex-col rounded-lg transition hover:shadow-lg hover:shadow-green-500/50 h-auto md:h-full"
                >
                  <SortableWidget
                    widget={widget}
                    onRefresh={refreshWidget}
                    onConfigure={() => {}}
                    onDelete={removeWidget}
                    onEdit={() => {}}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeWidget ? (
              <div className="opacity-50">
                <SortableWidget widget={activeWidget} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Footer */}
      {widgets.length > 0 && (
        <footer
          className="mt-16 shadow-inner mb-0"
          style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                FinBoard Dashboard • {widgets.length} widget{widgets.length !== 1 ? "s" : ""} active
              </div>
              <div className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <AddWidgetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {configuringWidget && (
        <WidgetConfigModal
          widget={configuringWidget}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setConfiguringWidget(null);
          }}
          onSave={() => {}}
          onDelete={() => {}}
        />
      )}
      {detailWidget && (
        <WidgetDetailModal
          isOpen={isDetailOpen}
          widget={detailWidget}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailWidget(null);
          }}
        />
      )}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
};

const Dashboard: React.FC = () => (
  <ToastProvider>
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  </ToastProvider>
);

export { Dashboard };