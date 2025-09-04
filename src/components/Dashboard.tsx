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

  // Initialize theme on component mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Force theme application
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
      }

      // Also set CSS custom properties
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

  // Auto-refresh widgets based on their refresh intervals
  useEffect(() => {
    const intervals = widgets.map((widget) => {
      return setInterval(() => {
        refreshWidget(widget.id);
      }, widget.refreshInterval * 1000);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [widgets, refreshWidget]);

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

  const handleRefreshWidget = async (id: string) => {
    try {
      await refreshWidget(id);
      addToast({
        type: "success",
        title: "Widget refreshed",
        message: "Data has been updated successfully",
      });
    } catch {
      addToast({
        type: "error",
        title: "Refresh failed",
        message: "Failed to refresh widget data",
      });
    }
  };

  const handleDeleteWidget = (id: string) => {
    if (confirm("Are you sure you want to delete this widget?")) {
      removeWidget(id);
      addToast({
        type: "success",
        title: "Widget deleted",
        message: "Widget has been removed from your dashboard",
      });
    }
  };

  const handleSaveWidget = (updatedWidget: Widget) => {
    updateWidget(updatedWidget.id, updatedWidget);
    addToast({
      type: "success",
      title: "Widget updated",
      message: "Widget configuration has been saved successfully",
    });
  };

  const handleConfigureWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (widget) {
      setConfiguringWidget(widget);
      setIsConfigModalOpen(true);
    }
  };

  const handleEditWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (widget) {
      setConfiguringWidget(widget);
      setIsConfigModalOpen(true);
    }
  };

  const handleWidgetClick = (widget: Widget) => {
    setDetailWidget(widget);
    setIsDetailOpen(true);
  };

  const handleAddDemoWidgets = async () => {
    const demoWidgets = [
      {
        name: "Bitcoin Price",
        type: "card" as const,
        apiUrl: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
        refreshInterval: 30,
        selectedFields: [
          { path: "data.currency", label: "Currency", type: "string" as const },
          {
            path: "data.rates.USD",
            label: "USD Price",
            type: "string" as const,
            format: "currency" as const,
          },
          {
            path: "data.rates.EUR",
            label: "EUR Price",
            type: "string" as const,
            format: "currency" as const,
          },
        ],
        displayMode: "card" as const,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {},
      },
      {
        name: "Stock Market Data",
        type: "table" as const,
        apiUrl: "mock://stock",
        refreshInterval: 60,
        selectedFields: [
          { path: "symbol", label: "Symbol", type: "string" as const },
          {
            path: "price",
            label: "Price",
            type: "number" as const,
            format: "currency" as const,
          },
          {
            path: "change",
            label: "Change",
            type: "number" as const,
            format: "currency" as const,
          },
          {
            path: "changePercent",
            label: "Change %",
            type: "number" as const,
            format: "percentage" as const,
          },
        ],
        displayMode: "table" as const,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          searchEnabled: true,
          paginationEnabled: true,
          itemsPerPage: 5,
        },
      },
      {
        name: "Stock Price Chart",
        type: "chart" as const,
        apiUrl: "mock://stock",
        refreshInterval: 60,
        selectedFields: [
          { path: "symbol", label: "Symbol", type: "string" as const },
          { path: "price", label: "Price", type: "number" as const },
          { path: "change", label: "Change", type: "number" as const },
          { path: "changePercent", label: "Change %", type: "number" as const },
        ],
        displayMode: "chart" as const,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          chartType: "line" as const,
        },
      },
      {
        name: "Forex Chart",
        type: "chart" as const,
        apiUrl: "mock://forex",
        refreshInterval: 120,
        selectedFields: [
          { path: "rates.EUR", label: "EUR Rate", type: "number" as const },
          { path: "rates.GBP", label: "GBP Rate", type: "number" as const },
          { path: "rates.JPY", label: "JPY Rate", type: "number" as const },
        ],
        displayMode: "chart" as const,
        position: { x: 0, y: 0 },
        size: { width: 400, height: 300 },
        config: {
          chartType: "line" as const,
        },
      },
    ];

    // Add widgets sequentially to ensure proper data fetching
    for (const widget of demoWidgets) {
      await addWidget(widget);
    }

    addToast({
      type: "success",
      title: "Demo widgets added!",
      message: "Four sample widgets have been added to your dashboard",
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

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

      // Clear existing widgets and add imported ones
      widgets.forEach((widget) => removeWidget(widget.id));

      // Add imported widgets sequentially to ensure proper data fetching
      for (const widget of config.widgets) {
        await addWidget(widget);
      }

      // Set theme if different
      if (config.theme !== theme) {
        setTheme(config.theme);
      }

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

  const handleLoadTemplate = async (
    template: (typeof dashboardTemplates)[0]
  ) => {
    if (
      widgets.length > 0 &&
      !confirm("This will replace your current dashboard. Are you sure?")
    ) {
      return;
    }

    // Clear existing widgets
    widgets.forEach((widget) => removeWidget(widget.id));

    // Add template widgets sequentially to ensure proper data fetching
    for (const widget of template.widgets) {
      await addWidget(widget);
    }

    addToast({
      type: "success",
      title: "Template loaded",
      message: `${template.name} template has been applied to your dashboard`,
    });

    setIsTemplateModalOpen(false);
  };

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
            <div className="flex items-center gap-3 justify-between">
              {/* <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-xl shadow"> */}
              {/* <BarChart3 className="h-8 w-8 text-white" /> */}
              <svg
                width="320"
                height="50"
                viewBox="0 0 620 90"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect
                  width="320"
                  height="90"
                  rx="12"
                  fill="var(--card)"
                />

                {/* Green candlestick */}
                <rect
                  x="35"
                  y="30"
                  width="10"
                  height="30"
                  rx="2"
                  fill="var(--success)"
                />
                <line
                  x1="40"
                  y1="20"
                  x2="40"
                  y2="30"
                  stroke="var(--success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="40"
                  y1="60"
                  x2="40"
                  y2="70"
                  stroke="var(--success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* White candlestick (theme-based) */}
                <rect
                  x="55"
                  y="20"
                  width="10"
                  height="40"
                  rx="2"
                  fill="var(--foreground)"
                />
                <line
                  x1="60"
                  y1="10"
                  x2="60"
                  y2="20"
                  stroke="var(--foreground)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="60"
                  y1="60"
                  x2="60"
                  y2="75"
                  stroke="var(--foreground)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Green candlestick */}
                <rect
                  x="75"
                  y="25"
                  width="10"
                  height="35"
                  rx="2"
                  fill="var(--success)"
                />
                <line
                  x1="80"
                  y1="15"
                  x2="80"
                  y2="25"
                  stroke="var(--success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="80"
                  y1="60"
                  x2="80"
                  y2="70"
                  stroke="var(--success)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Text */}
                <text
                  x="120"
                  y="55"
                  fontFamily="Inter, sans-serif"
                  fontSize="36"
                  fontWeight="700"
                  fill="var(--foreground)"
                >
                  FinBoard
                </text>
              </svg>

              {/* </div> */}
              <div>
                {/* <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  FinBoard
                </h1> */}
                {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                  Build your custom finance dashboard with real-time data
                </p> */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                {widgets.length} active widget{widgets.length !== 1 ? "s" : ""}{" "}
                • Real-time data
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportDashboard}
                className="h-8 w-8 p-0"
                title="Export dashboard"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportDashboard}
                className="h-8 w-8 p-0"
                title="Import dashboard"
              >
                <Upload className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTemplateModalOpen(true)}
                className="h-8 w-8 p-0"
                title="Load template"
              >
                <Layout className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearStorage}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Clear storage (if having issues)"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-[#1e293b] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
            <h2
              className="text-4xl font-extrabold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Build Your Finance Dashboard
            </h2>
            <p
              className="mb-10 max-w-2xl mx-auto text-lg"
              style={{ color: "var(--muted-foreground)" }}
            >
              Create custom widgets by connecting to any finance API. Track
              stocks, crypto, forex, or economic indicators - all in real-time.
            </p>
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 max-w-4xl mx-auto">
              <div
                className="text-center p-6 rounded-xl shadow-sm"
                style={{ background: "var(--card)" }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Multiple Widget Types
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cards, tables, and charts for different data visualization
                  needs
                </p>
              </div>
              <div
                className="text-center p-6 rounded-xl shadow-sm"
                style={{ background: "var(--card)" }}
              >
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Real-time Updates
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Configurable refresh intervals to keep your data current
                </p>
              </div>
              <div
                className="text-center p-6 rounded-xl shadow-sm"
                style={{ background: "var(--card)" }}
              >
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Easy Configuration
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Click any widget to configure fields, API settings, and more
                </p>
              </div>
            </div>
            <div className="flex gap-6 justify-center">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#1e293b] hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Widget
              </Button>
              <Button
                onClick={handleAddDemoWidgets}
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-2 hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full"
              >
                Try Demo Data (4 widgets)
              </Button>
            </div>
          </div>
        ) : (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext
              items={widgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 
                 gap-6 auto-rows-fr items-stretch"
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex flex-col rounded-lg transition hover:shadow-lg hover:shadow-green-500/50 h-auto md:h-full"
                  >
                    <SortableWidget
                      widget={widget}
                      onRefresh={handleRefreshWidget}
                      onConfigure={handleConfigureWidget}
                      onDelete={handleDeleteWidget}
                      onEdit={handleEditWidget}
                      onClick={handleWidgetClick}
                    />
                  </div>
                ))}

                {/* Add Widget Placeholder */}
                <div
                  className="h-full flex flex-col justify-center border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    boxShadow: "0 0 0 0 rgba(34,197,94,0)",
                  }}
                  onClick={() => setIsAddModalOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#22c55e";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px 2px rgba(34,197,94,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 0 rgba(34,197,94,0)";
                  }}
                >
                  <div
                    className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--muted)" }}
                  >
                    <Plus
                      className="h-8 w-8"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  </div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Add Widget
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Connect to a finance API and create a custom widget
                  </p>
                </div>
              </div>
            </SortableContext>

            {/* Drag overlay must stay inside DndContext */}
            <DragOverlay>
              {activeWidget ? (
                <div className="opacity-50">
                  <SortableWidget
                    widget={activeWidget}
                    onRefresh={handleRefreshWidget}
                    onConfigure={handleConfigureWidget}
                    onDelete={handleDeleteWidget}
                    onEdit={handleEditWidget}
                    onClick={handleWidgetClick}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Footer */}
      {widgets.length > 0 && (
        <footer
          className="mt-16 shadow-inner mb-0"
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                FinBoard Dashboard • {widgets.length} widget
                {widgets.length !== 1 ? "s" : ""} active
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Widget Configuration Modal */}
      {configuringWidget && (
        <WidgetConfigModal
          widget={configuringWidget}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setConfiguringWidget(null);
          }}
          onSave={handleSaveWidget}
          onDelete={handleDeleteWidget}
        />
      )}

      {/* Widget Detail Modal */}
      {detailWidget && (
        <WidgetDetailModal
          isOpen={isDetailOpen}
          widget={detailWidget}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailWidget(null);
          }}
          onRefresh={handleRefreshWidget}
          onConfigure={(id) => {
            setIsDetailOpen(false);
            const w = widgets.find((x) => x.id === id) || null;
            setConfiguringWidget(w);
            setIsConfigModalOpen(true);
          }}
          onDelete={(id) => {
            setIsDetailOpen(false);
            handleDeleteWidget(id);
          }}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <DashboardContent />
      </ErrorBoundary>
    </ToastProvider>
  );
};

export { Dashboard };
