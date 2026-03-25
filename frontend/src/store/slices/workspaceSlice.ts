import { createSlice } from '@reduxjs/toolkit';

export interface Website {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'syncing' | 'offline';
}

interface WorkspaceState {
  websites: Website[];
  activeWebsiteId: string | null;
}

const initialState: WorkspaceState = {
  websites: [
    { id: '1', name: 'Main E-Commerce', url: 'https://shop-main.com', status: 'active' },
    { id: '2', name: 'Startup Landing Page', url: 'https://nexgen-startup.io', status: 'syncing' }
  ],
  activeWebsiteId: '1', // Default selected
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWebsite: (state, action) => {
      state.activeWebsiteId = action.payload;
    },
    addWebsite: (state, action) => {
      const newSite: Website = {
        id: Date.now().toString(),
        name: action.payload.name,
        url: action.payload.url,
        status: 'syncing',
      };
      state.websites.push(newSite);
      state.activeWebsiteId = newSite.id;
    }
  },
});

export const { setActiveWebsite, addWebsite } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
