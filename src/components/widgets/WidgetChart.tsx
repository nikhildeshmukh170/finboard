"use client";
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Widget } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RefreshCw, Settings, Trash2, TrendingUp } from "lucide-react";
import { cn, getNestedValue, formatLastUpdated } from "@/lib/utils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WidgetChartProps {
  widget: Widget;
  onRefresh: (id: string) => void;
  onConfigure: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick?: (widget: Widget) => void;
}

const WidgetChart: React.FC<WidgetChartProps> = ({
  widget,
  onRefresh,
  onConfigure,
  onDelete,
  onClick,
}) => {
  const chartData = useMemo(() => {
    console.log("🔄 WidgetChart - Processing data for widget:", widget.name);

    if (!widget.data || !widget.selectedFields.length) {
      console.log("❌ No data or selected fields");
      return null;
    }

    let labels: string[] = [];
    let datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }> = [];

    // Handle forex-style data
    if (widget.data.rates && typeof widget.data.rates === "object") {
      console.log("💱 Processing forex-style data");

      const selectedNumericFields = widget.selectedFields.filter(
        (field) => field.type === "number" && field.path.startsWith("rates.")
      );

      if (selectedNumericFields.length === 0) {
        console.log("❌ No numeric fields found for forex data");
        return null;
      }

      const currencyNames = selectedNumericFields.map((field) =>
        field.path.replace("rates.", "")
      );
      labels = currencyNames;

      datasets = selectedNumericFields.map((field, index) => {
        const colors = [
          "rgb(34, 197, 94)", // green-500
          "rgb(239, 68, 68)", // red-500
          "rgb(59, 130, 246)", // blue-500
          "rgb(168, 85, 247)", // purple-500
          "rgb(245, 158, 11)", // amber-500
        ];

        return {
          label: field.label,
          data: currencyNames.map((currency) => widget.data.rates[currency]),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
        };
      });
    } else {
      console.log("📊 Processing object-style data");
      let dataArray: any[] | null = null;

      // Alpha Vantage style data
      if (
        widget.data["Technical Analysis: SMA"] ||
        widget.data["Technical Analysis"] ||
        widget.data["Time Series (Daily)"] ||
        widget.data["Time Series (Intraday)"]
      ) {
        console.log("📈 Found Alpha Vantage style data");

        const techAnalysisKey = Object.keys(widget.data).find(
          (key) =>
            key.includes("Technical Analysis") || key.includes("Time Series")
        );

        if (techAnalysisKey) {
          const techData = widget.data[techAnalysisKey];
          if (typeof techData === "object" && techData !== null) {
            dataArray = Object.entries(techData).map(([date, values]) => ({
              date,
              ...values,
            }));
          }
        }
      } else {
        console.log("🔍 Searching for array fields...");

        const arrayField = widget.selectedFields.find(
          (field) => field.type === "array"
        );
        if (arrayField) {
          dataArray = getNestedValue(widget.data, arrayField.path);
        } else {
          // Recursive search for arrays
          const findArrayInObject = (
            obj: Record<string, unknown>,
            path = ""
          ): unknown[] | null => {
            if (Array.isArray(obj)) return obj;
            if (typeof obj === "object" && obj !== null) {
              for (const [key, value] of Object.entries(obj)) {
                const newPath = path ? `${path}.${key}` : key;
                if (Array.isArray(value)) {
                  console.log("📋 Found array at path:", newPath);
                  return value;
                }
                const result = findArrayInObject(
                  value as Record<string, unknown>,
                  newPath
                );
                if (result) return result;
              }
            }
            return null;
          };

          dataArray = findArrayInObject(widget.data);
        }
      }

      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.log("❌ No array data found");
        return null;
      }

      const numericFields = widget.selectedFields.filter(
        (field) => field.type === "number"
      );
      if (numericFields.length === 0) {
        console.log("❌ No numeric fields found for charting");
        return null;
      }

      labels = dataArray.map((item: Record<string, unknown>, index: number) => {
        let labelValue: any = null;
        if (item.date) labelValue = item.date;
        else if (item.symbol) labelValue = item.symbol;
        else if (item.name) labelValue = item.name;
        else if (item.id) labelValue = item.id;
        else if (item.title) labelValue = item.title;
        else if (item.pair) labelValue = item.pair;

        if (!labelValue) {
          const stringField =
            widget.selectedFields.find(
              (field) =>
                field.type === "string" &&
                (field.path.includes("symbol") ||
                  field.path.includes("name") ||
                  field.path.includes("id") ||
                  field.path.includes("title"))
            ) || widget.selectedFields.find((field) => field.type === "string");

          if (stringField) {
            labelValue = getNestedValue(item, stringField.path);
          }
        }

        return String(labelValue || `Item ${index + 1}`);
      });

      if (!widget.selectedFields.some((field) => field.type === "string")) {
        labels = dataArray.map((_, index) => `Item ${index + 1}`);
      }

      datasets = numericFields.map((field, index) => {
        const data = dataArray.map((item: Record<string, unknown>) => {
          let value;
          if (field.path.includes(".")) {
            value = getNestedValue(item, field.path);
          } else {
            value = item[field.path];
            if (value === undefined) {
              value = getNestedValue(item, field.path);
            }
          }
          return typeof value === "number" ? value : 0;
        });

        const colors = [
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
          "rgb(59, 130, 246)",
          "rgb(168, 85, 247)",
          "rgb(245, 158, 11)",
        ];

        return {
          label: field.label,
          data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
        };
      });
    }

    return { labels, datasets };
  }, [widget.name, widget.data, widget.selectedFields]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgb(107, 114, 128)",
          font: { size: 10, weight: "500" },
          boxWidth: 12,
          padding: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(107, 114, 128)", font: { size: 9 } },
      },
      y: {
        ticks: { color: "rgb(107, 114, 128)", font: { size: 9 } },
      },
    },
  };

  const renderChartContent = () => {
    if (widget.isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
          <div className="text-center">
            <p className="text-sm font-medium">Error loading data</p>
            <p className="text-xs mt-1">{widget.error}</p>
          </div>
        </div>
      );
    }

    if (!widget.selectedFields.length || !chartData) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No data available</p>
            <p className="text-xs mt-1">Check your API configuration</p>
          </div>
        </div>
      );
    }

    const ChartComponent = widget.config.chartType === "bar" ? Bar : Line;
    return (
      <div className="h-64 w-full overflow-hidden">
        <ChartComponent data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <Card
      className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      onClick={() => onClick?.(widget)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
            <CardTitle className="text-lg">{widget.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
              {widget.refreshInterval}s
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRefresh(widget.id);
              }}
              disabled={widget.isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-blue-600 dark:text-blue-400",
                  widget.isLoading && "animate-spin"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfigure(widget.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(widget.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">{renderChartContent()}</div>
        {widget.lastUpdated && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500">
              Last updated: {formatLastUpdated(widget.lastUpdated)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { WidgetChart };