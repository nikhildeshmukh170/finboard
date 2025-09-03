import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, DashboardState, LayoutConfig } from '@/types';
import { apiService } from '@/services/api';
import { generateId } from '@/lib/utils';

interface DashboardStore extends DashboardState {
  // Actions
  addWidget: (widget: Omit<Widget, 'id' | 'lastUpdated' | 'isLoading' | 'error'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  updateWidgetSize: (id: string, size: { width: number; height: number }) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateLayout: (layout: Partial<LayoutConfig>) => void;
  refreshWidget: (id: string) => Promise<void>;
  refreshAllWidgets: () => Promise<void>;
  testApiConnection: (url: string) => Promise<{ success: boolean; message: string; fields?: unknown[] }>;
  clearError: () => void;
}

const defaultLayout: LayoutConfig = {
  columns: 4,
  gap: 16,
  padding: 24
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      layout: defaultLayout,
      theme: 'light',
      isLoading: false,
      error: undefined,

      addWidget: async (widgetData) => {
        const newWidget: Widget = {
          ...widgetData,
          id: generateId(),
          lastUpdated: new Date(),
          isLoading: true, // Start with loading state
          error: undefined,
          data: undefined // Ensure data is undefined initially
        };

        set((state) => ({
          widgets: [...state.widgets, newWidget]
        }));

        // Immediately fetch data for the new widget
        try {
          await get().refreshWidget(newWidget.id);
        } catch (error) {
          console.error('Failed to fetch initial data for widget:', error);
        }
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id)
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates } : widget
          )
        }));
      },

      updateWidgetPosition: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, position } : widget
          )
        }));
      },

      updateWidgetSize: (id, size) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, size } : widget
          )
        }));
      },

      reorderWidgets: (widgetIds) => {
        set((state) => {
          const widgetMap = new Map(state.widgets.map(w => [w.id, w]));
          const reorderedWidgets = widgetIds
            .map(id => widgetMap.get(id))
            .filter(Boolean) as Widget[];
          
          return { widgets: reorderedWidgets };
        });
      },

      setTheme: (theme) => {
        set({ theme });
        // Update document class for theme switching
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          }
          
          // Force CSS custom properties
          document.documentElement.style.setProperty('--background', theme === 'dark' ? '#0f172a' : '#ffffff');
          document.documentElement.style.setProperty('--foreground', theme === 'dark' ? '#f8fafc' : '#1a1a1a');
        }
      },

      updateLayout: (layoutUpdates) => {
        set((state) => ({
          layout: { ...state.layout, ...layoutUpdates }
        }));
      },

      refreshWidget: async (id) => {
        const widget = get().widgets.find(w => w.id === id);
        if (!widget) {
          console.log('❌ Widget not found:', id);
          return;
        }

        console.log('🔄 Refreshing widget:', widget.name, 'URL:', widget.apiUrl);

        // Set loading state
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, isLoading: true, error: undefined } : w
          )
        }));

        try {
          const response = await apiService.fetchData(widget.apiUrl);
          console.log('📡 API response for', widget.name, ':', response);
          
                     if (response.success) {
             console.log('✅ Successfully fetched data for', widget.name, ':', response.data);
             set((state) => ({
              widgets: state.widgets.map((w) =>
                w.id === id 
                  ? { 
                      ...w, 
                      data: response.data,
                      isLoading: false, 
                      lastUpdated: new Date(),
                      error: undefined 
                    } 
                  : w
              )
            }));
          } else {
            console.log('❌ Failed to fetch data for', widget.name, ':', response.error);
            set((state) => ({
              widgets: state.widgets.map((w) =>
                w.id === id 
                  ? { 
                      ...w, 
                      isLoading: false, 
                      error: response.error 
                    } 
                  : w
              )
            }));
          }
        } catch (error) {
          console.log('💥 Error refreshing widget', widget.name, ':', error);
          set((state) => ({
            widgets: state.widgets.map((w) =>
              w.id === id 
                ? { 
                    ...w, 
                    isLoading: false, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                  } 
                : w
            )
          }));
        }
      },

      refreshAllWidgets: async () => {
        set({ isLoading: true, error: undefined });
        
        const { widgets } = get();
        const refreshPromises = widgets.map(widget => get().refreshWidget(widget.id));
        
        try {
          await Promise.all(refreshPromises);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to refresh widgets' });
        } finally {
          set({ isLoading: false });
        }
      },

      testApiConnection: async (url) => {
        return apiService.testApiConnection(url);
      },

      clearError: () => {
        set({ error: undefined });
      }
    }),
    {
      name: 'finboard-dashboard',
      partialize: (state) => ({
        widgets: state.widgets,
        layout: state.layout,
        theme: state.theme
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize theme on app load
        if (state && typeof document !== 'undefined') {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          }
          
          // Force CSS custom properties
          document.documentElement.style.setProperty('--background', state.theme === 'dark' ? '#0f172a' : '#ffffff');
          document.documentElement.style.setProperty('--foreground', state.theme === 'dark' ? '#f8fafc' : '#1a1a1a');
        }
        
        // Convert lastUpdated strings back to Date objects
        if (state && state.widgets) {
          state.widgets.forEach(widget => {
            if (widget.lastUpdated && typeof widget.lastUpdated === 'string') {
              widget.lastUpdated = new Date(widget.lastUpdated);
            }
          });
        }
      }
    }
  )
);
